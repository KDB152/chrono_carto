// API service for connecting to backend endpoints
import { ERROR_MESSAGES } from './errorMessages';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Generic API request function
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // Si la réponse n'est pas du JSON, utiliser le texte
        const text = await response.text().catch(() => '');
        errorData = { message: text || ERROR_MESSAGES.AUTH.SERVER_ERROR };
      }
      
      // Gestion spéciale pour les erreurs 401 (token expiré/invalide)
      if (response.status === 401) {
        // Nettoyer le localStorage et rediriger vers la page de connexion
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userDetails');
        
        // Rediriger vers la page de connexion si on est dans le navigateur
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        throw new Error(ERROR_MESSAGES.AUTH.SESSION_EXPIRED);
      }
      
      // Extraire le message d'erreur (NestJS retourne { message: "...", statusCode: 404, error: "..." })
      const errorMessage = errorData.message || errorData.error || ERROR_MESSAGES.AUTH.SERVER_ERROR;
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData: any) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  verifyEmail: (token: string) =>
    apiRequest(`/auth/verify-email?token=${token}`, {
      method: 'GET',
    }),

  forgotPassword: (email: string) =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),

  changePassword: (currentPassword: string, newPassword: string, userId: number) =>
    apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword, userId }),
    }),

  changeEmail: (newEmail: string, userId: number) =>
    apiRequest('/auth/change-email', {
      method: 'POST',
      body: JSON.stringify({ newEmail, userId }),
    }),
};

// Admin API
export const adminAPI = {
  // Students management
  getStudents: (params?: { page?: number; limit?: number }) =>
    apiRequest(`/admin/students?${new URLSearchParams(params as any)}`),

  createStudent: (studentData: any) =>
    apiRequest('/admin/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    }),

  updateStudent: (id: number, studentData: any) =>
    apiRequest(`/admin/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(studentData),
    }),

  deleteStudent: (id: number) =>
    apiRequest(`/admin/students/${id}`, {
      method: 'DELETE',
    }),

  // Parents management
  getParents: (params?: { page?: number; limit?: number }) =>
    apiRequest(`/admin/parents?${new URLSearchParams(params as any)}`),

  createParent: (parentData: any) =>
    apiRequest('/admin/parents', {
      method: 'POST',
      body: JSON.stringify(parentData),
    }),

  updateParent: (id: number, parentData: any) =>
    apiRequest(`/admin/parents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(parentData),
    }),

  deleteParent: (id: number) =>
    apiRequest(`/admin/parents/${id}`, {
      method: 'DELETE',
    }),

  // User approval
  approveUser: async (id: number, approve: boolean) => {
    try {
      // Essayer d'abord le backend avec authentification
      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://www.chronocarto.tn/api'}/admin/users/${id}/approve`;
      const token = localStorage.getItem('token');
      
      const response = await fetch(backendUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ approve }),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Backend error: ${response.status}`);
      }
    } catch (error) {
      console.log('⚠️ Backend non accessible, utilisation du fallback frontend');
      // Fallback vers l'endpoint frontend
      return apiRequest(`/api/admin/users/approve?userId=${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ approve }),
      });
    }
  },

  // Get user by ID
  getUser: (id: number) => apiRequest(`/users/${id}`),
};

