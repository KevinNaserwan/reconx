'use client';

import React from 'react';
import { 
  Layers, 
  BarChart3, 
  ArrowLeftRight, 
  AlertOctagon, 
  UploadCloud, 
  BookOpen, 
  CreditCard, 
  Radio, 
  History,
  Sliders, 
  Building2
} from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openExceptionsCount: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openExceptionsCount,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const navSections = [
    {
      group: 'OPERATIONAL CLEARING',
      items: [
        { id: 'overview', label: 'Executive Dashboard', icon: BarChart3 },
        { id: 'workbench', label: 'Recon Workbench', icon: ArrowLeftRight },
        { 
          id: 'exceptions', 
          label: 'Exception Queue', 
          icon: AlertOctagon,
          badge: openExceptionsCount > 0 ? openExceptionsCount : undefined
        },
        { id: 'ingestion', label: 'Statement Ingestion', icon: UploadCloud },
      ],
    },
    {
      group: 'LEDGER & SETTLEMENTS',
      items: [
        { id: 'internal-ledger', label: 'Internal Ledgers', icon: BookOpen },
        { id: 'provider-settlement', label: 'Provider Statements', icon: CreditCard },
      ],
    },
    {
      group: 'PLATFORM GOVERNANCE',
      items: [
        { id: 'connectors', label: 'Gateway Connectors', icon: Radio },
        { id: 'audit-trail', label: 'Security Audit Logs', icon: History },
        { id: 'settings', label: 'Rules & Thresholds', icon: Sliders },
      ],
    },
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base">
                  Recon<span className="text-emerald-500">X</span>
                </span>
                <span className="rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 px-1 py-0.2 text-[9px] font-bold">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">Fintech Clearing Platform</p>
            </div>
          </div>

          <ThemeToggle />
        </div>

        {/* Tenant Switcher Simulation */}
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 p-2 text-xs">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] leading-tight">
                  PTBA Fin-Treasury
                </p>
                <p className="text-[9px] text-slate-400">IDR Settlement Core</p>
              </div>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" title="Live Cluster" />
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase">
                {section.group}
              </p>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold shadow-soft'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          isActive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white px-1">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer User Profile Card */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-950">
          <div className="flex items-center space-x-2.5 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold text-xs">
              KN
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                Kevin Naserwan
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                Fintech Lead Architect
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
