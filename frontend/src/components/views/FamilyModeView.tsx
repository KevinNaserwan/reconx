'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Copy, 
  Check, 
  Smartphone, 
  ArrowRightLeft, 
  PiggyBank, 
  TrendingUp, 
  Eye, 
  EyeOff, 
  Sparkles,
  ChevronRight,
  PlusCircle,
  Landmark,
  Wallet,
  ShoppingBag,
  Zap,
  Coins,
  Gem
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface WalletItem {
  id: string;
  name: string;
  type: string;
  accountNo: string;
  balance: number;
  isShared: boolean;
  syncStatus: string;
  app: string;
  icon: string;
}

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  device: string;
  deviceStatus: string;
  wallets: WalletItem[];
  totalBalance: number;
  isCurrentProfile: boolean;
}

interface InternalTransfer {
  id: string;
  fromMember: string;
  toMember: string;
  sourceWallet: string;
  destinationWallet: string;
  amount: number;
  category: string;
  timestamp: string;
  status: string;
  notes: string;
}

interface JointBudget {
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  pic: string;
}

interface FamilyData {
  id: string;
  name: string;
  inviteCode: string;
  head: string;
  activeMode: string;
  totalNetWorth: number;
  membersCount: number;
  connectedDevicesCount: number;
  members: FamilyMember[];
  jointBudgets: JointBudget[];
  internalTransfers: InternalTransfer[];
}

