'use client';

import React, { useState, useEffect } from 'react';
import { useAdminDashboard } from '@/hooks/useDashboard';
import { useRealStats } from '@/hooks/useRealStats';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  BarChart3,
  Users,
  BookOpen,
  MessageSquare,
  FileText,
  Shield,
  Database,
  Zap,
  Menu,
  X,
  LogOut,
  User,
  Palette,
  Archive,
  Activity,
  Globe,
  Lock,
  Mail,
  Phone,
  Calendar,
  Clock,
  Award,
  Target,
  TrendingUp,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Save,
  Filter,
  Star,
  Heart,
  Flag,
  Tag,
  Bookmark,
  Share2,
  ExternalLink,
  Home,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Minimize2,
  CreditCard
} from 'lucide-react';

// Import des composants d'onglets
import DashboardOverviewTab from './DashboardOverviewTab';
import UsersManagementTab from './UsersManagementTab';
import QuizzesManagementTab from './QuizzesManagementTab';
import MessagesManagementTab from './MessagesManagementTab';
import RendezVousManagementTab from './RendezVousManagementTab';
import AttendanceTab from './AttendanceTab';
import PaymentsManagementTab from './PaymentsManagementTab';
import AdminProfileTab from './AdminProfileTab';
import FileManagementTab from './FileManagementTab';
import CalendarManagementTab from './CalendarManagementTab';
import { AnimatedCard, AnimatedButton, AnimatedList, AnimatedListItem } from '../../../components/ui/animations';

type TabType = 'overview' | 'users' | 'quizzes' | 'messages' | 'rendez-vous' | 'attendance' | 'payments' | 'files' | 'calendar' | 'profile';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  avatar?: string;
  lastLogin: string;
}

