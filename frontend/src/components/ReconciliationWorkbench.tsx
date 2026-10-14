import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Copy, 
  RefreshCw 
} from 'lucide-react';
import { ReconciliationResultItem, ReconciliationRunItem, fetchRunResults } from '@/lib/api';

interface ReconciliationWorkbenchProps {
  runs: ReconciliationRunItem[];
  selectedRunId?: string;
}

export const ReconciliationWorkbench: React.FC<ReconciliationWorkbenchProps> = ({
  runs,
  selectedRunId: initialRunId
}) => {
  const [selectedRunId, setSelectedRunId] = useState<string>(initialRunId || runs[0]?.runId || '');
  const [results, setResults] = useState<ReconciliationResultItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const loadResults = useCallback(async (runId: string, status?: number) => {
    try {
      setLoading(true);
      const res = await fetchRunResults(runId, status);
      setResults(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialRunId) {
      setSelectedRunId(initialRunId);
    } else if (runs.length > 0 && !selectedRunId) {
      setSelectedRunId(runs[0].runId);
    }
  }, [initialRunId, runs, selectedRunId]);

  useEffect(() => {
    if (selectedRunId) {
      loadResults(selectedRunId, statusFilter);
    }
  }, [selectedRunId, statusFilter, loadResults]);

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1: // Matched
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-3 w-3" />
            Matched
          </span>
        );
      case 2: // MatchedWithFeeVariance
        return (
          <span className="inline-flex items-center gap-1 rounded bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-400 border border-sky-500/20">
            <CheckCircle className="h-3 w-3" />
            Fee Variance
          </span>
        );
      case 3: // AmountMismatch
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-400 border border-rose-500/20">
            <AlertTriangle className="h-3 w-3" />
            Amount Mismatch
          </span>
        );
      case 4: // MissingInternal
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400 border border-amber-500/20">
            <XCircle className="h-3 w-3" />
            Missing Internal
          </span>
        );
      case 5: // MissingProvider
        return (
          <span className="inline-flex items-center gap-1 rounded bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-400 border border-purple-500/20">
            <XCircle className="h-3 w-3" />
            Missing Provider
          </span>
        );
      case 6: // Duplicate
        return (
          <span className="inline-flex items-center gap-1 rounded bg-orange-500/10 px-2 py-0.5 text-[11px] font-medium text-orange-400 border border-orange-500/20">
            <Copy className="h-3 w-3" />
            Duplicate
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-400">
            Pending
          </span>
        );
    }
  };

  const filteredResults = results.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.externalRef?.toLowerCase().includes(s) ||
      r.internalTransactionRef?.toLowerCase().includes(s) ||
      r.providerTrxId?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-4">
      {/* Workbench Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="flex items-center space-x-3">
          <label className="text-xs font-medium text-slate-400">Execution Run:</label>
          <select
            value={selectedRunId}
            onChange={(e) => setSelectedRunId(e.target.value)}
            className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            {runs.map((r) => (
              <option key={r.runId} value={r.runId}>
                {r.runNumber} ({r.providerCode}) - {r.matchPercentage.toFixed(1)}% Matched
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Filter */}
          <select
            value={statusFilter === undefined ? '' : statusFilter}
            onChange={(e) => setStatusFilter(e.target.value === '' ? undefined : Number(e.target.value))}
            className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="1">Matched</option>
            <option value="2">Fee Variance</option>
            <option value="3">Amount Mismatch</option>
            <option value="4">Missing Internal</option>
            <option value="5">Missing Provider</option>
            <option value="6">Duplicate</option>
          </select>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-44 sm:w-56 rounded-md border border-slate-700 bg-slate-950 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => loadResults(selectedRunId, statusFilter)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 bg-slate-950 text-slate-400 hover:text-white"
            title="Refresh Table"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Status & Reference</th>
                <th className="py-3 px-4 border-l border-slate-800/80 bg-slate-950/90">
                  <span className="text-emerald-400 font-bold">● Internal System</span> (Ledger)
                </th>
                <th className="py-3 px-4 border-l border-slate-800/80 bg-slate-950/90">
                  <span className="text-sky-400 font-bold">● Provider Statement</span> (Bank / PG)
                </th>
                <th className="py-3 px-4 border-l border-slate-800 text-right">Variance</th>
                <th className="py-3 px-4">Discrepancy Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredResults.length > 0 ? (
                filteredResults.map((r) => (
                  <tr key={r.resultId} className="hover:bg-slate-800/30 transition-colors">
                    {/* Status & Reference */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-1">
                        <div>{getStatusBadge(r.matchStatus)}</div>
                        <div className="font-mono text-[11px] text-slate-300 font-medium">
                          Ref: {r.externalRef || '-'}
                        </div>
                      </div>
                    </td>

                    {/* Internal System Column */}
                    <td className="py-3 px-4 align-top border-l border-slate-800/60 bg-slate-950/20 font-mono">
                      {r.internalTransactionId ? (
                        <div>
                          <div className="font-semibold text-white">
                            {formatCurrency(r.internalAmount)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            ID: {r.internalTransactionRef}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">Not found in internal</span>
                      )}
                    </td>

                    {/* Provider Statement Column */}
                    <td className="py-3 px-4 align-top border-l border-slate-800/60 bg-slate-950/20 font-mono">
                      {r.providerTransactionId ? (
                        <div>
                          <div className="font-semibold text-white">
                            Gross: {formatCurrency(r.providerGrossAmount)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex gap-2">
                            <span>Net: {formatCurrency(r.providerNetAmount)}</span>
                            <span>Fee: {formatCurrency(r.providerFeeAmount)}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            ID: {r.providerTrxId}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">Missing in statement</span>
                      )}
                    </td>

                    {/* Variance Amount */}
                    <td className="py-3 px-4 align-top border-l border-slate-800/60 text-right font-mono font-medium">
                      {r.amountDifference > 0 ? (
                        <span className="text-rose-400">
                          {formatCurrency(r.amountDifference)}
                        </span>
                      ) : (
                        <span className="text-slate-500">Rp 0</span>
                      )}
                    </td>

                    {/* Discrepancy Reason */}
                    <td className="py-3 px-4 align-top text-slate-400 text-[11px] max-w-xs">
                      {r.discrepancyReason || (
                        <span className="text-emerald-500/80">Matched without discrepancy</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                    {loading ? 'Loading reconciliation results...' : 'No transaction results match the criteria.'}
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