// Quizzes API
export const quizzesAPI = {
  getQuizzes: (params?: {
    page?: number;
    limit?: number;
    subject?: string;
    level?: string;
    status?: string;
  }) => apiRequest(`/quizzes?${new URLSearchParams(params as any)}`),

  getQuiz: (id: number) => apiRequest(`/quizzes/${id}`),

  getQuizWithQuestions: (id: number) => apiRequest(`/quizzes/${id}/with-questions`),

  createQuiz: (quizData: any) =>
    apiRequest('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    }),

  updateQuiz: (id: number, quizData: any) =>
    apiRequest(`/quizzes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(quizData),
    }),

  deleteQuiz: (id: number) =>
    apiRequest(`/quizzes/${id}`, {
      method: 'DELETE',
    }),

  getQuizAttempts: (id: number) => apiRequest(`/quizzes/${id}/attempts`),

  submitQuizAttempt: (attemptData: any) =>
    apiRequest('/quizzes/attempts', {
      method: 'POST',
      body: JSON.stringify(attemptData),
    }),

  // Question management
  getQuestions: (quizId: number) => apiRequest(`/quizzes/${quizId}/questions`),

  getQuestion: (questionId: number) => apiRequest(`/quizzes/questions/${questionId}`),

  createQuestion: (questionData: any) =>
    apiRequest('/quizzes/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    }),

  updateQuestion: (questionId: number, questionData: any) =>
    apiRequest(`/quizzes/questions/${questionId}`, {
      method: 'PATCH',
      body: JSON.stringify(questionData),
    }),

  deleteQuestion: (questionId: number) =>
    apiRequest(`/quizzes/questions/${questionId}`, {
      method: 'DELETE',
    }),
};

// Messaging API
// Removed duplicate declaration of messagingAPI

// Files API
export const filesAPI = {
  getFiles: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
  }) => apiRequest(`/files?${new URLSearchParams(params as any)}`),

  getFile: (id: number) => apiRequest(`/files/${id}`),

  uploadFile: (file: File, metadata: any) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });

    return apiRequest('/files/upload', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  },

  updateFile: (id: number, updateData: any) =>
    apiRequest(`/files/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    }),

  deleteFile: (id: number) =>
    apiRequest(`/files/${id}`, {
      method: 'DELETE',
    }),

  getCategories: () => apiRequest('/files/categories'),

  getFileTypes: () => apiRequest('/files/types'),

  bulkDelete: (ids: number[]) =>
    apiRequest('/files/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  bulkMove: (ids: number[], category: string) =>
    apiRequest('/files/bulk-move', {
      method: 'POST',
      body: JSON.stringify({ ids, category }),
    }),

  searchFiles: (query: string) => apiRequest(`/files/search?query=${query}`),

  getFileStats: () => apiRequest('/files/stats'),

  downloadFile: (id: number) =>
    apiRequest(`/files/download/${id}`, {
      method: 'POST',
    }),

  shareFile: (id: number, users: number[]) =>
    apiRequest(`/files/share/${id}`, {
      method: 'POST',
      body: JSON.stringify({ users }),
    }),
};

// Users API
export const usersAPI = {
  getUsers: (params?: { page?: number; limit?: number; role?: string }) =>
    apiRequest(`/users?${new URLSearchParams(params as any)}`),

  getUser: (id: number) => apiRequest(`/users/${id}`),

  updateUser: (id: number, userData: any) =>
    apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  deleteUser: (id: number) =>
    apiRequest(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// Students API
export const studentsAPI = {
  getStudents: (params?: { page?: number; limit?: number }) =>
    apiRequest(`/students?${new URLSearchParams(params as any)}`),

  getStudent: (id: number) => apiRequest(`/students/${id}`),

  updateStudent: (id: number, studentData: any) =>
    apiRequest(`/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(studentData),
    }),

  deleteStudent: (id: number) =>
    apiRequest(`/students/${id}`, {
      method: 'DELETE',
    }),
};

// Parents API
export const parentsAPI = {
  getParents: (params?: { page?: number; limit?: number }) =>
    apiRequest(`/parents?${new URLSearchParams(params as any)}`),

  getParent: (id: number) => apiRequest(`/parents/${id}`),

  getParentByUserId: (userId: number) => apiRequest(`/parents/by-user/${userId}`),

  updateParent: (id: number, parentData: any) =>
    apiRequest(`/parents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(parentData),
    }),

  deleteParent: (id: number) =>
    apiRequest(`/parents/${id}`, {
      method: 'DELETE',
    }),
};

// Progress API
export const progressAPI = {
  getProgress: (studentId: number) => apiRequest(`/progress/student/${studentId}`),

  updateProgress: (studentId: number, progressData: any) =>
    apiRequest(`/progress/student/${studentId}`, {
      method: 'PATCH',
      body: JSON.stringify(progressData),
    }),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (userId: number) => apiRequest(`/notifications/user/${userId}`),

  markAsRead: (id: number) =>
    apiRequest(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  deleteNotification: (id: number) =>
    apiRequest(`/notifications/${id}`, {
      method: 'DELETE',
    }),
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: () => apiRequest('/analytics/dashboard'),

  getUserStats: (userId: number) => apiRequest(`/analytics/user/${userId}`),

  getQuizStats: (quizId?: number) =>
    apiRequest(`/analytics/quizzes${quizId ? `/${quizId}` : ''}`),

  getProgressStats: (timeframe: string) =>
    apiRequest(`/analytics/progress?timeframe=${timeframe}`),
};

// Settings API
export const settingsAPI = {
  // System Settings
  getSystemSettings: () => apiRequest('/settings/system'),
  
  getSystemSettingsAsObject: () => apiRequest('/settings/system/object'),
  
  getSystemSetting: (key: string) => apiRequest(`/settings/system/${key}`),
  
  getSystemSettingsByCategory: (category: string) => 
    apiRequest(`/settings/system/category/${category}`),
  
  setSystemSetting: (settingData: any) =>
    apiRequest('/settings/system', {
      method: 'POST',
      body: JSON.stringify(settingData),
    }),
  
  updateSystemSetting: (key: string, settingData: any) =>
    apiRequest(`/settings/system/${key}`, {
      method: 'PATCH',
      body: JSON.stringify(settingData),
    }),
  
  bulkUpdateSystemSettings: (settings: any[]) =>
    apiRequest('/settings/system/bulk', {
      method: 'POST',
      body: JSON.stringify({ settings }),
    }),
  
  deleteSystemSetting: (key: string) =>
    apiRequest(`/settings/system/${key}`, {
      method: 'DELETE',
    }),
  
  initializeSystemSettings: () =>
    apiRequest('/settings/system/initialize', {
      method: 'POST',
    }),

  // User Preferences
  getUserPreferences: (userId: number) => apiRequest(`/settings/user/${userId}`),
  
  getUserPreferencesAsObject: (userId: number) => 
    apiRequest(`/settings/user/${userId}/object`),
  
  getUserPreference: (userId: number, key: string) => 
    apiRequest(`/settings/user/${userId}/${key}`),
  
  getUserPreferencesByCategory: (userId: number, category: string) => 
    apiRequest(`/settings/user/${userId}/category/${category}`),
  
  setUserPreference: (userId: number, preferenceData: any) =>
    apiRequest(`/settings/user/${userId}`, {
      method: 'POST',
      body: JSON.stringify(preferenceData),
    }),
  
  updateUserPreference: (userId: number, key: string, preferenceData: any) =>
    apiRequest(`/settings/user/${userId}/${key}`, {
      method: 'PATCH',
      body: JSON.stringify(preferenceData),
    }),
  
  bulkUpdateUserPreferences: (userId: number, preferences: any[]) =>
    apiRequest(`/settings/user/${userId}/bulk`, {
      method: 'POST',
      body: JSON.stringify({ preferences }),
    }),
  
  deleteUserPreference: (userId: number, key: string) =>
    apiRequest(`/settings/user/${userId}/${key}`, {
      method: 'DELETE',
    }),
};

// Messaging API
export const messagingAPI = {
  // Conversations
  getConversations: (userId: number) =>
    apiRequest(`/messaging/conversations?userId=${userId}`),

  getConversation: (conversationId: number) =>
    apiRequest(`/messaging/conversations/${conversationId}`),

  createConversation: (conversationData: {
    participant1Id: number;
    participant2Id: number;
    title?: string;
    type?: 'direct' | 'group';
  }) =>
    apiRequest('/messaging/conversations', {
      method: 'POST',
      body: JSON.stringify(conversationData),
    }),

  createOrGetConversation: (participant1Id: number, participant2Id: number) =>
    apiRequest('/messaging/conversations/create-or-get', {
      method: 'POST',
      body: JSON.stringify({ recipientId: participant2Id }),
    }),

  deleteConversation: (conversationId: number) =>
    apiRequest(`/messaging/conversations/${conversationId}`, {
      method: 'DELETE',
    }),

  // Messages
  getMessages: (conversationId: number) =>
    apiRequest(`/messaging/conversations/${conversationId}/messages`),

  sendMessage: (messageData: {
    conversationId: number;
    senderId: number;
    content: string;
    messageType?: 'text' | 'image' | 'file' | 'audio';
  }) =>
    apiRequest('/messaging/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    }),

  // Admin functions - Message management
  updateMessage: (messageId: number, content: string) =>
    apiRequest(`/messaging/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    }),

  deleteMessage: (messageId: number) =>
    apiRequest(`/messaging/messages/${messageId}`, {
      method: 'DELETE',
    }),

  // Admin functions - Conversation management
  updateConversation: (conversationId: number, title: string) =>
    apiRequest(`/messaging/conversations/${conversationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    }),

  uploadFile: (formData: FormData) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/messaging/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  },

  downloadFile: (messageId: number) => {
    const token = localStorage.getItem('accessToken');
    return fetch(`${API_BASE_URL}/messaging/download/${messageId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  markMessageAsRead: (messageId: number) =>
    apiRequest(`/messaging/messages/${messageId}/read`, {
      method: 'PATCH',
    }),

  // Groups
  getUserGroups: () =>
    apiRequest('/messaging/groups'),

  getGroupConversation: (groupId: number) =>
    apiRequest(`/messaging/groups/${groupId}/conversation`),

  // Contacts and Users
  getContacts: (userId: number) =>
    apiRequest(`/messaging/users/${userId}/contacts`),

  getAvailableRecipients: () =>
    apiRequest('/messaging/recipients'),

  // Search
  searchMessages: (conversationId: number, query: string) =>
    apiRequest(`/messaging/search?conversationId=${conversationId}&query=${encodeURIComponent(query)}`),

  // Test
  test: () => apiRequest('/messaging/test'),
};

// Fonctions pour la gestion des profils
export const updateUserProfile = async (userId: number, profileData: any) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.PROFILE.SAVE_FAILED);
    }

    const updatedUser = await response.json();
    
    // Mettre à jour les données dans localStorage
    const currentUserDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
    const updatedUserDetails = { ...currentUserDetails, ...updatedUser };
    localStorage.setItem('userDetails', JSON.stringify(updatedUserDetails));
    
    return updatedUser;
  } catch (error) {
    console.error('Erreur API updateUserProfile:', error);
    throw error;
  }
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 400) {
        throw new Error(errorData.message || 'Les informations saisies ne sont pas correctes');
      } else if (response.status === 401) {
        throw new Error('Le mot de passe actuel est incorrect');
      } else if (response.status === 404) {
        throw new Error(ERROR_MESSAGES.AUTH.ACCOUNT_NOT_FOUND);
      } else {
        throw new Error(ERROR_MESSAGES.ACCOUNT.PASSWORD_CHANGE_FAILED);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur API changePassword:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: number) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.PROFILE.LOAD_FAILED);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur API getUserProfile:', error);
    throw error;
  }
};

// Fonction pour récupérer les données complètes d'un étudiant
export const getStudentProfile = async (studentId: number) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.PROFILE.STUDENT_LOAD_FAILED);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur API getStudentProfile:', error);
    throw error;
  }
};

// Fonction pour mettre à jour le profil d'un étudiant
export const updateStudentProfile = async (studentId: number, profileData: any) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.PROFILE.STUDENT_SAVE_FAILED);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur API updateStudentProfile:', error);
    throw error;
  }
};

// Fonction pour récupérer les données complètes d'un parent
export const getParentProfile = async (parentId: number) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/parents/${parentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.PROFILE.PARENT_LOAD_FAILED);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur API getParentProfile:', error);
    throw error;
  }
};

// Fonction pour mettre à jour le profil d'un parent
export const updateParentProfile = async (parentId: number, profileData: any) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/parents/${parentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      throw new Error(ERROR_MESSAGES.PROFILE.PARENT_SAVE_FAILED);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur API updateParentProfile:', error);
    throw error;
  }
};

// API Client for easy access
export const apiClient = {
  ...authAPI,
  ...adminAPI,
  ...quizzesAPI,
  ...messagingAPI,
  ...filesAPI,
  ...usersAPI,
  ...studentsAPI,
  ...parentsAPI,
  ...progressAPI,
  ...notificationsAPI,
  ...analyticsAPI,
};

export default {
  auth: authAPI,
  admin: adminAPI,
  quizzes: quizzesAPI,
  messaging: messagingAPI,
  files: filesAPI,
  users: usersAPI,
  students: studentsAPI,
  parents: parentsAPI,
  progress: progressAPI,
  notifications: notificationsAPI,
  analytics: analyticsAPI,
};


