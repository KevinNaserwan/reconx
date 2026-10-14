'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown, 
  Download, 
  LayoutGrid, 
  Table as TableIcon, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react';

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: keyof T | ((item: T) => string);
  onRowClick?: (item: T) => void;
  exportFileName?: string;
  actionSlot?: React.ReactNode;
  emptyMessage?: string;
  cardRenderer?: (item: T) => React.ReactNode;
}

export function DataTable<T extends object>({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  searchKey,
  onRowClick,
  exportFileName = 'data_export',
  actionSlot,
  emptyMessage = 'No records found.',
  cardRenderer
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filter
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const s = search.toLowerCase().trim();

    return data.filter((item) => {
      if (typeof searchKey === 'function') {
        return searchKey(item).toLowerCase().includes(s);
      }
      if (searchKey) {
        const val = item[searchKey];
        return String(val ?? '').toLowerCase().includes(s);
      }
      // Fallback: search across all string values in item
      return Object.values(item as Record<string, unknown>).some((v) =>
        String(v ?? '').toLowerCase().includes(s)
      );
    });
  }, [data, search, searchKey]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const col = columns.find((c) => c.id === sortColumn);
      if (!col || !col.accessorKey) return 0;

      const valA = a[col.accessorKey];
      const valB = b[col.accessorKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      const comparison = (valA as string | number) < (valB as string | number) ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (columnId: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortColumn === columnId) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = columns.map((c) => `"${c.header}"`).join(',');
    const rows = sortedData.map((item) =>
      columns
        .map((c) => {
          const val = c.accessorKey ? item[c.accessorKey] : '';
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${exportFileName}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-8 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {actionSlot}

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex h-9 items-center space-x-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-colors"
            title="Export CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* View Mode Toggle (Grid/Table) if cardRenderer provided */}
          {cardRenderer && (
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 shadow-sm">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Table View"
              >
                <TableIcon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'table' || !cardRenderer ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-card overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      onClick={() => handleSort(col.id, col.sortable)}
                      className={`py-3 px-4 select-none ${col.sortable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60' : ''} ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      } ${col.className || ''}`}
                    >
                      <div className={`inline-flex items-center space-x-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                        <span>{col.header}</span>
                        {col.sortable && (
                          <span className="text-slate-400">
                            {sortColumn === col.id ? (
                              sortDirection === 'asc' ? (
                                <ChevronUp className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-emerald-500" />
                              )
                            ) : (
                              <ChevronsUpDown className="h-3 w-3 opacity-40" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, rowIdx) => (
                    <tr
                      key={(item as Record<string, unknown>).id ? String((item as Record<string, unknown>).id) : rowIdx}
                      onClick={() => onRowClick && onRowClick(item)}
                      className={`transition-colors ${
                        onRowClick ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                      }`}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.id}
                          className={`py-3 px-4 ${
                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                          } ${col.className || ''}`}
                        >
                          {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey] ?? '-') : null}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="py-12 text-center text-slate-400 text-xs">
                      {emptyMessage}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedData.length > 0 ? (
            paginatedData.map((item, idx) => (
              <div
                key={(item as Record<string, unknown>).id ? String((item as Record<string, unknown>).id) : idx}
                onClick={() => onRowClick && onRowClick(item)}
                className="cursor-pointer transition-transform hover:-translate-y-0.5"
              >
                {cardRenderer(item)}
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 text-xs">
              {emptyMessage}
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
        <div className="flex items-center space-x-2">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-7 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 text-xs text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span>of {sortedData.length} records</span>
        </div>

        <div className="flex items-center space-x-1.5 self-end sm:self-auto">
          <span className="mr-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors shadow-sm"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors shadow-sm"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
