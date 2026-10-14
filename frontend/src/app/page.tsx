'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from '@/components/ui/ThemeContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardOverview } from '@/components/DashboardOverview';
import { ReconciliationWorkbench } from '@/components/ReconciliationWorkbench';
import { ExceptionQueue } from '@/components/ExceptionQueue';
import { FileIngestion } from '@/components/FileIngestion';
import { InternalLedgerView } from '@/components/views/InternalLedgerView';
import { ProviderSettlementView } from '@/components/views/ProviderSettlementView';
import { ConnectorsView } from '@/components/views/ConnectorsView';
import { AuditTrailView } from '@/components/views/AuditTrailView';
import { SettingsView } from '@/components/views/SettingsView';
import { 
  DashboardMetrics, 
  ReconciliationRunItem, 
  ExceptionCaseItem,
  fetchDashboardMetrics, 
  fetchReconciliationRuns, 
  fetchExceptions,
  executeReconciliationRun 
} from '@/lib/api';

// Fallback demo data in case backend API is not yet running
const fallbackMetrics: DashboardMetrics = {
  kpis: {
    totalInternalVolume: 3100000,
    totalInternalCount: 5,
    totalProviderVolume: 2620000,
    totalProviderCount: 5,
    overallMatchRate: 60.00,
    openExceptionsCount: 3,
    totalDiscrepancyAmount: 1120000,
    totalRuns: 1
  },
  discrepancyBreakdown: [
    { status: 'AmountMismatch', count: 1, totalAmount: 50000 },
    { status: 'MissingProvider', count: 1, totalAmount: 750000 },
    { status: 'MissingInternal', count: 1, totalAmount: 320000 }
  ],
  providers: [
    { id: 'prov-midtrans-001', code: 'MIDTRANS', name: 'Midtrans Payment Gateway', feeRate: 0.015, fixedFeeAmount: 0 },
    { id: 'prov-xendit-002', code: 'XENDIT', name: 'Xendit XenPlatform', feeRate: 0, fixedFeeAmount: 4500 },
    { id: 'prov-bca-003', code: 'BCA_VA', name: 'Bank Central Asia - Virtual Account', feeRate: 0, fixedFeeAmount: 2500 }
  ]
};

const fallbackRuns: ReconciliationRunItem[] = [
  {
    runId: 'demo-run-001',
    runNumber: 'REC-20261014-A8F91B',
    providerCode: 'MIDTRANS',
    providerName: 'Midtrans Payment Gateway',
    cutoffStart: '2026-10-14T00:00:00Z',
    cutoffEnd: '2026-10-14T23:59:59Z',
    totalProcessed: 5,
    totalMatched: 3,
    totalDiscrepancy: 2,
    matchPercentage: 60.00,
    totalInternalAmount: 3100000,
    totalProviderAmount: 2620000,
    totalDiscrepancyAmount: 800000,
    status: 'COMPLETED',
    startedAt: '2026-10-14T10:00:00Z',
    completedAt: '2026-10-14T10:00:05Z'
  }
];

const fallbackExceptions: ExceptionCaseItem[] = [
  {
    id: 'exc-demo-001',
    reconResultId: 'res-001',
    runNumber: 'REC-20261014-A8F91B',
    externalRef: 'EXT-MID-9003',
    internalTransactionRef: 'TRX-ORD-1003',
    providerTrxId: 'MID-SETTLE-88003',
    amountDifference: 50000,
    matchStatus: 3,
    discrepancyReason: 'Amount discrepancy: Internal=500.000, Provider Gross=450.000, Diff=50.000',
    assignedTo: 'OPS-LEAD-01',
    severity: 3,
    status: 1,
    createdAt: '2026-10-14T10:00:05Z',
    updatedAt: '2026-10-14T10:00:05Z'
  },
  {
    id: 'exc-demo-002',
    reconResultId: 'res-002',
    runNumber: 'REC-20261014-A8F91B',
    externalRef: 'EXT-MID-9005',
    internalTransactionRef: 'TRX-ORD-1005',
    amountDifference: 750000,
    matchStatus: 5,
    discrepancyReason: 'Transaction TRX-ORD-1005 exists internally but missing in provider settlement statement.',
    severity: 2,
    status: 1,
    createdAt: '2026-10-14T10:00:05Z',
    updatedAt: '2026-10-14T10:00:05Z'
  }
];

export default function Home() {
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
    loadData();
  }, [loadData]);

  const handleInspectRun = (runId: string) => {
    setSelectedRunId(runId);
    setActiveTab('workbench');
  };

  const handleQuickReconcile = async () => {
    try {
      setIsQuickReconciling(true);
      const providerId = metrics?.providers[0]?.id || 'prov-midtrans-001';
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
      case 'overview': return 'Executive Overview';
      case 'workbench': return 'Reconciliation Workbench';
      case 'exceptions': return 'Exception Management';
      case 'ingestion': return 'Statement Ingestion';
      case 'internal-ledger': return 'Internal Ledgers';
      case 'provider-settlement': return 'Provider Statements';
      case 'connectors': return 'Gateway Connectors';
      case 'audit-trail': return 'Security Audit Trail';
      case 'settings': return 'Rules & Settings';
      default: return 'Clearing Platform';
    }
  };

  return (
    <ThemeProvider>
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
        <div className={`flex-1 ${isCollapsedDesktop ? 'lg:pl-0' : 'lg:pl-72'} flex flex-col min-w-0 transition-all duration-300`}>
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

            {activeTab === 'audit-trail' && (
              <AuditTrailView />
            )}

            {activeTab === 'settings' && (
              <SettingsView />
            )}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
