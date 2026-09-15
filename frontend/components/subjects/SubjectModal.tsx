import React, { useState, useEffect } from 'react';
import { Subject } from '@/lib/types';
import { X, BookPlus, Save, Palette } from 'lucide-react';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; professor?: string; targetGrade: number; color: string; description?: string }) => Promise<void>;
  subjectToEdit?: Subject | null;
}

const COLOR_PRESETS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#f43f5e', // Rose
];

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subjectToEdit
}) => {
  const [name, setName] = useState('');
  const [professor, setProfessor] = useState('');
  const [targetGrade, setTargetGrade] = useState(85);
  const [color, setColor] = useState('#6366f1');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name);
      setProfessor(subjectToEdit.professor || '');
      setTargetGrade(subjectToEdit.targetGrade || 85);
      setColor(subjectToEdit.color || '#6366f1');
      setDescription(subjectToEdit.description || '');
    } else {
      setName('');
      setProfessor('');
      setTargetGrade(85);
      setColor(COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)]);
      setDescription('');
    }
  }, [subjectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        professor: professor.trim() || undefined,
        targetGrade,
        color,
        description: description.trim() || undefined
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass w-full max-w-md p-6 rounded-3xl relative border border-card-border shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-card/40 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: color }}>
            <BookPlus size={20} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-[var(--text-main)]">
              {subjectToEdit ? 'Editar Disciplina' : 'Nova Disciplina'}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Organize matérias, metas e ementas para o Gemini IA.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              Nome da Disciplina *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Direito Constitucional"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              Nome do Professor(a)
            </label>
            <input
              type="text"
              placeholder="Ex: Profa. Helena Santos"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              Meta de Pontuação (pts)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="5"
              value={targetGrade}
              onChange={(e) => setTargetGrade(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)]"
            />
          </div>

          {/* Paleta de Cores */}
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-2">
              Cor de Identificação
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[var(--bg-main)]' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              Ementa / Conteúdo Programático (Opcional - Usado pelo Bot com IA)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Direitos Fundamentais, Controle de Constitucionalidade..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-card border border-card-border text-xs font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-card-border text-xs font-semibold text-[var(--text-muted)] hover:bg-card/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
            >
              <Save size={15} />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Matéria'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
