import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, BookOpen, CheckSquare, Bell, User, LogOut, Bot, Sparkles } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const { signOut, profile } = useAuth();

  const navItems = [
    { href: '/dashboard', label: 'Desempenho Geral', icon: LayoutDashboard },
    { href: '/subjects', label: 'Matérias & Cursos', icon: BookOpen },
    { href: '/activities', label: 'Atividades & Notas', icon: CheckSquare },
    { href: '/alerts', label: 'Avisos de Provas', icon: Bell },
    { href: '/profile', label: 'Configuração do Perfil', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-card-border bg-[var(--sidebar-bg)] p-4 min-h-[calc(100vh-65px)] sticky top-[65px] self-start justify-between">
      
      {/* Menu Principal */}
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          Navegação
        </div>

        {navItems.map((item) => {
          const isActive = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-card/40'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Card de Telegram Bot com Gemini */}
        <div className="pt-6">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-pink-500/10 to-transparent border border-indigo-500/20">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-1">
              <Bot size={16} />
              <span>Ló no Telegram</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-3">
              Receba lembretes de provas e tire dúvidas de matérias com o Gemini IA.
            </p>
            <Link
              href="/profile?tab=telegram"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-colors w-full justify-center"
            >
              <Sparkles size={13} />
              <span>Conectar Bot</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Rodapé da Sidebar */}
      <div className="pt-4 border-t border-card-border space-y-2">
        <div className="px-3 py-2 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 overflow-hidden">
            {profile?.avatarDataUrl ? (
              <img src={profile.avatarDataUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              profile?.name?.charAt(0) || 'L'
            )}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold truncate text-[var(--text-main)]">{profile?.name || 'Estudante'}</div>
            <div className="text-[10px] text-[var(--text-muted)] truncate">{profile?.course || 'Faculdade'}</div>
          </div>
        </div>

        <button
          onClick={() => signOut().then(() => router.push('/'))}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} />
          <span>Sair da Conta</span>
        </button>
      </div>

    </aside>
  );
};
