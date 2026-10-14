'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
  role: string;
  tenant: string;
  familyId: string;
  familyName: string;
  familyInviteCode: string;
  activeMode: 'personal' | 'family';
  token?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  action: 'create_family' | 'join_family';
  familyName?: string;
  inviteCode?: string;
  role?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  activeMode: 'personal' | 'family';
  switchMode: (mode: 'personal' | 'family') => void;
  loginWithGoogle: (customData?: Partial<UserProfile>) => Promise<boolean>;
  loginWithEmail: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  activeMode: 'family',
  switchMode: () => {},
  loginWithGoogle: async () => false,
  loginWithEmail: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  isLoginModalOpen: false,
  setIsLoginModalOpen: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('reconx_auth_user');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'personal' | 'family'>('family');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('reconx_auth_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        if (parsed.activeMode) {
          setActiveMode(parsed.activeMode);
        }
      } else {
        // Enforce Authentication Gate: Do not auto-login
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const switchMode = (mode: 'personal' | 'family') => {
    setActiveMode(mode);
    if (user) {
      const updated = { ...user, activeMode: mode };
      setUser(updated);
      localStorage.setItem('reconx_auth_user', JSON.stringify(updated));
    }
  };

  const loginWithGoogle = async (customData?: Partial<UserProfile>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const email = customData?.email || 'kevin.naserwan@gmail.com';
      const name = customData?.name || 'Kevin Naserwan';
      const picture = customData?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

      let profile: UserProfile = {
        id: customData?.id || 'usr-kevin-001',
        name,
        email,
        picture,
        role: customData?.role || 'Head of Household (Suami)',
        tenant: customData?.familyName || 'Keluarga Kevin & Istri',
        familyId: customData?.familyId || 'fam-kevin-001',
        familyName: customData?.familyName || 'Keluarga Kevin & Istri',
        familyInviteCode: customData?.familyInviteCode || 'FAM-KVN-8821',
        activeMode: activeMode,
      };

      try {
        const res = await fetch(`${API_BASE_URL.replace('/v1', '')}/v1/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name,
            picture,
            idToken: 'mock_google_id_token_' + Date.now(),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            profile = {
              ...profile,
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              familyId: data.user.familyId,
              familyName: data.user.familyName,
              familyInviteCode: data.user.familyInviteCode,
              tenant: data.user.familyName,
              token: data.token,
            };
          }
        }
      } catch (e) {
        console.warn('Backend auth sync skipped, using local session', e);
      }

      setUser(profile);
      localStorage.setItem('reconx_auth_user', JSON.stringify(profile));
      setIsLoginModalOpen(false);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL.replace('/v1', '')}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || 'reconx123' }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Gagal login.' };
      }

      const profile: UserProfile = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        picture: data.user.picture,
        role: data.user.role,
        tenant: data.user.familyName,
        familyId: data.user.familyId,
        familyName: data.user.familyName,
        familyInviteCode: data.user.familyInviteCode,
        activeMode: 'family',
        token: data.token,
      };

      setUser(profile);
      localStorage.setItem('reconx_auth_user', JSON.stringify(profile));
      setIsLoginModalOpen(false);
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message || 'Gagal terhubung ke server auth.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL.replace('/v1', '')}/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          password: payload.password || 'reconx123',
          action: payload.action,
          familyName: payload.familyName,
          inviteCode: payload.inviteCode,
          role: payload.role || (payload.action === 'join_family' ? 'Anggota Keluarga' : 'Head of Household'),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Gagal mendaftar akun baru.' };
      }

      const profile: UserProfile = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        picture: data.user.picture,
        role: data.user.role,
        tenant: data.user.familyName,
        familyId: data.user.familyId,
        familyName: data.user.familyName,
        familyInviteCode: data.user.familyInviteCode,
        activeMode: 'family',
        token: data.token,
      };

      setUser(profile);
      localStorage.setItem('reconx_auth_user', JSON.stringify(profile));
      setIsLoginModalOpen(false);
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message || 'Gagal terhubung ke server registrasi.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('reconx_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        activeMode,
        switchMode,
        loginWithGoogle,
        loginWithEmail,
        register,
        logout,
        isLoginModalOpen,
        setIsLoginModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
