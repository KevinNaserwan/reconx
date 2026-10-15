'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Zap, ShieldCheck, RefreshCw, PanelLeft, LogOut } from 'lucide-react';
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
  const router = useRouter();
  const { user, activeMode, switchMode, logout } = useAuth();
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
        {/* Mode Switcher Pill (Personal vs Family) */}
        <div className="hidden sm:inline-flex p-1 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner text-xs">
          <button
            onClick={() => switchMode('personal')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'personal'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>👤</span>
            <span>Personal</span>
          </button>
          <button
            onClick={() => switchMode('family')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'family'
                ? 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>👨‍👩‍👧‍👦</span>
            <span>Family</span>
          </button>
        </div>

        {/* Security & Idempotency Badge */}
        <div className="hidden md:flex items-center space-x-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Idempotency:</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">ENFORCED</span>
        </div>

        {/* User Account Info */}
        <div className="flex items-center space-x-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-2.5 py-1.5">
          {user?.picture ? (
            <img src={user.picture} alt={user?.name || 'Avatar'} className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500" />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-[10px] ring-1 ring-emerald-500">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'KN'}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
              {user?.name || 'Kevin Naserwan'}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold leading-tight mt-0.5">
              {user?.familyName || 'Kevin & Anan (Couple)'}
            </p>
          </div>
        </div>

        {/* Explicit Logout Button */}
        <button
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="flex items-center space-x-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-bold text-xs transition-colors shadow-sm"
          title="Keluar dari Akun (Logout)"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Keluar</span>
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
