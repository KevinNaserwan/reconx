'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const { user, isLoading, activeMode, switchMode } = useAuth();
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

  // Auth Guard: Redirect immediately to /login if not authenticated
  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center space-y-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-cyan-400 border-t-transparent" />
          <p className="text-xs text-slate-400 font-mono tracking-wider">Memverifikasi Sesi ReconX SaaS...</p>
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
