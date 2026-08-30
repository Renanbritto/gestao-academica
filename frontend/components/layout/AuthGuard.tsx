import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isGuest, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && !isGuest && router.pathname !== '/' && router.pathname !== '/register') {
      router.replace('/');
    }
  }, [user, isGuest, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mb-4" />
        <span className="text-sm font-semibold text-[var(--text-muted)] animate-pulse">Carregando Ló Acadêmico...</span>
      </div>
    );
  }

  return <>{children}</>;
};
