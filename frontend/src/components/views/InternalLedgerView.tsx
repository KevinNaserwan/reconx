'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, ColumnDef } from '../ui/DataTable';
import { API_BASE_URL } from '@/lib/api';
import { CreditCard, QrCode, Landmark, ArrowDownLeft, Eye } from 'lucide-react';
import { DetailDrawer } from '../ui/DetailDrawer';
import { BrandBadge } from '../ui/BrandBadge';

interface InternalTransactionItem {
  id: string;
  transactionRef: string;
  externalRef: string;
  providerId: string;
  providerName: string;
  amount: number;
  feeAmount: number;
  currency: string;
  transactionTime: string;
  channel: string;
  status: string;
  createdAt: string;
}

export const InternalLedgerView: React.FC = () => {
  const [data, setData] = useState<InternalTransactionItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InternalTransactionItem | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/transactions?pageSize=100`)
      .then((res) => res.json())
      .then((res) => setData(res.items || []))
      .catch((err) => {
        console.error(err);
        // Fallback demo data if offline
        setData([
          {
            id: 'int-001',
            transactionRef: 'TRX-ORD-1001',
            externalRef: 'EXT-MID-9001',
            providerId: 'prov-midtrans-001',
            providerName: 'Midtrans Payment Gateway',
            amount: 250000,
            feeAmount: 3750,
            currency: 'IDR',
            transactionTime: '2026-10-14T10:05:00Z',
            channel: 'QRIS',
            status: 'SUCCESS',
            createdAt: '2026-10-14T10:05:00Z',
          },
          {
            id: 'int-002',
            transactionRef: 'TRX-ORD-1002',
            externalRef: 'EXT-MID-9002',
            providerId: 'prov-midtrans-001',
            providerName: 'Midtrans Payment Gateway',
            amount: 1500000,
            feeAmount: 22500,
            currency: 'IDR',
            transactionTime: '2026-10-14T10:15:00Z',
            channel: 'CC',
            status: 'SUCCESS',
            createdAt: '2026-10-14T10:15:00Z',
          },
          {
            id: 'int-003',
            transactionRef: 'TRX-ORD-1003',
            externalRef: 'EXT-MID-9003',
            providerId: 'prov-midtrans-001',
            providerName: 'Midtrans Payment Gateway',
            amount: 500000,
            feeAmount: 7500,
            currency: 'IDR',
            transactionTime: '2026-10-14T10:25:00Z',
            channel: 'VA',
            status: 'SUCCESS',
            createdAt: '2026-10-14T10:25:00Z',
          },
          {
            id: 'int-004',
            transactionRef: 'TRX-BLU-1004',
            externalRef: 'EXT-BLU-1001',
            providerId: 'prov-blu-004',
            providerName: 'blu by BCA Digital',
            amount: 150000,
            feeAmount: 0,
            currency: 'IDR',
            transactionTime: '2026-10-14T11:00:00Z',
            channel: 'SNAP_BI_DEBIT',
            status: 'SUCCESS',
            createdAt: '2026-10-14T11:00:00Z',
          },
          {
            id: 'int-005',
            transactionRef: 'TRX-SPB-1005',
            externalRef: 'EXT-SPB-2001',
            providerId: 'prov-superbank-005',
            providerName: 'Superbank Indonesia',
            amount: 350000,
            feeAmount: 0,
            currency: 'IDR',
            transactionTime: '2026-10-14T11:15:00Z',
            channel: 'BI_FAST',
            status: 'SUCCESS',
            createdAt: '2026-10-14T11:15:00Z',
          },
          {
            id: 'int-006',
            transactionRef: 'TRX-SEA-1006',
            externalRef: 'EXT-SEA-3001',
            providerId: 'prov-seabank-006',
            providerName: 'SeaBank Indonesia',
            amount: 75000,
            feeAmount: 1000,
            currency: 'IDR',
            transactionTime: '2026-10-14T11:10:00Z',
            channel: 'QRIS',
            status: 'SUCCESS',
            createdAt: '2026-10-14T11:10:00Z',
          },
          {
            id: 'int-007',
            transactionRef: 'TRX-SPAY-1007',
            externalRef: 'EXT-SPAY-4001',
            providerId: 'prov-shopeepay-007',
            providerName: 'ShopeePay Indonesia',
            amount: 100000,
            feeAmount: 700,
            currency: 'IDR',
            transactionTime: '2026-10-14T11:05:00Z',
            channel: 'SHOPEEPAY_WALLET',
            status: 'SUCCESS',
            createdAt: '2026-10-14T11:05:00Z',
          },
        ]);
      });
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);

  const getChannelIcon = (channel: string) => {
    switch (channel?.toUpperCase()) {
      case 'QRIS':
        return <QrCode className="h-3.5 w-3.5 text-emerald-500" />;
      case 'CC':
        return <CreditCard className="h-3.5 w-3.5 text-sky-500" />;
      case 'VA':
        return <Landmark className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return <ArrowDownLeft className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  const columns: ColumnDef<InternalTransactionItem>[] = [
    {
      id: 'transactionRef',
      header: 'Internal Ref',
      accessorKey: 'transactionRef',
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-mono font-semibold text-slate-900 dark:text-white">
            {item.transactionRef}
          </span>
          <span className="block text-[10px] text-slate-400 font-mono">
            Ext: {item.externalRef}
          </span>
        </div>
      ),
    },
    {
      id: 'channel',
      header: 'Channel',
      accessorKey: 'channel',
      sortable: true,
      cell: (item) => (
        <div className="flex items-center space-x-1.5">
          {getChannelIcon(item.channel)}
          <span className="font-semibold text-slate-700 dark:text-slate-300">{item.channel}</span>
        </div>
      ),
    },
    {
      id: 'providerName',
      header: 'Gateway Provider',
      accessorKey: 'providerName',
      sortable: true,
      cell: (item) => (
        <div className="flex items-center space-x-2">
          <BrandBadge brand={item.providerName || item.channel} size={22} />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {item.providerName || 'Payment Gateway'}
          </span>
        </div>
      ),
    },
    {
      id: 'amount',
      header: 'Gross Amount',
      accessorKey: 'amount',
      sortable: true,
      align: 'right',
      cell: (item) => (
        <span className="font-mono font-bold text-slate-900 dark:text-emerald-400">
          {formatCurrency(item.amount)}
        </span>
      ),
    },
    {
      id: 'feeAmount',
      header: 'Estimated Fee',
      accessorKey: 'feeAmount',
      sortable: true,
      align: 'right',
      cell: (item) => (
        <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
          {formatCurrency(item.feeAmount)}
        </span>
      ),
    },
    {
      id: 'transactionTime',
      header: 'Timestamp',
      accessorKey: 'transactionTime',
      sortable: true,
      cell: (item) => (
        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
          {new Date(item.transactionTime).toLocaleString('id-ID')}
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
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Internal Financial Ledgers</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Raw incoming transactions captured by internal core banking and order checkout services.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Filter by Transaction Ref or External Ref..."
        searchKey={(item) => `${item.transactionRef} ${item.externalRef}`}
        onRowClick={(item) => setSelectedItem(item)}
        exportFileName="internal_ledgers"
      />

      {/* Detail Slide-over Drawer */}
      <DetailDrawer
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.transactionRef || 'Transaction Detail'}
        subtitle={`Channel: ${selectedItem?.channel} · External Ref: ${selectedItem?.externalRef}`}
      >
        {selectedItem && (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Nominal:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-emerald-400 text-sm">
                  {formatCurrency(selectedItem.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway Fee:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {formatCurrency(selectedItem.feeAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
                <span className="text-slate-500 font-semibold">Net Expected:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(selectedItem.amount - selectedItem.feeAmount)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-white">System Invariants</h4>
              <div className="font-mono text-[11px] bg-slate-100 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1 text-slate-700 dark:text-slate-300">
                <div>ID: {selectedItem.id}</div>
                <div>Currency: {selectedItem.currency} (ISO 4217)</div>
                <div>Status: {selectedItem.status}</div>
                <div>Created: {selectedItem.createdAt}</div>
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
