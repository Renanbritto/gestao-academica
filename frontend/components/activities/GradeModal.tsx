import React, { useState } from 'react';
import { X, Award, Check } from 'lucide-react';

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGrade: (grade: number) => Promise<void>;
  activityTitle: string;
  currentGrade?: number | null;
}

export const GradeModal: React.FC<GradeModalProps> = ({
  isOpen,
  onClose,
  onSaveGrade,
  activityTitle,
  currentGrade
}) => {
  const [grade, setGrade] = useState<number>(currentGrade ?? 85);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveGrade(grade);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass w-full max-w-xs p-6 rounded-3xl relative border border-card-border shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-card/40 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-emerald-500/20">
          <Award size={24} />
        </div>

        <h3 className="font-display font-bold text-base text-[var(--text-main)] mb-1">
          Lançar Nota
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-4 truncate">
          {activityTitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              required
              autoFocus
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="w-full text-center text-3xl font-display font-black py-2 rounded-2xl bg-card border border-card-border text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[11px] text-[var(--text-muted)] mt-1 block">Escala de 0 a 100 pontos</span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-card-border text-xs font-semibold text-[var(--text-muted)] hover:bg-card/50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1"
            >
              <Check size={14} />
              <span>{isSubmitting ? 'Salvando...' : 'Confirmar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
