'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUserName } from '@/lib/userUtils';
import { useSimpleStats } from '@/hooks/useSimpleStats';
import { useStudentDashboardStats } from '@/hooks/useStudentDashboardStats';
import {
  BookOpen,
  Target,
  TrendingUp,
  Award,
  Calendar,
  MessageSquare,
  Star,
  ChevronRight,
  Play,
  CheckCircle,
  AlertCircle,
  Trophy,
  Heart,
  BookMarked,
  Users,
  BarChart3,
  Zap,
  Timer,
  Flag,
  Sparkles,
  Gift,
  ArrowRight,
  Plus,
  Eye,
  Download,
  Share2,
  Bookmark,
  ThumbsUp,
  MessageCircle,
  Send,
  Coffee,
  Sun,
  Moon,
  CloudRain,
  Smile,
  RefreshCw
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  action: () => void;
  badge?: string;
}

interface UpcomingTask {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  type: 'quiz' | 'assignment' | 'exam';
  completed: boolean;
}

interface DashboardHomeTabProps {
  onNavigateToQuiz: (quizId: string) => void;
  onNavigateToQuizzes: () => void;
  onNavigateToResults: () => void;
  onNavigateToMessages: () => void;
  onNavigateToCalendar: () => void;
}

const DashboardHomeTab: React.FC<DashboardHomeTabProps> = ({ 
  onNavigateToQuiz, 
  onNavigateToQuizzes,
  onNavigateToResults, 
  onNavigateToMessages, 
  onNavigateToCalendar 
}) => {
  const { stats: simpleStats } = useSimpleStats();
  const { stats: studentStats } = useStudentDashboardStats();
  
  // Debug: afficher les stats dans la console
  useEffect(() => {
    console.log('🎯 DashboardHomeTab - studentStats:', studentStats);
  }, [studentStats]);
  
  const [userName, setUserName] = useState('Utilisateur'); // État local pour éviter l'hydratation mismatch
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({
    quizzesCompleted: simpleStats.completedQuizzes,
    averageScore: simpleStats.averageScore,
    timeSpent: 0, // Pas de données de temps pour l'instant
    streak: 0 // Pas de données de série pour l'instant
  });

  useEffect(() => {
    // Marquer le composant comme monté côté client
    setMounted(true);
    
    // Initialiser l'heure
    setCurrentTime(new Date());
    
    // Timer pour mettre à jour l'heure
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Charger le nom d'utilisateur côté client uniquement
    setUserName(getCurrentUserName());

    return () => clearInterval(timer);
  }, []);

  // Mettre à jour les statistiques avec les données réelles
  useEffect(() => {
    setWeeklyStats(prev => ({
      ...prev,
      quizzesCompleted: simpleStats.completedQuizzes,
      averageScore: simpleStats.averageScore
    }));
  }, [simpleStats.completedQuizzes, simpleStats.averageScore]);

  const quickActions: QuickAction[] = [
    {
      id: 'start-quiz',
      title: 'Commencer un quiz',
      description: 'Démarrer un nouveau quiz disponible',
      icon: Play,
      color: 'from-green-500 to-emerald-600',
      action: () => onNavigateToQuizzes(),

    },
    {
      id: 'view-results',
      title: 'Voir mes résultats',
      description: 'Consulter vos derniers résultats',
      icon: BarChart3,
      color: 'from-blue-500 to-indigo-600',
      action: () => onNavigateToResults()
    },
    {
      id: 'check-messages',
      title: 'Messages',
      description: 'Lire vos nouveaux messages',
      icon: MessageSquare,
      color: 'from-purple-500 to-violet-600',
      action: () => onNavigateToMessages()
    },
    {
      id: 'view-calendar',
      title: 'Planning',
      description: 'Voir votre calendrier',
      icon: Calendar,
      color: 'from-orange-500 to-red-600',
      action: () => onNavigateToCalendar()
    }
  ];

  const formatTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    
    if (diff < 0) return 'Échéance dépassée';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}j ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Bientôt';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-100';
      case 'medium': return 'text-orange-500 bg-orange-100';
      case 'low': return 'text-green-500 bg-green-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };


  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {mounted && currentTime ? (() => {
                  const hour = currentTime.getHours();
                  if (hour < 12) return 'Bonjour';
                  if (hour < 18) return 'Bon après-midi';
                  return 'Bonsoir';
                })() : 'Bonjour'}, {userName} ! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Prêt à continuer votre apprentissage aujourd'hui ?
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
                title="Actualiser"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <div className="text-right">
                {mounted && currentTime ? (
                  <>
                    <div className="text-2xl font-bold">
                      {currentTime.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    <div className="text-blue-200">
                      {currentTime.toLocaleDateString('fr-FR', { 
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">--:--</div>
                    <div className="text-blue-200">Chargement...</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Éléments décoratifs */}
        <div className="absolute top-4 right-4 opacity-20">
          <img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-32 h-32" />
        </div>
        <div className="absolute bottom-4 left-4 opacity-10">
          <Sparkles className="w-24 h-24" />
        </div>
      </div>

      {/* Statistiques de la semaine */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Quiz terminés</p>
              <p className="text-white text-2xl font-bold">{weeklyStats.quizzesCompleted}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-400 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            {weeklyStats.quizzesCompleted > 0 ? 'Progression continue' : 'Commencez votre premier quiz !'}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Score moyen</p>
              <p className="text-white text-2xl font-bold">{weeklyStats.averageScore}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-blue-400 text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            {weeklyStats.averageScore > 0 ? 'Amélioration continue' : 'Terminez un quiz pour voir votre score !'}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Messages reçus</p>
              <p className="text-white text-2xl font-bold">{studentStats.totalMessages}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-purple-400 text-sm">
            <MessageCircle className="w-4 h-4 mr-1" />
            {studentStats.unreadMessages > 0 ? `${studentStats.unreadMessages} non lus` : studentStats.totalMessages > 0 ? 'Tous les messages lus' : 'Aucun message'}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Ressources</p>
              <p className="text-white text-2xl font-bold">{studentStats.totalResources}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-orange-400 text-sm">
            <BookMarked className="w-4 h-4 mr-1" />
            {studentStats.totalResources > 0 ? 'Dossiers disponibles' : 'Aucune ressource'}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Actions rapides */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-white text-xl font-bold mb-4 flex items-center">
              <Zap className="w-6 h-6 mr-2 text-yellow-400" />
              Actions rapides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="group bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      {action.badge && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-semibold mb-1">{action.title}</h3>
                    <p className="text-blue-200 text-sm">{action.description}</p>
                    <div className="flex items-center mt-3 text-blue-300 group-hover:text-white transition-colors">
                      <span className="text-sm">Commencer</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Sidebar droite - Motivation du jour */}
        <div className="lg:col-span-1 flex flex-col">
          {/* Motivation du jour */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-12 text-white h-full flex flex-col justify-center">
            <div className="flex items-center mb-10">
              <Heart className="w-12 h-12 mr-5 text-pink-200" />
              <h2 className="text-4xl font-bold">Motivation du jour</h2>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-pink-100 text-3xl leading-relaxed mb-10 font-medium">
                "L'éducation est l'arme la plus puissante qu'on puisse utiliser pour changer le monde."
              </p>
              <p className="text-pink-200 text-2xl font-semibold">- Nelson Mandela</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomeTab;


