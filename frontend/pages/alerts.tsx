import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { getSupabase } from '@/lib/supabase';
import { Activity, Subject } from '@/lib/types';
import { Bell, AlertTriangle, Clock, CheckCircle2, Calendar, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function AlertsPage() {
  const { user, isGuest } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/activities?status=Pendente');
      if (res.data) {
        setActivities(res.data);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.warn('API C# offline, calculando via Supabase/Local');
    }

    try {
      const supabase = getSupabase();
      if (user) {
        const { data: sData } = await supabase.from('subjects').select('*').eq('user_id', user.id);
        const { data: aData } = await supabase.from('activities').select('*').eq('user_id', user.id).neq('status', 'Concluído').order('due_date');
        
        const today = new Date().toISOString().split('T')[0];
        const mapped = (aData || []).map(a => {
          const s = (sData || []).find(sub => sub.id === a.subject_id);
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
        const rawActs = localStorage.getItem('academic_activities_v6');
        const rawSubs = localStorage.getItem('academic_subjects_v6');
        const subs = rawSubs ? JSON.parse(rawSubs) : [];
        const acts = rawActs ? JSON.parse(rawActs) : [];
        const pending = acts.filter((a: any) => a.status !== 'Concluído');
        setActivities(pending);
      }
    } catch (err) {
      console.warn('Erro ao carregar avisos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, isGuest]);

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-[var(--text-main)] tracking-tight">
            Central de Avisos & Prazos 🔔
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Contagem regressiva automática com semáforo de urgência para você não perder nenhuma entrega.
          </p>
        </div>

        {/* Lista de Alertas */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-[var(--text-muted)] animate-pulse">
            Calculando contagem regressiva...
          </div>
        ) : activities.length === 0 ? (
          <div className="glass p-12 text-center rounded-3xl border border-card-border space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-display font-bold text-base text-[var(--text-main)]">
              Tudo em dia! Nenhuma pendência urgente.
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              Você não possui provas ou trabalhos pendentes para os próximos dias.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {activities.map((act) => {
              const diff = act.daysUntilDue;
              
              let urgencyColor = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
              let countdownText = `Faltam ${diff} dias`;
              let badgeText = '🟢 No Prazo';

              if (diff < 0) {
                urgencyColor = 'bg-rose-500/15 border-rose-500/40 text-rose-400';
                countdownText = `Atrasado há ${Math.abs(diff)} dias`;
                badgeText = '🔴 ATRASADO';
              } else if (diff === 0) {
                urgencyColor = 'bg-rose-500/15 border-rose-500/40 text-rose-400 animate-pulse';
                countdownText = 'É HOJE!';
                badgeText = '🔴 URGENTE';
              } else if (diff === 1) {
                urgencyColor = 'bg-amber-500/15 border-amber-500/40 text-amber-400';
                countdownText = 'AMANHÃ!';
                badgeText = '🟡 ATENÇÃO';
              } else if (diff <= 3) {
                urgencyColor = 'bg-amber-500/15 border-amber-500/40 text-amber-400';
                countdownText = `Faltam ${diff} dias`;
                badgeText = '🟡 ATENÇÃO';
              }

              return (
                <div
                  key={act.id}
                  className={`glass p-4 sm:p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${urgencyColor}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: act.subjectColor || '#6366f1' }}
                      />
                      <span className="text-xs font-bold text-[var(--text-muted)]">
                        {act.subjectName || 'Geral'}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-card/60 border border-white/10">
                        {badgeText}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-base text-[var(--text-main)]">
                      {act.title}
                    </h3>

                    {act.notes && (
                      <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">
                        Conteúdo: {act.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-[var(--text-muted)] block">Prazo Final:</span>
                      <span className="font-semibold text-xs text-[var(--text-main)]">{act.dueDate}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-display font-black text-[var(--text-main)] block">
                        {countdownText}
                      </span>
                      <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                        Peso: {act.weight}% da nota
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </AppShell>
  );
}
