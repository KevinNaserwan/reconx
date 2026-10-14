'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from '@/components/ui/ThemeContext';
import { AuthProvider, useAuth } from '@/components/auth/AuthContext';
import { LoginModal } from '@/components/auth/LoginModal';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardOverview } from '@/components/DashboardOverview';
import { ReconciliationWorkbench } from '@/components/ReconciliationWorkbench';
import { ExceptionQueue } from '@/components/ExceptionQueue';
import { FileIngestion } from '@/components/FileIngestion';
import { InternalLedgerView } from '@/components/views/InternalLedgerView';
import { ProviderSettlementView } from '@/components/views/ProviderSettlementView';
import { ConnectorsView } from '@/components/views/ConnectorsView';
import { MobileSyncView } from '@/components/views/MobileSyncView';
import { AuditTrailView } from '@/components/views/AuditTrailView';
import { SettingsView } from '@/components/views/SettingsView';
import { FamilyModeView } from '@/components/views/FamilyModeView';
import { ShieldCheck, Lock, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { 
  DashboardMetrics, 
  ReconciliationRunItem, 
  ExceptionCaseItem,
  fetchDashboardMetrics, 
  fetchReconciliationRuns, 
  fetchExceptions,
  executeReconciliationRun 
} from '@/lib/api';

const fallbackMetrics: DashboardMetrics = {
  kpis: {
    totalInternalVolume: 0,
    totalInternalCount: 0,
    totalProviderVolume: 0,
    totalProviderCount: 0,
    overallMatchRate: 100.00,
    openExceptionsCount: 0,
    totalDiscrepancyAmount: 0,
    totalRuns: 0
  },
  discrepancyBreakdown: [],
  providers: [
    { id: 'prov-blu-004', code: 'BLU_BCA', name: 'blu by BCA Digital', feeRate: 0, fixedFeeAmount: 0 },
    { id: 'prov-superbank-005', code: 'SUPERBANK', name: 'Superbank Indonesia', feeRate: 0, fixedFeeAmount: 0 },
    { id: 'prov-seabank-006', code: 'SEABANK', name: 'SeaBank Indonesia', feeRate: 0, fixedFeeAmount: 1000 },
    { id: 'prov-shopeepay-007', code: 'SHOPEEPAY', name: 'ShopeePay & QRIS', feeRate: 0.007, fixedFeeAmount: 0 }
  ]
};

const fallbackRuns: ReconciliationRunItem[] = [];

const fallbackExceptions: ExceptionCaseItem[] = [];

function DashboardApp() {
  const { user, isLoading, activeMode, switchMode, loginWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRunId, setSelectedRunId] = useState<string | undefined>(undefined);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [runs, setRuns] = useState<ReconciliationRunItem[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionCaseItem[]>([]);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsedDesktop, setIsCollapsedDesktop] = useState(false);
  const [isQuickReconciling, setIsQuickReconciling] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [m, r, e] = await Promise.all([
        fetchDashboardMetrics().catch(() => fallbackMetrics),
        fetchReconciliationRuns().catch(() => fallbackRuns),
        fetchExceptions().then(res => res.items).catch(() => fallbackExceptions)
      ]);
      setMetrics(m);
      setRuns(r);
      setExceptions(e);
      setSelectedRunId(prev => prev || (r.length > 0 ? r[0].runId : undefined));
    } catch {
      setMetrics(fallbackMetrics);
      setRuns(fallbackRuns);
      setExceptions(fallbackExceptions);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const handleInspectRun = (runId: string) => {
    setSelectedRunId(runId);
    setActiveTab('workbench');
  };

  const handleQuickReconcile = async () => {
    try {
      setIsQuickReconciling(true);
      const providerId = metrics?.providers[0]?.id || 'prov-blu-004';
      const now = new Date();
      const cutoffStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      const cutoffEnd = new Date(now.setHours(23, 59, 59, 999)).toISOString();

      await executeReconciliationRun(providerId, cutoffStart, cutoffEnd);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      alert(`Reconciliation error: ${msg}`);
    } finally {
      setIsQuickReconciling(false);
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'overview': return activeMode === 'family' ? 'Executive Family Overview' : 'Personal Financial Overview';
      case 'family-mode': return 'Family Household & Wallets';
      case 'workbench': return 'Reconciliation Workbench';
      case 'exceptions': return 'Exception Management';
      case 'ingestion': return 'Statement Ingestion';
      case 'internal-ledger': return 'Internal Ledgers';
      case 'provider-settlement': return 'Provider Statements';
      case 'connectors': return 'Gateway Connectors';
      case 'mobile-sync': return 'Mobile Sync Agent';
      case 'audit-trail': return 'Security Audit Trail';
      case 'settings': return 'Rules & Settings';
      default: return 'Clearing Platform';
    }
  };

  // Auth Guard: Lock application if not logged in
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-xl shadow-cyan-500/20 ring-1 ring-cyan-400/40">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l16 16" />
                <path d="M20 4l-7 7" />
                <path d="M4 20l5-5" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
              </svg>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Recon<span className="text-cyan-400">X</span> Financial OS
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Sistem rekonsiliasi finansial pribadi & multi-tenant family group dengan enkripsi perbankan dan anti-dobel hitung mutasi.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <button
              onClick={() => loginWithGoogle()}
              className="w-full flex items-center justify-center space-x-3 rounded-2xl bg-white text-slate-900 py-3.5 px-4 font-bold text-sm shadow-lg hover:bg-slate-100 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Masuk dengan Google (Kevin Naserwan)</span>
            </button>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 text-xs text-slate-400">
              <div className="flex items-center space-x-2 text-slate-300 font-semibold">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>Terotentikasi & Terproteksi Penuh</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Akses dashboard hanya terbuka bagi pengguna terverifikasi. Seluruh endpoint REST API dienkripsi dan membutuhkan Bearer Token yang sah.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Left SaaS Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openExceptionsCount={metrics?.kpis.openExceptionsCount || 0}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        isCollapsedDesktop={isCollapsedDesktop}
        setIsCollapsedDesktop={setIsCollapsedDesktop}
      />

      {/* Main Content Viewport */}
      <div className={`flex-1 ${isCollapsedDesktop ? 'lg:pl-20' : 'lg:pl-72'} flex flex-col min-w-0 transition-all duration-300`}>
        <Header
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
          onToggleDesktopSidebar={() => setIsCollapsedDesktop((prev) => !prev)}
          isCollapsedDesktop={isCollapsedDesktop}
          activeTabLabel={getTabLabel(activeTab)}
          onQuickReconcile={handleQuickReconcile}
          isRunning={isQuickReconciling}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <DashboardOverview
              metrics={metrics}
              runs={runs}
              onRefresh={loadData}
              onSelectRun={handleInspectRun}
            />
          )}

          {activeTab === 'family-mode' && (
            <FamilyModeView
              activeMode={activeMode}
              onSwitchMode={switchMode}
            />
          )}

          {activeTab === 'workbench' && (
            <ReconciliationWorkbench
              runs={runs}
              selectedRunId={selectedRunId}
            />
          )}

          {activeTab === 'exceptions' && (
            <ExceptionQueue
              exceptions={exceptions}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'ingestion' && (
            <FileIngestion
              onUploadSuccess={loadData}
            />
          )}

          {activeTab === 'internal-ledger' && (
            <InternalLedgerView />
          )}

          {activeTab === 'provider-settlement' && (
            <ProviderSettlementView />
          )}

          {activeTab === 'connectors' && (
            <ConnectorsView />
          )}

          {activeTab === 'mobile-sync' && (
            <MobileSyncView />
          )}

          {activeTab === 'audit-trail' && (
            <AuditTrailView />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Global Google OAuth Login Modal */}
      <LoginModal />
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DashboardApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
