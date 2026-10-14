'use client';

import React from 'react';
import { Menu, Zap, ShieldCheck, RefreshCw, PanelLeft } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '../auth/AuthContext';

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
  const { user, setIsLoginModalOpen } = useAuth();
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
          title={isCollapsedDesktop ? "Expand Sidebar" : "Collapse to Mini Rail"}
        >
          <PanelLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-bold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
            {activeTabLabel}
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">/</span>
          <span className="hidden sm:inline rounded-md bg-slate-100 dark:bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
            Settlement Hub
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Security & Idempotency Badge */}
        <div className="hidden md:flex items-center space-x-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Idempotency:</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">ENFORCED</span>
        </div>

        {/* User Account / Google SSO Trigger */}
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="flex items-center space-x-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Google Account / Enterprise SSO"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-[10px] ring-1 ring-emerald-500">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'KN'}
          </div>
          <span className="hidden xl:inline text-xs font-bold text-slate-700 dark:text-slate-300">
            {user?.name || 'Kevin Naserwan'}
          </span>
        </button>

        {/* Theme Toggle (Moved from sidebar) */}
        <ThemeToggle />

        {/* Quick Trigger Button */}
        {onQuickReconcile && (
          <button
            onClick={onQuickReconcile}
            disabled={isRunning}
            className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-all disabled:opacity-50"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 fill-current" />
            )}
            <span className="hidden sm:inline">{isRunning ? 'Matching...' : 'Run Engine'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
