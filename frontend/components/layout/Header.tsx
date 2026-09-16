import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Bell, User, CloudOff } from 'lucide-react';
import Link from 'next/link';

export const Header: React.FC = () => {
  const { profile, isGuest } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl border-b border-[var(--glass-border)] bg-[var(--header-glass)] px-4 py-3 sm:px-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between">
        
        {/* Lado Esquerdo: Identidade do Aluno / Logo Ió */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="Ió Acadêmico"
              className="w-10 h-10 rounded-2xl object-cover shadow-[0_0_25px_rgba(99,102,241,0.5)] group-hover:scale-105 transition-all border border-white/20"
            />
            <div className="hidden sm:block">
              <span className="font-display font-bold text-base block leading-tight text-[var(--text-main)]">
                Ió Acadêmico
              </span>
              <span className="text-xs text-[var(--text-muted)] font-medium">
                {profile?.course ? `${profile.course} • ${profile.period || ''}` : 'Gestão Universitária'}
              </span>
            </div>
          </Link>
        </div>

        {/* Mensagem Motivacional no Topo (Glass Capsule) */}
        {profile?.motivationNote && (
          <div className="hidden md:flex items-center px-4 py-1.5 rounded-full glass-pill text-xs font-semibold text-[var(--text-main)] border border-indigo-500/30 max-w-md truncate shadow-sm">
            <span className="truncate">{profile.motivationNote}</span>
          </div>
        )}

        {/* Lado Direito: Ações Rápidas (Tema, Status de Nuvem, Perfil) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Status Nuvem / Visitante */}
          {isGuest ? (
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold backdrop-blur-md"
              title="Modo Local Offline. Clique para logar."
            >
              <CloudOff size={14} />
              <span className="hidden sm:inline">Offline</span>
            </Link>
          ) : (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              title="Sincronizado na Nuvem"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span className="hidden sm:inline">Nuvem Conectada</span>
            </div>
          )}

          {/* Alternador de Tema */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl glass-pill hover:border-indigo-500/50 text-[var(--text-main)] transition-all hover:scale-105 active:scale-95"
            aria-label="Alternar tema claro/escuro"
          >
            {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-indigo-400" />}
          </button>

          {/* Link para Avisos */}
          <Link
            href="/alerts"
            className="p-2.5 rounded-xl glass-pill hover:border-indigo-500/50 text-[var(--text-main)] relative transition-all hover:scale-105 active:scale-95"
            aria-label="Avisos e Provas"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-pink-500 rounded-full shadow-[0_0_8px_#ec4899] ring-2 ring-[var(--bg-main)] animate-pulse" />
          </Link>

          {/* Foto de Perfil / Avatar */}
          <Link
            href="/profile"
            className="w-10 h-10 rounded-2xl glass-pill overflow-hidden flex items-center justify-center text-[var(--text-main)] hover:border-indigo-500 transition-all hover:scale-105 active:scale-95 border-2 border-indigo-500/30 shadow-sm"
          >
            {profile?.avatarDataUrl ? (
              <img src={profile.avatarDataUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-indigo-400" />
            )}
          </Link>
        </div>

      </div>
    </header>
  );
};
