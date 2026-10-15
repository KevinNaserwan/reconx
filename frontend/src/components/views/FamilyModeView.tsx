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
  Landmark,
  Wallet,
  ShoppingBag,
  Zap,
  Coins,
  Gem,
  Plus,
  X,
  CreditCard,
  UserPlus
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { useAuth } from '../auth/AuthContext';
import { BrandBadge } from '../ui/BrandBadge';

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
  const { user } = useAuth();
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>('all');
  
  // Modals state
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Istri (Co-Admin)');
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletType, setNewWalletType] = useState('BANK');
  const [newWalletAccountNo, setNewWalletAccountNo] = useState('');
  const [newWalletBalance, setNewWalletBalance] = useState('');
  const [newWalletMemberId, setNewWalletMemberId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFamilySummary = async () => {
    try {
      setIsLoading(true);
      const famIdQuery = user?.familyId ? `&familyId=${encodeURIComponent(user.familyId)}` : '';
      const inviteCodeQuery = user?.familyInviteCode ? `&inviteCode=${encodeURIComponent(user.familyInviteCode)}` : '';
      const res = await fetch(`${API_BASE_URL.replace('/v1', '')}/v1/family/summary?mode=${activeMode}${famIdQuery}${inviteCodeQuery}`, {
        headers: {
          'X-Family-Id': user?.familyId || '',
          'X-User-Email': user?.email || '',
        }
      });
      if (res.ok) {
        const data = await res.json();
        setFamilyData(data.familyGroup);
        if (data.familyGroup?.members?.length > 0 && !newWalletMemberId) {
          setNewWalletMemberId(data.familyGroup.members[0].id);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch live family summary', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilySummary();
  }, [activeMode, user?.familyId]);

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE_URL.replace('/v1', '')}/v1/family/member/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId: user?.familyId,
          name: newMemberName.trim(),
          role: newMemberRole,
        }),
      });
      if (res.ok) {
        setNewMemberName('');
        setShowAddMemberModal(false);
        await fetchFamilySummary();
      }
    } catch (err) {
      alert('Gagal menambahkan anggota keluarga: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletName.trim()) return;
    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE_URL.replace('/v1', '')}/v1/family/wallet/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId: user?.familyId,
          memberId: newWalletMemberId,
          name: newWalletName.trim(),
          type: newWalletType,
          accountNo: newWalletAccountNo.trim() || '-',
          initialBalance: parseFloat(newWalletBalance) || 0,
          isShared: true,
        }),
      });
      if (res.ok) {
        setNewWalletName('');
        setNewWalletAccountNo('');
        setNewWalletBalance('');
        setShowAddWalletModal(false);
        await fetchFamilySummary();
      }
    } catch (err) {
      alert('Gagal menambahkan dompet: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWalletIcon = (iconName: string) => {
    switch (iconName) {
      case 'Landmark': return <Landmark className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      case 'Zap': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'TrendingUp': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'Coins': return <Coins className="w-4 h-4 text-indigo-500" />;
      case 'Gem': return <Gem className="w-4 h-4 text-purple-500" />;
      case 'ShoppingBag': return <ShoppingBag className="w-4 h-4 text-rose-500" />;
      case 'PiggyBank': return <PiggyBank className="w-4 h-4 text-teal-500" />;
      default: return <Wallet className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
    }
  };

  if (isLoading && !familyData) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-9 h-9 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium">Menghubungkan ke Multi-Tenant Family Group...</p>
      </div>
    );
  }

  if (!familyData) return null;

  const totalWalletsCount = familyData.members.reduce((acc, m) => acc + (m.wallets?.length || 0), 0);

  const displayedMembers = selectedMember === 'all' 
    ? familyData.members 
    : familyData.members.filter(m => m.id === selectedMember);

  return (
    <div className="space-y-6">
      {/* Top Banner: Mode Selector & Family Group Header (Clean Light & Dark Mode) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/60 dark:from-slate-900 dark:via-indigo-950/80 dark:to-slate-900 border border-indigo-100/80 dark:border-slate-800 p-6 shadow-xs dark:shadow-2xl transition-colors">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
                <Users className="w-3.5 h-3.5" />
                Multi-Tenant Household Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <span className={`w-1.5 h-1.5 rounded-full ${familyData.connectedDevicesCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                {familyData.connectedDevicesCount > 0 
                  ? `${familyData.connectedDevicesCount} Perangkat Terkoneksi`
                  : '0 Perangkat Terkoneksi (Standby)'}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              {familyData.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Platform rekonsiliasi finansial bersama untuk pasangan (Kevin & Anan). Setiap partner memiliki dompet mandiri, anti-dobel hitung transaksi internal (transfer Kevin-Anan), dan ringkasan kekayaan bersama.
            </p>
          </div>

          {/* Mode Switcher Toggle Pill & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* High-Contrast Mode Pill Switcher */}
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-inner">
              <button
                onClick={() => onSwitchMode('personal')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeMode === 'personal'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                👤 Mode Personal
              </button>
              <button
                onClick={() => onSwitchMode('family')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeMode === 'family'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                👨‍👩‍👧‍👦 Mode Family
              </button>
            </div>

            {/* Invite Code PIN Badge */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs shadow-xs">
              <div className="text-slate-500 dark:text-slate-400 font-medium">PIN Undangan:</div>
              <div className="font-mono font-bold text-cyan-700 dark:text-cyan-400 tracking-wider">{familyData.inviteCode}</div>
              <button
                onClick={() => copyInviteCode(familyData.inviteCode)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                title="Salin PIN Undangan Keluarga"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Net Worth Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="bg-white/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/40 rounded-xl p-4 shadow-xs dark:shadow-none">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {activeMode === 'personal' ? `Total Kekayaan Pribadi (${user?.name || 'Saya'})` : `Total Kekayaan Bersih (${familyData.name})`}
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Rp {familyData.totalNetWorth.toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3" />
              100% Terekonsiliasi Real-Time
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/40 rounded-xl p-4 shadow-xs dark:shadow-none">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Anggota & Akun Terdaftar</div>
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
              {familyData.membersCount} Anggota
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {totalWalletsCount > 0 ? `${totalWalletsCount} Dompet Aktif Terkoneksi` : '0 Dompet (Kosongan Siap Ditambah)'}
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/40 rounded-xl p-4 shadow-xs dark:shadow-none">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sync Companion Android</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              {familyData.connectedDevicesCount > 0 ? `${familyData.connectedDevicesCount} HP Aktif` : '0 HP Aktif'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {familyData.connectedDevicesCount > 0 
                ? 'Intersepsi Notifikasi Status Bar Aktif' 
                : 'Menunggu Pairing via Companion APK'}
            </div>
          </div>
        </div>
      </div>

      {/* Member Filter Tabs & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedMember('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedMember === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Semua Anggota ({familyData.members.length})
          </button>
          {familyData.members.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMember(m.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedMember === m.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <img src={m.avatar} alt={m.name} className="w-4 h-4 rounded-full" />
              {m.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            + Undang Anggota
          </button>
          <button
            onClick={() => setShowAddWalletModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            + Tambah Dompet
          </button>
        </div>
      </div>

      {/* Segregated Member Wallet Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {displayedMembers.map((member) => (
          <div
            key={member.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs overflow-hidden flex flex-col"
          >
            {/* Member Card Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-11 h-11 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                      {member.name}
                      {member.isCurrentProfile && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
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
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                  member.deviceStatus === 'ONLINE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    member.deviceStatus === 'ONLINE' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}></span>
                  {member.deviceStatus}
                </span>
              </div>
            </div>

            {/* Individual Wallet List */}
            <div className="p-4 space-y-2.5 flex-1">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                <span>Dompet & Portofolio ({member.wallets.length})</span>
                <button
                  onClick={() => {
                    setNewWalletMemberId(member.id);
                    setShowAddWalletModal(true);
                  }}
                  className="text-cyan-600 dark:text-cyan-400 hover:underline normal-case font-semibold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Tambah
                </button>
              </div>

              {member.wallets.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-2">
                  <Wallet className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Belum ada dompet/rekening terdaftar</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Tambahkan akun bank, e-wallet, atau sambungkan via Companion APK</p>
                  <button
                    onClick={() => {
                      setNewWalletMemberId(member.id);
                      setShowAddWalletModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 hover:bg-cyan-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Tambah Dompet
                  </button>
                </div>
              ) : (
                member.wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="shrink-0">
                        <BrandBadge brand={wallet.app || wallet.name} size={36} />
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
                ))
              )}
            </div>

            {/* Member Subtotal Footer */}
            <div className="p-4 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Subtotal Saldo:</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Rp {member.totalBalance.toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Internal Family Transfers & Anti-Double Counting Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Transfer Internal Antar-Pasangan (Auto-Deduplicated)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ketika Kevin atau Anan saling mentransfer dana (misal tabungan bersama / belanja bersama), ReconX otomatis mengeliminasi transaksi internal agar tidak dihitung ganda sebagai pengeluaran di dashboard.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" /> Anti-Double Counting Active
          </span>
        </div>

        {familyData.internalTransfers.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-2">
            <ArrowRightLeft className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Belum Ada Transaksi Internal Pasangan</p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto mt-1">
              Semua transfer antara Kevin dan Anan akan otomatis terdeteksi dan diisolasi di sini sehingga neraca pengeluaran bersama tetap bersih dan akurat.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {familyData.internalTransfers.map((tx) => (
              <div key={tx.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5">
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
        )}
      </div>

      {/* Joint Household Budgets */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <PiggyBank className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Pos Anggaran Bersama Rumah Tangga
        </h2>

        {familyData.jointBudgets.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-2">
            <PiggyBank className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Belum Ada Pos Anggaran Bersama</p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto mt-1">
              Buat pos anggaran bersama untuk belanja bulanan, operasional rumah tangga, atau tabungan pendidikan keluarga.
            </p>
          </div>
        ) : (
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
        )}
      </div>

      {/* Modal: Undang Anggota Keluarga */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddMemberModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <UserPlus className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              Undang Anggota Keluarga
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Tambah profil anggota keluarga ke tenant household. Anggota dapat menghubungkan HP mereka menggunakan PIN Undangan: <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{familyData.inviteCode}</span>
            </p>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nama Anggota Keluarga
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pasangan, Anak Pertama, Orang Tua"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Peran dalam Rumah Tangga
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Istri (Co-Admin)">Istri (Co-Admin)</option>
                  <option value="Suami (Head of Family)">Suami (Head of Family)</option>
                  <option value="Anak (Pendidikan & Saku)">Anak (Pendidikan & Saku)</option>
                  <option value="Orang Tua / Mertua">Orang Tua / Mertua</option>
                  <option value="Anggota Keluarga Lain">Anggota Keluarga Lain</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Tambah Anggota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Rekening / Dompet Baru */}
      {showAddWalletModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddWalletModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <CreditCard className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              Tambah Rekening / Dompet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Daftarkan rekening bank, akun e-wallet, atau sekuritas investasi untuk salah satu anggota keluarga.
            </p>

            <form onSubmit={handleAddWallet} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Anggota Keluarga
                </label>
                <select
                  value={newWalletMemberId}
                  onChange={(e) => setNewWalletMemberId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {familyData.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nama Dompet / Bank / Akun
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: blu BCA, Superbank, ShopeePay, Bibit"
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tipe Akun
                  </label>
                  <select
                    value={newWalletType}
                    onChange={(e) => setNewWalletType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="BANK">Bank Rekening</option>
                    <option value="EWALLET">E-Wallet (QRIS)</option>
                    <option value="INVEST">Investasi / Saham / SBN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Rekening / HP
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 5040182910"
                    value={newWalletAccountNo}
                    onChange={(e) => setNewWalletAccountNo(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Saldo Awal (Rp)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={newWalletBalance}
                  onChange={(e) => setNewWalletBalance(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddWalletModal(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Dompet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
