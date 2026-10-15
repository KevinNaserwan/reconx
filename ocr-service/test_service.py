import sys
from main import parse_indonesian_receipt, ocr
import cv2

images = [
    "/home/rchandra/Downloads/WhatsApp Unknown 2026-10-15 at 14.24.52/WhatsApp Image 2026-10-15 at 14.24.40.jpeg",
    "/home/rchandra/Downloads/WhatsApp Unknown 2026-10-15 at 14.24.52/WhatsApp Image 2026-10-15 at 14.24.40 (1).jpeg"
]

for idx, img_path in enumerate(images):
    print(f"\n================ TEST PADDLE PARSER IMAGE {idx + 1} ================")
    img = cv2.imread(img_path)
    result = ocr.ocr(img, cls=True)
    lines_with_conf = []
    if result and len(result) > 0 and result[0]:
        for word_info in result[0]:
            bbox, (text, score) = word_info
            lines_with_conf.append((text, score))
    parsed = parse_indonesian_receipt(lines_with_conf)
    print("Parsed Result:")
    for k, v in parsed.items():
        if k != "rawLines":
            print(f"  {k}: {v}")
