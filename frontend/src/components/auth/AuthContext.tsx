'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

export interface UserProfile {
  name: string;
  email: string;
  picture: string;
  role: string;
  tenant: string;
  token?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginWithGoogle: (customData?: Partial<UserProfile>) => Promise<void>;
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
}

const defaultUser: UserProfile = {
  name: 'Kevin Naserwan',
  email: 'kevin.naserwan@reconx.io',
  picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin',
  role: 'Fintech Lead Architect',
  tenant: 'PTBA Fin-Treasury',
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  loginWithGoogle: async () => {},
  logout: () => {},
  isLoginModalOpen: false,
  setIsLoginModalOpen: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('reconx_auth_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Initial active session for seamless demo
        setUser(defaultUser);
        localStorage.setItem('reconx_auth_user', JSON.stringify(defaultUser));
      }
    } catch {
      setUser(defaultUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = async (customData?: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      const profile = {
        name: customData?.name || 'Kevin Naserwan',
        email: customData?.email || 'kevin.naserwan@reconx.io',
        picture: customData?.picture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin',
        role: 'Fintech Lead Architect',
        tenant: 'PTBA Fin-Treasury',
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
