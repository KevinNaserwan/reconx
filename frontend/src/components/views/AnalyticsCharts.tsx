'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { useTheme } from '../ui/ThemeContext';

interface AnalyticsChartsProps {
  matchRate: number;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const trendData = [
    { day: 'Mon', internalVolume: 12500000, providerVolume: 12480000, matchRate: 99.2 },
    { day: 'Tue', internalVolume: 18400000, providerVolume: 18100000, matchRate: 98.4 },
    { day: 'Wed', internalVolume: 15200000, providerVolume: 15200000, matchRate: 100.0 },
    { day: 'Thu', internalVolume: 22100000, providerVolume: 21850000, matchRate: 98.8 },
    { day: 'Fri', internalVolume: 28900000, providerVolume: 28300000, matchRate: 97.9 },
    { day: 'Sat', internalVolume: 14600000, providerVolume: 14590000, matchRate: 99.9 },
    { day: 'Sun', internalVolume: 19800000, providerVolume: 19480000, matchRate: 98.3 },
  ];

  const providerShareData = [
    { name: 'Midtrans QRIS/CC', value: 48, color: '#10b981' },
    { name: 'Xendit Disbursement', value: 28, color: '#0ea5e9' },
    { name: 'BCA Virtual Account', value: 16, color: '#8b5cf6' },
    { name: 'Mandiri Bill', value: 8, color: '#f59e0b' },
  ];

  const formatIDR = (val: number) => `Rp ${(val / 1000000).toFixed(1)}M`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 7-Day Settlement Trend (2 cols) */}
      <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-card transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              7-Day Settlement & Clearing Volume
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily gross transaction volume comparison (Internal vs Provider)
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Internal Ledger
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-sky-500" /> Bank Statements
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="internalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="providerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDark ? '#1e293b' : '#f1f5f9'}
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                stroke={isDark ? '#64748b' : '#94a3b8'}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={formatIDR}
                stroke={isDark ? '#64748b' : '#94a3b8'}
                fontSize={11}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  color: isDark ? '#f8fafc' : '#0f172a',
                }}
                formatter={(value: unknown) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
              />
              <Area
                type="monotone"
                dataKey="internalVolume"
                name="Internal Ledger"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#internalGrad)"
              />
              <Area
                type="monotone"
                dataKey="providerVolume"
                name="Provider Statement"
                stroke="#0ea5e9"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#providerGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Provider Clearing Share (1 col) */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-card transition-colors flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Provider Volume Share</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Settlement proportion by payment channel
          </p>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={providerShareData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {providerShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(val: unknown) => [`${val}% Share`, 'Volume']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {providerShareData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{item.name}</span>
              </div>
              <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
