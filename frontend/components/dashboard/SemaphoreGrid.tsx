import React from 'react';
import { SubjectSemaphore } from '@/lib/types';
import { Award, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface SemaphoreGridProps {
  semaphores: SubjectSemaphore[];
  passingGrade?: number;
}

export const SemaphoreGrid: React.FC<SemaphoreGridProps> = ({
  semaphores,
  passingGrade = 70.0
}) => {
  if (!semaphores || semaphores.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-muted)] text-sm">
        Nenhuma matéria cadastrada ainda. Cadastre suas disciplinas para acompanhar o semáforo.
      </div>
    );
  }

  const getStatusBadge = (status: SubjectSemaphore['status']) => {
    switch (status) {
      case 'success':
        return {
          icon: Award,
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          barColor: 'bg-emerald-500',
          label: 'Meta Atingida'
        };
      case 'ok':
        return {
          icon: CheckCircle2,
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          barColor: 'bg-blue-500',
          label: 'Aprovado'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          barColor: 'bg-amber-500',
          label: 'Atenção'
        };
      default:
        return {
          icon: ShieldAlert,
          bg: 'bg-red-500/10 text-red-400 border-red-500/20',
          barColor: 'bg-red-500',
          label: 'Crítico'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {semaphores.map((item) => {
        const badge = getStatusBadge(item.status);
        const Icon = badge.icon;
        const percent = Math.min(100, Math.max(0, (item.currentScore / 100) * 100));

        return (
          <div
            key={item.subjectId}
            className="glass p-4 rounded-2xl border border-card-border hover:border-indigo-500/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color || '#6366f1' }}
                  />
                  <h4 className="text-sm font-bold text-[var(--text-main)] truncate">
                    {item.subjectName}
                  </h4>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                  <Icon size={11} />
                  <span>{badge.label}</span>
                </span>
              </div>

              {/* Barra de Progresso */}
              <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden my-3 relative">
                {/* Linha indicativa dos 70 pts de aprovação */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/40 z-10"
                  style={{ left: `${passingGrade}%` }}
                  title="Mínimo para passar: 70 pts"
                />
                <div
                  className={`h-full rounded-full transition-all duration-500 ${badge.barColor}`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="flex justify-between items-baseline text-xs mb-2">
                <span className="text-[var(--text-muted)]">Pontuação Atual:</span>
                <span className="font-display font-black text-sm text-[var(--text-main)]">
                  {item.currentScore.toFixed(1)} <span className="text-[10px] text-[var(--text-muted)]">/ 100 pts</span>
                </span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-card-border/60 text-xs text-[var(--text-muted)] flex items-center justify-between">
              <span>Falta p/ aprovação:</span>
              <span className={`font-bold ${item.missingForPassing === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {item.missingForPassing === 0 ? 'Aprovado (0 pts)' : `${item.missingForPassing.toFixed(1)} pts`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
