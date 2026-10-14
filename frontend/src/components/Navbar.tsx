import React from 'react';
import { Layers } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openExceptionsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openExceptionsCount }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-white text-base">Recon<span className="text-emerald-400">X</span></span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 border border-slate-700">
                v1.0-LTS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none">Payment Clearing & Reconciliation Engine</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('workbench')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'workbench'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Recon Workbench
          </button>
          <button
            onClick={() => setActiveTab('exceptions')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'exceptions'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>Exceptions</span>
            {openExceptionsCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500/20 px-1 text-[10px] font-semibold text-rose-400 border border-rose-500/30">
                {openExceptionsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('ingestion')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'ingestion'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            File Ingestion
          </button>
        </nav>

        {/* Status indicator */}
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-300 font-mono">Engine Active</span>
        </div>
      </div>
    </header>
  );
};
