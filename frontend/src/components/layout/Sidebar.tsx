'use client';

import React from 'react';
import { 
  BarChart3, 
  ArrowLeftRight, 
  AlertOctagon, 
  UploadCloud, 
  BookOpen, 
  CreditCard, 
  Radio, 
  History,
  Sliders, 
  Building2,
  PanelLeftClose,
  X
} from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openExceptionsCount: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  isCollapsedDesktop: boolean;
  setIsCollapsedDesktop: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openExceptionsCount,
  isOpenMobile,
  setIsOpenMobile,
  isCollapsedDesktop,
  setIsCollapsedDesktop,
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
      {/* Mobile/Tablet Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col shadow-2xl lg:shadow-none transition-all duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } ${
          isCollapsedDesktop ? 'lg:-translate-x-full' : 'lg:translate-x-0'
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="h-18 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            {/* Custom Brand Vector Logo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/30">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l16 16" />
                <path d="M20 4l-7 7" />
                <path d="M4 20l5-5" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black tracking-tight text-slate-900 dark:text-white text-lg font-sans">
                  Recon<span className="text-emerald-500">X</span>
                </span>
                <span className="rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wide">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Payment Clearing Engine</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <ThemeToggle />

            {/* Desktop Collapse Trigger */}
            <button
              onClick={() => setIsCollapsedDesktop((prev) => !prev)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title="Hide Sidebar (Desktop)"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>

            {/* Mobile Close Trigger */}
            <button
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title="Close Menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tenant Switcher Simulation */}
        <div className="px-3.5 pt-3.5 pb-2">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-2.5 text-xs">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs leading-tight">
                  PTBA Fin-Treasury
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">IDR Multibank Cluster</p>
              </div>
            </div>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" title="Live Cluster Active" />
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <p className="px-3 text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                {section.group}
              </p>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border dark:border-emerald-500/30 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`h-5 w-5 transition-colors ${
                          isActive
                            ? 'text-white dark:text-emerald-400'
                            : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className={`flex h-5 min-w-5 items-center justify-center rounded-full text-xs font-bold px-1.5 shadow-sm ${
                        isActive 
                          ? 'bg-white text-emerald-700' 
                          : 'bg-rose-500 text-white'
                      }`}>
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
        <div className="border-t border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/70 dark:bg-slate-950">
          <div className="flex items-center space-x-3 rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs ring-2 ring-emerald-500/20">
              KN
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                Kevin Naserwan
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate mt-0.5">
                Fintech Lead Architect
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
