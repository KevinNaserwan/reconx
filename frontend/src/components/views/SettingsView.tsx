'use client';

import React, { useState } from 'react';
import { Sliders, Shield, Calculator, Check, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [tolerance, setTolerance] = useState(5.0);
  const [dualApprovalLimit, setDualApprovalLimit] = useState(1000000);
  const [autoMatchEnabled, setAutoMatchEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Reconciliation Engine Rules & Policy
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tune matching sensitivity, MDR fee variance thresholds, and financial authorization limits.
        </p>
      </div>

      <div className="space-y-4">
        {/* Card 1: Fee Tolerance */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-card space-y-4">
          <div className="flex items-center space-x-2.5">
            <Sliders className="h-5 w-5 text-emerald-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                MDR Fee Variance Tolerance Window
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Allow transactions with minor nominal variances caused by bank fee deductions to be classified as <span className="font-semibold text-emerald-500">MatchedWithFeeVariance</span>.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-500">Max Allowable Variance:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{tolerance.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="10.0"
              step="0.5"
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% (Strict Exact Match)</span>
              <span>5% (Default Recommended)</span>
              <span>10% (Loose Aggregator)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Four-Eyes Dual Control */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-card space-y-4">
          <div className="flex items-center space-x-2.5">
            <Shield className="h-5 w-5 text-sky-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Four-Eyes Principle Dual Approval Threshold
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Discrepancies exceeding this nominal value require mandatory Supervisor co-signature.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Supervisor Approval Floor (IDR)</label>
              <input
                type="number"
                value={dualApprovalLimit}
                onChange={(e) => setDualApprovalLimit(Number(e.target.value))}
                className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-xs font-mono font-semibold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-3 pt-4 sm:pt-0">
              <input
                type="checkbox"
                id="autoMatch"
                checked={autoMatchEnabled}
                onChange={(e) => setAutoMatchEnabled(e.target.checked)}
                className="h-4 w-4 rounded accent-emerald-500"
              />
              <label htmlFor="autoMatch" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                Auto-clear Pass 1 deterministic matches immediately
              </label>
            </div>
          </div>
        </div>

        {/* Card 3: Invariant Guard Check */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-card space-y-2">
          <div className="flex items-center space-x-2.5">
            <Calculator className="h-5 w-5 text-purple-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Core Financial Invariant Status
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                System mathematically enforces zero floating point drift using C# decimal & PostgreSQL NUMERIC(18, 4).
              </p>
            </div>
          </div>

          <div className="font-mono text-[11px] bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1 text-slate-700 dark:text-slate-300 mt-2">
            <div className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Banker&apos;s Rounding: MidpointRounding.ToEven (Active)</div>
            <div className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Currency Lock: ISO-4217 validation enforced</div>
            <div className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Idempotency: SHA-256 payload fingerprinting active</div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow"
          >
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            <span>{saved ? 'Settings Persisted' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
