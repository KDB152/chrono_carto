// App Configuration
export const APP_NAME = 'Chrono-Carto';
export const APP_DESCRIPTION = 'Plateforme pédagogique Histoire-Géographie';
export const APP_VERSION = '1.0.0';

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Authentication
export const TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_DATA_KEY = 'user_data';
export const TOKEN_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  PARENT: 'parent',
  ADMIN: 'admin',
} as const;

export const USER_ROLE_LABELS = {
  [USER_ROLES.STUDENT]: 'Élève',
  [USER_ROLES.PARENT]: 'Parent',
  [USER_ROLES.ADMIN]: 'Administrateur',
} as const;

// Subjects
export const SUBJECTS = {
  HISTORY: 'history',
  GEOGRAPHY: 'geography',
  EMC: 'emc',
} as const;

export const SUBJECT_LABELS = {
  [SUBJECTS.HISTORY]: 'Histoire',
  [SUBJECTS.GEOGRAPHY]: 'Géographie',
  [SUBJECTS.EMC]: 'EMC',
} as const;

export const SUBJECT_COLORS = {
  [SUBJECTS.HISTORY]: '#3B82F6',
  [SUBJECTS.GEOGRAPHY]: '#10B981',
  [SUBJECTS.EMC]: '#F59E0B',
} as const;

// Content Types
export const CONTENT_TYPES = {
  PDF: 'pdf',
  VIDEO: 'video',
  WORKSHEET: 'worksheet',
  CORRECTION: 'correction',
  SYNTHESIS: 'synthesis',
} as const;

export const CONTENT_TYPE_LABELS = {
  [CONTENT_TYPES.PDF]: 'Document PDF',
  [CONTENT_TYPES.VIDEO]: 'Vidéo',
  [CONTENT_TYPES.WORKSHEET]: 'Fiche de travail',
  [CONTENT_TYPES.CORRECTION]: 'Correction',
  [CONTENT_TYPES.SYNTHESIS]: 'Synthèse',
} as const;

// Quiz Configuration
export const QUIZ_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer',
} as const;

export const QUIZ_TYPE_LABELS = {
  [QUIZ_TYPES.MULTIPLE_CHOICE]: 'QCM',
  [QUIZ_TYPES.TRUE_FALSE]: 'Vrai/Faux',
  [QUIZ_TYPES.SHORT_ANSWER]: 'Réponse courte',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  QUIZ_RESULT: 'quiz_result',
  NEW_CONTENT: 'new_content',
  MESSAGE: 'message',
  ANNOUNCEMENT: 'announcement',
  REMINDER: 'reminder',
} as const;

export const NOTIFICATION_TYPE_LABELS = {
  [NOTIFICATION_TYPES.QUIZ_RESULT]: 'Résultat de quiz',
  [NOTIFICATION_TYPES.NEW_CONTENT]: 'Nouveau contenu',
  [NOTIFICATION_TYPES.MESSAGE]: 'Message',
  [NOTIFICATION_TYPES.ANNOUNCEMENT]: 'Annonce',
  [NOTIFICATION_TYPES.REMINDER]: 'Rappel',
} as const;

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  VIDEOS: ['video/mp4', 'video/webm', 'video/ogg'],
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Academic Levels
export const ACADEMIC_LEVELS = {
  PREMIERE: 'Première',
  TERMINALE: 'Terminale',
} as const;

// Progress Status
export const PROGRESS_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

export const PROGRESS_STATUS_LABELS = {
  [PROGRESS_STATUS.NOT_STARTED]: 'Non commencé',
  [PROGRESS_STATUS.IN_PROGRESS]: 'En cours',
  [PROGRESS_STATUS.COMPLETED]: 'Terminé',
} as const;

export const PROGRESS_STATUS_COLORS = {
  [PROGRESS_STATUS.NOT_STARTED]: '#6B7280',
  [PROGRESS_STATUS.IN_PROGRESS]: '#F59E0B',
  [PROGRESS_STATUS.COMPLETED]: '#10B981',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  STUDENT_DASHBOARD: '/dashboard/student',
  PARENT_DASHBOARD: '/dashboard/parent',
  ADMIN_DASHBOARD: '/dashboard/admin',
  COURSES: '/courses',
  QUIZZES: '/quizzes',
  MESSAGES: '/messages',
  PROFILE: '/profile',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  RECENT_SEARCHES: 'recent_searches',
} as const;

// Theme
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Languages
export const LANGUAGES = {
  FR: 'fr',
  EN: 'en',
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  LONG: 'dd MMMM yyyy',
  WITH_TIME: 'dd/MM/yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
} as const;

// Validation
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 255,
  PHONE_PATTERN: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion au serveur',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à accéder à cette ressource',
  FORBIDDEN: 'Accès interdit',
  NOT_FOUND: 'Ressource non trouvée',
  VALIDATION_ERROR: 'Erreur de validation des données',
  SERVER_ERROR: 'Erreur interne du serveur',
} as const;


