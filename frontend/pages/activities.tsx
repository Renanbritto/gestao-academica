import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ActivityModal } from '@/components/activities/ActivityModal';
import { GradeModal } from '@/components/activities/GradeModal';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { getSupabase } from '@/lib/supabase';
import { Activity, Subject } from '@/lib/types';
import { CheckSquare, Plus, Edit2, Trash2, Calendar, Award, CheckCircle2, Clock, Filter } from 'lucide-react';
import { useRouter } from 'next/router';

export default function ActivitiesPage() {
  const router = useRouter();
  const { user, isGuest } = useAuth();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);

  const [gradeModalTarget, setGradeModalTarget] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Se veio com ?action=new na query
  useEffect(() => {
    if (router.query.action === 'new') {
      setActivityToEdit(null);
      setIsModalOpen(true);
    }
  }, [router.query]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Tenta API C#
      const [actsRes, subsRes] = await Promise.all([
        api.get('/activities'),
        api.get('/subjects')
      ]);

      if (actsRes.data && subsRes.data) {
        setActivities(actsRes.data);
        setSubjects(subsRes.data);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.warn('API C# offline, buscando Supabase/Local');
    }

    // 2. Fallback Supabase
    try {
      const supabase = getSupabase();
      if (user) {
        const { data: sData } = await supabase.from('subjects').select('*').eq('user_id', user.id);
        const { data: aData } = await supabase.from('activities').select('*').eq('user_id', user.id).order('due_date');
        setSubjects(sData || []);
        
        const mapped = (aData || []).map(a => {
          const s = (sData || []).find(sub => sub.id === a.subject_id);
          const today = new Date().toISOString().split('T')[0];
          const diff = Math.ceil((new Date(a.due_date).getTime() - new Date(today).getTime()) / (1000 * 3600 * 24));
          return {
            id: a.id,
            userId: a.user_id,
            subjectId: a.subject_id,
            subjectName: s?.name || 'Geral',
            subjectColor: s?.color || '#6366f1',
            title: a.title,
            type: a.type || 'Prova',
            dueDate: a.due_date,
            weight: a.weight || 25,
            maxGrade: a.max_grade || 100,
            obtainedGrade: a.obtained_grade,
            status: a.status || 'Pendente',
            notes: a.notes,
            createdAt: a.created_at,
            daysUntilDue: diff
          };
        });
        setActivities(mapped as any);
      } else {
        const rawSubs = localStorage.getItem('academic_subjects_v6');
        const rawActs = localStorage.getItem('academic_activities_v6');
        setSubjects(rawSubs ? JSON.parse(rawSubs) : []);
        setActivities(rawActs ? JSON.parse(rawActs) : []);
      }
    } catch (err) {
      console.warn('Erro ao carregar atividades:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, isGuest]);

  const handleSaveActivity = async (data: any) => {
    try {
      if (activityToEdit) {
        await api.put(`/activities/${activityToEdit.id}`, data);
      } else {
        await api.post('/activities', data);
      }
    } catch (e) {
      // Fallback Supabase
      const supabase = getSupabase();
      if (user) {
        if (activityToEdit) {
          await supabase.from('activities').update({
            subject_id: data.subjectId,
            title: data.title,
            type: data.type,
            due_date: data.dueDate,
            weight: data.weight,
            max_grade: data.maxGrade,
            obtained_grade: data.obtainedGrade,
            status: data.status,
            notes: data.notes
          }).eq('id', activityToEdit.id);
        } else {
          await supabase.from('activities').insert({
            user_id: user.id,
            subject_id: data.subjectId,
            title: data.title,
            type: data.type,
            due_date: data.dueDate,
            weight: data.weight,
            max_grade: data.maxGrade,
            obtained_grade: data.obtainedGrade,
            status: data.status,
            notes: data.notes
          });
        }
      }
    }
    await loadData();
  };

  const handleSaveGrade = async (grade: number) => {
    if (!gradeModalTarget) return;

    try {
      await api.patch(`/activities/${gradeModalTarget.id}/grade`, { obtainedGrade: grade });
    } catch (e) {
      const supabase = getSupabase();
      if (user) {
        await supabase.from('activities').update({
          obtained_grade: grade,
          status: 'Concluído'
        }).eq('id', gradeModalTarget.id);
      }
    }
    await loadData();
  };

  const handleDeleteActivity = async (id: number) => {
    if (!confirm('Deseja excluir esta atividade?')) return;

    try {
      await api.delete(`/activities/${id}`);
    } catch (e) {
      const supabase = getSupabase();
      if (user) {
        await supabase.from('activities').delete().eq('id', id);
      }
    }
    await loadData();
  };

  // Filtros
  const filteredActivities = activities.filter(a => {
    if (selectedSubjectFilter !== 'all' && a.subjectId?.toString() !== selectedSubjectFilter) {
      return false;
    }
    if (selectedStatusFilter === 'pending' && a.status === 'Concluído') return false;
    if (selectedStatusFilter === 'completed' && a.status !== 'Concluído') return false;
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-[var(--text-main)] tracking-tight">
              Atividades & Avaliações 📝
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
              Controle provas, trabalhos, prazos e notas obtidas.
            </p>
          </div>

          <button
            onClick={() => {
              setActivityToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all sm:self-start"
          >
            <Plus size={16} />
            <span>Nova Avaliação</span>
          </button>
        </div>

        {/* Barra de Filtros Responsiva */}
        <div className="glass p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[var(--text-muted)] flex items-center gap-1 font-semibold">
              <Filter size={14} /> Filtros:
            </span>

            {/* Filtro de Status */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-card border border-card-border text-xs font-semibold focus:outline-none focus:border-indigo-500 text-[var(--text-main)]"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">⏳ Apenas Pendentes</option>
              <option value="completed">✅ Apenas Concluídos</option>
            </select>

            {/* Filtro de Matéria */}
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-card border border-card-border text-xs font-semibold focus:outline-none focus:border-indigo-500 text-[var(--text-main)] max-w-[180px] truncate"
            >
              <option value="all">Todas as Disciplinas</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id.toString()}>{s.name}</option>
              ))}
            </select>
          </div>

          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            {filteredActivities.length} {filteredActivities.length === 1 ? 'atividade' : 'atividades'}
          </span>
        </div>

        {/* Lista de Atividades (Mobile First: Cards Interativos) */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-[var(--text-muted)] animate-pulse">
            Carregando avaliações...
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="glass p-12 text-center rounded-3xl border border-card-border space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <CheckSquare size={24} />
            </div>
            <h3 className="font-display font-bold text-base text-[var(--text-main)]">
              Nenhuma atividade encontrada
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              Cadastre suas provas e trabalhos para manter o calendário e semáforo atualizados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredActivities.map((act) => {
              const isCompleted = act.status === 'Concluído';
              const hasGrade = act.obtainedGrade !== null && act.obtainedGrade !== undefined;

              return (
                <div
                  key={act.id}
                  className="glass p-4 sm:p-5 rounded-3xl border border-card-border hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: act.subjectColor || '#6366f1' }}
                        />
                        <span className="text-xs font-bold text-[var(--text-muted)] truncate">
                          {act.subjectName || 'Geral'}
                        </span>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {act.type} • {act.status}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-base text-[var(--text-main)] leading-snug">
                      {act.title}
                    </h3>

                    {act.notes && (
                      <p className="text-xs text-[var(--text-muted)] mt-1.5 line-clamp-2 bg-card/40 p-2 rounded-xl border border-card-border/60">
                        {act.notes}
                      </p>
                    )}
                  </div>

                  {/* Detalhes de Nota, Peso e Data */}
                  <div className="pt-3 border-t border-card-border flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <Calendar size={14} className="text-indigo-400" />
                      <span>{act.dueDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                        Peso: <strong>{act.weight}%</strong>
                      </span>

                      {/* Botão de Lançamento Rápido de Nota */}
                      {hasGrade ? (
                        <button
                          onClick={() => setGradeModalTarget(act)}
                          className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-display font-black text-xs hover:scale-105 transition-transform"
                          title="Clique para alterar nota"
                        >
                          {act.obtainedGrade} pts
                        </button>
                      ) : (
                        <button
                          onClick={() => setGradeModalTarget(act)}
                          className="px-2.5 py-1 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs hover:bg-indigo-600 hover:text-white transition-colors"
                        >
                          + Lançar Nota
                        </button>
                      )}

                      {/* Ações */}
                      <button
                        onClick={() => {
                          setActivityToEdit(act);
                          setIsModalOpen(true);
                        }}
                        className="p-1 text-[var(--text-muted)] hover:text-indigo-400 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(act.id)}
                        className="p-1 text-[var(--text-muted)] hover:text-rose-400 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <ActivityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveActivity}
          activityToEdit={activityToEdit}
          subjects={subjects}
        />

        <GradeModal
          isOpen={!!gradeModalTarget}
          onClose={() => setGradeModalTarget(null)}
          onSaveGrade={handleSaveGrade}
          activityTitle={gradeModalTarget?.title || ''}
          currentGrade={gradeModalTarget?.obtainedGrade}
        />

      </div>
    </AppShell>
  );
}
