'use client';

import React, { useState } from 'react';
import { DataTable, ColumnDef } from '../ui/DataTable';
import { Eye } from 'lucide-react';
import { DetailDrawer } from '../ui/DetailDrawer';

interface AuditLogItem {
  id: number;
  entityName: string;
  entityId: string;
  action: string;
  actorUsername: string;
  previousState: string | null;
  newState: string | null;
  ipAddress: string;
  createdAt: string;
}

export const AuditTrailView: React.FC = () => {
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const logs: AuditLogItem[] = [
    {
      id: 1001,
      entityName: 'RECONCILIATION_RUN',
      entityId: 'REC-20261014-F4A1EC',
      action: 'EXECUTE_RECONCILIATION',
      actorUsername: 'knaserwan',
      previousState: null,
      newState: '{"totalProcessed":6,"totalMatched":3,"totalDiscrepancy":3,"matchRate":50.0}',
      ipAddress: '127.0.0.1',
      createdAt: '2026-10-14T10:37:33Z',
    },
    {
      id: 1002,
      entityName: 'EXCEPTION_CASE',
      entityId: 'exc-demo-001',
      action: 'ASSIGN_OPERATOR',
      actorUsername: 'system_auto_router',
      previousState: '{"assignedTo": null}',
      newState: '{"assignedTo": "OPS-LEAD-01", "status": "UnderInvestigation"}',
      ipAddress: '10.3.4.65',
      createdAt: '2026-10-14T10:37:35Z',
    },
    {
      id: 1003,
      entityName: 'EXCEPTION_CASE',
      entityId: 'exc-demo-003',
      action: 'RESOLVE_EXCEPTION',
      actorUsername: 'OPS-LEAD-01',
      previousState: '{"status": "UnderInvestigation"}',
      newState: '{"status": "Resolved", "resolutionType": "ManualMatch", "notes": "Approved override after manual bank PDF verification"}',
      ipAddress: '10.3.4.183',
      createdAt: '2026-10-14T10:45:10Z',
    },
  ];

  const columns: ColumnDef<AuditLogItem>[] = [
    {
      id: 'id',
      header: 'Audit ID',
      accessorKey: 'id',
      sortable: true,
      cell: (item) => (
        <span className="font-mono text-slate-500 dark:text-slate-400 font-bold">
          #{item.id}
        </span>
      ),
    },
    {
      id: 'action',
      header: 'Security Action',
      accessorKey: 'action',
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            {item.action}
          </span>
          <span className="block text-[10px] text-slate-400 font-mono">
            Target: {item.entityName}
          </span>
        </div>
      ),
    },
    {
      id: 'actorUsername',
      header: 'Actor / Operator',
      accessorKey: 'actorUsername',
      sortable: true,
      cell: (item) => (
        <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
          {item.actorUsername}
        </span>
      ),
    },
    {
      id: 'ipAddress',
      header: 'Source IP',
      accessorKey: 'ipAddress',
      sortable: true,
      cell: (item) => (
        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
          {item.ipAddress}
        </span>
      ),
    },
    {
      id: 'createdAt',
      header: 'Timestamp',
      accessorKey: 'createdAt',
      sortable: true,
      cell: (item) => (
        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
          {new Date(item.createdAt).toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      id: 'view',
      header: '',
      align: 'right',
      cell: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLog(item);
          }}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Immutable System Audit Trail
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Permanent ledger of all financial mutations, operator assignments, and manual exception resolutions.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        searchPlaceholder="Filter by action or actor..."
        searchKey={(item) => `${item.action} ${item.actorUsername}`}
        onRowClick={(item) => setSelectedLog(item)}
        exportFileName="audit_trail_logs"
      />

      <DetailDrawer
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title={`Audit Entry #${selectedLog?.id}`}
        subtitle={`Action: ${selectedLog?.action}`}
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 font-semibold block">Actor & Context:</span>
              <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                <div>Actor: {selectedLog.actorUsername}</div>
                <div>Entity: {selectedLog.entityName} ({selectedLog.entityId})</div>
                <div>Source IP: {selectedLog.ipAddress}</div>
                <div>Timestamp: {selectedLog.createdAt}</div>
              </div>
            </div>

            {selectedLog.previousState && (
              <div className="space-y-1">
                <span className="text-rose-500 font-semibold block">Previous State:</span>
                <pre className="bg-slate-100 dark:bg-slate-950 p-3 rounded-lg border border-rose-200 dark:border-rose-900/40 font-mono text-[11px] text-rose-600 dark:text-rose-400 overflow-x-auto">
                  {selectedLog.previousState}
                </pre>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-emerald-500 font-semibold block">New State / Mutation:</span>
              <pre className="bg-slate-100 dark:bg-slate-950 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/40 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 overflow-x-auto">
                {selectedLog.newState}
              </pre>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
