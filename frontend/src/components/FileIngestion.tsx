'use client';

import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, Download, Check } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface FileIngestionProps {
  onUploadSuccess: () => void;
}

interface UploadResponse {
  batchId: string;
  fileName: string;
  totalRows: number;
  processedRows: number;
  failedRows: number;
  status: string;
  errors: string[];
}

export const FileIngestion: React.FC<FileIngestionProps> = ({ onUploadSuccess }) => {
  const [providerId, setProviderId] = useState('prov-midtrans-001');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [copiedSample, setCopiedSample] = useState(false);

  const getSampleCsv = (pId: string) => {
    switch (pId) {
      case 'prov-blu-004':
        return `provider_trx_id,external_ref,gross_amount,fee_amount,net_amount,currency,settlement_time
BLU-MUT-55001,EXT-BLU-1001,150000.0000,0.0000,150000.0000,IDR,2026-10-14T11:00:00Z
BLU-MUT-55002,EXT-BLU-1002,500000.0000,0.0000,500000.0000,IDR,2026-10-14T11:20:00Z`;
      case 'prov-superbank-005':
        return `provider_trx_id,external_ref,gross_amount,fee_amount,net_amount,currency,settlement_time
SPB-SETTLE-77001,EXT-SPB-2001,350000.0000,0.0000,350000.0000,IDR,2026-10-14T11:15:00Z
SPB-SETTLE-77002,EXT-SPB-2002,820000.0000,0.0000,820000.0000,IDR,2026-10-14T11:35:00Z`;
      case 'prov-seabank-006':
        return `provider_trx_id,external_ref,gross_amount,fee_amount,net_amount,currency,settlement_time
SEA-MUT-99001,EXT-SEA-3001,75000.0000,1000.0000,74000.0000,IDR,2026-10-14T11:10:00Z
SEA-MUT-99002,EXT-SEA-3002,250000.0000,1000.0000,249000.0000,IDR,2026-10-14T11:40:00Z`;
      case 'prov-shopeepay-007':
        return `provider_trx_id,external_ref,gross_amount,fee_amount,net_amount,currency,settlement_time
SPAY-SETTLE-44001,EXT-SPAY-4001,100000.0000,700.0000,99300.0000,IDR,2026-10-14T11:05:00Z
SPAY-SETTLE-44002,EXT-SPAY-4002,450000.0000,3150.0000,446850.0000,IDR,2026-10-14T11:25:00Z`;
      default:
        return `provider_trx_id,external_ref,gross_amount,fee_amount,net_amount,currency,settlement_time
MID-SETTLE-88001,EXT-MID-9001,250000.0000,3750.0000,246250.0000,IDR,2026-10-14T10:10:00Z
MID-SETTLE-88002,EXT-MID-9002,1500000.0000,22500.0000,1477500.0000,IDR,2026-10-14T10:20:00Z
MID-SETTLE-88003,EXT-MID-9003,450000.0000,6750.0000,443250.0000,IDR,2026-10-14T10:30:00Z`;
    }
  };

  const handleDownloadSample = () => {
    const csvData = getSampleCsv(providerId);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${providerId}_statement_sample.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a CSV file first.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('providerId', providerId);
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/imports/upload`, {
        method: 'POST',
        headers: {
          'X-Idempotency-Key': `UPLOAD-${Date.now()}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.detail || 'Upload failed');
      }

      setUploadResult(data as UploadResponse);
      onUploadSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      alert(`Upload error: ${msg}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Provider Settlement Statement Ingestion
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload settlement statements directly from Payment Gateways, Bank Digitals, or E-Wallets with automatic SHA-256 deduplication.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-card space-y-4">
        {/* Upload Form */}
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1.5 font-medium">Select Target Provider Gateway / Bank</label>
            <select
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              className="w-full sm:w-96 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-xs text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="prov-midtrans-001">Midtrans Payment Gateway (MIDTRANS)</option>
              <option value="prov-xendit-002">Xendit XenPlatform (XENDIT)</option>
              <option value="prov-bca-003">BCA Virtual Account (BCA_VA)</option>
              <option value="prov-blu-004">blu by BCA Digital (BLU_BCA)</option>
              <option value="prov-superbank-005">Superbank Indonesia (SUPERBANK)</option>
              <option value="prov-seabank-006">SeaBank Indonesia (SEABANK)</option>
              <option value="prov-shopeepay-007">ShopeePay Indonesia (SHOPEEPAY)</option>
            </select>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/50 bg-slate-50/50 dark:bg-slate-950/40 p-8 text-center transition-all">
            <UploadCloud className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
            <div className="text-xs text-slate-800 dark:text-slate-200 font-semibold">
              {file ? file.name : 'Drag & drop bank statement CSV, or browse from computer'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports standard settlement schemas (provider_trx_id, external_ref, gross_amount, fee_amount, currency)
            </p>

            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="csvFileInput"
            />
            <label
              htmlFor="csvFileInput"
              className="mt-4 inline-block cursor-pointer rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              Choose CSV File
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadSample}
              className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              {copiedSample ? <Check className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
              <span>Download Synthetic Sample CSV</span>
            </button>

            <button
              type="submit"
              disabled={uploading || !file}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Parsing & Ingesting...' : 'Upload & Process Batch'}
            </button>
          </div>
        </form>

        {/* Upload Success Feedback */}
        {uploadResult && (
          <div className="mt-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/30 p-4">
            <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
              <CheckCircle2 className="h-4 w-4" />
              <span>Import Batch Ingested Successfully</span>
            </div>
            <div className="mt-2 text-xs text-slate-700 dark:text-slate-300 space-y-1 font-mono">
              <div>Batch ID: {uploadResult.batchId}</div>
              <div>File: {uploadResult.fileName}</div>
              <div>Valid Processed: {uploadResult.processedRows} rows</div>
              {uploadResult.failedRows > 0 && (
                <div className="text-amber-600 dark:text-amber-400">Failed / Quarantined: {uploadResult.failedRows} rows</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
