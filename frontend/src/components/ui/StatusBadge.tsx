import React from 'react';
import { 
  Clock, 
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

interface StatusBadgeProps {
  status: number | string;
  type?: 'match' | 'severity' | 'exception' | 'generic';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'match' }) => {
  if (type === 'match') {
    const num = Number(status);
    switch (num) {
      case 1: // Matched
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Matched
          </span>
        );
      case 2: // MatchedWithFeeVariance
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            Fee Variance
          </span>
        );
      case 3: // AmountMismatch
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Amount Mismatch
          </span>
        );
      case 4: // MissingInternal
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Missing Internal
          </span>
        );
      case 5: // MissingProvider
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            Missing Provider
          </span>
        );
      case 6: // Duplicate
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            Duplicate
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Pending
          </span>
        );
    }
  }

  if (type === 'severity') {
    const num = Number(status);
    switch (num) {
      case 4:
        return <span className="rounded-md bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 px-2 py-0.5 text-[10px] font-bold tracking-wider border border-rose-300 dark:border-rose-500/30">CRITICAL</span>;
      case 3:
        return <span className="rounded-md bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400 px-2 py-0.5 text-[10px] font-bold tracking-wider border border-orange-300 dark:border-orange-500/30">HIGH</span>;
      case 2:
        return <span className="rounded-md bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 px-2 py-0.5 text-[10px] font-bold tracking-wider border border-amber-300 dark:border-amber-500/30">MEDIUM</span>;
      default:
        return <span className="rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 text-[10px] font-medium">LOW</span>;
    }
  }

  if (type === 'exception') {
    const num = Number(status);
    switch (num) {
      case 3: // Resolved
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20">
            <ShieldCheck className="h-3 w-3" />
            Resolved
          </span>
        );
      case 2: // UnderInvestigation
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20">
            <Clock className="h-3 w-3" />
            Investigating
          </span>
        );
      default: // Open
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-300 dark:border-rose-500/20">
            <ShieldAlert className="h-3 w-3" />
            Open Case
          </span>
        );
    }
  }

  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
      {status}
    </span>
  );
};
