export interface Profile {
  id: string;
  name: string;
  course: string;
  period: string;
  targetGpa: number;
  motivationNote: string;
  theme: 'dark' | 'light';
  accentColor: string;
  avatarDataUrl?: string;
  updatedAt: string;
}

export interface Subject {
  id: number;
  userId: string;
  name: string;
  professor?: string;
  targetGrade: number;
  color: string;
  description?: string;
  createdAt: string;
  totalActivities: number;
  currentAverage: number;
}

export interface Activity {
  id: number;
  userId: string;
  subjectId?: number;
  subjectName?: string;
  subjectColor?: string;
  title: string;
  type: 'Prova' | 'Trabalho' | 'Exercício' | 'Seminário';
  dueDate: string;
  weight: number;
  maxGrade: number;
  obtainedGrade?: number | null;
  status: 'Pendente' | 'Concluído' | 'Entregue' | 'Atrasado';
  notes?: string;
  createdAt: string;
  daysUntilDue: number;
}

export interface NextExam {
  activityId: number;
  title: string;
  subjectName: string;
  subjectColor: string;
  dueDate: string;
  daysRemaining: number;
  weight: number;
  notes?: string;
}

export interface SubjectSemaphore {
  subjectId: number;
  subjectName: string;
  color: string;
  currentScore: number;
  targetScore: number;
  missingForPassing: number;
  missingForTarget: number;
  status: 'success' | 'ok' | 'warning' | 'danger';
  statusMessage: string;
}

export interface DashboardData {
  generalAverage: number;
  targetGpa: number;
  passingGradeThreshold: number;
  totalSubjects: number;
  pendingActivitiesCount: number;
  completedActivitiesCount: number;
  nextExam?: NextExam | null;
  semaphoreList: SubjectSemaphore[];
  recentActivities: Activity[];
}

export interface TelegramLinkStatus {
  isLinked: boolean;
  chatId?: number;
  username?: string;
  notificationsEnabled: boolean;
  reminderHours: string;
  linkedAt?: string;
}

export interface GenerateLinkCodeResponse {
  code: string;
  expiresAt: string;
  botUsername: string;
  instructions: string;
}