const AdminDashboard = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
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

  // Use the admin dashboard hook
  const {
    stats,
    students,
    parents,
    quizzes,
    files,
    notifications,
    loading,
    error,
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
  } = useAdminDashboard();

  // Use real stats hook
  const { stats: realStats } = useRealStats();

  // Données de l'utilisateur admin connecté
  const [currentUser, setCurrentUser] = useState<AdminUser>({
    id: '',
    name: '',
    email: '',
    role: 'admin',
    lastLogin: ''
  });

  // Charger les données de l'utilisateur admin
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (token) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setCurrentUser({
              id: userData.id,
              name: `${userData.firstName} ${userData.lastName}`,
              email: userData.email,
              role: userData.role,
              lastLogin: userData.lastLogin || new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données admin:', error);
      }
    };

    loadAdminData();
  }, []);

  const menuItems = [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      icon: BarChart3,
      description: 'Statistiques et tableau de bord principal',
      badge: null
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: Users,
      description: 'Gestion des étudiants et parents',
      badge: null
    },
    {
      id: 'quizzes',
      label: 'Quiz',
      icon: BookOpen,
      description: 'Création et gestion des questionnaires',
      badge: null
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      description: 'Communication avec les utilisateurs',
      badge: null
    },
    {
      id: 'rendez-vous',
      label: 'Rendez-vous',
      icon: Calendar,
      description: 'Gestion des demandes de rendez-vous',
      badge: null
    },
    {
      id: 'attendance',
      label: 'Présence',
      icon: Users,
      description: 'Liste de présence des étudiants',
      badge: null
    },
    {
      id: 'payments',
      label: 'Paiements',
      icon: CreditCard,
      description: 'Gestion des paiements des étudiants',
      badge: null
    },
    {
      id: 'files',
      label: 'Fichiers',
      icon: FileText,
      description: 'Gestion des documents et médias avec organisation en dossiers',
      badge: null
    },
    {
      id: 'calendar',
      label: 'Calendrier',
      icon: Calendar,
      description: 'Planification des séances d\'études',
      badge: null
    },
    {
      id: 'profile',
      label: 'Mon Profil',
      icon: User,
      description: 'Gestion du profil administrateur',
      badge: null
    }
  ];

  // Gérer les paramètres d'URL pour les onglets
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'users', 'quizzes', 'messages', 'rendez-vous', 'attendance', 'payments', 'files', 'calendar', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);

  // Gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    // Mettre à jour l'URL sans recharger la page
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    router.replace(url.pathname + url.search);
    
    if (window.innerWidth < 1024) {
      setSidebarCollapsed(true);
    }
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
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
    }
  };

  const handleRefresh = () => {
    loadStats();
    loadStudents();
    loadParents();
    loadQuizzes();
    loadFiles();
    loadNotifications();
  };

  const unreadNotifications = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverviewTab />;
      case 'users':
        return <UsersManagementTab 
          students={students}
          parents={parents}
          loading={loading}
          onCreateStudent={createStudent}
          onUpdateStudent={updateStudent}
          onDeleteStudent={deleteStudent}
          onCreateParent={createParent}
          onUpdateParent={updateParent}
          onDeleteParent={deleteParent}
          onApproveUser={approveUser}
          loadStudents={loadStudents}
          loadParents={loadParents}
        />;
      case 'quizzes':
        return <QuizzesManagementTab />;
      case 'messages':
        return <MessagesManagementTab />;
      case 'rendez-vous':
        return <RendezVousManagementTab onRefresh={handleRefresh} />;
      case 'attendance':
        return <AttendanceTab />;
      case 'payments':
        return <PaymentsManagementTab />;
      case 'files':
        return <FileManagementTab />;
      case 'calendar':
        return <CalendarManagementTab />;
      case 'profile':
        return <AdminProfileTab />;
      default:
        return <DashboardOverviewTab />;
    }
  };

  const getCurrentTabInfo = () => {
    return menuItems.find(item => item.id === activeTab) || menuItems[0];
  };

  const currentTabInfo = getCurrentTabInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col">
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

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${
        isMobile 
          ? (mobileMenuOpen ? 'translate-x-0' : '-translate-x-full') 
          : (sidebarCollapsed ? 'w-20' : 'w-80')
      } ${isMobile ? 'w-80 max-w-[85vw]' : ''}`}>
        <div className="h-full bg-blue-900/80 backdrop-blur-xl border-r border-blue-700/50 flex flex-col">
          {/* Header du sidebar */}
          <div className="p-6 border-b border-blue-700/50">
            <div className="flex items-center justify-between">
              {((!isMobile && !sidebarCollapsed) || (isMobile && mobileMenuOpen)) && (
                <div>
                  <h1 className="text-xl font-bold text-blue-100">Chrono-Carto</h1>
                  <p className="text-blue-300 text-sm">Administration</p>
                </div>
              )}
              <AnimatedButton
                onClick={() => {
                  if (isMobile) {
                    setMobileMenuOpen(false);
                  } else {
                    setSidebarCollapsed(!sidebarCollapsed);
                  }
                }}
                className="p-2 text-blue-200 hover:text-blue-100 hover:bg-blue-800/50 rounded-lg transition-all"
              >
                {isMobile ? <X className="w-5 h-5" /> : (sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />)}
              </AnimatedButton>
            </div>
          </div>

          {/* Menu de navigation */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <AnimatedList className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <AnimatedListItem key={item.id}>
                    <AnimatedButton
                      onClick={() => handleTabChange(item.id as TabType)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {((!isMobile && !sidebarCollapsed) || (isMobile && mobileMenuOpen)) && (
                        <div className="flex-1 text-left">
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                      {((!isMobile && !sidebarCollapsed) || (isMobile && mobileMenuOpen)) && isActive && (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </AnimatedButton>
                  </AnimatedListItem>
                );
              })}
            </AnimatedList>
          </div>

          {/* Footer du sidebar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700/50">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-blue-800/50 transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                {((!isMobile && !sidebarCollapsed) || (isMobile && mobileMenuOpen)) && (
                  <div className="flex-1 text-left">
                    <p className="text-blue-100 font-medium">{currentUser.name}</p>
                    <p className="text-blue-300 text-xs">{currentUser.role}</p>
                  </div>
                )}
                {((!isMobile && !sidebarCollapsed) || (isMobile && mobileMenuOpen)) && (
                  <ChevronDown className="w-4 h-4 text-blue-300" />
                )}
              </button>

              {/* Menu utilisateur */}
              {showUserMenu && ((!isMobile && !sidebarCollapsed) || (isMobile && mobileMenuOpen)) && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-blue-800/90 backdrop-blur-xl rounded-xl border border-blue-700/50 shadow-xl">
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700/50 transition-all text-red-300 hover:text-red-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className={`flex-1 transition-all duration-300 ${
        isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-20' : 'ml-80')
      }`}>
        {/* Header principal */}
        <header className="bg-blue-900/80 backdrop-blur-xl border-b border-blue-700/50 shadow-sm">
          <div className="px-6 py-4">
            {/* En-tête aligné avec le sidebar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-white">Interface d'administration Chrono-Carto</h1>
                </div>
              </div>
              
            </div>
            
            <hr className="border-blue-700/30 mb-4" />
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-blue-100">{currentTabInfo.label}</h2>
                <p className="text-blue-300 text-sm">{currentTabInfo.description}</p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Actions rapides */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 text-blue-200 hover:text-blue-100 hover:bg-blue-800/50 rounded-lg transition-all"
                    title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
                  >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>

                                {/* Bouton de déconnexion */}
                                <button
                                  onClick={handleLogout}
                                  className="flex items-center space-x-2 px-4 py-2 bg-transparent border border-white/30 rounded-xl text-red-400 hover:bg-red-500/20 hover:border-red-400/50 transition-all"
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
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {renderTabContent()}
        </main>
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

export default AdminDashboard;

