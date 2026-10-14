'use client';

import React from 'react';
import { Menu, Zap, ShieldCheck, RefreshCw, PanelLeft } from 'lucide-react';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onToggleDesktopSidebar: () => void;
  isCollapsedDesktop?: boolean;
  activeTabLabel: string;
  onQuickReconcile?: () => void;
  isRunning?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onToggleDesktopSidebar,
  isCollapsedDesktop = false,
  activeTabLabel,
  onQuickReconcile,
  isRunning = false,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center space-x-3.5">
        {/* Mobile / Tablet Menu Button */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden rounded-lg p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          aria-label="Open sidebar"
          title="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={onToggleDesktopSidebar}
          className="hidden lg:flex items-center justify-center rounded-lg p-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          aria-label="Toggle sidebar"
          title={isCollapsedDesktop ? "Expand Sidebar (288px)" : "Collapse Sidebar"}
        >
          <PanelLeft className="h-5 w-5" />
        </button>

        {/* Logo Mark shown when sidebar is collapsed */}
        {isCollapsedDesktop && (
          <div className="hidden lg:flex items-center space-x-2 pr-2 border-r border-slate-200 dark:border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-600 to-cyan-500 text-white shadow-sm">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 4l16 16" />
                <path d="M20 4l-7 7" />
                <path d="M4 20l5-5" />
              </svg>
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white text-base">Recon<span className="text-emerald-500">X</span></span>
          </div>
        )}

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
            {activeTabLabel}
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">/</span>
          <span className="hidden sm:inline rounded-md bg-slate-100 dark:bg-slate-900 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
            Settlement Hub
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
