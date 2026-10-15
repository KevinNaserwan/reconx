'use client';

import React, { useState } from 'react';
import { 
  Smartphone, 
  Mail, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  Link2
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { useAuth } from '../auth/AuthContext';
import { BrandBadge } from '../ui/BrandBadge';

export const MobileSyncView: React.FC = () => {
  const { user } = useAuth();
  const [simulationType, setSimulationType] = useState<'notification' | 'email'>('notification');
  const [isInjecting, setIsInjecting] = useState(false);
  const [injectResult, setInjectResult] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState('Pluang (Emas & Saham AS)');
  const [customText, setCustomText] = useState('Pembelian Saham AS NVDA senilai Rp 500.000 telah berhasil dieksekusi di market.');
  const [invoiceNumber, setInvoiceNumber] = useState('PLU-992182');
  
  const [syncedHistory, setSyncedHistory] = useState<any[]>([]);

  const targetApps = [
    { 
      name: 'Pluang (Emas & Saham AS)', 
      pkg: 'com.pluang.android', 
      sender: 'no-reply@pluang.com',
      color: 'text-amber-400', 
      notifText: 'Pembelian Saham AS NVDA senilai Rp 500.000 telah berhasil dieksekusi di market.',
      emailText: 'Hai Kevin Naserwan, Bukti Transaksi Pembelian Saham AS senilai Rp 500.000 telah terverifikasi. Nomor Order: PLU-992182.',
      defaultInvoice: 'PLU-992182'
    },
    { 
      name: 'Bibit Reksadana & SBN', 
      pkg: 'com.bibit.id', 
      sender: 'no-reply@bibit.id',
      color: 'text-teal-400', 
      notifText: 'Pembelian Reksa Dana Pasar Uang senilai Rp 1.000.000 telah berhasil.',
      emailText: 'Konfirmasi Pembelian Reksa Dana senilai Rp 1.000.000 telah diverifikasi oleh KSEI. Invoice: BIB-774912.',
      defaultInvoice: 'BIB-774912'
    },
    { 
      name: 'Bareksa Investasi', 
      pkg: 'com.bareksa.android', 
      sender: 'no-reply@bareksa.com',
      color: 'text-emerald-400', 
      notifText: 'Order Reksa Dana sebesar Rp 750.000 telah sukses.',
      emailText: 'Order Reksa Dana Pendapatan Tetap Rp 750.000 berhasil diverifikasi. Invoice: BAR-338291.',
      defaultInvoice: 'BAR-338291'
    },
    { 
      name: 'Ajaib Sekuritas', 
      pkg: 'com.ajaib.android', 
      sender: 'support@ajaib.co.id',
      color: 'text-blue-400', 
      notifText: 'Order Beli Saham BBCA Rp 2.500.000 telah MATCH.',
      emailText: 'Konfirmasi Transaksi Beli Saham BBCA senilai Rp 2.500.000. Trade ID: AJB-662910.',
      defaultInvoice: 'AJB-662910'
    },
    { 
      name: 'Stockbit Saham', 
      pkg: 'id.stockbit.android', 
      sender: 'statement@stockbit.com',
      color: 'text-indigo-400', 
      notifText: 'Order buy 10 lot BMRI Rp 6.800.000 telah executed.',
      emailText: 'Trade Confirmation Buy BMRI senilai Rp 6.800.000. Order No: STK-882193.',
      defaultInvoice: 'STK-882193'
    },
    { 
      name: 'blu by BCA Digital', 
      pkg: 'id.co.bcadigital.blu', 
      sender: 'haloblu@bcadigital.co.id',
      color: 'text-cyan-400', 
      notifText: 'Pembayaran QRIS sebesar Rp 50.000 ke Starbucks telah berhasil.',
      emailText: 'Resi e-Statement Pembayaran QRIS blu Rp 50.000. Ref: BLU-552918.',
      defaultInvoice: 'BLU-552918'
    },
    { 
      name: 'SeaBank Indonesia', 
      pkg: 'com.searpm.bank', 
      sender: 'cs@seabank.co.id',
      color: 'text-orange-400', 
      notifText: 'Transfer masuk Rp 250.000 dari Rekening BCA telah selesai.',
      emailText: 'Bukti Transfer Masuk SeaBank Rp 250.000. Transaksi Ref: SEA-991283.',
      defaultInvoice: 'SEA-991283'
    },
    { 
      name: 'Superbank Indonesia', 
      pkg: 'id.superbank.app', 
      sender: 'help@superbank.id',
      color: 'text-purple-400', 
      notifText: 'Transfer keluar Rp 120.000 via BI-FAST ke Bank Mandiri berhasil.',
      emailText: 'Resi Transfer BI-FAST Superbank Rp 120.000. Nomor Referensi: SUP-449102.',
      defaultInvoice: 'SUP-449102'
    },
    { 
      name: 'ShopeePay', 
      pkg: 'com.shopee.id', 
      sender: 'support@shopeepay.co.id',
      color: 'text-amber-500', 
      notifText: 'Pembayaran sebesar Rp 85.000 di Toko Sayur Segar berhasil.',
      emailText: 'Bukti Pembayaran ShopeePay Rp 85.000. Order ID: SHO-119283.',
      defaultInvoice: 'SHO-119283'
    },
    { 
      name: 'Tokopedia', 
      pkg: 'com.tokopedia.tkpd', 
      sender: 'invoice@tokopedia.com',
      color: 'text-emerald-500', 
      notifText: 'Pembayaran pesanan Rp 320.000 telah diverifikasi Tokopedia.',
      emailText: 'Invoice Resmi Tokopedia INV/20261014/XX/320000. Total Rp 320.000.',
      defaultInvoice: 'INV/20261014/XX/320000'
    }
  ];

  const handleAppSelect = (app: typeof targetApps[0]) => {
    setSelectedApp(app.name);
    setInvoiceNumber(app.defaultInvoice);
    if (simulationType === 'notification') {
      setCustomText(app.notifText);
    } else {
      setCustomText(app.emailText);
    }
  };

  const handleSwitchType = (type: 'notification' | 'email') => {
    setSimulationType(type);
    const app = targetApps.find(a => a.name === selectedApp) || targetApps[0];
    if (type === 'notification') {
      setCustomText(app.notifText);
    } else {
      setCustomText(app.emailText);
    }
  };

  const handleInjectTest = async () => {
    setIsInjecting(true);
    try {
      const activeApp = targetApps.find(a => a.name === selectedApp) || targetApps[0];
      const baseUrl = API_BASE_URL.replace('/v1', '');

      let endpoint = `${baseUrl}/v1/mobile/sync-notification`;
      let bodyData: any = {};

      if (simulationType === 'notification') {
        bodyData = {
          appPackage: activeApp.pkg,
          appName: activeApp.name,
          title: 'Notifikasi Transaksi HP',
          content: customText,
          postTime: Date.now(),
          userEmail: user?.email || 'kevin.naserwan@reconx.io'
        };
      } else {
        endpoint = `${baseUrl}/v1/email/ingest-receipt`;
        bodyData = {
          from: activeApp.sender,
          subject: `Bukti Transaksi - ${activeApp.name}`,
          body: customText,
          invoiceNumber: invoiceNumber,
          userEmail: user?.email || 'kevin.naserwan@reconx.io'
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();

      setInjectResult(data.message);

      // Check if already in history or insert
      setSyncedHistory(prev => {
        const existingIdx = prev.findIndex(item => item.id === data.transactionRef);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            channel: data.channel,
            ref: data.externalRef || updated[existingIdx].ref,
            isEnriched: true
          };
          return updated;
        } else {
          return [
            {
              id: data.transactionRef,
              app: activeApp.name,
              pkg: activeApp.pkg,
              amount: data.parsedAmount || data.amount,
              merchant: data.merchant || activeApp.name,
              channel: data.channel,
              ref: data.externalRef,
              time: 'Baru saja',
              isEnriched: data.isDuplicate || false
            },
            ...prev
          ];
        }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setInjectResult(`[ERROR] ${msg}`);
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Multi-Platform Sync & Anti-Deduplication Hub</span>
                <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold">
                  PROTECTED
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Otomatisasi tangkap mutasi perbankan, dompet digital, & investasi (Pluang, Bibit, Bareksa, dll.) dengan proteksi pencegahan duplikasi data (*anti-double counting*).
              </p>
            </div>
          </div>
        </div>

        {/* Protection Shield Status */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/30 px-3.5 py-1.5 text-xs text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="font-bold">Anti-Double Engine:</span>
            <span className="font-mono text-xs">CROSS-CHANNEL ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Mobile Companion APK Download Banner */}
      <div className="rounded-2xl border border-cyan-200 dark:border-cyan-800/60 bg-gradient-to-r from-cyan-50/80 via-blue-50/50 to-indigo-50/60 dark:from-cyan-950/40 dark:via-blue-950/30 dark:to-indigo-950/40 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-600 text-white shadow-md shadow-cyan-600/20 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Download ReconX Companion Android APK</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-600 text-white">v1.3.13</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Pasang aplikasi di HP Android Mas Kevin untuk menangkap notifikasi transaksi otomatis (BCA, Superbank, SeaBank, Mandiri, Shopee, OVO, Bibit, Pluang).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <a
            href="https://github.com/KevinNaserwan/reconx-mobile/actions"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial text-center px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            GitHub Actions Builds
          </a>
          <a
            href="https://github.com/KevinNaserwan/reconx-mobile/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial text-center px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs transition-colors"
          >
            Download APK (Releases)
          </a>
        </div>
      </div>

      {/* Overview 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Mobile Listener */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Channel 1: Mobile App</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Smartphone className="h-4 w-4 text-cyan-500" />
            <span>Android Notification Listener</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Menangkap notifikasi pop-up seketika saat Mas Kevin checkout di Tokopedia, bayar QRIS, atau top up di HP.
          </p>
          <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            Endpoint: /api/v1/mobile/sync-notification
          </div>
        </div>

        {/* Card 2: Email Receipt Ingestion */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Channel 2: Email Receipt</span>
            <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Mail className="h-4 w-4 text-emerald-500" />
            <span>Official e-Statement & Invoices</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Menyerap bukti transaksi resmi dari email (Pluang, Bibit, Tokopedia) lengkap dengan nomor invoice resmi.
          </p>
          <div className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
            Forwarder: receipts+kevin@reconx.io
          </div>
        </div>

        {/* Card 3: Anti-Deduplication Engine */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Protection Shield</span>
            <Sparkles className="h-4 w-4 text-emerald-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Link2 className="h-4 w-4 text-emerald-500" />
            <span>Anti-Double Counting Window (±20 Min)</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Jika satu transaksi menerima notifikasi HP dan email bukti bayar sekaligus, ReconX otomatis **menggabungkan data** tanpa menduplikasi nominal rupiah.
          </p>
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            Deduplication Algorithm: ACTIVE
          </div>
        </div>
      </div>

      {/* Target Platforms (10 Ecosystems) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Platform & Ekosistem Terkoneksi (10 Kanal)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilih platform di bawah untuk menguji integrasi notifikasi HP vs bukti invoice email
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">10 Platforms Protected</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {targetApps.map((app, idx) => (
            <button
              key={idx}
              onClick={() => handleAppSelect(app)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedApp === app.name
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BrandBadge brand={app.name} size={24} />
                <span className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">{app.name}</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-1.5 font-mono">{app.pkg}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Anti-Deduplication Simulator */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Zap className="h-4 w-4 text-emerald-500" />
              <span>Simulasi Pengujian Anti-Deduplikasi: Notifikasi HP vs Bukti Email</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kirim Notifikasi HP terlebih dahulu, lalu kirim Bukti Email untuk platform yang sama. Perhatikan sistem menggabungkan keduanya tanpa menggandakan nominal!
            </p>
          </div>

          {/* Toggle Type */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => handleSwitchType('notification')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                simulationType === 'notification'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>1. Notifikasi HP</span>
            </button>
            <button
              onClick={() => handleSwitchType('email')}
              className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                simulationType === 'email'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>2. Bukti Email</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
              placeholder="Isi teks transaksi..."
            />
            {simulationType === 'email' && (
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-48 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                placeholder="Invoice No"
              />
            )}
            <button
              onClick={handleInjectTest}
              disabled={isInjecting}
              className={`flex items-center justify-center space-x-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50 ${
                simulationType === 'notification'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                  : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/20'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isInjecting ? 'Memproses...' : simulationType === 'notification' ? 'Kirim Notifikasi HP' : 'Kirim Bukti Email'}</span>
            </button>
          </div>

          {injectResult && (
            <div className={`p-3.5 rounded-xl border text-xs font-mono transition-all ${
              injectResult.includes('Deduplikasi Cerdas') || injectResult.includes('TIDAK diduplikasi')
                ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                : injectResult.startsWith('[SUCCESS]')
                ? 'border-cyan-300 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300'
                : 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
            }`}>
              {injectResult}
            </div>
          )}
        </div>
      </div>

      {/* Real-time Synced Feed */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Live Intercepted Transactions & Anti-Double Audit Feed
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Riwayat mutasi terdata di ledger dengan status verifikasi silang (Hybrid Notif + Email)
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">{syncedHistory.length} Transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Transaction ID</th>
                <th className="py-3 px-3">Platform</th>
                <th className="py-3 px-3">Merchant / Instrument</th>
                <th className="py-3 px-3 text-right">Nominal (Rp)</th>
                <th className="py-3 px-3">Reference / Invoice</th>
                <th className="py-3 px-3">Channel Source</th>
                <th className="py-3 px-3 text-right">Deduplication Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {syncedHistory.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {item.id}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.app}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                    {item.merchant}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    Rp {Number(item.amount).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {item.ref}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-semibold ${
                      item.channel === 'HYBRID_NOTIF_AND_EMAIL'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : item.channel.includes('EMAIL')
                        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {item.channel}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {item.isEnriched ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold">
                        <CheckCircle2 className="h-3 w-3" />
                        DEDUPLICATED & ENRICHED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 text-[10px] font-bold">
                        SINGLE SOURCE
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