export const FamilyModeView: React.FC<{ activeMode: 'personal' | 'family'; onSwitchMode: (mode: 'personal' | 'family') => void }> = ({
  activeMode,
  onSwitchMode,
}) => {
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteInput, setInviteInput] = useState('');

  const fetchFamilySummary = async () => {
    try {
      const res = await fetch(`${API_BASE_URL.replace('/v1', '')}/v1/family/summary?mode=${activeMode}`);
      if (res.ok) {
        const data = await res.json();
        setFamilyData(data.familyGroup);
      }
    } catch (err) {
      console.warn('Failed to fetch live family summary, using local state', err);
    }
  };

  useEffect(() => {
    fetchFamilySummary();
  }, [activeMode]);

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getWalletIcon = (iconName: string) => {
    switch (iconName) {
      case 'Landmark': return <Landmark className="w-4 h-4 text-cyan-500" />;
      case 'Zap': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'TrendingUp': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'Coins': return <Coins className="w-4 h-4 text-indigo-500" />;
      case 'Gem': return <Gem className="w-4 h-4 text-purple-500" />;
      case 'ShoppingBag': return <ShoppingBag className="w-4 h-4 text-rose-500" />;
      case 'PiggyBank': return <PiggyBank className="w-4 h-4 text-teal-500" />;
      default: return <Wallet className="w-4 h-4 text-cyan-500" />;
    }
  };

  if (!familyData) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Memuat ringkasan Multi-Tenant Family Group...
      </div>
    );
  }

  const displayedMembers = selectedMember === 'all' 
    ? familyData.members 
    : familyData.members.filter(m => m.id === selectedMember);

  return (
    <div className="space-y-6">
      {/* Top Banner: Mode Selector & Family Group Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Users className="w-3.5 h-3.5" />
                Multi-Tenant Household Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                2 Perangkat Terkoneksi
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              {familyData.name}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Platform rekonsiliasi finansial bersama untuk Suami, Istri, dan Keluarga. Setiap anggota memiliki dompet mandiri, anti-dobel hitung transaksi internal, dan ringkasan kekayaan bersih terpusat.
            </p>
          </div>

          {/* Mode Switcher Toggle Pill */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="inline-flex p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 shadow-inner">
              <button
                onClick={() => onSwitchMode('personal')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeMode === 'personal'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                👤 Mode Personal
              </button>
              <button
                onClick={() => onSwitchMode('family')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeMode === 'family'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                👨‍👩‍👧‍👦 Mode Family
              </button>
            </div>

            {/* Invite Code Badge */}
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3.5 py-2 rounded-xl text-xs">
              <div className="text-slate-400">PIN Undangan:</div>
              <div className="font-mono font-bold text-cyan-400 tracking-wider">{familyData.inviteCode}</div>
              <button
                onClick={() => copyInviteCode(familyData.inviteCode)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Salin PIN Undangan Keluarga"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Aggregate Net Worth Metric */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
            <div className="text-xs text-slate-400 font-medium">
              {activeMode === 'personal' ? 'Total Kekayaan Pribadi (Mas Kevin)' : 'Total Kekayaan Bersih Keluarga'}
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              Rp {familyData.totalNetWorth.toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3" />
              100% Terekonsiliasi Real-Time
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
            <div className="text-xs text-slate-400 font-medium">Total Anggota & Akun Terdaftar</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {familyData.membersCount} Anggota
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Suami, Istri, Anak (9 Dompet & Investasi)
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
            <div className="text-xs text-slate-400 font-medium">Sync Companion Android</div>
            <div className="text-2xl font-bold text-purple-400 mt-1 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-400" />
              2 HP Aktif
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Intersepsi Notifikasi Status Bar Otomatis
            </div>
          </div>
        </div>
      </div>

      {/* Member Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedMember('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedMember === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Semua Anggota ({familyData.members.length})
        </button>
        {familyData.members.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMember(m.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedMember === m.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <img src={m.avatar} alt={m.name} className="w-4 h-4 rounded-full" />
            {m.name}
          </button>
        ))}
      </div>

      {/* Segregated Member Wallet Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {displayedMembers.map((member) => (
          <div
            key={member.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden flex flex-col"
          >
            {/* Member Card Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-11 h-11 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                      {member.name}
                      {member.isCurrentProfile && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                          Anda
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{member.role}</div>
                  </div>
                </div>
              </div>

              {/* Device Sync Info */}
              <div className="mt-3.5 flex items-center justify-between text-xs pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[180px]">{member.device}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {member.deviceStatus}
                </span>
              </div>
            </div>

            {/* Individual Wallet List */}
            <div className="p-4 space-y-2.5 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Dompet & Portofolio ({member.wallets.length})
              </div>

              {member.wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-xs shrink-0">
                      {getWalletIcon(wallet.icon)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {wallet.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        No. {wallet.accountNo}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Rp {wallet.balance.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                      {wallet.isShared ? (
                        <span className="text-cyan-600 dark:text-cyan-400 flex items-center gap-0.5 font-medium">
                          <Eye className="w-2.5 h-2.5" /> Shared
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-0.5">
                          <EyeOff className="w-2.5 h-2.5" /> Pribadi
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Member Subtotal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Subtotal Saldo:</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Rp {member.totalBalance.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Internal Family Transfers & Anti-Double Counting Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-cyan-500" />
              Transfer Internal Antar-Anggota Keluarga (Auto-Deduplicated)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ketika Mas Kevin mentransfer uang ke Istri (misal belanja dapur / nafkah), ReconX mendeteksi kedua sisi dan mengeliminasi dari pengeluaran eksternal sehingga tidak dobel hitung di laporan.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" /> Anti-Double Counting Active
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {familyData.internalTransfers.map((tx) => (
            <div key={tx.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500 shrink-0 mt-0.5">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{tx.fromMember}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tx.toMember}</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                    {tx.category} • {tx.sourceWallet} ke {tx.destinationWallet}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                    ✓ {tx.notes}
                  </div>
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  Rp {tx.amount.toLocaleString('id-ID')}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{tx.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Joint Household Budgets */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <PiggyBank className="w-4 h-4 text-purple-500" />
          Pos Anggaran Bersama Rumah Tangga
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {familyData.jointBudgets.map((b, i) => {
            const pct = Math.min(100, Math.round((b.spent / b.allocated) * 100));
            return (
              <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900 dark:text-white">{b.name}</span>
                  <span className="text-slate-400">PIC: {b.pic}</span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                  Rp {b.spent.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">/ Rp {b.allocated.toLocaleString('id-ID')}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-3">
                  <div 
                    className={`h-full rounded-full ${
                      pct > 90 ? 'bg-rose-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>{pct}% Terpakai</span>
                  <span>Sisa: Rp {b.remaining.toLocaleString('id-ID')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
