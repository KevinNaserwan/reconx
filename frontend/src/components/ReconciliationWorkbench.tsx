'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Eye } from 'lucide-react';
import { ReconciliationResultItem, ReconciliationRunItem, fetchRunResults } from '@/lib/api';
import { DataTable, ColumnDef } from './ui/DataTable';
import { StatusBadge } from './ui/StatusBadge';
import { DetailDrawer } from './ui/DetailDrawer';

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
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ReconciliationResultItem | null>(null);

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

  const columns: ColumnDef<ReconciliationResultItem>[] = [
    {
      id: 'matchStatus',
      header: 'Classification',
      accessorKey: 'matchStatus',
      sortable: true,
      cell: (item) => (
        <div className="space-y-1">
          <StatusBadge status={item.matchStatus} type="match" />
          <div className="font-mono text-[10px] text-slate-400">
            Ref: {item.externalRef || '-'}
          </div>
        </div>
      ),
    },
    {
      id: 'internalAmount',
      header: 'Internal Ledger',
      accessorKey: 'internalAmount',
      sortable: true,
      align: 'right',
      cell: (item) => (
        item.internalTransactionId ? (
          <div>
            <span className="font-mono font-bold text-slate-900 dark:text-emerald-400">
              {formatCurrency(item.internalAmount)}
            </span>
            <span className="block text-[10px] text-slate-400 font-mono">
              {item.internalTransactionRef}
            </span>
          </div>
        ) : (
          <span className="text-slate-400 italic text-[11px]">N/A in internal</span>
        )
      ),
    },
    {
      id: 'providerGrossAmount',
      header: 'Provider Settlement',
      accessorKey: 'providerGrossAmount',
      sortable: true,
      align: 'right',
      cell: (item) => (
        item.providerTransactionId ? (
          <div>
            <span className="font-mono font-bold text-slate-900 dark:text-sky-400">
              {formatCurrency(item.providerGrossAmount)}
            </span>
            <span className="block text-[10px] text-slate-400 font-mono">
              Net: {formatCurrency(item.providerNetAmount)} (Fee: {formatCurrency(item.providerFeeAmount)})
            </span>
          </div>
        ) : (
          <span className="text-slate-400 italic text-[11px]">N/A in statement</span>
        )
      ),
    },
    {
      id: 'amountDifference',
      header: 'Variance',
      accessorKey: 'amountDifference',
      sortable: true,
      align: 'right',
      cell: (item) => (
        <span className={`font-mono font-bold ${item.amountDifference > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
          {item.amountDifference > 0 ? formatCurrency(item.amountDifference) : 'Rp 0'}
        </span>
      ),
    },
    {
      id: 'discrepancyReason',
      header: 'Audit Reason / Notes',
      accessorKey: 'discrepancyReason',
      cell: (item) => (
        <span className="text-slate-600 dark:text-slate-400 text-[11px] line-clamp-2 max-w-xs">
          {item.discrepancyReason || 'Exact match verified.'}
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
            setSelectedResult(item);
          }}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Workbench Header & Batch Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-card">
        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Active Clearing Batch:</label>
          <select
            value={selectedRunId}
            onChange={(e) => setSelectedRunId(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-medium text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            {runs.map((r) => (
              <option key={r.runId} value={r.runId}>
                {r.runNumber} ({r.providerCode}) — {r.matchPercentage.toFixed(1)}% Matched
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={statusFilter === undefined ? '' : statusFilter}
            onChange={(e) => setStatusFilter(e.target.value === '' ? undefined : Number(e.target.value))}
            className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-xs text-slate-700 dark:text-slate-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Classifications</option>
            <option value="1">Matched (100%)</option>
            <option value="2">Fee Variance</option>
            <option value="3">Amount Mismatch</option>
            <option value="4">Missing Internal</option>
            <option value="5">Missing Provider</option>
            <option value="6">Duplicate</option>
          </select>

          <button
            onClick={() => loadResults(selectedRunId, statusFilter)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Reload Batch Results"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Unified DataTable */}
      <DataTable
        columns={columns}
        data={results}
        searchPlaceholder="Search reference, transaction ID, or reason..."
        searchKey={(item) => `${item.externalRef} ${item.internalTransactionRef} ${item.providerTrxId} ${item.discrepancyReason}`}
        onRowClick={(item) => setSelectedResult(item)}
        exportFileName={`recon_results_${selectedRunId}`}
      />

      {/* Slide-over Inspection Drawer */}
      <DetailDrawer
        isOpen={Boolean(selectedResult)}
        onClose={() => setSelectedResult(null)}
        title={selectedResult?.externalRef ? `Reference ${selectedResult.externalRef}` : 'Match Result'}
        subtitle={`Classification: Status #${selectedResult?.matchStatus}`}
      >
        {selectedResult && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Status:</span>
              <StatusBadge status={selectedResult.matchStatus} type="match" />
            </div>

            {/* Split Comparison Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                  Internal Ledger
                </span>
                <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  {formatCurrency(selectedResult.internalAmount)}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  ID: {selectedResult.internalTransactionRef || 'None'}
                </div>
              </div>

              <div className="rounded-lg border border-sky-200 dark:border-sky-500/20 bg-sky-50/50 dark:bg-sky-950/20 p-3 space-y-1.5">
                <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider block">
                  Provider Statement
                </span>
                <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  {formatCurrency(selectedResult.providerGrossAmount)}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  ID: {selectedResult.providerTrxId || 'None'}
                </div>
              </div>
            </div>

            {selectedResult.amountDifference > 0 && (
              <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 p-3">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 block mb-1">
                  Discrepancy Variance
                </span>
                <div className="font-mono text-base font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(selectedResult.amountDifference)}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                  {selectedResult.discrepancyReason}
                </p>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
