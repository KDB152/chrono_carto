// Export de tous les composants d'administration
export { default as AdminDashboard } from './AdminDashboard';
export { default as DashboardOverviewTab } from './DashboardOverviewTab';
export { default as UsersManagementTab } from './UsersManagementTab';
export { default as QuizzesManagementTab } from './QuizzesManagementTab';
export { default as MessagesManagementTab } from './MessagesManagementTab';
export { default as SettingsManagementTab } from './SettingsManagementTab';
export { default as FileManagementTab } from './FileManagementTab';

// Types et interfaces partagés
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin' | 'moderator';
  avatar?: string;
  lastLogin: string;
  isActive: boolean;
  permissions: string[];
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  registrationDate: string;
  lastActivity: string;
  isActive: boolean;
  parentEmail?: string;
  avatar?: string;
  stats: {
    quizzesCompleted: number;
    averageScore: number;
    totalTimeSpent: number;
    achievements: number;
  };
}

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  children: string[];
  registrationDate: string;
  lastActivity: string;
  isActive: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: 'history' | 'geography' | 'both';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  questions: QuizQuestion[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  stats: {
    totalAttempts: number;
    averageScore: number;
    completionRate: number;
  };
  tags: string[];
  category: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching' | 'ordering';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  timeLimit?: number;
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    alt?: string;
  };
}

export interface Message {
  id: string;
  from: {
    id: string;
    name: string;
    email: string;
    type: 'student' | 'parent' | 'admin';
    avatar?: string;
  };
  to: {
    id: string;
    name: string;
    email: string;
    type: 'student' | 'parent' | 'admin';
  };
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'general' | 'academic' | 'technical' | 'administrative';
  attachments?: MessageAttachment[];
  parentMessageId?: string;
  replies?: Message[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  path: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isShared: boolean;
  permissions: {
    read: string[];
    write: string[];
    delete: string[];
  };
  tags: string[];
  description?: string;
  thumbnail?: string;
}

export interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    adminEmail: string;
    timezone: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
  };
  security: {
    enableTwoFactor: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requirePasswordChange: boolean;
    allowRegistration: boolean;
    emailVerification: boolean;
    ipWhitelist: string[];
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    newUserRegistration: boolean;
    newMessage: boolean;
    quizCompleted: boolean;
    systemAlerts: boolean;
    maintenanceMode: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl: string;
    faviconUrl: string;
    customCss: string;
    showBranding: boolean;
  };
  storage: {
    maxFileSize: number;
    allowedFileTypes: string[];
    storageProvider: 'local' | 'aws' | 'gcp' | 'azure';
    storageQuota: number;
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    retentionPeriod: number;
  };
  integrations: {
    googleAnalytics: string;
    googleMaps: string;
    emailProvider: 'smtp' | 'sendgrid' | 'mailgun';
    smsProvider: 'twilio' | 'nexmo' | 'aws';
    paymentProvider: 'stripe' | 'paypal' | 'square';
    socialLogin: {
      google: boolean;
      facebook: boolean;
      microsoft: boolean;
    };
  };
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
  quizzes: {
    total: number;
    completed: number;
    averageScore: number;
    growth: number;
  };
  messages: {
    total: number;
    unread: number;
    replied: number;
    growth: number;
  };
  engagement: {
    dailyActive: number;
    weeklyActive: number;
    monthlyActive: number;
    averageSession: number;
  };
}

export interface RecentActivity {
  id: string;
  type: 'user_registration' | 'quiz_completed' | 'message_sent' | 'login' | 'achievement';
  user: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
}

// Utilitaires et helpers
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

  if (diffInMinutes < 60) {
    return `Il y a ${Math.floor(diffInMinutes)} min`;
  } else if (diffInMinutes < 1440) {
    return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
  } else {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  }
};

export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
  return '📄';
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

export const getGradeColor = (grade: string): string => {
  const gradeMap: { [key: string]: string } = {
    '6ème': 'bg-green-500',
    '5ème': 'bg-blue-500',
    '4ème': 'bg-purple-500',
    '3ème': 'bg-orange-500',
    '2nde': 'bg-red-500',
    '1ere': 'bg-pink-500',
    'Terminale': 'bg-indigo-500'
  };
  return gradeMap[grade] || 'bg-gray-500';
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return 'text-green-500 bg-green-100';
    case 'medium': return 'text-yellow-500 bg-yellow-100';
    case 'hard': return 'text-red-500 bg-red-100';
    default: return 'text-gray-500 bg-gray-100';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent': return 'text-red-500 bg-red-100';
    case 'high': return 'text-orange-500 bg-orange-100';
    case 'normal': return 'text-blue-500 bg-blue-100';
    case 'low': return 'text-gray-500 bg-gray-100';
    default: return 'text-blue-500 bg-blue-100';
  }
};


