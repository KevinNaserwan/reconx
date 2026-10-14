import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: string;
    positive?: boolean;
  };
  icon: React.ReactNode;
  iconBg?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  icon,
  iconBg = 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-card hover:shadow-elevated transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${iconBg}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
          {value}
        </div>

        <div className="mt-1.5 flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
              {subtitle}
            </span>
          )}

          {change && (
            <span
              className={`inline-flex items-center text-[10px] font-semibold ${
                change.positive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {change.positive ? (
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-0.5" />
              )}
              {change.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
