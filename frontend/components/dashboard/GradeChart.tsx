import React from 'react';
import { SubjectSemaphore } from '@/lib/types';

interface GradeChartProps {
  semaphores: SubjectSemaphore[];
}

export const GradeChart: React.FC<GradeChartProps> = ({ semaphores }) => {
  if (!semaphores || semaphores.length === 0) {
    return (
      <div className="text-center py-10 text-xs text-[var(--text-muted)]">
        Cadastre suas disciplinas para visualizar o gráfico de pontuação.
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {semaphores.map((item) => {
        const percent = Math.min(100, Math.max(0, (item.currentScore / 100) * 100));

        return (
          <div key={item.subjectId} className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 max-w-[70%]">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color || '#6366f1' }}
                />
                <span className="font-semibold text-[var(--text-main)] truncate">
                  {item.subjectName}
                </span>
              </div>
              <span className="font-bold text-[var(--text-main)]">
                {item.currentScore.toFixed(1)} <span className="text-[10px] text-[var(--text-muted)] font-normal">pts</span>
              </span>
            </div>

            {/* Barra Horizontal Dinâmica */}
            <div className="w-full bg-slate-800/60 rounded-full h-3 overflow-hidden p-0.5 border border-white/5 relative">
              {/* Linha dos 70 pontos */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400/50 z-10"
                style={{ left: '70%' }}
                title="70 pts (Aprovação)"
              />
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${percent}%`,
                  backgroundColor: item.color || '#6366f1'
                }}
              />
            </div>
          </div>
        );
      })}

      <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] pt-2 border-t border-card-border">
        <span>0 pts</span>
        <span className="text-amber-400/80 font-bold">Mínimo: 70 pts</span>
        <span>100 pts</span>
      </div>
    </div>
  );
};
