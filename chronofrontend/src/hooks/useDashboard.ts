import { useState, useEffect, useCallback } from 'react';
import { adminAPI, quizzesAPI, messagingAPI, filesAPI, analyticsAPI, authAPI, notificationsAPI, usersAPI } from '@/lib/api';

// Types
interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalParents: number;
  totalQuizzes: number;
  totalFiles: number;
  recentActivity: any[];
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
}

interface Student extends User {
  classLevel: string;
  birthDate: string;
  phone_number: string;
  progressPercentage: number;
  averageScore: number;
}

interface Parent extends User {
  phone_number: string;
  address: string;
  occupation: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  subject: string;
  level: string;
  questions: any[];
  timeLimit: number;
  isActive: boolean;
  createdAt: string;
}

interface File {
  id: number;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  category: string;
  description: string;
  uploadedBy: number;
  createdAt: string;
}

interface Message {
  id: number;
  content: string;
  senderId: number;
  conversationId: number;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  id: number;
  participant1Id: number;
  participant2Id: number;
  title: string;
  type: string;
  lastMessage: Message;
  updatedAt: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  userId: number;
  createdAt: string;
}

// Hook for Admin Dashboard
export const useAdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard stats
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const statsData = await analyticsAPI.getDashboardStats();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load students
  const loadStudents = useCallback(async (page = 1, limit = 1000) => {
    try {
      setLoading(true);
      console.log('?? Frontend - Loading students...');
      
      // Forcer le rechargement sans cache en ajoutant un timestamp
      const timestamp = Date.now();
      const response = await adminAPI.getStudents({ page, limit, _t: timestamp });
      
      console.log('?? Frontend - Students loaded:', response.items?.length || 0, 'students');
      setStudents(response.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load parents
  const loadParents = useCallback(async (page = 1, limit = 1000) => {
    try {
      setLoading(true);
      const response = await adminAPI.getParents({ page, limit });
      setParents(response.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load parents');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load quizzes
  const loadQuizzes = useCallback(async (page = 1, limit = 50) => {
    try {
      setLoading(true);
      const response = await quizzesAPI.getQuizzes({ page, limit });
      setQuizzes(response.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load files
  const loadFiles = useCallback(async (page = 1, limit = 50) => {
    try {
      setLoading(true);
      const response = await filesAPI.getFiles({ page, limit });
      setFiles(response.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
      const response = await notificationsAPI.getNotifications(userDetails.id);
      setNotifications(response || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    }
  }, []);

  // Create student
  const createStudent = useCallback(async (studentData: any) => {
    try {
      setLoading(true);
      const newStudent = await adminAPI.createStudent(studentData);
      setStudents(prev => [newStudent, ...prev]);
      return newStudent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create student');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update student
  const updateStudent = useCallback(async (id: number, studentData: any) => {
    try {
      setLoading(true);
      const updatedStudent = await adminAPI.updateStudent(id, studentData);
      setStudents(prev => prev.map(s => s.id === id ? updatedStudent : s));
      return updatedStudent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update student');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete student
  const deleteStudent = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await adminAPI.deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete student');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create parent
  const createParent = useCallback(async (parentData: any) => {
    try {
      setLoading(true);
      const newParent = await adminAPI.createParent(parentData);
      setParents(prev => [newParent, ...prev]);
      return newParent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create parent');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update parent
  const updateParent = useCallback(async (id: number, parentData: any) => {
    try {
      setLoading(true);
      const updatedParent = await adminAPI.updateParent(id, parentData);
      setParents(prev => prev.map(p => p.id === id ? updatedParent : p));
      return updatedParent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update parent');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete parent
  const deleteParent = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await adminAPI.deleteParent(id);
      setParents(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete parent');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Approve user
  const approveUser = useCallback(async (id: number, approve: boolean) => {
    try {
      setLoading(true);
      await adminAPI.approveUser(id, approve);
      // Update the user in the appropriate list
      setStudents(prev => prev.map(s => s.id === id ? { ...s, isApproved: approve } : s));
      setParents(prev => prev.map(p => p.id === id ? { ...p, isApproved: approve } : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create quiz
  const createQuiz = useCallback(async (quizData: any) => {
    try {
      setLoading(true);
      const newQuiz = await quizzesAPI.createQuiz(quizData);
      setQuizzes(prev => [newQuiz, ...prev]);
      return newQuiz;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quiz');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update quiz
  const updateQuiz = useCallback(async (id: number, quizData: any) => {
    try {
      setLoading(true);
      const updatedQuiz = await quizzesAPI.updateQuiz(id, quizData);
      setQuizzes(prev => prev.map(q => q.id === id ? updatedQuiz : q));
      return updatedQuiz;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quiz');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete quiz
  const deleteQuiz = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await quizzesAPI.deleteQuiz(id);
      setQuizzes(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete quiz');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload file
  const uploadFile = useCallback(async (file: File, metadata: any) => {
    try {
      setLoading(true);
      const newFile = await filesAPI.uploadFile(file, metadata);
      setFiles(prev => [newFile, ...prev]);
      return newFile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete file
  const deleteFile = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await filesAPI.deleteFile(id);
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk delete files
  const bulkDeleteFiles = useCallback(async (ids: number[]) => {
    try {
      setLoading(true);
      await filesAPI.bulkDelete(ids);
      setFiles(prev => prev.filter(f => !ids.includes(f.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete files');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (id: number) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationsAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userDetails');
    window.location.href = '/login';
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load initial data
  useEffect(() => {
    loadStats();
    loadStudents();
    loadParents();
    loadQuizzes();
    loadFiles();
    loadNotifications();
  }, [loadStats, loadStudents, loadParents, loadQuizzes, loadFiles, loadNotifications]);

  return {
    // State
    stats,
    students,
    parents,
    quizzes,
    files,
    notifications,
    loading,
    error,

    // Actions
    loadStats,
    loadStudents,
    loadParents,
    loadQuizzes,
    loadFiles,
    loadNotifications,
    createStudent,
    updateStudent,
    deleteStudent,
    createParent,
    updateParent,
    deleteParent,
    approveUser,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    uploadFile,
    deleteFile,
    bulkDeleteFiles,
    markNotificationAsRead,
    deleteNotification,
    logout,
    clearError,
  };
};

// Hook for Student Dashboard
export const useStudentDashboard = () => {
  const [progress, setProgress] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load student progress
  const loadProgress = useCallback(async (studentId: number) => {
    try {
      setLoading(true);
      const progressData = await analyticsAPI.getUserStats(studentId);
      setProgress(progressData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load available quizzes
  const loadQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await quizzesAPI.getQuizzes({ status: 'active' });
      setQuizzes(response.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load conversations
  const loadConversations = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      const conversationsData = await messagingAPI.getConversations(userId);
      setConversations(conversationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: number) => {
    try {
      setLoading(true);
      const messagesData = await messagingAPI.getMessages(conversationId);
      setMessages(messagesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (messageData: any) => {
    try {
      setLoading(true);
      const newMessage = await messagingAPI.sendMessage(messageData);
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create conversation
  const createConversation = useCallback(async (conversationData: any) => {
    try {
      setLoading(true);
      const newConversation = await messagingAPI.createConversation(conversationData);
      setConversations(prev => [newConversation, ...prev]);
      return newConversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load notifications
  const loadNotifications = useCallback(async (userId: number) => {
    try {
      const response = await notificationsAPI.getNotifications(userId);
      setNotifications(response || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    }
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (id: number) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, []);

  // Submit quiz attempt
  const submitQuizAttempt = useCallback(async (attemptData: any) => {
    try {
      setLoading(true);
      const result = await quizzesAPI.submitQuizAttempt(attemptData);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userDetails');
    window.location.href = '/login';
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    progress,
    quizzes,
    messages,
    conversations,
    notifications,
    loading,
    error,

    // Actions
    loadProgress,
    loadQuizzes,
    loadConversations,
    loadMessages,
    loadNotifications,
    sendMessage,
    createConversation,
    markNotificationAsRead,
    submitQuizAttempt,
    logout,
    clearError,
  };
};

// Hook for Parent Dashboard
export const useParentDashboard = () => {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load children data
  const loadChildren = useCallback(async (parentId: number) => {
    try {
      setLoading(true);
      // This would typically come from a parent-specific API
      const childrenData = await usersAPI.getUsers({ role: 'student' });
      setChildren(childrenData.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load children');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load conversations
  const loadConversations = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      const conversationsData = await messagingAPI.getConversations(userId);
      setConversations(conversationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: number) => {
    try {
      setLoading(true);
      const messagesData = await messagingAPI.getMessages(conversationId);
      setMessages(messagesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (messageData: any) => {
    try {
      setLoading(true);
      const newMessage = await messagingAPI.sendMessage(messageData);
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create conversation
  const createConversation = useCallback(async (conversationData: any) => {
    try {
      setLoading(true);
      const newConversation = await messagingAPI.createConversation(conversationData);
      setConversations(prev => [newConversation, ...prev]);
      return newConversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load notifications
  const loadNotifications = useCallback(async (userId: number) => {
    try {
      const response = await notificationsAPI.getNotifications(userId);
      setNotifications(response || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    }
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (id: number) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userDetails');
    window.location.href = '/login';
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    children,
    selectedChild,
    messages,
    conversations,
    notifications,
    loading,
    error,

    // Actions
    setSelectedChild,
    loadChildren,
    loadConversations,
    loadMessages,
    loadNotifications,
    sendMessage,
    createConversation,
    markNotificationAsRead,
    logout,
    clearError,
  };
};

