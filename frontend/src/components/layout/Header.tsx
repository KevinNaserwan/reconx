'use client';

import React from 'react';
import { Menu, Zap, ShieldCheck, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  activeTabLabel: string;
  onQuickReconcile?: () => void;
  isRunning?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  activeTabLabel,
  onQuickReconcile,
  isRunning = false,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
            {activeTabLabel}
          </span>
          <span className="hidden sm:inline text-slate-400">/</span>
          <span className="hidden sm:inline rounded-md bg-slate-100 dark:bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
            Realtime Clearing
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Security & Idempotency Badge */}
        <div className="hidden md:flex items-center space-x-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-1 text-[11px] text-slate-600 dark:text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Idempotency Guard:</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">ENFORCED</span>
        </div>

        {/* Quick Trigger Button */}
        {onQuickReconcile && (
          <button
            onClick={onQuickReconcile}
            disabled={isRunning}
            className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition-all disabled:opacity-50"
          >
            {isRunning ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5 fill-current" />
            )}
            <span className="hidden sm:inline">{isRunning ? 'Matching...' : 'Run Engine'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
