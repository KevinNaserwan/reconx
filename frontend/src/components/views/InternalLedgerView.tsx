'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, ColumnDef } from '../ui/DataTable';
import { API_BASE_URL } from '@/lib/api';
import { CreditCard, QrCode, Landmark, ArrowDownLeft, Eye, TrendingDown, TrendingUp, Wallet, Layers, PlusCircle, Users, X, CheckCircle2 } from 'lucide-react';
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
  const [selectedMember, setSelectedMember] = useState<string>('ALL');

  // Manual Transaction Entry State
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [manualType, setManualType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [manualMember, setManualMember] = useState<string>('Kevin');
  const [manualAmount, setManualAmount] = useState<string>('');
  const [manualCategory, setManualCategory] = useState<string>('Konsumsi & Belanja');
  const [manualWallet, setManualWallet] = useState<string>('Tunai (Cash)');
  const [manualMerchant, setManualMerchant] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchData = () => {
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
  };

  useEffect(() => {
    fetchData();
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

  const getMemberFromItem = (item: InternalTransactionItem): string => {
    const text = `${item.externalRef} ${item.transactionRef} ${item.providerName}`.toLowerCase();
    if (text.includes('[istri]') || text.includes('istri')) return 'Istri';
    if (text.includes('[anak]') || text.includes('anak')) return 'Anak';
    return 'Kevin';
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
      header: 'Internal Ref & Anggota',
      accessorKey: 'transactionRef',
      sortable: true,
      cell: (item) => {
        const member = getMemberFromItem(item);
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {item.transactionRef}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  member === 'Kevin'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : member === 'Istri'
                    ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                }`}
              >
                {member}
              </span>
            </div>
            <span className="block text-[10px] text-slate-400 font-mono">
              Ext: {item.externalRef}
            </span>
          </div>
        );
      },
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

  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(manualAmount.replace(/[^0-9]/g, ''));
    if (!parsedAmount || parsedAmount <= 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/mobile/sync-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appPackage: 'com.reconx.manual.web',
          appName: manualWallet,
          title: `Input Manual (${manualMember})`,
          content: `${manualType === 'INCOME' ? 'Penerimaan' : 'Pengeluaran'} manual ${manualCategory}: ${manualMerchant || manualWallet} senilai Rp ${parsedAmount}`,
          postTime: Date.now(),
          userEmail: 'knaserwan@reconx.io',
          explicitAmount: parsedAmount,
          explicitMerchant: manualMerchant || (manualType === 'INCOME' ? 'Penerimaan Kas' : 'Pengeluaran Kas'),
          type: manualType,
          member: manualMember,
          category: manualCategory,
        }),
      });
      if (res.ok) {
        setIsManualModalOpen(false);
        setManualAmount('');
        setManualMerchant('');
        fetchData();
      }
    } catch (err) {
      console.error('Error saving manual transaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredData = data.filter((item) => {
    if (selectedMember !== 'ALL') {
      const member = getMemberFromItem(item);
      if (member !== selectedMember) return false;
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Buku Kas & Mutasi Finansial</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pencatatan real-time seluruh mutasi Uang Masuk dan Uang Keluar dari HP Android, Scan Nota, dan Input Manual.
          </p>
        </div>
        <button
          onClick={() => setIsManualModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Catat Mutasi Manual</span>
        </button>
      </div>

      {/* Family Member Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-1">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          Anggota:
        </span>
        {[
          { key: 'ALL', label: 'Semua Keluarga' },
          { key: 'Kevin', label: 'Kevin' },
          { key: 'Istri', label: 'Istri' },
          { key: 'Anak', label: 'Anak' },
        ].map((m) => {
          const count = m.key === 'ALL' ? data.length : data.filter((d) => getMemberFromItem(d) === m.key).length;
          return (
            <button
              key={m.key}
              onClick={() => setSelectedMember(m.key)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedMember === m.key
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{m.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {count}
              </span>
            </button>
          );
        })}
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

      {/* Modal Catat Mutasi Manual (Hallmark UI) */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Catat Mutasi Kas Manual</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Pencatatan uang masuk atau keluar mandiri</p>
                </div>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="space-y-3.5 text-xs">
              {/* Type Toggle: Uang Keluar vs Uang Masuk */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setManualType('EXPENSE')}
                  className={`py-2 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                    manualType === 'EXPENSE'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <TrendingDown className="h-3.5 w-3.5" />
                  Uang Keluar
                </button>
                <button
                  type="button"
                  onClick={() => setManualType('INCOME')}
                  className={`py-2 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                    manualType === 'INCOME'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Uang Masuk
                </button>
              </div>

              {/* Anggota Keluarga */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Anggota Keluarga
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Kevin', 'Istri', 'Anak'].map((mem) => (
                    <button
                      key={mem}
                      type="button"
                      onClick={() => setManualMember(mem)}
                      className={`py-1.5 px-2 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                        manualMember === mem
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {mem}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nominal (Rp) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nominal Transaksi (Rp) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-xs">Rp</span>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="Contoh: 50000"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Kategori & Dompet */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori
                  </label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Konsumsi & Belanja">Konsumsi & Belanja</option>
                    <option value="Transportasi & Bensin">Transportasi & Bensin</option>
                    <option value="Tagihan & Utilitas">Tagihan & Utilitas</option>
                    <option value="Kesehatan & Obat">Kesehatan & Obat</option>
                    <option value="Gaji & Pendapatan">Gaji & Pendapatan</option>
                    <option value="Investasi & Tabungan">Investasi & Tabungan</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sumber / Dompet
                  </label>
                  <select
                    value={manualWallet}
                    onChange={(e) => setManualWallet(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Tunai (Cash)">Tunai (Cash)</option>
                    <option value="blu by BCA Digital">blu by BCA Digital</option>
                    <option value="BCA Mobile">BCA Mobile</option>
                    <option value="Livin' by Mandiri">Livin' by Mandiri</option>
                    <option value="BRImo BRI">BRImo BRI</option>
                    <option value="GoPay">GoPay</option>
                    <option value="OVO">OVO</option>
                    <option value="DANA">DANA</option>
                    <option value="ShopeePay">ShopeePay</option>
                    <option value="SeaBank">SeaBank</option>
                  </select>
                </div>
              </div>

              {/* Merchant / Keterangan */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Keterangan / Merchant
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Belanja Sayur Pasar, Bensin Shell, Warung Makan"
                  value={manualMerchant}
                  onChange={(e) => setManualMerchant(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !manualAmount}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    'Menyimpan...'
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Simpan Mutasi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
