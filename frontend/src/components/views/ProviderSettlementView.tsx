'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, ColumnDef } from '../ui/DataTable';
import { DetailDrawer } from '../ui/DetailDrawer';
import { Eye } from 'lucide-react';

interface ProviderTransactionItem {
  id: string;
  importBatchId: string;
  providerId: string;
  providerTrxId: string;
  externalRef: string;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  currency: string;
  settlementTime: string;
}

export const ProviderSettlementView: React.FC = () => {
  const [data, setData] = useState<ProviderTransactionItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ProviderTransactionItem | null>(null);

  useEffect(() => {
    // Populate provider settlements
    setData([
      {
        id: 'prv-001',
        importBatchId: 'batch-demo-001',
        providerId: 'prov-midtrans-001',
        providerTrxId: 'MID-SETTLE-88001',
        externalRef: 'EXT-MID-9001',
        grossAmount: 250000,
        feeAmount: 3750,
        netAmount: 246250,
        currency: 'IDR',
        settlementTime: '2026-10-14T10:10:00Z',
      },
      {
        id: 'prv-002',
        importBatchId: 'batch-demo-001',
        providerId: 'prov-midtrans-001',
        providerTrxId: 'MID-SETTLE-88002',
        externalRef: 'EXT-MID-9002',
        grossAmount: 1500000,
        feeAmount: 22500,
        netAmount: 1477500,
        currency: 'IDR',
        settlementTime: '2026-10-14T10:20:00Z',
      },
      {
        id: 'prv-003',
        importBatchId: 'batch-demo-001',
        providerId: 'prov-midtrans-001',
        providerTrxId: 'MID-SETTLE-88003',
        externalRef: 'EXT-MID-9003',
        grossAmount: 450000,
        feeAmount: 6750,
        netAmount: 443250,
        currency: 'IDR',
        settlementTime: '2026-10-14T10:30:00Z',
      },
      {
        id: 'prv-004',
        importBatchId: 'batch-demo-001',
        providerId: 'prov-midtrans-001',
        providerTrxId: 'MID-SETTLE-88004',
        externalRef: 'EXT-MID-9004',
        grossAmount: 100000,
        feeAmount: 2500,
        netAmount: 97500,
        currency: 'IDR',
        settlementTime: '2026-10-14T10:40:00Z',
      },
      {
        id: 'prv-005',
        importBatchId: 'batch-demo-001',
        providerId: 'prov-midtrans-001',
        providerTrxId: 'MID-SETTLE-88005-ORPHAN',
        externalRef: 'EXT-MID-9999-GHOST',
        grossAmount: 320000,
        feeAmount: 4800,
        netAmount: 315200,
        currency: 'IDR',
        settlementTime: '2026-10-14T10:50:00Z',
      },
      {
        id: 'prv-006',
        importBatchId: 'batch-blu-001',
        providerId: 'prov-blu-004',
        providerTrxId: 'BLU-MUT-55001',
        externalRef: 'EXT-BLU-1001',
        grossAmount: 150000,
        feeAmount: 0,
        netAmount: 150000,
        currency: 'IDR',
        settlementTime: '2026-10-14T11:00:00Z',
      },
      {
        id: 'prv-007',
        importBatchId: 'batch-spb-001',
        providerId: 'prov-superbank-005',
        providerTrxId: 'SPB-SETTLE-77001',
        externalRef: 'EXT-SPB-2001',
        grossAmount: 350000,
        feeAmount: 0,
        netAmount: 350000,
        currency: 'IDR',
        settlementTime: '2026-10-14T11:15:00Z',
      },
      {
        id: 'prv-008',
        importBatchId: 'batch-sea-001',
        providerId: 'prov-seabank-006',
        providerTrxId: 'SEA-MUT-99001',
        externalRef: 'EXT-SEA-3001',
        grossAmount: 75000,
        feeAmount: 1000,
        netAmount: 74000,
        currency: 'IDR',
        settlementTime: '2026-10-14T11:10:00Z',
      },
      {
        id: 'prv-009',
        importBatchId: 'batch-spay-001',
        providerId: 'prov-shopeepay-007',
        providerTrxId: 'SPAY-SETTLE-44001',
        externalRef: 'EXT-SPAY-4001',
        grossAmount: 100000,
        feeAmount: 700,
        netAmount: 99300,
        currency: 'IDR',
        settlementTime: '2026-10-14T11:05:00Z',
      },
    ]);
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);

  const columns: ColumnDef<ProviderTransactionItem>[] = [
    {
      id: 'providerTrxId',
      header: 'Provider Settlement ID',
      accessorKey: 'providerTrxId',
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {item.providerTrxId}
          </span>
          <span className="block text-[10px] text-slate-400 font-mono">
            Ref: {item.externalRef}
          </span>
        </div>
      ),
    },
    {
      id: 'grossAmount',
      header: 'Gross Settled',
      accessorKey: 'grossAmount',
      sortable: true,
      align: 'right',
      cell: (item) => (
        <span className="font-mono font-bold text-slate-900 dark:text-emerald-400">
          {formatCurrency(item.grossAmount)}
        </span>
      ),
    },
    {
      id: 'feeAmount',
      header: 'MDR Admin Fee',
      accessorKey: 'feeAmount',
      sortable: true,
      align: 'right',
      cell: (item) => (
        <span className="font-mono text-rose-600 dark:text-rose-400 text-[11px]">
          -{formatCurrency(item.feeAmount)}
        </span>
      ),
    },
    {
      id: 'netAmount',
      header: 'Net Transferred',
      accessorKey: 'netAmount',
      sortable: true,
      align: 'right',
      cell: (item) => (
        <span className="font-mono font-bold text-slate-900 dark:text-sky-400">
          {formatCurrency(item.netAmount)}
        </span>
      ),
    },
    {
      id: 'settlementTime',
      header: 'Settlement Time',
      accessorKey: 'settlementTime',
      sortable: true,
      cell: (item) => (
        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
          {new Date(item.settlementTime).toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      cell: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedItem(item);
          }}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            External Provider Statements
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Statement files ingested from payment gateways and banks, recording gross, fees, and net settlement.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Filter by Provider Trx ID or External Ref..."
        searchKey={(item) => `${item.providerTrxId} ${item.externalRef}`}
        onRowClick={(item) => setSelectedItem(item)}
        exportFileName="provider_settlements"
      />

      <DetailDrawer
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.providerTrxId || 'Statement Detail'}
        subtitle={`External Ref: ${selectedItem?.externalRef}`}
      >
        {selectedItem && (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Settlement:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(selectedItem.grossAmount)}
                </span>
              </div>
              <div className="flex justify-between text-rose-500">
                <span>MDR Fee Deducted:</span>
                <span className="font-mono">-{formatCurrency(selectedItem.feeAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 text-sky-500 font-bold">
                <span>Net Credited to Bank:</span>
                <span className="font-mono">{formatCurrency(selectedItem.netAmount)}</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-100 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
              <div>Batch ID: {selectedItem.importBatchId}</div>
              <div>Settled: {selectedItem.settlementTime}</div>
              <div>Currency: {selectedItem.currency}</div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
