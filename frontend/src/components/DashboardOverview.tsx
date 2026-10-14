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
      {/* Top Banner & Run Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Payment Clearing Overview</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time transaction matching, fee variance deduction, and settlement verification.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="h-9 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
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
            className="flex h-9 items-center space-x-2 rounded-md bg-emerald-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            {isRunning ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            <span>{isRunning ? 'Reconciling...' : 'Run Engine'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Reconciled Volume */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Internal Volume</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-white font-mono">
            {formatCurrency(kpi.totalInternalVolume)}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-400">
            <span>{kpi.totalInternalCount} registered internal records</span>
          </div>
        </div>

        {/* Card 2: Match Rate */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Deterministic Match Rate</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-white font-mono">
            {kpi.overallMatchRate.toFixed(2)}%
          </div>
          <div className="mt-1 flex items-center text-[11px] text-emerald-400">
            <span>Deterministic + Fee Variance Pipeline</span>
          </div>
        </div>

        {/* Card 3: Discrepancy Amount */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Discrepancies</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-rose-400 font-mono">
            {formatCurrency(kpi.totalDiscrepancyAmount)}
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-400">
            <span>{kpi.openExceptionsCount} cases requiring investigation</span>
          </div>
        </div>

        {/* Card 4: Clearing Runs */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Clearing Executions</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-white font-mono">
            {kpi.totalRuns} <span className="text-sm font-normal text-slate-400">Runs</span>
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-400">
            <span>Multi-pass batch runs completed</span>
          </div>
        </div>
      </div>

      {/* Discrepancy Breakdown & Active Providers */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Breakdown Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold text-white">Discrepancy Breakdown</h3>
          <p className="text-xs text-slate-400 mb-4">Distribution by classification category</p>

          <div className="space-y-3">
            {metrics?.discrepancyBreakdown && metrics.discrepancyBreakdown.length > 0 ? (
              metrics.discrepancyBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="text-slate-300 font-medium">{item.status}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-slate-200">{item.count} items</span>
                    <span className="text-slate-500 text-[10px] block">
                      {formatCurrency(item.totalAmount)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                No discrepancies recorded yet. Run the reconciliation engine.
              </div>
            )}
          </div>
        </div>

        {/* Reconciliation Runs Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Reconciliation Runs</h3>
              <p className="text-xs text-slate-400">Historical execution audits and match rates</p>
            </div>
            <button
              onClick={onRefresh}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Run Number</th>
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3 text-right">Records</th>
                  <th className="py-2.5 px-3 text-right">Match Rate</th>
                  <th className="py-2.5 px-3 text-right">Variance</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {runs.length > 0 ? (
                  runs.map((r) => (
                    <tr key={r.runId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-200">
                        {r.runNumber}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                          {r.providerCode}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                        {r.totalProcessed}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        <span className={`font-semibold ${r.matchPercentage >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {r.matchPercentage.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                        {formatCurrency(r.totalDiscrepancyAmount)}
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => onSelectRun(r.runId)}
                          className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-medium text-[11px]"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                      No runs recorded. Click &quot;Run Engine&quot; to execute the first reconciliation.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
