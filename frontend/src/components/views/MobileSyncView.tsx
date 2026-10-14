'use client';

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Wifi, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  DollarSign, 
  Layers, 
  Clock, 
  Zap,
  Lock
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { useAuth } from '../auth/AuthContext';

export const MobileSyncView: React.FC = () => {
  const { user, setIsLoginModalOpen } = useAuth();
  const [isInjecting, setIsInjecting] = useState(false);
  const [injectResult, setInjectResult] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState('blu by BCA Digital');
  const [customText, setCustomText] = useState('Pembayaran QRIS sebesar Rp 75.000 ke Solaria Plaza telah berhasil.');
  const [syncedHistory, setSyncedHistory] = useState<any[]>([
    {
      id: 'MOB-HIST-01',
      app: 'blu by BCA Digital',
      pkg: 'id.co.bcadigital.blu',
      title: 'Pembayaran QRIS Berhasil',
      amount: 45000,
      merchant: 'Kopi Kenangan',
      channel: 'BLU_QRIS_OR_TRANSFER',
      time: 'Baru saja',
      status: 'SYNCED_TO_LEDGER'
    },
    {
      id: 'MOB-HIST-02',
      app: 'ShopeePay',
      pkg: 'com.shopee.id',
      title: 'ShopeePay Berhasil',
      amount: 185000,
      merchant: 'Toko Komputer Sukses',
      channel: 'SHOPEEPAY_WALLET',
      time: '2 menit lalu',
      status: 'SYNCED_TO_LEDGER'
    },
    {
      id: 'MOB-HIST-03',
      app: 'Bibit (Investasi)',
      pkg: 'com.bibit.id',
      title: 'Investasi Berhasil',
      amount: 1500000,
      merchant: 'Reksa Dana Pasar Uang',
      channel: 'INVESTMENT_SETTLEMENT',
      time: '5 menit lalu',
      status: 'SYNCED_TO_LEDGER'
    }
  ]);

  const targetApps = [
    { name: 'blu by BCA Digital', pkg: 'id.co.bcadigital.blu', color: 'text-cyan-500', defaultText: 'Pembayaran QRIS sebesar Rp 50.000 ke Starbucks telah berhasil.' },
    { name: 'SeaBank Indonesia', pkg: 'com.searpm.bank', color: 'text-orange-500', defaultText: 'Transfer masuk Rp 250.000 dari Rekening BCA telah selesai.' },
    { name: 'Superbank Indonesia', pkg: 'id.superbank.app', color: 'text-purple-500', defaultText: 'Transfer keluar Rp 120.000 via BI-FAST ke Bank Mandiri berhasil.' },
    { name: 'ShopeePay', pkg: 'com.shopee.id', color: 'text-amber-500', defaultText: 'Pembayaran sebesar Rp 85.000 di Toko Sayur Segar berhasil.' },
    { name: 'Tokopedia', pkg: 'com.tokopedia.tkpd', color: 'text-emerald-500', defaultText: 'Pembayaran pesanan Rp 320.000 telah diverifikasi Tokopedia.' },
    { name: 'OVO', pkg: 'ovo.id', color: 'text-indigo-500', defaultText: 'Berhasil bayar Rp 35.000 di Alfamart via OVO Cash.' },
    { name: 'Bibit / Ajaib (Investasi)', pkg: 'com.bibit.id', color: 'text-teal-500', defaultText: 'Pembelian Reksa Dana senilai Rp 500.000 telah berhasil diverifikasi.' }
  ];

  const handleAppSelect = (app: typeof targetApps[0]) => {
    setSelectedApp(app.name);
    setCustomText(app.defaultText);
  };

  const handleInjectTest = async () => {
    setIsInjecting(true);
    try {
      const activeAppConfig = targetApps.find(a => a.name === selectedApp) || targetApps[0];
      const res = await fetch(`${API_BASE_URL.replace('/v1', '')}/v1/mobile/sync-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appPackage: activeAppConfig.pkg,
          appName: activeAppConfig.name,
          title: 'Notifikasi Transaksi HP',
          content: customText,
          postTime: Date.now(),
          userEmail: user?.email || 'kevin.naserwan@reconx.io'
        })
      });

      if (!res.ok) throw new Error('Sync failed with status ' + res.status);
      const data = await res.json();

      setInjectResult(`[SUCCESS] Transaksi berhasil disinkronkan ke ReconX! ID: ${data.transactionRef} (Nominal: Rp ${Number(data.parsedAmount).toLocaleString('id-ID')})`);

      setSyncedHistory(prev => [
        {
          id: data.transactionRef,
          app: activeAppConfig.name,
          pkg: activeAppConfig.pkg,
          title: 'Notifikasi Transaksi HP',
          amount: data.parsedAmount,
          merchant: data.merchant,
          channel: data.channel,
          time: 'Baru saja',
          status: 'SYNCED_TO_LEDGER'
        },
        ...prev
      ]);
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
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Mobile Notification Sync Hub
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sinkronisasi otomatis mutasi pembayaran dari HP Android (blu, SeaBank, Superbank, Shopee, Tokopedia, OVO, Bibit)
              </p>
            </div>
          </div>
        </div>

        {/* Google OAuth Connection Pill */}
        <div className="flex items-center space-x-2">
          {user ? (
            <div className="flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/30 px-3.5 py-1.5 text-xs text-emerald-700 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold">Google SSO:</span>
              <span className="font-mono text-xs">{user.email}</span>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center space-x-2 rounded-xl bg-slate-900 dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Connect Google OAuth</span>
            </button>
          )}
        </div>
      </div>

      {/* Connection & Setup Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Companion Service Status */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Companion Agent</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              SERVICE ACTIVE
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              ReconX Android Listener
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Membaca notifikasi resmi bank dan dompet digital saat Mas Kevin melakukan checkout, bayar QRIS, atau transfer saldo dari smartphone.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Endpoint:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">/api/v1/mobile/sync-notification</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Security:</span>
              <span className="text-slate-700 dark:text-slate-300">Google OAuth Bearer</span>
            </div>
          </div>
        </div>

        {/* Card 2: Monitored Apps Grid */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Payment Channels</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{targetApps.length} Apps Monitored</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {targetApps.map((app, idx) => (
              <button
                key={idx}
                onClick={() => handleAppSelect(app)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedApp === app.name
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className={`text-xs font-bold truncate ${app.color}`}>{app.name}</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-1 font-mono">{app.pkg}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulator Test Injector (Allows Mas Kevin to test-fire incoming notifications) */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Zap className="h-4 w-4 text-emerald-500" />
              <span>Simulasi Notifikasi Masuk dari HP Mas Kevin</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilih aplikasi di atas atau ketik format teks notifikasi belanja/transfer untuk menguji parser otomatis ke internal ledger.
            </p>
          </div>
          <span className="rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 text-xs font-bold">
            Target: {selectedApp}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
            placeholder="Contoh: Pembayaran QRIS sebesar Rp 45.000 ke Kopi Kenangan telah berhasil."
          />
          <button
            onClick={handleInjectTest}
            disabled={isInjecting}
            className="flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-all disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isInjecting ? 'Mengirim ke Engine...' : 'Kirim Notifikasi HP'}</span>
          </button>
        </div>

        {injectResult && (
          <div className={`p-3.5 rounded-xl border text-xs font-mono transition-all ${
            injectResult.startsWith('[SUCCESS]')
              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
              : 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
          }`}>
            {injectResult}
          </div>
        )}
      </div>

      {/* Real-Time Synced Transactions Stream */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Live Intercepted Notifications Stream
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daftar transaksi yang ditangkap dari smartphone dan sudah terinput otomatis ke ledger ReconX
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">{syncedHistory.length} Recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Transaction ID</th>
                <th className="py-3 px-3">App Origin</th>
                <th className="py-3 px-3">Merchant / Recipient</th>
                <th className="py-3 px-3 text-right">Nominal (Rp)</th>
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-3 text-right">Sync Status</th>
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
                  <td className="py-3 px-3">
                    <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-400">
                      {item.channel}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold">
                      <CheckCircle2 className="h-3 w-3" />
                      LEDGER STORED
                    </span>
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
