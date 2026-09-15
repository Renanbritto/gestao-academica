import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SubjectModal } from '@/components/subjects/SubjectModal';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { getSupabase } from '@/lib/supabase';
import { Subject } from '@/lib/types';
import { BookOpen, Plus, Edit2, Trash2, User, Award, CheckCircle2 } from 'lucide-react';

export default function SubjectsPage() {
  const { user, isGuest } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      // 1. Tenta API C#
      const res = await api.get('/subjects');
      if (res.data) {
        setSubjects(res.data);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.warn('API C# offline, fallback Supabase/Local');
    }

    // 2. Fallback Supabase
    try {
      const supabase = getSupabase();
      if (user) {
        const { data } = await supabase.from('subjects').select('*').eq('user_id', user.id);
        setSubjects(data || []);
      } else {
        const raw = localStorage.getItem('academic_subjects_v6');
        setSubjects(raw ? JSON.parse(raw) : []);
      }
    } catch (err) {
      console.warn('Erro ao carregar matérias:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [user, isGuest]);

  const handleSave = async (data: { name: string; professor?: string; targetGrade: number; color: string; description?: string }) => {
    try {
      if (subjectToEdit) {
        await api.put(`/subjects/${subjectToEdit.id}`, data);
      } else {
        await api.post('/subjects', data);
      }
    } catch (e) {
      // Fallback Supabase direto
      const supabase = getSupabase();
      if (user) {
        if (subjectToEdit) {
          await supabase.from('subjects').update({
            name: data.name,
            professor: data.professor,
            target_grade: data.targetGrade,
            color: data.color,
            description: data.description
          }).eq('id', subjectToEdit.id);
        } else {
          await supabase.from('subjects').insert({
            user_id: user.id,
            name: data.name,
            professor: data.professor,
            target_grade: data.targetGrade,
            color: data.color,
            description: data.description
          });
        }
      }
    }
    await fetchSubjects();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir esta matéria e todas as atividades vinculadas a ela?')) return;

    try {
      await api.delete(`/subjects/${id}`);
    } catch (e) {
      const supabase = getSupabase();
      if (user) {
        await supabase.from('subjects').delete().eq('id', id);
      }
    }
    await fetchSubjects();
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-[var(--text-main)] tracking-tight">
              Minhas Disciplinas 📚
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
              Cadastre suas matérias, professores e ementas acadêmicas.
            </p>
          </div>

          <button
            onClick={() => {
              setSubjectToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all sm:self-start"
          >
            <Plus size={16} />
            <span>Adicionar Matéria</span>
          </button>
        </div>

        {/* Lista de Matérias (Grid Mobile First: 1 col → sm: 2 cols → lg: 3 cols) */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-[var(--text-muted)] animate-pulse">
            Carregando matérias...
          </div>
        ) : subjects.length === 0 ? (
          <div className="glass p-12 text-center rounded-3xl border border-card-border space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <BookOpen size={24} />
            </div>
            <h3 className="font-display font-bold text-base text-[var(--text-main)]">
              Nenhuma disciplina cadastrada
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              Comece adicionando suas matérias do semestre para acompanhar notas e prazos.
            </p>
            <button
              onClick={() => {
                setSubjectToEdit(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
            >
              <Plus size={15} />
              <span>Cadastrar Primeira Matéria</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="glass p-5 rounded-3xl border border-card-border hover:border-indigo-500/30 transition-all flex flex-col justify-between group space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-4 h-4 rounded-xl flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: sub.color || '#6366f1' }}
                      />
                      <h3 className="font-display font-bold text-base text-[var(--text-main)] leading-snug">
                        {sub.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setSubjectToEdit(sub);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-indigo-400 hover:bg-card transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-card transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {sub.professor && (
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-2">
                      <User size={13} className="text-indigo-400" />
                      <span>{sub.professor}</span>
                    </div>
                  )}

                  {sub.description && (
                    <p className="text-[11px] text-[var(--text-muted)] bg-card/40 p-2.5 rounded-xl border border-card-border/60 line-clamp-2">
                      {sub.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-card-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[var(--text-muted)]">
                    <Award size={13} className="text-amber-400" />
                    <span>Meta: <strong>{sub.targetGrade || 80} pts</strong></span>
                  </div>

                  <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    {sub.totalActivities || 0} atividades
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <SubjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          subjectToEdit={subjectToEdit}
        />

      </div>
    </AppShell>
  );
}
