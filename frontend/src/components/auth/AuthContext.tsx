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
  familyId?: string;
  familyName?: string;
  familyInviteCode?: string;
  activeMode: 'personal' | 'family';
  token?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  activeMode: 'personal' | 'family';
  switchMode: (mode: 'personal' | 'family') => void;
  loginWithGoogle: (customData?: Partial<UserProfile>) => Promise<void>;
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
}

export const defaultUser: UserProfile = {
  id: 'usr-kevin-001',
  name: 'Kevin Naserwan',
  email: 'kevin.naserwan@gmail.com',
  picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin',
  role: 'Head of Household (Suami)',
  tenant: 'Keluarga Kevin & Istri',
  familyId: 'fam-kevin-001',
  familyName: 'Keluarga Kevin & Istri',
  familyInviteCode: 'FAM-KVN-8821',
  activeMode: 'family',
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  activeMode: 'family',
  switchMode: () => {},
  loginWithGoogle: async () => {},
  logout: () => {},
  isLoginModalOpen: false,
  setIsLoginModalOpen: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    } finally {
      setIsLoading(false);
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

  const loginWithGoogle = async (customData?: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      const profile: UserProfile = {
        id: customData?.id || 'usr-kevin-001',
        name: customData?.name || 'Kevin Naserwan',
        email: customData?.email || 'kevin.naserwan@gmail.com',
        picture: customData?.picture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin',
        role: 'Head of Household (Suami)',
        tenant: 'Keluarga Kevin & Istri',
        familyId: 'fam-kevin-001',
        familyName: 'Keluarga Kevin & Istri',
        familyInviteCode: 'FAM-KVN-8821',
        activeMode: activeMode,
      };

      // Call backend Google Auth endpoint
      try {
        const res = await fetch(`${API_BASE_URL.replace('/v1', '')}/v1/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: profile.email,
            name: profile.name,
            picture: profile.picture,
            idToken: 'mock_google_id_token_' + Date.now(),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          profile.token = data.token;
        }
      } catch (e) {
        console.warn('Backend auth sync skipped, using local session', e);
      }

      setUser(profile);
      localStorage.setItem('reconx_auth_user', JSON.stringify(profile));
      setIsLoginModalOpen(false);
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
