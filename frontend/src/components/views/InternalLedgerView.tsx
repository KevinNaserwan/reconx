'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, ColumnDef } from '../ui/DataTable';
import { API_BASE_URL } from '@/lib/api';
import { CreditCard, QrCode, Landmark, ArrowDownLeft, Eye, TrendingDown, TrendingUp, Wallet, Layers } from 'lucide-react';
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
  type?: string;
  createdAt: string;
}

export const InternalLedgerView: React.FC = () => {
  const [data, setData] = useState<InternalTransactionItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InternalTransactionItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/transactions?pageSize=100`)
      .then((res) => res.json())
      .then((res) => {
        setData(res.items || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching internal transactions:', err);
        setData([]);
        setIsLoading(false);
      });
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);

  const isIncomeItem = (item: InternalTransactionItem) => {
    if (item.type?.toUpperCase() === 'INCOME') return true;
    if (item.type?.toUpperCase() === 'EXPENSE') return false;
    const text = `${item.transactionRef} ${item.externalRef} ${item.channel} ${item.providerName}`.toLowerCase();
    return (
      text.includes('masuk') ||
      text.includes('menerima') ||
      text.includes('topup') ||
      text.includes('top up') ||
      text.includes('kredit') ||
      text.includes('cashback') ||
      text.includes('refund')
    );
  };

  const totalExpense = data
    .filter((d) => !isIncomeItem(d))
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const totalIncome = data
    .filter((d) => isIncomeItem(d))
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const netCashflow = totalIncome - totalExpense;

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
      id: 'type',
      header: 'Jenis Mutasi',
      accessorKey: 'type',
      sortable: true,
      cell: (item) => {
        const isInc = isIncomeItem(item);
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
              isInc
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
            }`}
          >
            {isInc ? '↓ Uang Masuk' : '↑ Uang Keluar'}
          </span>
        );
      },
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
      header: 'Gateway / Merchant',
      accessorKey: 'providerName',
      sortable: true,
      cell: (item) => (
        <div className="flex items-center space-x-2">
          <BrandBadge brand={item.providerName || item.channel} size={22} />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {item.providerName || 'Payment Partner'}
          </span>
        </div>
      ),
    },
    {
      id: 'amount',
      header: 'Nominal Mutasi',
      accessorKey: 'amount',
      sortable: true,
      align: 'right',
      cell: (item) => {
        const isInc = isIncomeItem(item);
        return (
          <span
            className={`font-mono font-bold ${
              isInc ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isInc ? '+ ' : '- '}
            {formatCurrency(item.amount)}
          </span>
        );
      },
    },
    {
      id: 'feeAmount',
      header: 'Est. Fee',
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

  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const filteredData = data.filter((item) => {
    const isInc = isIncomeItem(item);
    if (activeFilter === 'EXPENSE') return !isInc;
    if (activeFilter === 'INCOME') return isInc;
    if (activeFilter === 'RECEIPT') return item.channel.toLowerCase().includes('receipt') || item.providerName.toLowerCase().includes('nota');
    if (activeFilter === 'QRIS') {
      const ch = `${item.channel} ${item.providerName}`.toLowerCase();
      return ch.includes('qris') || ch.includes('gopay') || ch.includes('ovo') || ch.includes('dana') || ch.includes('shopee');
    }
    if (activeFilter === 'BANK') {
      const ch = `${item.channel} ${item.providerName}`.toLowerCase();
      return ch.includes('bca') || ch.includes('mandiri') || ch.includes('bri') || ch.includes('bni') || ch.includes('seabank') || ch.includes('bank');
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Buku Kas & Mutasi Finansial</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pencatatan real-time seluruh mutasi Uang Masuk dan Uang Keluar dari HP Android dan Scan Nota.
          </p>
        </div>
      </div>

      {/* Cashflow Summary Cards (Hallmark Design System) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Uang Keluar */}
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">Total Uang Keluar</span>
            <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-mono font-extrabold text-rose-600 dark:text-rose-400">
            - {formatCurrency(totalExpense)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Pengeluaran belanja & transaksi debit
          </p>
        </div>

        {/* Total Uang Masuk */}
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Total Uang Masuk</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
            + {formatCurrency(totalIncome)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Transfer masuk, payroll & setoran
          </p>
        </div>

        {/* Net Cashflow */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Arus Kas Bersih (Net)</span>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div
            className={`mt-2 text-xl font-mono font-extrabold ${
              netCashflow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {netCashflow >= 0 ? '+ ' : ''}
            {formatCurrency(netCashflow)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Surplus / defisit kumulatif
          </p>
        </div>

        {/* Total Transaksi */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Total Transaksi</span>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-mono font-extrabold text-slate-900 dark:text-white">
            {data.length} <span className="text-sm font-normal text-slate-500">Mutasi</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {isLoading ? 'Memuat data live...' : 'Semua mutasi tervalidasi'}
          </p>
        </div>
      </div>

      {/* Source Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
        {[
          { key: 'ALL', label: 'Semua Mutasi', count: data.length },
          { key: 'EXPENSE', label: '↑ Uang Keluar', count: data.filter((d) => !isIncomeItem(d)).length },
          { key: 'INCOME', label: '↓ Uang Masuk', count: data.filter((d) => isIncomeItem(d)).length },
          { key: 'RECEIPT', label: '📸 Scan Nota Fisik', count: data.filter((d) => d.channel.toLowerCase().includes('receipt') || d.providerName.toLowerCase().includes('nota')).length },
          { key: 'QRIS', label: '⚡ QRIS & E-Wallet', count: data.filter((d) => `${d.channel} ${d.providerName}`.toLowerCase().match(/qris|gopay|ovo|dana|shopee/)).length },
          { key: 'BANK', label: '🏦 Transfer Bank', count: data.filter((d) => `${d.channel} ${d.providerName}`.toLowerCase().match(/bca|mandiri|bri|bni|seabank|bank/)).length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === tab.key
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeFilter === tab.key
                  ? 'bg-slate-700 text-slate-200 dark:bg-slate-200 dark:text-slate-800'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        searchPlaceholder="Filter berdasarkan Ref Transaksi, Merchant, atau Kanal..."
        searchKey={(item) => `${item.transactionRef} ${item.externalRef} ${item.providerName} ${item.type || ''}`}
        onRowClick={(item) => setSelectedItem(item)}
        exportFileName="mutasi_finansial_reconx"
      />

      {/* Detail Slide-over Drawer */}
      <DetailDrawer
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.transactionRef || 'Detail Transaksi'}
        subtitle={`Kanal: ${selectedItem?.channel} · External Ref: ${selectedItem?.externalRef}`}
      >
        {selectedItem && (
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Jenis Transaksi:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    isIncomeItem(selectedItem)
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  }`}
                >
                  {isIncomeItem(selectedItem) ? '↓ Uang Masuk' : '↑ Uang Keluar'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nominal Transaksi:</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    isIncomeItem(selectedItem) ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {(isIncomeItem(selectedItem) ? '+ ' : '- ') + formatCurrency(selectedItem.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Biaya / Gateway Fee:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {formatCurrency(selectedItem.feeAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
                <span className="text-slate-500 font-semibold">Net Bersih:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(selectedItem.amount - selectedItem.feeAmount)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-white">Parameter Sistem</h4>
              <div className="font-mono text-[11px] bg-slate-100 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1 text-slate-700 dark:text-slate-300">
                <div>ID: {selectedItem.id}</div>
                <div>Mata Uang: {selectedItem.currency} (ISO 4217)</div>
                <div>Status: {selectedItem.status}</div>
                <div>Waktu Pembuatan: {selectedItem.createdAt}</div>
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
