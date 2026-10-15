'use client';

import React from 'react';
import { ThemeProvider } from '@/components/ui/ThemeContext';
import { AuthProvider } from '@/components/auth/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
