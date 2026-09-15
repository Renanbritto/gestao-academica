import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, BookOpen, CheckSquare, Bell, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const router = useRouter();

  const navItems = [
    { href: '/dashboard', label: 'Início', icon: LayoutDashboard },
    { href: '/subjects', label: 'Matérias', icon: BookOpen },
    { href: '/activities', label: 'Atividades', icon: CheckSquare },
    { href: '/alerts', label: 'Avisos', icon: Bell },
    { href: '/profile', label: 'Perfil', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-3 left-4 right-4 z-50">
      <nav className="glass rounded-3xl px-3 py-2 border border-[var(--glass-border)] shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl bg-[var(--bottom-nav-glass)]">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-300 relative ${
                  isActive
                    ? 'text-white font-black scale-110'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] font-medium'
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 bg-indigo-600/25 rounded-2xl -z-10 border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
                )}

                <div className="relative">
                  <Icon
                    size={20}
                    className={isActive ? 'stroke-[2.5px] text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'stroke-2'}
                  />
                </div>
                <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'text-white font-bold' : 'text-[var(--text-muted)]'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
