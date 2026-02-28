'use client';

import React, { useState, useEffect } from 'react';
import { useStudentDashboard } from '@/hooks/useDashboard';
import { useRealStats } from '@/hooks/useRealStats';
import {
  Home,
  BookOpen,
  PenTool,
  BarChart3,
  TrendingUp,
  MessageSquare,
  User,
  Award,
  Calendar,
  Library,
  Menu,
  X,
  LogOut,
  Settings,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  RefreshCw,
  ChevronRight,
  Star,
  Clock,
  Target,
  Zap,
  Heart,
  BookMarked,
  GraduationCap,
  Trophy,
  Flag,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  Filter,
  Download,
  Upload,
  Share2,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  Signal
} from 'lucide-react';

// Import des composants d'onglets
import DashboardHomeTab from './DashboardHomeTab';
import QuizListTab from './QuizListTab';
import QuizTakeTab from './QuizTakeTab';
import QuizResultsTab from './QuizResultsTab';
import ProgressTab from './ProgressTab';
import MessagesTab from './MessagesTab';
import ProfileTab from './ProfileTab';
import CalendarTab from './CalendarTab';
import ResourcesTab from './ResourcesTab';

type TabType = 'home' | 'quizzes' | 'quiz-take' | 'results' | 'progress' | 'messages' | 'profile' | 'achievements' | 'calendar' | 'resources';

interface StudentUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  grade: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
  lastActivity: string;
  birthDate?: string; // Ajout du champ date de naissance
}

