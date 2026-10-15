import os
import re
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from paddleocr import PaddleOCR
import numpy as np
import cv2

app = FastAPI(
    title="ReconX PaddleOCR Engine Service",
    description="High-precision OCR microservice using PaddleOCR PP-OCRv4 for Indonesian receipts & M-Banking screenshots",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize PaddleOCR engine once at startup
print("Initializing PaddleOCR PP-OCRv4 engine...")
ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
print("PaddleOCR PP-OCRv4 engine ready.")


class BoundingBox(BaseModel):
    points: List[List[float]]


class DetectedTextLine(BaseModel):
    text: str
    confidence: float
    bbox: List[List[float]]


class OcrScanResponse(BaseModel):
    success: bool
    merchant: str
    amount: float
    date: str
    type: str # INCOME or EXPENSE
    paymentMethod: str
    category: str
    confidenceScore: float
    detectedItems: List[str]
    rawLines: List[str]
    message: str


def clean_nominal_string(val_str: str) -> Optional[float]:
    """Cleans Indonesian nominal string like '940.571,oo', 'Rp 38.490,00', '50.000' to float"""
    if not val_str:
        return None
    
    s = val_str.lower().strip()
    s = re.sub(r'^(rp|idr)\.?\s*', '', s)
    
    # Handle OCR common misreads for decimals ',oo' or ',0o' -> ',00'
    s = re.sub(r'[,.](oo|0o|o0)$', ',00', s)
    
    # Strip cents if ending with ,00 or .00
    if s.endswith(',00') or s.endswith('.00'):
        s = s[:-3]
        
    # Strip non-digits
    digits_only = re.sub(r'[^\d]', '', s)
    if not digits_only:
        return None
        
    try:
        val = float(digits_only)
        if 100 <= val <= 500_000_000:
            return val
    except ValueError:
        pass
    return None


def parse_indonesian_receipt(lines_with_conf: List[tuple]) -> dict:
    """
    Intelligent Indonesian Receipt & M-Banking Parser
    Extracts Merchant, Nominal, Date, Payment Method, and Category with high fidelity.
    """
    raw_texts = [item[0].strip() for item in lines_with_conf if item[0].strip()]
    full_text = " ".join(raw_texts).lower()
    
    detected_amount = 0.0
    amount_confidence = 0.95
    detected_merchant = "Transaksi Keuangan"
    detected_type = "EXPENSE"
    detected_payment = "Transfer Bank"
    detected_category = "Konsumsi & Belanja"
    detected_date = datetime.now().isoformat()
    detected_items = []
    
    # 1. Detect Nominal (Amount)
    # Strategy A: Multi-line lookahead for 'Nominal' header (common in blu, BCA Mobile, Livin')
    for i, (text, conf) in enumerate(lines_with_conf):
        lower = text.lower()
        if re.search(r'\b(nominal|nominal transfer|jumlah transfer|nilai transfer|total pembayaran|total|harga tunai|bayar tunai)\b', lower):
            # Check same line
            same_line_match = clean_nominal_string(text)
            if same_line_match and same_line_match > 0:
                detected_amount = same_line_match
                amount_confidence = conf
                break
                
            # Check next 2 lines
            for offset in range(1, 3):
                if i + offset < len(lines_with_conf):
                    next_text, next_conf = lines_with_conf[i + offset]
                    # Skip 'Rp' alone on next line
                    if next_text.strip().lower() in ['rp', 'idr']:
                        if i + offset + 1 < len(lines_with_conf):
                            sub_text, sub_conf = lines_with_conf[i + offset + 1]
                            parsed = clean_nominal_string(sub_text)
                            if parsed:
                                detected_amount = parsed
                                amount_confidence = min(conf, sub_conf)
                                break
                    else:
                        parsed = clean_nominal_string(next_text)
                        if parsed:
                            detected_amount = parsed
                            amount_confidence = min(conf, next_conf)
                            break
            if detected_amount > 0:
                break

    # Strategy B: Fallback regex search for Rp pattern across lines
    if detected_amount <= 0:
        for text, conf in lines_with_conf:
            lower = text.lower()
            if any(neg in lower for neg in ['no. ref', 'referensi', 'rekening', 'norek', 'wib', 'kembali ke beranda']):
                continue
            if 'rp' in lower or 'idr' in lower:
                parsed = clean_nominal_string(text)
                if parsed:
                    detected_amount = parsed
                    amount_confidence = conf
                    break

    # Strategy C: Cash change arithmetic (Tunai minus Kembali)
    if detected_amount <= 0:
        tunai_val = 0.0
        kembali_val = 0.0
        for text, conf in lines_with_conf:
            lower = text.lower()
            if 'beranda' in lower or 'menu' in lower:
                continue
            if 'tunai' in lower:
                p = clean_nominal_string(text)
                if p: tunai_val = p
            elif 'kembali' in lower:
                p = clean_nominal_string(text)
                if p: kembali_val = p
        if tunai_val > kembali_val and kembali_val > 0:
            detected_amount = tunai_val - kembali_val
            detected_payment = "Tunai (Cash)"

    # 2. Detect Merchant / Recipient
    # For M-Banking: look for lines under 'Nominal' / 'Rp ...' which are recipient names
    for i, (text, conf) in enumerate(lines_with_conf):
        lower = text.lower()
        if 'nominal' in lower:
            # Lookahead up to 4 lines for recipient name
            for off in range(1, 5):
                if i + off < len(lines_with_conf):
                    cand, cand_conf = lines_with_conf[i + off]
                    cand_lower = cand.lower()
                    if any(skip in cand_lower for skip in ['rp', 'nominal', 'transaksi berhasil', 'berhasil', 'kembali', 'favorit', 'tipe transaksi', 'wib', 'kategori']):
                        continue
                    if re.search(r'^\d', cand):
                        continue
                    if len(cand) >= 4 and not cand_lower.startswith('blu by'):
                        detected_merchant = cand.replace('.', '').strip()
                        break
            if detected_merchant != "Transaksi Keuangan":
                break

    # If merchant is still default, find top meaningful line
    if detected_merchant == "Transaksi Keuangan":
        for text, conf in lines_with_conf[:8]:
            cand_lower = text.lower()
            if any(skip in cand_lower for skip in ['transaksi berhasil', 'nominal', 'berhasil', 'status', 'wib', 'bca', 'blu', 'mandiri', 'bri', 'seabank', 'ovo', 'gopay', 'dana', 'shopee']):
                continue
            if len(text) >= 4 and not re.search(r'^\d', text):
                detected_merchant = text.strip()
                break

    # 3. Detect Payment Method
    if 'blu' in full_text:
        detected_payment = "blu by BCA Digital"
    elif 'bi-fast' in full_text or 'bifast' in full_text:
        detected_payment = "BI-FAST"
    elif 'bca' in full_text:
        detected_payment = "BCA Mobile"
    elif 'mandiri' in full_text or 'livin' in full_text:
        detected_payment = "Livin' by Mandiri"
    elif 'bri' in full_text or 'brimo' in full_text:
        detected_payment = "BRImo BRI"
    elif 'seabank' in full_text:
        detected_payment = "SeaBank"
    elif 'superbank' in full_text:
        detected_payment = "Superbank"
    elif 'gopay' in full_text:
        detected_payment = "GoPay"
    elif 'ovo' in full_text:
        detected_payment = "OVO"
    elif 'dana' in full_text:
        detected_payment = "DANA"
    elif 'shopeepay' in full_text:
        detected_payment = "ShopeePay"
    elif 'qris' in full_text:
        detected_payment = "QRIS"
    elif 'tunai' in full_text:
        detected_payment = "Tunai (Cash)"

    # 4. Detect Transaction Type
    if any(inc in full_text for inc in ['uang masuk', 'transfer masuk', 'menerima', 'top up berhasil', 'topup berhasil', 'kredit', 'cashback']):
        detected_type = "INCOME"
    else:
        detected_type = "EXPENSE"

    # 5. Detect Category
    if any(k in full_text for k in ['spbu', 'pertamina', 'shell', 'bensin', 'solar', 'parkir', 'tol', 'gojek', 'grab']):
        detected_category = "Transportasi & Bensin"
    elif any(k in full_text for k in ['apotek', 'obat', 'klinik', 'rs', 'dokter', 'kimia farma', 'k24']):
        detected_category = "Kesehatan & Obat"
    elif any(k in full_text for k in ['pln', 'listrik', 'pdam', 'indihome', 'wifi', 'bpjs', 'pulsa']):
        detected_category = "Tagihan & Utilitas"
    elif any(k in full_text for k in ['gaji', 'payroll', 'pendapatan', 'bonus', 'dividen']):
        detected_category = "Gaji & Pendapatan"
    else:
        detected_category = "Konsumsi & Belanja"

    return {
        "merchant": detected_merchant,
        "amount": detected_amount,
        "date": detected_date,
        "type": detected_type,
        "paymentMethod": detected_payment,
        "category": detected_category,
        "confidenceScore": round(float(amount_confidence), 2),
        "detectedItems": detected_items,
        "rawLines": raw_texts
    }


@app.get("/health")
def health_check():
    return {
        "status": "ONLINE",
        "engine": "PaddleOCR PP-OCRv4",
        "version": "2.9.1",
        "capabilities": ["Receipt Scanning", "M-Banking Recognition", "Indonesian Currency Parsing", "Orientation Classification"]
    }


@app.post("/ocr/scan", response_model=OcrScanResponse)
async def scan_receipt(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file format")
            
        # Run PaddleOCR
        result = ocr.ocr(img, cls=True)
        
        lines_with_conf = []
        if result and len(result) > 0 and result[0]:
            for word_info in result[0]:
                bbox, (text, score) = word_info
                lines_with_conf.append((text, score))
                
        # Parse text lines
        parsed = parse_indonesian_receipt(lines_with_conf)
        
        return OcrScanResponse(
            success=True,
            merchant=parsed["merchant"],
            amount=parsed["amount"],
            date=parsed["date"],
            type=parsed["type"],
            paymentMethod=parsed["paymentMethod"],
            category=parsed["category"],
            confidenceScore=parsed["confidenceScore"],
            detectedItems=parsed["detectedItems"],
            rawLines=parsed["rawLines"],
            message=f"Sukses mengekstrak data dari nota/screenshot: {parsed['merchant']} senilai Rp {parsed['amount']:N0}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PaddleOCR scan error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5055, reload=False)
