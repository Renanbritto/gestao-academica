import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SemaphoreGrid } from '@/components/dashboard/SemaphoreGrid';
import { GradeChart } from '@/components/dashboard/GradeChart';
import { GoalCalculator } from '@/components/dashboard/GoalCalculator';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { getSupabase } from '@/lib/supabase';
import { DashboardData, Subject, Activity } from '@/lib/types';
import { Award, BookOpen, Clock, CalendarCheck, TrendingUp, Sparkles, Bot, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { profile, user, isGuest } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);

    // 1. Tenta carregar via API C#
    try {
      const [dashRes, subRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/subjects')
      ]);

      if (dashRes.data) {
        setDashboardData(dashRes.data);
        setSubjects(subRes.data || []);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.warn('API C# não conectada ainda, calculando via dados Supabase/Local:', e);
    }

    // 2. Fallback direto Supabase / Local
    try {
      const supabase = getSupabase();
      let subs: any[] = [];
      let acts: any[] = [];

      if (user) {
        const { data: sData } = await supabase.from('subjects').select('*').eq('user_id', user.id);
        const { data: aData } = await supabase.from('activities').select('*').eq('user_id', user.id);
        subs = sData || [];
        acts = aData || [];
      } else {
        const rawSubs = localStorage.getItem('academic_subjects_v6');
        const rawActs = localStorage.getItem('academic_activities_v6');
        subs = rawSubs ? JSON.parse(rawSubs) : [];
        acts = rawActs ? JSON.parse(rawActs) : [];
      }

      setSubjects(subs);

      const targetGpa = profile?.targetGpa || 80.0;
      const today = new Date().toISOString().split('T')[0];

      const pendingCount = acts.filter(a => a.status !== 'Concluído').length;
      const completedCount = acts.filter(a => a.status === 'Concluído').length;

      const upcomingActs = acts.filter(a => a.due_date >= today && a.status !== 'Concluído').sort((a,b) => a.due_date.localeCompare(b.due_date));
      const nextAct = upcomingActs[0];

      let nextExam = null;
      if (nextAct) {
        const d1 = new Date(nextAct.due_date);
        const d2 = new Date(today);
        const diffDays = Math.ceil((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));
        const sub = subs.find(s => s.id === nextAct.subject_id);
        nextExam = {
          activityId: nextAct.id,
          title: nextAct.title,
          subjectName: sub?.name || 'Geral',
          subjectColor: sub?.color || '#6366f1',
          dueDate: nextAct.due_date,
          daysRemaining: diffDays,
          weight: nextAct.weight || 25,
          notes: nextAct.notes
        };
      }

      const semaphoreList = subs.map(s => {
        const sActs = acts.filter(a => a.subject_id === s.id && (a.obtained_grade !== null && a.obtained_grade !== undefined));
        const score = sActs.reduce((acc, curr) => acc + (Number(curr.obtained_grade) * (Number(curr.weight) / 100)), 0);
        const subTarget = Number(s.target_grade) || targetGpa;

        let status: any = 'danger';
        let msg = `Faltam ${(70 - score).toFixed(1)} pts p/ aprovação`;

        if (score >= subTarget) {
          status = 'success';
          msg = 'Meta atingida! 🌟';
        } else if (score >= 70) {
          status = 'ok';
          msg = 'Aprovado! 🚀';
        } else if (score >= 40) {
          status = 'warning';
        }

        return {
          subjectId: s.id,
          subjectName: s.name,
          color: s.color || '#6366f1',
          currentScore: Math.round(score * 10) / 10,
          targetScore: subTarget,
          missingForPassing: Math.max(0, 70 - score),
          missingForTarget: Math.max(0, subTarget - score),
          status,
          statusMessage: msg
        };
      });

      const avg = semaphoreList.length > 0
        ? semaphoreList.reduce((acc, curr) => acc + curr.currentScore, 0) / semaphoreList.length
        : 0;

      setDashboardData({
        generalAverage: Math.round(avg * 10) / 10,
        targetGpa,
        passingGradeThreshold: 70.0,
        totalSubjects: subs.length,
        pendingActivitiesCount: pendingCount,
        completedActivitiesCount: completedCount,
        nextExam,
        semaphoreList,
        recentActivities: []
      });
    } catch (err) {
      console.warn('Erro ao calcular métricas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, isGuest]);

  return (
    <AppShell>
      <div className="space-y-6 w-full animate-fade-in">
        
        {/* Cabeçalho do Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-[var(--text-main)] tracking-tight">
              Dashboard de Rendimento 📈
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Escala de 0 a 100 pontos • Mínimo para Aprovação: <strong className="text-[var(--text-main)]">70 Pontos</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile?tab=telegram"
              className="hidden lg:inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl glass hover:border-sky-500/40 text-sky-400 text-xs font-bold transition-all hover:scale-105"
            >
              <Bot size={16} />
              <span>Telegram com Gemini IA</span>
            </Link>

            <Link
              href="/activities?action=new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={16} />
              <span>Nova Prova / Atividade</span>
            </Link>
          </div>
        </div>

        {/* Banner do Bot Telegram (Apenas no Mobile/Tablet ou sutil) */}
        <div className="lg:hidden glass p-4 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-display font-bold text-xs text-[var(--text-main)] flex items-center gap-1.5">
                <span>Conecte o IO no Telegram</span>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-bold">Com Gemini IA</span>
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Receba lembretes automáticos e tire dúvidas de matérias.
              </p>
            </div>
          </div>

          <Link
            href="/profile?tab=telegram"
            className="px-3.5 py-1.5 rounded-xl bg-card border border-card-border hover:border-indigo-500 text-xs font-bold text-[var(--text-main)] transition-colors flex-shrink-0 self-end sm:self-center"
          >
            Vincular
          </Link>
        </div>

        {/* Grid de 4 Métricas Principais (Widescreen Fluid: 1 col → sm: 2 cols → xl: 4 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          <MetricCard
            title="Média Geral (CR)"
            value={`${dashboardData?.generalAverage.toFixed(1) || '0.0'} pts`}
            subtitle={`Meta: ${dashboardData?.targetGpa || 80} pts • Mínimo: 70 pts`}
            icon={Award}
            color="success"
          />

          <MetricCard
            title="Disciplinas Ativas"
            value={dashboardData?.totalSubjects || 0}
            subtitle="Matérias matriculadas"
            icon={BookOpen}
            color="primary"
          />

          <MetricCard
            title="Atividades Pendentes"
            value={dashboardData?.pendingActivitiesCount || 0}
            subtitle="Provas e trabalhos"
            icon={Clock}
            color="warning"
          />

          <MetricCard
            title="Próximo Compromisso"
            value={
              dashboardData?.nextExam
                ? dashboardData.nextExam.daysRemaining === 0
                  ? 'HOJE!'
                  : `Em ${dashboardData.nextExam.daysRemaining}d`
                : '-'
            }
            subtitle={dashboardData?.nextExam?.title || 'Nenhum próximo'}
            icon={CalendarCheck}
            color="pink"
          />
        </div>

        {/* Semáforo de Rendimento por Matéria */}
        <div className="glass p-5 sm:p-7 rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-2 border-b border-[var(--glass-border)]">
            <div>
              <h3 className="text-base sm:text-lg font-display font-bold text-[var(--text-main)] flex items-center gap-2">
                <span>🚦 Semáforo de Rendimento & Pontos Faltantes</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Acompanhamento para os <strong>70 pontos de aprovação</strong> e a meta pessoal.
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 self-start sm:self-center">
              Mínimo para passar: 70 pts
            </span>
          </div>

          <SemaphoreGrid
            semaphores={dashboardData?.semaphoreList || []}
            passingGrade={dashboardData?.passingGradeThreshold || 70}
          />
        </div>

        {/* Gráfico de Pontuação & Calculadora de Meta */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          
          {/* Gráfico de Barras */}
          <div className="glass p-5 sm:p-7 rounded-3xl space-y-4">
            <div className="pb-2 border-b border-[var(--glass-border)]">
              <h3 className="text-base font-display font-bold text-[var(--text-main)] flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-400" />
                <span>Pontuação Atual por Disciplina</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Progresso acumulado nas avaliações já realizadas.
              </p>
            </div>

            <GradeChart semaphores={dashboardData?.semaphoreList || []} />
          </div>

          {/* Calculadora de Meta */}
          <div className="glass p-5 sm:p-7 rounded-3xl space-y-4">
            <div className="pb-2 border-b border-[var(--glass-border)]">
              <h3 className="text-base font-display font-bold text-[var(--text-main)] flex items-center gap-2">
                <Sparkles size={18} className="text-pink-400" />
                <span>Calculadora de Meta Inteligente</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Descubra quanto precisa tirar na próxima avaliação.
              </p>
            </div>

            <GoalCalculator subjects={subjects} />
          </div>

        </div>

      </div>
    </AppShell>
  );
}
