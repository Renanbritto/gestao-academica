import { Profile, Subject, Activity } from './types';

export const DEFAULT_PROFILE: Profile = {
  id: 'guest-user-local',
  name: 'Monalysa Delvivo Rocha',
  course: 'Direito',
  period: '7º Período',
  targetGpa: 85.0,
  motivationNote: 'Bem-vinda ao seu painel da facul, bora arrasar! ❤️',
  theme: 'dark',
  accentColor: '#6366f1',
  updatedAt: new Date().toISOString()
};

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 1,
    userId: 'guest-user-local',
    name: 'Direito Internacional Público',
    professor: 'Prof. Marcus Vinícius',
    targetGrade: 85.0,
    color: '#6366f1',
    description: 'Tratados internacionais, soberania e direitos humanos.',
    createdAt: new Date().toISOString(),
    totalActivities: 1,
    currentAverage: 0
  },
  {
    id: 2,
    userId: 'guest-user-local',
    name: 'Direito Civil VII',
    professor: 'Profa. Helena Santos',
    targetGrade: 80.0,
    color: '#10b981',
    description: 'Direito das Sucessões e inventários.',
    createdAt: new Date().toISOString(),
    totalActivities: 1,
    currentAverage: 95
  },
  {
    id: 3,
    userId: 'guest-user-local',
    name: 'Prática Jurídica Trabalhista',
    professor: 'Prof. André Luiz',
    targetGrade: 90.0,
    color: '#ec4899',
    description: 'Peças processuais e petição inicial simulada.',
    createdAt: new Date().toISOString(),
    totalActivities: 1,
    currentAverage: 0
  },
  {
    id: 4,
    userId: 'guest-user-local',
    name: 'Prática Jurídica Cível II',
    professor: 'Profa. Camila Oliveira',
    targetGrade: 85.0,
    color: '#8b5cf6',
    description: 'Contestação e recursos nos tribunais.',
    createdAt: new Date().toISOString(),
    totalActivities: 1,
    currentAverage: 0
  },
  {
    id: 5,
    userId: 'guest-user-local',
    name: 'Projeto Integrador',
    professor: 'Prof. Fernando Rocha',
    targetGrade: 90.0,
    color: '#f59e0b',
    description: 'Pesquisa científica e TCC.',
    createdAt: new Date().toISOString(),
    totalActivities: 1,
    currentAverage: 90
  }
];

export function getDefaultActivities(): Activity[] {
  const getFormattedDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 101,
      userId: 'guest-user-local',
      subjectId: 1,
      subjectName: 'Direito Internacional Público',
      subjectColor: '#6366f1',
      title: 'Prova 1 (Tratados Internacionais)',
      type: 'Prova',
      dueDate: getFormattedDate(3),
      weight: 40,
      maxGrade: 100,
      obtainedGrade: null,
      status: 'Pendente',
      notes: 'Conteúdo: Fontes do Direito Internacional, Tratados e Convenções.',
      createdAt: new Date().toISOString(),
      daysUntilDue: 3
    },
    {
      id: 102,
      userId: 'guest-user-local',
      subjectId: 2,
      subjectName: 'Direito Civil VII',
      subjectColor: '#10b981',
      title: 'Estudo de Caso - Direito Sucessório',
      type: 'Trabalho',
      dueDate: getFormattedDate(-3),
      weight: 30,
      maxGrade: 100,
      obtainedGrade: 95.0,
      status: 'Concluído',
      notes: 'Análise jurisprudencial do STJ.',
      createdAt: new Date().toISOString(),
      daysUntilDue: -3
    },
    {
      id: 103,
      userId: 'guest-user-local',
      subjectId: 3,
      subjectName: 'Prática Jurídica Trabalhista',
      subjectColor: '#ec4899',
      title: 'Redação de Reclamação Trabalhista',
      type: 'Trabalho',
      dueDate: getFormattedDate(7),
      weight: 30,
      maxGrade: 100,
      obtainedGrade: null,
      status: 'Pendente',
      notes: 'Peça prática simulada de petição inicial.',
      createdAt: new Date().toISOString(),
      daysUntilDue: 7
    },
    {
      id: 104,
      userId: 'guest-user-local',
      subjectId: 4,
      subjectName: 'Prática Jurídica Cível II',
      subjectColor: '#8b5cf6',
      title: 'Peça Prática - Contestação Cível',
      type: 'Trabalho',
      dueDate: getFormattedDate(10),
      weight: 25,
      maxGrade: 100,
      obtainedGrade: null,
      status: 'Pendente',
      notes: 'Simulação de audiência de conciliação e contestação.',
      createdAt: new Date().toISOString(),
      daysUntilDue: 10
    },
    {
      id: 105,
      userId: 'guest-user-local',
      subjectId: 5,
      subjectName: 'Projeto Integrador',
      subjectColor: '#f59e0b',
      title: 'Entrega da 1ª Etapa do Projeto',
      type: 'Exercício',
      dueDate: getFormattedDate(-2),
      weight: 20,
      maxGrade: 100,
      obtainedGrade: 90.0,
      status: 'Concluído',
      notes: 'Tema e estrutura metodológica.',
      createdAt: new Date().toISOString(),
      daysUntilDue: -2
    }
  ];
}

export function seedGuestDataIfEmpty() {
  if (typeof window === 'undefined') return;

  const rawSubs = localStorage.getItem('academic_subjects_v6');
  if (!rawSubs || rawSubs === '[]') {
    localStorage.setItem('academic_subjects_v6', JSON.stringify(DEFAULT_SUBJECTS));
  }

  const rawActs = localStorage.getItem('academic_activities_v6');
  if (!rawActs || rawActs === '[]') {
    localStorage.setItem('academic_activities_v6', JSON.stringify(getDefaultActivities()));
  }
}
