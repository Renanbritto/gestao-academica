import React, { useState } from 'react';
import { Subject } from '@/lib/types';
import { Calculator, Sparkles } from 'lucide-react';

interface GoalCalculatorProps {
  subjects: Subject[];
}

export const GoalCalculator: React.FC<GoalCalculatorProps> = ({ subjects }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id?.toString() || '');
  const [targetScore, setTargetScore] = useState<number>(85);
  const [currentScore, setCurrentScore] = useState<number>(50);
  const [nextExamWeight, setNextExamWeight] = useState<number>(40);

  const calculateNeededGrade = (): { grade: number; possible: boolean; message: string } => {
    if (nextExamWeight <= 0) return { grade: 0, possible: false, message: 'Peso inválido' };

    const needed = (targetScore - currentScore) / (nextExamWeight / 100);
    const clamped = Math.max(0, needed);

    if (clamped <= 0) {
      return { grade: 0, possible: true, message: 'Você já atingiu esta meta! 🎉' };
    } else if (clamped <= 100) {
      return { grade: clamped, possible: true, message: 'Totalmente possível! Mantenha o foco! 💪' };
    } else {
      return { grade: clamped, possible: false, message: 'Meta muito alta para o peso desta prova! ⚠️' };
    }
  };

  const result = calculateNeededGrade();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
            Meta Desejada (pts)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="5"
            value={targetScore}
            onChange={(e) => setTargetScore(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-card border border-card-border text-sm font-semibold focus:outline-none focus:border-indigo-500 text-[var(--text-main)]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
            Pontuação Atual (pts)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="5"
            value={currentScore}
            onChange={(e) => setCurrentScore(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-card border border-card-border text-sm font-semibold focus:outline-none focus:border-indigo-500 text-[var(--text-main)]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
            Peso da Próxima Prova / Trabalho (%)
          </label>
          <input
            type="number"
            min="5"
            max="100"
            step="5"
            value={nextExamWeight}
            onChange={(e) => setNextExamWeight(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-card border border-card-border text-sm font-semibold focus:outline-none focus:border-indigo-500 text-[var(--text-main)]"
          />
        </div>
      </div>

      {/* Caixa de Resultado */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-pink-500/10 to-transparent border border-indigo-500/30 text-center">
        <span className="text-xs font-semibold text-[var(--text-muted)] block">
          Nota necessária na próxima prova:
        </span>
        <div className="text-3xl font-display font-black text-indigo-400 my-1">
          {result.grade.toFixed(1)} <span className="text-xs text-[var(--text-muted)] font-normal">/ 100 pts</span>
        </div>
        <span className={`text-xs font-bold inline-flex items-center gap-1 ${result.possible ? 'text-emerald-400' : 'text-rose-400'}`}>
          <Sparkles size={14} />
          {result.message}
        </span>
      </div>
    </div>
  );
};
