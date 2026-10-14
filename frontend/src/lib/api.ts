export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface DashboardMetrics {
  kpis: {
    totalInternalVolume: number;
    totalInternalCount: number;
    totalProviderVolume: number;
    totalProviderCount: number;
    overallMatchRate: number;
    openExceptionsCount: number;
    totalDiscrepancyAmount: number;
    totalRuns: number;
  };
  discrepancyBreakdown: Array<{
    status: string;
    count: number;
    totalAmount: number;
  }>;
  providers: Array<{
    id: string;
    code: string;
    name: string;
    feeRate: number;
    fixedFeeAmount: number;
  }>;
}

export interface ReconciliationRunItem {
  runId: string;
  runNumber: string;
  providerCode: string;
  providerName: string;
  cutoffStart: string;
  cutoffEnd: string;
  totalProcessed: number;
  totalMatched: number;
  totalDiscrepancy: number;
  matchPercentage: number;
  totalInternalAmount: number;
  totalProviderAmount: number;
  totalDiscrepancyAmount: number;
  status: string;
  startedAt: string;
  completedAt?: string;
}

export interface ReconciliationResultItem {
  resultId: string;
  internalTransactionId?: string;
  internalTransactionRef?: string;
  externalRef?: string;
  internalAmount?: number;
  providerTransactionId?: string;
  providerTrxId?: string;
  providerGrossAmount?: number;
  providerNetAmount?: number;
  providerFeeAmount?: number;
  currency: string;
  matchStatus: number; // 1=Matched, 2=MatchedWithFeeVariance, 3=AmountMismatch, 4=MissingInternal, 5=MissingProvider, 6=Duplicate, 7=Pending
  amountDifference: number;
  discrepancyReason?: string;
  createdAt: string;
  exceptionId?: string;
  exceptionStatus?: string;
}

export interface ExceptionCaseItem {
  id: string;
  reconResultId: string;
  runNumber: string;
  externalRef?: string;
  internalTransactionRef?: string;
  providerTrxId?: string;
  amountDifference: number;
  matchStatus: number;
  discrepancyReason?: string;
  assignedTo?: string;
  severity: number; // 1=Low, 2=Medium, 3=High, 4=Critical
  status: number; // 1=Open, 2=UnderInvestigation, 3=Resolved, 4=Escalated
  resolutionType?: number;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await fetch(`${API_BASE_URL}/dashboard/metrics`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
}

export async function fetchReconciliationRuns(): Promise<ReconciliationRunItem[]> {
  const res = await fetch(`${API_BASE_URL}/reconciliation/runs`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch reconciliation runs');
  return res.json();
}

export async function fetchRunResults(runId: string, status?: number): Promise<{ total: number; items: ReconciliationResultItem[] }> {
  const query = status ? `?status=${status}` : '';
  const res = await fetch(`${API_BASE_URL}/reconciliation/runs/${runId}/results${query}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch run results');
  return res.json();
}

export async function executeReconciliationRun(providerId: string, cutoffStart: string, cutoffEnd: string): Promise<ReconciliationRunItem> {
  const res = await fetch(`${API_BASE_URL}/reconciliation/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': `RUN-${Date.now()}-${Math.random().toString(36).substring(7)}`
    },
    body: JSON.stringify({
      providerId,
      cutoffStart,
      cutoffEnd,
      feeTolerancePercentage: 0.05
    })
  });
  if (!res.ok) throw new Error('Failed to execute reconciliation');
  return res.json();
}

export async function fetchExceptions(): Promise<{ total: number; items: ExceptionCaseItem[] }> {
  const res = await fetch(`${API_BASE_URL}/exceptions`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch exceptions');
  return res.json();
}

export async function resolveException(id: string, resolutionType: number, resolutionNotes: string, resolvedBy: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/exceptions/${id}/resolve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': `RES-${id}-${Date.now()}`
    },
    body: JSON.stringify({
      resolutionType,
      resolutionNotes,
      resolvedBy
    })
  });
  if (!res.ok) throw new Error('Failed to resolve exception');
}
