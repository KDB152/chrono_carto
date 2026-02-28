import CalendarTab from './CalendarTab';
import DashboardHomeTab from './DashboardHomeTab';
import MessagesTab from './MessagesTab';
import StudentDashboard from './page';
import ProfileTab from './ProfileTab';
import ProgressTab from './ProgressTab';
import QuizListTab from './QuizListTab';
import QuizTakeTab from './QuizTakeTab';
import ResourcesTab from './ResourcesTab';
import ResultsTab from './ResultsTab';

// Student Dashboard Components
export { default as StudentDashboard } from './page';
export { default as DashboardHomeTab } from './DashboardHomeTab';
export { default as QuizListTab } from './QuizListTab';
export { default as QuizTakeTab } from './QuizTakeTab';
export { default as ResultsTab } from './ResultsTab';
export { default as ProgressTab } from './ProgressTab';
export { default as MessagesTab } from './MessagesTab';
export { default as ProfileTab } from './ProfileTab';
export { default as CalendarTab } from './CalendarTab';
export { default as ResourcesTab } from './ResourcesTab';

// Types et interfaces
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  class: string;
  level: string;
  school: string;
  teacher: string;
  stats: {
    averageScore: number;
    totalQuizzes: number;
    completedQuizzes: number;
    currentStreak: number;
    totalXP: number;
    badges: number;
    rank: number;
  };
  recentActivity: {
    lastQuiz: string;
    lastScore: number;
    lastActive: string;
  };
  parents: {
    id: string;
    name: string;
  }[];
}

export interface Quiz {
  id: string;
  title: string;
  subject: 'history' | 'geography' | 'both';
  difficulty: 'easy' | 'medium' | 'hard';
  questionsCount: number;
  timeLimit: number; // minutes
  averageScore: number;
  attempts: number;
  status: 'available' | 'completed' | 'in-progress';
  dueDate?: string;
  tags: string[];
  description: string;
  prerequisites: string[];
  xpReward: number;
  isStarred: boolean;
}

export interface Question {
  id: string;
  type: 'mcq' | 'true_false' | 'short_answer' | 'essay' | 'matching' | 'ordering';
  text: string;
  options?: { id: string; text: string; isCorrect?: boolean }[];
  correctAnswer?: string | string[];
  explanation?: string;
  media?: { type: 'image' | 'video' | 'audio'; url: string; caption?: string }[];
}

export interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  subject: 'history' | 'geography' | 'both';
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
  timeSpent: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  questionsTotal: number;
  questionsCorrect: number;
  questionsIncorrect: number;
  rank: number;
  classAverage: number;
  teacherComment?: string;
  strengths: string[];
  weaknesses: string[];
  badges: string[];
  xpEarned: number;
  attempts: number;
  isImprovement: boolean;
  previousScore?: number;
}

export interface ProgressData {
  subject: 'history' | 'geography' | 'both';
  period: string;
  scores: number[];
  dates: string[];
  averageScore: number;
  improvement: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface SubjectProgress {
  subject: string;
  currentLevel: number;
  maxLevel: number;
  progress: number;
  recentScores: number[];
  trend: 'up' | 'down' | 'stable';
  nextMilestone: string;
}

export interface Message {
  id: string;
  from: {
    id: string;
    name: string;
    role: 'student' | 'teacher' | 'parent' | 'admin';
    avatar?: string;
  };
  to: {
    id: string;
    name: string;
    role: 'student' | 'teacher' | 'parent' | 'admin';
    avatar?: string;
  };
  subject: string;
  content: string;
  type: 'message' | 'notification' | 'announcement' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'replied' | 'archived';
  sentAt: string;
  readAt?: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  parentMessageId?: string;
  isStarred: boolean;
  tags: string[];
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }[];
  lastMessage: Message;
  unreadCount: number;
  isArchived: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'badge' | 'trophy' | 'certificate';
  xpReward: number;
  criteria: string;
  unlockedAt: string;
  isUnlocked: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: 'quiz' | 'exam' | 'meeting' | 'class' | 'event' | 'deadline' | 'reminder' | 'holiday';
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  teacherId?: string;
  teacherName?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  reminders: {
    time: number; // minutes avant
    method: 'notification' | 'email' | 'sms';
  }[];
  attendees?: {
    id: string;
    name: string;
    role: string;
    status: 'pending' | 'accepted' | 'declined';
  }[];
  color?: string;
  isAllDay: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'audio' | 'link';
  url: string;
  subject: 'history' | 'geography' | 'both';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  teacherName: string;
  uploadDate: string;
  thumbnail?: string;
  duration?: number; // for video/audio in minutes
  fileSize?: number; // for documents in bytes
  views: number;
  downloads: number;
  rating: number; // 1-5
}

