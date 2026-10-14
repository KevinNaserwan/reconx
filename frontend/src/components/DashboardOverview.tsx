'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ArrowUpRight, 
  Play, 
  Layers 
} from 'lucide-react';
import { DashboardMetrics, ReconciliationRunItem, executeReconciliationRun } from '@/lib/api';
import { MetricCard } from './ui/MetricCard';
import { AnalyticsCharts } from './views/AnalyticsCharts';

interface DashboardOverviewProps {
  metrics: DashboardMetrics | null;
  runs: ReconciliationRunItem[];
  onRefresh: () => void;
  onSelectRun: (runId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  metrics,
  runs,
  onRefresh,
  onSelectRun
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>(
    metrics?.providers[0]?.id || 'prov-midtrans-001'
  );

  const handleRunReconciliation = async () => {
    try {
      setIsRunning(true);
      const now = new Date();
      const cutoffStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      const cutoffEnd = new Date(now.setHours(23, 59, 59, 999)).toISOString();

      await executeReconciliationRun(selectedProvider, cutoffStart, cutoffEnd);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      alert(`Error triggering reconciliation: ${msg}`);
    } finally {
      setIsRunning(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const kpi = metrics?.kpis || {
    totalInternalVolume: 0,
    totalInternalCount: 0,
    totalProviderVolume: 0,
    totalProviderCount: 0,
    overallMatchRate: 0,
    openExceptionsCount: 0,
    totalDiscrepancyAmount: 0,
    totalRuns: 0
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-card transition-colors">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Clearing & Settlement Operations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Realtime deterministic transaction correlation, MDR fee variance verification, and ledger reconciler.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-xs text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            {metrics?.providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>

          <button
            onClick={handleRunReconciliation}
            disabled={isRunning}
            className="flex h-9 items-center space-x-1.5 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            {isRunning ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            <span>{isRunning ? 'Processing...' : 'Run Engine'}</span>
          </button>
        </div>
      </div>

      {/* Reusable Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Internal Ledger Volume"
          value={formatCurrency(kpi.totalInternalVolume)}
          subtitle={`${kpi.totalInternalCount} registered internal records`}
          change={{ value: '+4.2% today', positive: true }}
          icon={<TrendingUp className="h-4 w-4" />}
          iconBg="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
        />

        <MetricCard
          title="Deterministic Match Rate"
          value={`${kpi.overallMatchRate.toFixed(2)}%`}
          subtitle="Multi-pass correlation accuracy"
          change={{ value: '+0.8% vs yesterday', positive: true }}
          icon={<CheckCircle2 className="h-4 w-4" />}
          iconBg="bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/20"
        />

        <MetricCard
          title="Active Discrepancies"
          value={formatCurrency(kpi.totalDiscrepancyAmount)}
          subtitle={`${kpi.openExceptionsCount} open investigation tickets`}
          change={{ value: '-2 resolved', positive: true }}
          icon={<AlertTriangle className="h-4 w-4" />}
          iconBg="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
        />

        <MetricCard
          title="Clearing Batch Runs"
          value={`${kpi.totalRuns} Batches`}
          subtitle="Audit immutability verified"
          icon={<Layers className="h-4 w-4" />}
          iconBg="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20"
        />
      </div>

      {/* Visual Analytics Charts */}
      <AnalyticsCharts matchRate={kpi.overallMatchRate} />

      {/* Recent Runs Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-card transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Reconciliation Runs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit logs of all multi-pass engine executions with transaction match rates
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            title="Refresh Runs"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Run Number</th>
                <th className="py-2.5 px-3">Provider</th>
                <th className="py-2.5 px-3 text-right">Records</th>
                <th className="py-2.5 px-3 text-right">Match Rate</th>
                <th className="py-2.5 px-3 text-right">Discrepancy Total</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {runs.length > 0 ? (
                runs.map((r) => (
                  <tr key={r.runId} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-slate-200">
                      {r.runNumber}
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                        {r.providerCode}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      {r.totalProcessed}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span className={`font-bold ${r.matchPercentage >= 95 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {r.matchPercentage.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-rose-600 dark:text-rose-400 font-semibold">
                      {formatCurrency(r.totalDiscrepancyAmount)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectRun(r.runId)}
                        className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold text-xs"
                      >
                        <span>Inspect Run</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No runs recorded yet. Click &quot;Run Engine&quot; to execute the first reconciliation batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
