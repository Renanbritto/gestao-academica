import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'primary' | 'success' | 'warning' | 'pink';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary'
}) => {
  const colorStyles = {
    primary: {
      border: 'hover:border-indigo-500/50',
      iconBg: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]',
      glow: 'group-hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.25)]',
      accentGlow: 'bg-indigo-500/10'
    },
    success: {
      border: 'hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
      glow: 'group-hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.25)]',
      accentGlow: 'bg-emerald-500/10'
    },
    warning: {
      border: 'hover:border-amber-500/50',
      iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
      glow: 'group-hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.25)]',
      accentGlow: 'bg-amber-500/10'
    },
    pink: {
      border: 'hover:border-pink-500/50',
      iconBg: 'bg-pink-500/15 text-pink-400 border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]',
      glow: 'group-hover:shadow-[0_20px_40px_-10px_rgba(236,72,153,0.25)]',
      accentGlow: 'bg-pink-500/10'
    }
  }[color];

  return (
    <div
      className={`glass glass-interactive p-5 rounded-3xl group relative overflow-hidden flex flex-col justify-between ${colorStyles.border} ${colorStyles.glow}`}
    >
      {/* Brilho interno no topo do card */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${colorStyles.accentGlow} rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500`} />

      <div>
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-xs font-bold text-[var(--text-muted)] tracking-wider uppercase">
            {title}
          </span>
          <div className={`p-2.5 rounded-2xl ${colorStyles.iconBg} transition-transform group-hover:scale-110`}>
            <Icon size={18} />
          </div>
        </div>

        <div className="text-2xl sm:text-3xl font-display font-black text-[var(--text-main)] tracking-tight relative z-10">
          {value}
        </div>
      </div>

      {subtitle && (
        <div className="text-xs font-semibold text-[var(--text-muted)] mt-2 truncate relative z-10">
          {subtitle}
        </div>
      )}
    </div>
  );
};
