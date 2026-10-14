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
      id: 'MANDIRI',
      name: 'Bank Mandiri MCM 2.0',
      type: 'Corporate Treasury Clearing',
      status: 'DEGRADED',
      ping: '185ms',
      feeStructure: 'Rp 2.000 / settlement (Fixed)',
      cutoff: '22:00:00 WIB',
      lastBatch: '3 hours ago',
    },
  ];

  const handleSimulateWebhook = async (providerCode: string) => {
    try {
      setSimulating(true);
      const randomTrxRef = `TRX-SIM-${Date.now().toString().slice(-6)}`;
      const randomExtRef = `EXT-${providerCode.slice(0, 3)}-${Date.now().toString().slice(-4)}`;
      const amount = Math.floor(Math.random() * 8 + 2) * 100000; // 200k - 1M

      const res = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': `SIM-${randomTrxRef}`,
        },
        body: JSON.stringify({
          transactionRef: randomTrxRef,
          externalRef: randomExtRef,
          providerId: 'prov-midtrans-001',
          amount,
          feeAmount: amount * 0.015,
          currency: 'IDR',
          transactionTime: new Date().toISOString(),
          channel: 'QRIS',
        }),
      });

      if (!res.ok) throw new Error('Simulation failed');
      setSimulationLog(
        `[SUCCESS] Injected transaction '${randomTrxRef}' (Nominal: Rp ${amount.toLocaleString('id-ID')}) into internal ledger.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setSimulationLog(`[ERROR] ${msg}`);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Payment Provider Connectors & Telemetry
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Realtime status, health ping, cutoff windows, and simulated webhook ingestion endpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connectors.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-card space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-slate-400 block">
                  {c.id}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {c.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{c.type}</p>
              </div>

              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  c.status === 'OPERATIONAL'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                {c.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 dark:border-slate-800/80 py-3">
              <div>
                <span className="text-[11px] text-slate-400 block">Fee Schedule:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{c.feeStructure}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Latency Ping:</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{c.ping}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Cutoff Window:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{c.cutoff}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Last Statement:</span>
                <span className="text-slate-500 dark:text-slate-400">{c.lastBatch}</span>
              </div>
            </div>

            <button
              onClick={() => handleSimulateWebhook(c.id)}
              disabled={simulating}
              className="w-full flex items-center justify-center space-x-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
            >
              <Send className="h-3 w-3 text-emerald-500" />
              <span>Simulate Webhook Payment</span>
            </button>
          </div>
        ))}
      </div>

      {simulationLog && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs font-mono text-slate-700 dark:text-slate-300">
          {simulationLog}
        </div>
      )}
    </div>
  );
};
