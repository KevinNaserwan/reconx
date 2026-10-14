import React, { useState } from 'react';
import { ExceptionCaseItem, resolveException } from '@/lib/api';

interface ExceptionQueueProps {
  exceptions: ExceptionCaseItem[];
  onRefresh: () => void;
}

export const ExceptionQueue: React.FC<ExceptionQueueProps> = ({ exceptions, onRefresh }) => {
  const [selectedCase, setSelectedCase] = useState<ExceptionCaseItem | null>(null);
  const [resolutionType, setResolutionType] = useState<number>(1); // 1=ManualMatch, 2=ForceWriteOff, 3=RefundInitiated
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

  const getSeverityBadge = (sev: number) => {
    switch (sev) {
      case 4: // Critical
        return <span className="rounded bg-rose-500/20 text-rose-400 px-2 py-0.5 text-[10px] font-bold border border-rose-500/30">CRITICAL</span>;
      case 3: // High
        return <span className="rounded bg-orange-500/20 text-orange-400 px-2 py-0.5 text-[10px] font-bold border border-orange-500/30">HIGH</span>;
      case 2: // Medium
        return <span className="rounded bg-amber-500/20 text-amber-400 px-2 py-0.5 text-[10px] font-medium border border-amber-500/30">MEDIUM</span>;
      default:
        return <span className="rounded bg-slate-800 text-slate-400 px-2 py-0.5 text-[10px]">LOW</span>;
    }
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <h2 className="text-base font-semibold text-white">Exception Management Queue</h2>
        <p className="text-xs text-slate-400">
          Unmatched transactions, amount discrepancies, and duplicate incidents requiring manual operator review.
        </p>
      </div>

      {/* Exception Cards / Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-medium">
              <tr>
                <th className="py-2.5 px-3">Severity & Case ID</th>
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3 text-right">Variance Amount</th>
                <th className="py-2.5 px-3">Reason / Description</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {exceptions.length > 0 ? (
                exceptions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div>{getSeverityBadge(item.severity)}</div>
                        <div className="font-mono text-[11px] text-slate-400">
                          {item.id.substring(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-xs text-slate-200">
                        {item.externalRef || '-'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Run: {item.runNumber}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-rose-400">
                      {formatCurrency(item.amountDifference)}
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-sm text-[11px]">
                      {item.discrepancyReason}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium ${
                        item.status === 3
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {item.status === 3 ? 'Resolved' : 'Investigation'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {item.status !== 3 ? (
                        <button
                          onClick={() => setSelectedCase(item)}
                          className="rounded bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-emerald-400 hover:bg-slate-700 hover:text-emerald-300 transition-colors border border-slate-700"
                        >
                          Resolve Case
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Closed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No exceptions open. All transactions are cleanly reconciled!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Resolve Financial Exception</h3>
            <p className="text-xs text-slate-400 mb-4">
              Audit trail requires full justification before adjusting ledger discrepancies.
            </p>

            <form onSubmit={handleResolveSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Reference</label>
                <div className="font-mono text-xs text-white bg-slate-950 p-2 rounded border border-slate-800">
                  {selectedCase.externalRef || selectedCase.id}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Discrepancy Amount</label>
                <div className="font-mono text-sm font-semibold text-rose-400 bg-slate-950 p-2 rounded border border-slate-800">
                  {formatCurrency(selectedCase.amountDifference)}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Resolution Strategy</label>
                <select
                  value={resolutionType}
                  onChange={(e) => setResolutionType(Number(e.target.value))}
                  className="w-full h-8 rounded border border-slate-700 bg-slate-950 px-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="1">Manual Match (Approved Override)</option>
                  <option value="2">Force Write-Off (Immaterial Difference)</option>
                  <option value="3">Refund Initiated to Customer</option>
                  <option value="4">Provider Chargeback Claim</option>
                  <option value="5">Internal Ledger Data Correction</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Operator ID</label>
                <input
                  type="text"
                  value={resolvedBy}
                  onChange={(e) => setResolvedBy(e.target.value)}
                  className="w-full h-8 rounded border border-slate-700 bg-slate-950 px-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Audit Notes & Justification (Required)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why this resolution was authorized (e.g., Bank statement confirms delayed settlement)..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-xs text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="rounded px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
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
