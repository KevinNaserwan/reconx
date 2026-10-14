'use client';
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

export const ConnectorsView: React.FC = () => {
  const [simulating, setSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string | null>(null);

  const connectors = [
    {
      id: 'MIDTRANS',
      name: 'Midtrans Payment Gateway',
      type: 'Aggregator (QRIS, CC, ShopeePay)',
      status: 'OPERATIONAL',
      ping: '42ms',
      feeStructure: '1.50% MDR (Percentage)',
      cutoff: '23:59:59 WIB',
      lastBatch: '10 minutes ago',
    },
    {
      id: 'XENDIT',
      name: 'Xendit XenPlatform',
      type: 'Direct Settlement & Payouts',
      status: 'OPERATIONAL',
      ping: '38ms',
      feeStructure: 'Rp 4.500 / payout (Fixed)',
      cutoff: 'Realtime (Continuous)',
      lastBatch: '25 minutes ago',
    },
    {
      id: 'BCA_VA',
      name: 'Bank Central Asia - Host to Host',
      type: 'Direct Core Banking Virtual Account',
      status: 'OPERATIONAL',
      ping: '64ms',
      feeStructure: 'Rp 2.500 / inquiry (Fixed)',
      cutoff: '21:00:00 WIB',
      lastBatch: '1 hour ago',
    },
    {
      id: 'BLU_BCA',
      name: 'blu by BCA Digital',
      type: 'Bank Digital BCA (SNAP BI & e-Statement)',
      status: 'OPERATIONAL',
      ping: '35ms',
      feeStructure: 'Gratis / BI-FAST (Rp 0 - Rp 2.500)',
      cutoff: '23:59:59 WIB',
      lastBatch: '5 minutes ago',
    },
    {
      id: 'SUPERBANK',
      name: 'Superbank Indonesia',
      type: 'Bank Digital Grab/Singtel (BI-FAST / Open API)',
      status: 'OPERATIONAL',
      ping: '48ms',
      feeStructure: 'BI-FAST Settlement (Gratis promo)',
      cutoff: 'Realtime (Continuous)',
      lastBatch: '12 minutes ago',
    },
    {
      id: 'SEABANK',
      name: 'SeaBank Indonesia',
      type: 'Bank Digital Shopee Group (QRIS / VA SNAP)',
      status: 'OPERATIONAL',
      ping: '31ms',
      feeStructure: 'Rp 1.000 / VA Inquiry & QRIS',
      cutoff: 'Realtime (Continuous)',
      lastBatch: '18 minutes ago',
    },
    {
      id: 'SHOPEEPAY',
      name: 'ShopeePay (AirPay International)',
      type: 'E-Wallet & Merchant QRIS Aggregation',
      status: 'OPERATIONAL',
      ping: '29ms',
      feeStructure: '0.70% QRIS MDR / Webhook Direct',
      cutoff: '23:59:59 WIB (H+1 Settle)',
      lastBatch: '8 minutes ago',
    },
  ];

  const handleSimulateWebhook = async (providerCode: string) => {
    try {
      setSimulating(true);
      const randomTrxRef = `TRX-SIM-${Date.now().toString().slice(-6)}`;
      const randomExtRef = `EXT-${providerCode.slice(0, 3)}-${Date.now().toString().slice(-4)}`;
      const amount = Math.floor(Math.random() * 8 + 2) * 100000; // 200k - 1M

      const providerIdMap: Record<string, { id: string; channel: string; feeRate: number }> = {
        MIDTRANS: { id: 'prov-midtrans-001', channel: 'QRIS', feeRate: 0.015 },
        XENDIT: { id: 'prov-xendit-002', channel: 'PAYOUT', feeRate: 0 },
        BCA_VA: { id: 'prov-bca-003', channel: 'VA', feeRate: 0 },
        BLU_BCA: { id: 'prov-blu-004', channel: 'SNAP_BI_DEBIT', feeRate: 0 },
        SUPERBANK: { id: 'prov-superbank-005', channel: 'BI_FAST', feeRate: 0 },
        SEABANK: { id: 'prov-seabank-006', channel: 'QRIS', feeRate: 0 },
        SHOPEEPAY: { id: 'prov-shopeepay-007', channel: 'SHOPEEPAY_WALLET', feeRate: 0.007 },
      };

      const target = providerIdMap[providerCode] || {
        id: 'prov-midtrans-001',
        channel: 'QRIS',
        feeRate: 0.015,
      };

      const res = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': `SIM-${randomTrxRef}`,
        },
        body: JSON.stringify({
          transactionRef: randomTrxRef,
          externalRef: randomExtRef,
          providerId: target.id,
          amount,
          feeAmount: Math.round(amount * target.feeRate),
          currency: 'IDR',
          transactionTime: new Date().toISOString(),
          channel: target.channel,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
      }

      const data = await res.json();
      setSimulationLog(
        `[SUCCESS] 200 OK — Injected webhook transaction '${data.transactionRef || randomTrxRef}' for ${providerCode} (Nominal: Rp ${amount.toLocaleString('id-ID')}). Stored in Internal Ledger.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setSimulationLog(`[ERROR] Connection failed: ${msg}. Make sure backend is running on http://localhost:5000.`);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Payment Provider Connectors & Telemetry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Realtime status, health ping, cutoff windows, and simulated webhook ingestion endpoints.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Engine API Connected (:5000)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connectors.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-card hover:shadow-elevated transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 block tracking-wider">
                  {c.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {c.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{c.type}</p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  c.status === 'OPERATIONAL'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                {c.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border-y border-slate-100 dark:border-slate-800/80 py-3.5">
              <div>
                <span className="text-xs text-slate-400 block">Fee Schedule:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{c.feeStructure}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Latency Ping:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{c.ping}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Cutoff Window:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{c.cutoff}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Last Statement:</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">{c.lastBatch}</span>
              </div>
            </div>

            <button
              onClick={() => handleSimulateWebhook(c.id)}
              disabled={simulating}
              className="w-full flex items-center justify-center space-x-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-800/50 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all shadow-sm disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5 text-emerald-500" />
              <span>{simulating ? 'Injecting Webhook...' : 'Simulate Webhook Payment'}</span>
            </button>
          </div>
        ))}
      </div>

      {simulationLog && (
        <div className={`rounded-xl border p-4 text-xs font-mono shadow-sm transition-all ${
          simulationLog.startsWith('[SUCCESS]') 
            ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300' 
            : 'border-rose-200 dark:border-rose-800/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300'
        }`}>
          {simulationLog}
        </div>
      )}
    </div>
  );
};
