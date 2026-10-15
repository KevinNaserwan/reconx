'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, RegisterPayload } from '@/components/auth/AuthContext';
import { ShieldCheck, Users, Lock, Mail, User, KeyRound, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, loginWithGoogle, loginWithEmail, register } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [action, setAction] = useState<'create_family' | 'join_family'>('create_family');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [role, setRole] = useState('Partner / Pasangan');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, push to main dashboard
  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const ok = await loginWithGoogle();
      if (ok) {
        router.push('/');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Login Google gagal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email) {
      setErrorMsg('Mohon isi alamat email Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === 'login') {
        const res = await loginWithEmail(email, password);
        if (res.success) {
          router.push('/');
        } else {
          setErrorMsg(res.message || 'Gagal login.');
        }
      } else {
        if (!name) {
          setErrorMsg('Mohon isi nama lengkap Anda.');
          setIsSubmitting(false);
          return;
        }

        if (action === 'join_family' && !inviteCode) {
          setErrorMsg('Mohon masukkan PIN Undangan Keluarga yang ingin Anda ikuti.');
          setIsSubmitting(false);
          return;
        }

        const payload: RegisterPayload = {
          name,
          email,
          password: password || 'reconx123',
          action,
          familyName: action === 'create_family' ? (familyName || `${name || 'Kevin'} & Partner (Couple)`) : undefined,
          inviteCode: action === 'join_family' ? inviteCode : undefined,
          role: action === 'create_family' ? 'Partner / Pasangan' : role,
        };

        const res = await register(payload);
        if (res.success) {
          router.push('/');
        } else {
          setErrorMsg(res.message || 'Gagal registrasi akun.');
        }
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Dynamic Ambient Blur Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-13 w-13 p-3 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-xl shadow-cyan-500/25 ring-1 ring-cyan-400/40">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4l16 16" />
              <path d="M20 4l-7 7" />
              <path d="M4 20l5-5" />
              <circle cx="12" cy="12" r="2.5" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white pt-1">
            Recon<span className="text-cyan-400">X</span> <span className="text-xs uppercase px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold ml-1.5 align-middle">SaaS Cloud</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Platform rekonsiliasi keuangan pribadi & multi-tenant family cluster mandiri dengan proteksi enkripsi perbankan.
          </p>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(null); }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="h-4 w-4" />
            <span>Masuk (Login)</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(null); }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Daftar SaaS Baru</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
            <span className="text-base leading-none">⚠️</span>
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* Fast Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center space-x-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 py-3.5 px-4 font-bold text-sm shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Masuk Cepat dengan Akun Google</span>
        </button>

        <div className="flex items-center space-x-3 text-slate-600">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">atau dengan email</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Pratama"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Akun</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Kata Sandi (Password)</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>
          </div>

          {/* Multi-Tenant Household Options on Registration */}
          {activeTab === 'register' && (
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <label className="block text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>Konfigurasi Cluster Keluarga (Multi-Tenant SaaS)</span>
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setAction('create_family')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    action === 'create_family'
                      ? 'border-cyan-500/80 bg-cyan-950/30 text-white ring-1 ring-cyan-500/50'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="font-bold text-cyan-300">👨‍👩‍👧‍👦 Buat Cluster Baru</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Membuat grup baru & auto generate PIN</p>
                </button>

                <button
                  type="button"
                  onClick={() => setAction('join_family')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    action === 'join_family'
                      ? 'border-indigo-500/80 bg-indigo-950/30 text-white ring-1 ring-indigo-500/50'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="font-bold text-indigo-300">🔗 Gabung dengan PIN</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Masuk ke keluarga yang sudah ada</p>
                </button>
              </div>

              {action === 'create_family' ? (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nama Tracking Cluster Pasangan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kevin & Anan (Couple)"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Anda akan otomatis terdaftar sebagai partner dalam cluster bersama.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">PIN Undangan Pasangan</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Contoh: COUPLE-KVN-ANN"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Peran Finansial</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value="Partner / Pasangan">Partner / Pasangan</option>
                      <option value="Kevin (Partner)">Kevin (Partner)</option>
                      <option value="Anan (Partner)">Anan (Partner)</option>
                      <option value="Personal / Mandiri">Personal / Mandiri</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>{activeTab === 'login' ? 'Masuk ke Dashboard' : 'Daftar Akun & Luncurkan Tenant'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Note */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1.5 text-xs text-slate-400">
          <div className="flex items-center space-x-2 text-slate-300 font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Multi-Tenant Enterprise Isolation</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Setiap cluster keluarga terisolasi secara kriptografis. Mutasi bank antar anggota dihitung otomatis sebagai transfer internal (bukan pengeluaran ganda).
          </p>
        </div>
      </div>
    </div>
  );
}
