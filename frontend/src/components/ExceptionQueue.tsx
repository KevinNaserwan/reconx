'use client';

import React, { useState } from 'react';
import { ExceptionCaseItem, resolveException } from '@/lib/api';
import { DataTable, ColumnDef } from './ui/DataTable';
import { StatusBadge } from './ui/StatusBadge';

interface ExceptionQueueProps {
  exceptions: ExceptionCaseItem[];
  onRefresh: () => void;
}

export const ExceptionQueue: React.FC<ExceptionQueueProps> = ({ exceptions, onRefresh }) => {
  const [selectedCase, setSelectedCase] = useState<ExceptionCaseItem | null>(null);
  const [resolutionType, setResolutionType] = useState<number>(1);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolvedBy, setResolvedBy] = useState('OPS-LEAD-01');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    if (!resolutionNotes.trim()) {
      alert('Audit compliance requires resolution notes to be specified.');
      return;
    }

    try {
      setIsSubmitting(true);
      await resolveException(selectedCase.id, resolutionType, resolutionNotes, resolvedBy);
      setSelectedCase(null);
      setResolutionNotes('');
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to resolve case: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<ExceptionCaseItem>[] = [
    {
      id: 'severity',
      header: 'Severity',
      accessorKey: 'severity',
      sortable: true,
      cell: (item) => <StatusBadge status={item.severity} type="severity" />,
    },
    {
      id: 'externalRef',
      header: 'Reference ID',
      accessorKey: 'externalRef',
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {item.externalRef || '-'}
          </span>
          <span className="block text-[10px] text-slate-400 font-mono">
            Run: {item.runNumber}
          </span>
        </div>
      ),
    },
    {
      id: 'amountDifference',
      header: 'Variance Amount',
      accessorKey: 'amountDifference',
      sortable: true,
      align: 'right',
      cell: (item) => (
        <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">
          {formatCurrency(item.amountDifference)}
        </span>
      ),
    },
    {
      id: 'discrepancyReason',
      header: 'Discrepancy Cause',
      accessorKey: 'discrepancyReason',
      cell: (item) => (
        <span className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2 max-w-sm">
          {item.discrepancyReason}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (item) => <StatusBadge status={item.status} type="exception" />,
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      cell: (item) => (
        item.status !== 3 ? (
          <button
            onClick={() => setSelectedCase(item)}
            className="rounded-lg bg-emerald-600 dark:bg-emerald-600/90 hover:bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-white shadow transition-colors"
          >
            Investigate
          </button>
        ) : (
          <span className="text-[11px] text-slate-400 italic">Resolved</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Exception Management & Dispute Workflow
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Unmatched transactions, amount discrepancies, and duplicate incidents requiring manual operator review.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={exceptions}
        searchPlaceholder="Filter exceptions by reference or reason..."
        searchKey={(item) => `${item.externalRef} ${item.discrepancyReason}`}
        exportFileName="exceptions_queue"
      />

      {/* Resolution Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Resolve Financial Exception
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Four-Eyes audit compliance requires justification before adjusting ledger discrepancies.
            </p>

            <form onSubmit={handleResolveSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Reference ID</label>
                <div className="font-mono text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 font-semibold">
                  {selectedCase.externalRef || selectedCase.id}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">Discrepancy Variance</label>
                <div className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  {formatCurrency(selectedCase.amountDifference)}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">Resolution Strategy</label>
                <select
                  value={resolutionType}
                  onChange={(e) => setResolutionType(Number(e.target.value))}
                  className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-xs text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="1">Manual Match (Approved Override)</option>
                  <option value="2">Force Write-Off (Immaterial Variance)</option>
                  <option value="3">Refund Initiated to Customer</option>
                  <option value="4">Provider Chargeback Claim</option>
                  <option value="5">Internal Ledger Correction</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">Operator ID</label>
                <input
                  type="text"
                  value={resolvedBy}
                  onChange={(e) => setResolvedBy(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">Audit Notes & Justification (Required)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why this resolution was authorized (e.g., Bank statement confirms delayed settlement)..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