interface Notification {
  id: string;
  type: 'quiz' | 'message' | 'achievement' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high';
  createdAt: string; // Added for consistency with new notifications
}

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);
  const [isQuizInProgress, setIsQuizInProgress] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // Données dynamiques de l'étudiant connecté
  const [currentStudent, setCurrentStudent] = useState<StudentUser | null>(null);

  // Use the student dashboard hook
  const {
    progress,
    quizzes,
    messages,
    conversations,
    loading,
    error,
    loadProgress,
    loadQuizzes,
    loadConversations,
    loadMessages,
    sendMessage,
    createConversation,
    submitQuizAttempt,
    logout,
    clearError,
  } = useStudentDashboard();

  // Use real stats hook
  const { stats: realStats } = useRealStats();

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('userDetails') : null;
      if (!raw) return;
      const user = JSON.parse(raw);
      const base: StudentUser = {
        id: String(user.id),
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: (user.firstName || '').toLowerCase() + '.' + (user.lastName || '').toLowerCase(),
        email: user.email,
        grade: '',
        level: 1,
        xp: 0,
        streak: 0,
        lastActivity: new Date().toISOString(),
      };
      fetch(`${API_BASE}/students/by-user/${user.id}`)
        .then(r => r.json())
        .then(s => {
          const student = { ...base, grade: s?.class_level || '', birthDate: s?.birth_date || '' };
          setCurrentStudent(student);
          // Load dashboard data
          loadProgress(user.id);
          loadQuizzes();
          loadConversations(user.id);
        })
        .catch(() => setCurrentStudent(base));
    } catch {
      // ignore
    }
  }, [loadProgress, loadQuizzes, loadConversations]);

  const menuItems = [
    {
      id: 'home',
      label: 'Accueil',
      icon: Home,
      description: 'Vue d\'ensemble de vos activités',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'quizzes',
      label: 'Quiz',
      icon: BookOpen,
      description: 'Quiz disponibles et à faire',

      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'results',
      label: 'Résultats',
      icon: BarChart3,
      description: 'Vos résultats et corrections',
      color: 'from-purple-500 to-violet-600'
    },
    {
      id: 'progress',
      label: 'Progrès',
      icon: TrendingUp,
      description: 'Suivi de votre progression',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      description: 'Communications avec vos professeurs',

      color: 'from-pink-500 to-rose-600'
    },
    {
      id: 'calendar',
      label: 'Calendrier',
      icon: Calendar,
      description: 'Planning et échéances',
      color: 'from-teal-500 to-cyan-600'
    },
    {
      id: 'resources',
      label: 'Ressources',
      icon: Library,
      description: 'Documents et supports de cours',
      color: 'from-indigo-500 to-blue-600'
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      description: 'Vos informations personnelles',
      color: 'from-gray-500 to-slate-600'
    }
  ];

  useEffect(() => {
    // Simulation des notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'quiz',
        title: 'Nouveau quiz disponible',
        message: 'Le quiz "La Révolution française" est maintenant disponible',
        timestamp: '2025-12-20T09:30:00',
        isRead: false,
        priority: 'normal',
        createdAt: '2025-12-20T09:30:00'
      },
      {
        id: '2',
        type: 'message',
        title: 'Message du professeur',
        message: 'Votre professeur a répondu à votre question',
        timestamp: '2025-12-20T08:45:00',
        isRead: false,
        priority: 'high',
        createdAt: '2025-12-20T08:45:00'
      },
      {
        id: '3',
        type: 'achievement',
        title: 'Nouveau badge obtenu !',
        message: 'Félicitations ! Vous avez obtenu le badge "Historien en herbe"',
        timestamp: '2025-12-19T16:20:00',
        isRead: true,
        priority: 'normal',
        createdAt: '2025-12-19T16:20:00'
      }
    ];
    // setNotifications(mockNotifications); // This state is now managed by the hook
  }, []);

  const handleTabChange = (tabId: TabType, quizId?: string) => {
    // Empêcher la navigation si un quiz est en cours (mais pas terminé), sauf pour le quiz lui-même
    if (isQuizInProgress && !isQuizCompleted && tabId !== 'quiz-take') {
      alert('Vous ne pouvez pas quitter le quiz en cours. Terminez-le d\'abord.');
      return;
    }

    setActiveTab(tabId);
    if (tabId === 'quiz-take' && quizId) {
      setCurrentQuizId(quizId);
    }
    if (window.innerWidth < 1024) {
      setSidebarCollapsed(true);
    }
  };

  const handleQuizStart = () => {
    setIsQuizInProgress(true);
    setIsQuizCompleted(false);
  };

  const handleQuizComplete = () => {
    setIsQuizInProgress(false);
    setIsQuizCompleted(true);
    setCurrentQuizId(null);
    handleTabChange('results');
  };

  const handleQuizBack = () => {
    setIsQuizInProgress(false);
    setIsQuizCompleted(true);
    setCurrentQuizId(null);
    handleTabChange('quizzes');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLogout = () => {
    if (isQuizInProgress && !isQuizCompleted) {
      alert('Vous ne pouvez pas vous déconnecter pendant qu\'un quiz est en cours. Terminez-le d\'abord.');
      return;
    }
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
    }
  };

  const handleRefresh = () => {
    if (currentStudent) {
      const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
      loadProgress(userDetails.id);
      loadQuizzes();
      loadConversations(userDetails.id);
    }
  };

  const getXPProgress = () => {
    const lvl = currentStudent?.level || 1;
    const xp = currentStudent?.xp || 0;
    const currentLevelXP = lvl * 200;
    const nextLevelXP = (lvl + 1) * 200;
    const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardHomeTab
          onNavigateToQuiz={(quizId) => handleTabChange('quiz-take', quizId)}
          onNavigateToQuizzes={() => handleTabChange('quizzes')}
          onNavigateToResults={() => handleTabChange('results')}
          onNavigateToMessages={() => handleTabChange('messages')}
          onNavigateToCalendar={() => handleTabChange('calendar')}
        />;
      case 'quizzes':
        return <QuizListTab onStartQuiz={(quizId) => handleTabChange('quiz-take', quizId)} />;
      case 'quiz-take':
        return <QuizTakeTab
          quizId={currentQuizId}
          onComplete={handleQuizComplete}
          onBack={handleQuizBack}
          onStart={handleQuizStart}
        />;
      case 'results':
        return <QuizResultsTab />;
      case 'progress':
        return <ProgressTab />;
      case 'messages':
        return <MessagesTab />;
      case 'profile':
        return <ProfileTab />;

      case 'calendar':
        return <CalendarTab />;
      case 'resources':
        return <ResourcesTab />;
      default:
        return <DashboardHomeTab
          onNavigateToQuiz={(quizId) => handleTabChange('quiz-take', quizId)}
          onNavigateToQuizzes={() => handleTabChange('quizzes')}
          onNavigateToResults={() => handleTabChange('results')}
          onNavigateToMessages={() => handleTabChange('messages')}
          onNavigateToCalendar={() => handleTabChange('calendar')}
        />;
    }
  };

  const getCurrentTabInfo = () => {
    return menuItems.find(item => item.id === activeTab) || menuItems[0];
  };

  const currentTabInfo = getCurrentTabInfo();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode
      ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
      {/* Overlay mobile */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Bouton hamburger mobile */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-900/90 backdrop-blur-md rounded-lg text-white hover:bg-blue-800 transition-all"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar - Comportement cohérent */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${isMobile
        ? (mobileMenuOpen ? 'translate-x-0' : '-translate-x-full')
        : (sidebarCollapsed ? 'w-20' : 'w-80')
        } ${isMobile ? 'w-80 max-w-[85vw]' : ''}`}>
        <div className="h-full backdrop-blur-xl border-r border-blue-700/50 transition-colors duration-300 flex flex-col bg-blue-900/80">
          {/* Header du sidebar */}
          <div className="p-4 border-b border-blue-700/50 transition-colors duration-300">
            <div className="flex items-center justify-between">
              {((!isMobile && !sidebarCollapsed) || (isMobile && mobileMenuOpen)) && (
                <div>
                  <h1 className="text-xl font-bold text-blue-100 transition-colors duration-300">
                    Chrono-Carto
                  </h1>
                  <p className="text-sm text-blue-300 transition-colors duration-300">
                    Espace Étudiant
                  </p>
                </div>
              )}
              <button
                onClick={() => {
                  if (isMobile) {
                    setMobileMenuOpen(false);
                  } else {
                    setSidebarCollapsed(!sidebarCollapsed);
                  }
                }}
                className="p-2 rounded-lg transition-all text-blue-200 hover:text-blue-100 hover:bg-blue-800/50"
              >
                {isMobile ? <X className="w-5 h-5" /> : (sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />)}
              </button>
            </div>
          </div>



          {/* Navigation */}
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id as TabType)}
                  disabled={isQuizInProgress && !isQuizCompleted && item.id !== 'quiz-take'}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : isQuizInProgress && !isQuizCompleted && item.id !== 'quiz-take'
                      ? 'text-blue-400/50 cursor-not-allowed opacity-50'
                      : 'text-blue-200 hover:bg-blue-800/50 hover:text-blue-100'
                    }`}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-blue-300'
                    }`} />
                  {((!isMobile && !sidebarCollapsed) || (isMobile && mobileMenuOpen)) && (
                    <>
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{item.label}</div>
                        <div className="text-xs text-blue-400 opacity-75">{item.description}</div>
                      </div>

                    </>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Profil étudiant et actions du bas */}
          <div className={`p-4 border-t transition-colors duration-300 ${darkMode ? 'border-white/20' : 'border-gray-200'
            }`}>
            {/* Profil étudiant */}
            {currentStudent && (
              <div className="relative mb-4">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/10 transition-all ${darkMode ? 'text-white' : 'text-gray-900'
                    }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {(currentStudent?.firstName || '').charAt(0)}{(currentStudent?.lastName || '').charAt(0)}
                    </span>
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex-1 text-left">
                      <div className={`font-semibold text-sm transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                        {currentStudent?.firstName} {currentStudent?.lastName}
                      </div>
                      <div className={`text-xs transition-colors duration-300 ${darkMode ? 'text-blue-300' : 'text-blue-600'
                        }`}>
                        {currentStudent?.grade}
                      </div>
                    </div>
                  )}
                </button>

                {/* Menu utilisateur */}
                {showUserMenu && !sidebarCollapsed && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-blue-800 rounded-xl border border-blue-700/50 shadow-xl">
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        disabled={isQuizInProgress && !isQuizCompleted}
                        className={`w-full flex items-center space-x-3 px-3 py-2 border rounded-lg transition-all text-left font-medium ${isQuizInProgress && !isQuizCompleted
                          ? 'text-red-400/50 cursor-not-allowed opacity-50 border-red-500/20'
                          : 'text-red-400 hover:text-red-300 hover:bg-red-900/30 border-red-500/40'
                          }`}
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-semibold">Se déconnecter</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions du bas */}
            <div className="flex items-center justify-between">
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal - Ajustement automatique */}
      <div className={`transition-all duration-300 flex flex-col min-h-screen ${isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-20' : 'ml-80')
        }`}>
        {/* Header principal */}
        <header className="backdrop-blur-xl border-b border-blue-700/50 sticky top-0 z-30 transition-colors duration-300 bg-blue-900/80">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <currentTabInfo.icon className="w-6 h-6 text-blue-300 transition-colors duration-300" />
                    <h1 className="text-2xl font-bold text-blue-100 transition-colors duration-300">
                      {currentTabInfo.label}
                    </h1>
                    {isQuizInProgress && !isQuizCompleted && (
                      <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm font-semibold border border-orange-500/30">
                        Quiz en cours
                      </span>
                    )}
                    {isQuizInProgress && isQuizCompleted && (
                      <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-semibold border border-green-500/30">
                        Quiz terminé
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-blue-300 transition-colors duration-300">
                    {isQuizInProgress && !isQuizCompleted ? 'Quiz en cours - Terminez-le pour accéder aux autres sections' :
                      isQuizInProgress && isQuizCompleted ? 'Quiz terminé - Vous pouvez maintenant naviguer librement' :
                        currentTabInfo.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Actions rapides */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg transition-all text-blue-200 hover:text-blue-100 hover:bg-blue-800/50"
                    title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
                  >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>
                  {/* Bouton de déconnexion */}
                  <button
                    onClick={handleLogout}
                    disabled={isQuizInProgress && !isQuizCompleted}
                    className={`flex items-center space-x-2 px-4 py-2 bg-transparent border rounded-xl transition-all ${isQuizInProgress && !isQuizCompleted
                      ? 'border-white/10 text-red-400/50 cursor-not-allowed opacity-50'
                      : 'border-white/30 text-red-400 hover:bg-red-500/20 hover:border-red-400/50'
                      }`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Déconnexion</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu de l'onglet */}
        <main className="flex-1 p-6 overflow-y-auto">
          {renderTabContent()}
        </main>

        {/* Footer */}
        <footer className="backdrop-blur-xl border-t border-blue-700/50 px-6 py-4 transition-colors duration-300 bg-blue-900/50">
          <div className="flex items-center justify-between text-sm">
            <div className="text-blue-300 transition-colors duration-300">
              © 2025 Chrono-Carto. Plateforme éducative.
            </div>
          </div>
        </footer>
      </div>

      {/* Styles pour la scrollbar personnalisée */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;


