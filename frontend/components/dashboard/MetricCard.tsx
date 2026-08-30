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
      border: 'hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/15 text-indigo-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]'
    },
    success: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'
    },
    warning: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/15 text-amber-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]'
    },
    pink: {
      border: 'hover:border-pink-500/40',
      iconBg: 'bg-pink-500/15 text-pink-400',
      glow: 'group-hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]'
    }
  }[color];

  return (
    <div className={`glass p-4 sm:p-5 rounded-2xl group transition-all duration-200 ${colorStyles.border} ${colorStyles.glow}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[var(--text-muted)] tracking-wide uppercase">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${colorStyles.iconBg}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="text-2xl sm:text-3xl font-display font-black text-[var(--text-main)] tracking-tight">
        {value}
      </div>

      {subtitle && (
        <div className="text-xs font-medium text-[var(--text-muted)] mt-1 truncate">
          {subtitle}
        </div>
      )}
    </div>
  );
};
