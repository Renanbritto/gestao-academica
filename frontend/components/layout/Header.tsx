import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Bell, User, GraduationCap, CloudCheck, CloudOff } from 'lucide-react';
import Link from 'next/link';

export const Header: React.FC = () => {
  const { profile, isGuest, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b border-card-border bg-[var(--header-bg)] px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Lado Esquerdo: Identidade do Aluno / Logo Ló */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <span className="font-display font-black text-lg tracking-wider">Ló</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-base block leading-tight text-[var(--text-main)]">
                Ló Acadêmico
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {profile?.course ? `${profile.course} • ${profile.period || ''}` : 'Gestão Universitária'}
              </span>
            </div>
          </Link>
        </div>

        {/* Mensagem Motivacional no Topo (Desktop / Tablet) */}
        {profile?.motivationNote && (
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--badge-bg)] text-xs font-medium text-[var(--text-main)] border border-indigo-500/20 max-w-md truncate">
            <span>✨</span>
            <span className="truncate">{profile.motivationNote}</span>
          </div>
        )}

        {/* Lado Direito: Ações Rápidas (Tema, Status de Nuvem, Perfil) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Nuvem / Visitante */}
          {isGuest ? (
            <Link
              href="/"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-medium"
              title="Modo Local Offline. Clique para logar."
            >
              <CloudOff size={14} />
              <span className="hidden sm:inline">Offline</span>
            </Link>
          ) : (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium"
              title="Sincronizado na Nuvem"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Nuvem Conectada</span>
            </div>
          )}

          {/* Alternador de Tema */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-card-border bg-card/60 hover:bg-card text-[var(--text-main)] transition-colors"
            aria-label="Alternar tema claro/escuro"
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-400" />}
          </button>

          {/* Link para Avisos */}
          <Link
            href="/alerts"
            className="p-2 rounded-xl border border-card-border bg-card/60 hover:bg-card text-[var(--text-main)] relative transition-colors"
            aria-label="Avisos e Provas"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full ring-2 ring-[var(--bg-main)]" />
          </Link>

          {/* Foto de Perfil / Avatar */}
          <Link
            href="/profile"
            className="w-9 h-9 rounded-xl border border-card-border overflow-hidden bg-indigo-500/20 flex items-center justify-center text-[var(--text-main)] hover:border-indigo-500 transition-colors"
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
