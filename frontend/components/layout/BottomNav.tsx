import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, BookOpen, CheckSquare, Bell, User, Bot } from 'lucide-react';

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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bottom-nav-bg)] backdrop-blur-2xl border-t border-card-border px-2 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-indigo-400 font-bold scale-105'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] font-medium'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