// Fonctions utilitaires
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const formatTime = (timeString: string): string => {
  return timeString;
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} min`;
  } else if (diffInMinutes < 1440) {
    return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
  } else {
    return `Il y a ${Math.floor(diffInMinutes / 1440)} j`;
  }
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-400';
  if (score >= 70) return 'text-blue-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-red-400';
};

export const getScoreGradient = (score: number): string => {
  if (score >= 90) return 'from-green-500 to-emerald-600';
  if (score >= 70) return 'from-blue-500 to-indigo-600';
  if (score >= 50) return 'from-yellow-500 to-orange-600';
  return 'from-red-500 to-pink-600';
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent': return 'text-red-400 bg-red-500/20';
    case 'high': return 'text-orange-400 bg-orange-500/20';
    case 'medium': return 'text-blue-400 bg-blue-500/20';
    case 'low': return 'text-gray-400 bg-gray-500/20';
    default: return 'text-blue-400 bg-blue-500/20';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed': return 'text-green-400 bg-green-500/20';
    case 'cancelled': return 'text-red-400 bg-red-500/20';
    case 'completed': return 'text-blue-400 bg-blue-500/20';
    case 'scheduled': return 'text-yellow-400 bg-yellow-500/20';
    default: return 'text-gray-400 bg-gray-500/20';
  }
};

export const getTrendColor = (trend: string): string => {
  switch (trend) {
    case 'up': return 'text-green-400';
    case 'down': return 'text-red-400';
    default: return 'text-blue-400';
  }
};

export const getRankColor = (rank: number): string => {
  if (rank === 1) return 'text-yellow-400';
  if (rank <= 3) return 'text-blue-400';
  if (rank <= 5) return 'text-green-400';
  return 'text-gray-400';
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return 'text-green-400 bg-green-500/20';
    case 'medium': return 'text-yellow-400 bg-yellow-500/20';
    case 'hard': return 'text-red-400 bg-red-500/20';
    default: return 'text-gray-400 bg-gray-500/20';
  }
};

// Fonctions de validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[\S+@\S+\.\S+]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Constantes
export const SUBJECTS = {
  history: 'Histoire',
  geography: 'Géographie',
  both: 'Histoire-Géographie'
} as const;

export const PRIORITIES = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Élevée',
  urgent: 'Urgente'
} as const;

export const EVENT_TYPES = {
  quiz: 'Quiz',
  exam: 'Examen',
  meeting: 'Réunion',
  class: 'Cours',
  event: 'Événement',
  deadline: 'Échéance',
  reminder: 'Rappel',
  holiday: 'Vacances'
} as const;

export const MESSAGE_TYPES = {
  message: 'Message',
  notification: 'Notification',
  announcement: 'Annonce',
  reminder: 'Rappel'
} as const;

export const USER_ROLES = {
  parent: 'Parent',
  teacher: 'Professeur',
  admin: 'Administration',
  student: 'Élève'
} as const;

// Données de démonstration
export const DEMO_STUDENT: Student = {
  id: 'student-1',
  firstName: 'Étudiant',
  lastName: 'Exemple',
  avatar: '/avatars/student-default.jpg',
  class: '4ème A',
  level: 'Collège',
  school: 'École',
  teacher: 'Mme Martin',
  stats: {
    averageScore: 87,
    totalQuizzes: 24,
    completedQuizzes: 22,
    currentStreak: 5,
    totalXP: 2850,
    badges: 12,
    rank: 3
  },
  recentActivity: {
    lastQuiz: 'La Révolution française',
    lastScore: 92,
    lastActive: '2025-12-20T16:30:00'
  },
  parents: [
    { id: 'parent-1', name: 'Parent 1' },
    { id: 'parent-2', name: 'Parent 2' }
  ]
};

export default {
  StudentDashboard,
  DashboardHomeTab,
  QuizListTab,
  QuizTakeTab,
  ResultsTab,
  ProgressTab,
  MessagesTab,
  ProfileTab,
  CalendarTab,
  ResourcesTab
};



