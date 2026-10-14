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
  PanelLeftOpen,
  Smartphone,
  Users,
  X
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

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
  const { user, setIsLoginModalOpen } = useAuth();

  const navSections = [
    {
      group: 'OPERATIONAL CLEARING',
      items: [
        { id: 'overview', label: 'Executive Dashboard', icon: BarChart3 },
        { id: 'family-mode', label: 'Mode Family (Dompet)', icon: Users, badge: 'Family' },
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
        { id: 'mobile-sync', label: 'Mobile Sync Agent', icon: Smartphone },
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
      {/* Mobile/Tablet Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container: Full w-72 on mobile drawer or desktop expanded; mini rail w-20 on desktop collapsed */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col shadow-2xl lg:shadow-none transition-all duration-300 ease-in-out ${
          isOpenMobile 
            ? 'translate-x-0 w-72' 
            : '-translate-x-full lg:translate-x-0'
        } ${
          isCollapsedDesktop ? 'lg:w-20' : 'lg:w-72'
        }`}
      >
        {/* Workspace Brand Header */}
        <div className={`h-18 border-b border-slate-200 dark:border-slate-800 flex items-center py-3.5 transition-all ${
          isCollapsedDesktop ? 'justify-center px-2' : 'justify-between px-4'
        }`}>
          {isCollapsedDesktop ? (
            /* Mini Icon Header in Rail Mode */
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={() => setIsCollapsedDesktop(false)}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/30 hover:scale-105 transition-transform"
                title="ReconX Platform — Click to Expand Sidebar"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l16 16" />
                  <path d="M20 4l-7 7" />
                  <path d="M4 20l5-5" />
                  <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                </svg>
              </button>
              <button
                onClick={() => setIsCollapsedDesktop(false)}
                className="p-1 rounded-md text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                title="Expand Sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </div>
          ) : (
            /* Full Header with Brand Name and Collapse Button */
            <>
              <div className="flex items-center space-x-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/30">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4l16 16" />
                    <path d="M20 4l-7 7" />
                    <path d="M4 20l5-5" />
                    <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-xl font-sans">
                      Recon<span className="text-emerald-500">X</span>
                    </span>
                    <span className="rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 text-[11px] font-bold tracking-wide">
                      ENTERPRISE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Payment Clearing Engine</p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {/* Desktop Collapse Trigger */}
                <button
                  onClick={() => setIsCollapsedDesktop(true)}
                  className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  title="Collapse to Mini Rail"
                >
                  <PanelLeftClose className="h-5 w-5" />
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
            </>
          )}
        </div>

        {/* Household Tenant Cluster */}
        <div className={`pt-3.5 pb-2 transition-all ${isCollapsedDesktop ? 'px-2' : 'px-3.5'}`}>
          {isCollapsedDesktop ? (
            <div 
              className="flex items-center justify-center h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-indigo-500 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Household Cluster: Keluarga Kevin & Istri"
              onClick={() => setIsCollapsedDesktop(false)}
            >
              <Users className="h-5 w-5" />
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-bold">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight">
                    {user?.tenant || 'Keluarga Kevin & Istri'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Household Financial Cluster</p>
                </div>
              </div>
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" title="Multi-Tenant Sync Active" />
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className={`flex-1 overflow-y-auto py-2 space-y-6 ${isCollapsedDesktop ? 'px-2' : 'px-3.5'}`}>
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              {isCollapsedDesktop ? (
                /* Subtle Divider for Mini Rail */
                <div className="my-2 border-t border-slate-200 dark:border-slate-800 mx-1" title={section.group} />
              ) : (
                <p className="px-3 text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  {section.group}
                </p>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                if (isCollapsedDesktop) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      title={item.label}
                      className={`relative group flex w-full h-11 items-center justify-center rounded-xl transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border dark:border-emerald-500/30'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.badge !== undefined && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white px-1 shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                }

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
                      <span className="truncate">{item.label}</span>
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
        <div className={`border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 transition-all ${
          isCollapsedDesktop ? 'p-2 flex justify-center' : 'p-3.5'
        }`}>
          {isCollapsedDesktop ? (
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs ring-2 ring-emerald-500/20 cursor-pointer hover:ring-emerald-500 transition-all"
              title={`${user?.name || 'Kevin Naserwan'} — Click to Manage Account`}
              onClick={() => setIsLoginModalOpen(true)}
            >
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'KN'}
            </div>
          ) : (
            <div 
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center space-x-3 rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer group"
              title="Click to Switch User / Google SSO"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-sm ring-2 ring-emerald-500/20 group-hover:ring-emerald-500 transition-all">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'KN'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {user?.name || 'Kevin Naserwan'}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate mt-0.5">
                  {user?.role || 'Fintech Lead Architect'}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
