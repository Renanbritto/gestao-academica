import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Bell,
  User,
  LogOut,
  Bot,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const router = useRouter();
  const { signOut, profile } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Recupera preferência do usuário no localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lo_sidebar_collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('lo_sidebar_collapsed', String(next));
  };

  const navItems = [
    { href: '/dashboard', label: 'Desempenho Geral', icon: LayoutDashboard },
    { href: '/subjects', label: 'Matérias & Cursos', icon: BookOpen },
    { href: '/activities', label: 'Atividades & Notas', icon: CheckSquare },
    { href: '/alerts', label: 'Avisos de Provas', icon: Bell },
    { href: '/profile', label: 'Configuração do Perfil', icon: User },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-[var(--glass-border)] bg-[var(--sidebar-glass)] backdrop-blur-2xl p-3 min-h-[calc(100vh-65px)] sticky top-[65px] self-start justify-between transition-all duration-300 ease-in-out z-40 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Topo da Sidebar: Botão Recolher + Itens de Navegação */}
      <div className="space-y-2">
        
        {/* Cabeçalho do Menu com Botão de Recolher */}
        <div className={`flex items-center px-2 py-1.5 mb-2 relative group/toggle ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Navegação
            </span>
          )}
          
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-xl glass-pill hover:border-indigo-500/50 text-[var(--text-muted)] hover:text-white transition-all hover:scale-105 active:scale-95"
            title={isCollapsed ? 'Expandir Menu Lateral' : 'Recolher Menu Lateral'}
            aria-label={isCollapsed ? 'Expandir Menu Lateral' : 'Recolher Menu Lateral'}
          >
            {isCollapsed ? <PanelLeftOpen size={18} className="text-indigo-400" /> : <PanelLeftClose size={18} />}
          </button>

          {/* Tooltip para o botão quando recolhido */}
          {isCollapsed && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-[100] opacity-0 pointer-events-none group-hover/toggle:opacity-100 transition-opacity duration-200">
              <div className="relative bg-slate-900/95 text-white text-xs font-bold py-1.5 px-3 rounded-xl border border-indigo-500/40 shadow-2xl backdrop-blur-2xl whitespace-nowrap">
                Expandir Menu
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-slate-900/95" />
              </div>
            </div>
          )}
        </div>

        {/* Links de Navegação */}
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <div key={item.href} className="relative group/nav">
                <Link
                  href={item.href}
                  className={`flex items-center rounded-2xl text-sm font-semibold transition-all ${
                    isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-400/40'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5'
                  }`}
                >
                  <Icon
                    size={20}
                    className={`flex-shrink-0 transition-transform group-hover/nav:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover/nav:text-indigo-400'
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="truncate tracking-tight">{item.label}</span>
                  )}
                </Link>

                {/* Tooltip flutuante e nítido sem corte quando recolhido */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 z-[100] opacity-0 pointer-events-none group-hover/nav:opacity-100 transition-opacity duration-200">
                    <div className="relative bg-slate-900/95 text-white text-xs font-bold py-1.5 px-3 rounded-xl border border-indigo-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl whitespace-nowrap">
                      {item.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-slate-900/95" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Card do Telegram Bot (Expandido vs Ícone no modo recolhido) */}
        <div className="pt-4">
          {isCollapsed ? (
            <div className="relative group/bot">
              <Link
                href="/profile?tab=telegram"
                className="flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-600/20 border border-indigo-500/30 text-sky-400 hover:scale-105 transition-all"
              >
                <Bot size={20} className="group-hover/bot:rotate-12 transition-transform" />
              </Link>

              {/* Tooltip Bot */}
              <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 z-[100] opacity-0 pointer-events-none group-hover/bot:opacity-100 transition-opacity duration-200">
                <div className="relative bg-slate-900/95 text-white text-xs font-bold py-1.5 px-3 rounded-xl border border-indigo-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl whitespace-nowrap flex items-center gap-1.5">
                  <Sparkles size={13} className="text-pink-400" />
                  <span>Ió no Telegram (Gemini IA)</span>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-slate-900/95" />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-pink-500/10 to-transparent border border-indigo-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                <Bot size={16} />
                <span>Ió no Telegram</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Receba lembretes e tire dúvidas com o Gemini IA.
              </p>
              <Link
                href="/profile?tab=telegram"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-xl transition-all w-full justify-center shadow-md shadow-indigo-600/30"
              >
                <Sparkles size={13} />
                <span>Conectar Bot</span>
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Rodapé da Sidebar (Perfil e Logout) */}
      <div className="pt-3 border-t border-[var(--glass-border)] space-y-2">
        <div className="relative group/profile">
          <Link
            href="/profile"
            className={`flex items-center rounded-2xl transition-all hover:bg-white/5 ${
              isCollapsed ? 'justify-center p-2' : 'gap-3 p-2'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0 border border-white/20 shadow-sm">
              {profile?.avatarDataUrl ? (
                <img src={profile.avatarDataUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile?.name?.charAt(0) || 'I'
              )}
            </div>

            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="text-xs font-bold truncate text-[var(--text-main)]">
                  {profile?.name || 'Estudante Ió'}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] truncate font-medium">
                  {profile?.course ? `${profile.course} • ${profile.period || ''}` : 'Faculdade'}
                </div>
              </div>
            )}
          </Link>

          {/* Tooltip do Perfil quando recolhido */}
          {isCollapsed && (
            <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 z-[100] opacity-0 pointer-events-none group-hover/profile:opacity-100 transition-opacity duration-200">
              <div className="relative bg-slate-900/95 text-white text-xs font-bold py-1.5 px-3 rounded-xl border border-indigo-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl whitespace-nowrap">
                {profile?.name || 'Meu Perfil'}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-slate-900/95" />
              </div>
            </div>
          )}
        </div>

        <div className="relative group/logout">
          <button
            onClick={() => signOut().then(() => router.push('/'))}
            className={`w-full flex items-center rounded-2xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors ${
              isCollapsed ? 'justify-center p-2.5' : 'gap-2 px-3 py-2'
            }`}
            aria-label="Sair da Conta"
          >
            <LogOut size={16} className="flex-shrink-0" />
            {!isCollapsed && <span>Sair da Conta</span>}
          </button>

          {/* Tooltip Logout quando recolhido */}
          {isCollapsed && (
            <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 z-[100] opacity-0 pointer-events-none group-hover/logout:opacity-100 transition-opacity duration-200">
              <div className="relative bg-slate-900/95 text-rose-300 text-xs font-bold py-1.5 px-3 rounded-xl border border-rose-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl whitespace-nowrap">
                Sair da Conta
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-slate-900/95" />
              </div>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
};
