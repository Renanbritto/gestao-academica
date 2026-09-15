import React, { useState, useEffect } from 'react';
import { Activity, Subject } from '@/lib/types';
import { X, CalendarPlus, Save } from 'lucide-react';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    subjectId?: number;
    title: string;
    type: Activity['type'];
    dueDate: string;
    weight: number;
    maxGrade: number;
    obtainedGrade?: number | null;
    status: Activity['status'];
    notes?: string;
  }) => Promise<void>;
  activityToEdit?: Activity | null;
  subjects: Subject[];
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  activityToEdit,
  subjects
}) => {
  const [subjectId, setSubjectId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Activity['type']>('Prova');
  const [dueDate, setDueDate] = useState('');
  const [weight, setWeight] = useState(25);
  const [obtainedGrade, setObtainedGrade] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activityToEdit) {
      setSubjectId(activityToEdit.subjectId?.toString() || '');
      setTitle(activityToEdit.title);
      setType(activityToEdit.type || 'Prova');
      setDueDate(activityToEdit.dueDate);
      setWeight(activityToEdit.weight || 25);
      setObtainedGrade(activityToEdit.obtainedGrade !== null && activityToEdit.obtainedGrade !== undefined ? activityToEdit.obtainedGrade.toString() : '');
      setNotes(activityToEdit.notes || '');
    } else {
      setSubjectId(subjects[0]?.id?.toString() || '');
      setTitle('');
      setType('Prova');
      const in3Days = new Date();
      in3Days.setDate(in3Days.getDate() + 3);
      setDueDate(in3Days.toISOString().split('T')[0]);
      setWeight(25);
      setObtainedGrade('');
      setNotes('');
    }
  }, [activityToEdit, isOpen, subjects]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    setIsSubmitting(true);
    try {
      const gradeNum = obtainedGrade !== '' ? Number(obtainedGrade) : null;
      await onSave({
        subjectId: subjectId ? Number(subjectId) : undefined,
        title: title.trim(),
        type,
        dueDate,
        weight,
        maxGrade: 100,
        obtainedGrade: gradeNum,
        status: gradeNum !== null ? 'Concluído' : 'Pendente',
        notes: notes.trim() || undefined
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass w-full max-w-md p-6 rounded-3xl relative border border-card-border shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-card/40 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center text-white">
            <CalendarPlus size={20} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-[var(--text-main)]">
              {activityToEdit ? 'Editar Atividade' : 'Nova Avaliação ou Prova'}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Controle prazos, pesos e notas com precisão.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              Disciplina Vinculada *
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)]"
            >
              <option value="">Selecione a matéria</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              Título da Avaliação *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Prova 1 - Teoria Geral"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)]"
              >
                <option value="Prova">Prova</option>
                <option value="Trabalho">Trabalho</option>
                <option value="Exercício">Exercício</option>
                <option value="Seminário">Seminário</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                Data de Entrega / Prova *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)]"
              >
              </input>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                Peso na Média (%)
              </label>
              <input
                type="number"
                min="5"
                max="100"
                step="5"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                Nota Obtida (0 a 100 pts)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                placeholder="Pendente"
                value={obtainedGrade}
                onChange={(e) => setObtainedGrade(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-card border border-card-border text-sm font-medium focus:outline-none focus:border-indigo-500 text-[var(--text-main)]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              Observações / Conteúdo de Estudo
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Capítulos 1 a 4 do livro, jurisprudência do STJ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
            >
              <Save size={15} />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Atividade'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
