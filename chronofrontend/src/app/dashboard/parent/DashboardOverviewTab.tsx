'use client';

import React, { useState, useEffect } from 'react';
import { getChildName, getSchoolName } from '@/lib/userUtils';
import { useRealStats } from '@/hooks/useRealStats';
import { useParentDashboardStats } from '@/hooks/useParentDashboardStats';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Clock,
  Calendar,
  BookOpen,
  Star,
  CheckCircle,
  Info,
  MessageSquare,
  Users,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Heart,
  Brain,
  Trophy,
  Medal,
  Crown,
  Flag,
  Sparkles,
  Flame,
  Rocket,
  Mountain,
  Compass,
  History,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  MoreHorizontal,
  Filter,
  Search,
  Download,
  Share2,
  RefreshCw,
  Settings,
  HelpCircle,
  ExternalLink,
  Link,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Mail,
  Phone,
  MapPin,
  Home,
  School,
  GraduationCap,
  UserCheck,
  Users2,
  Baby,
  User,
  UserPlus,
  UserMinus,
  UserX,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Scan,
  QrCode,
  Barcode,
  CreditCard,
  Wallet,
  Coins,
  DollarSign,
  Euro,
  // Yen, // Icône non disponible
  Bitcoin,
  BanknoteIcon,
  Receipt,
  Calculator,
  PiggyBank,
  TrendingUpIcon,
  LineChart,
  AreaChart,
  ScatterChart,
  Timer
} from 'lucide-react';

interface Child {
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
    badges: number;
    rank: number;
  };
  recentActivity: {
    lastQuiz: string;
    lastScore: number;
    lastActive: string;
  };
}

interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  children: Child[];
  notifications: {
    unread: number;
    urgent: number;
  };
}


interface DashboardOverviewTabProps {
  selectedChild?: Child;
  parent?: Parent;
  searchQuery?: string;
  onNavigateToMessages?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToMeetings?: () => void;
  onNavigateToReports?: () => void;
  onNavigateToSettings?: () => void;
}

const DashboardOverviewTab: React.FC<DashboardOverviewTabProps> = ({
  selectedChild,
  parent,
  searchQuery,
  onNavigateToMessages,
  onNavigateToCalendar,
  onNavigateToMeetings,
  onNavigateToReports,
  onNavigateToSettings
}) => {
  // Hook pour les statistiques réelles
  const { stats: realStats } = useRealStats();
  const { stats: parentStats } = useParentDashboardStats();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');






  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays === 0) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays === 1) {
      return `Demain à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays < 7) {
      return `Dans ${diffInDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const formatRelativeTime = (dateString: string) => {
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

  const getChildName = (childId?: string) => {
    if (!childId || !parent) return '';
    const child = parent.children.find(c => c.id === childId);
    return child ? child.firstName : '';
  };

  const calculateOverallStats = () => {
    // Utiliser les statistiques calculées par les hooks existants
    // qui récupèrent les données réelles des tentatives de quiz
    return {
      averageScore: parentStats.averageScore,
      totalQuizzes: realStats.totalQuizzes,
      completedQuizzes: parentStats.completedQuizzes,
      totalBadges: Math.floor(parentStats.completedQuizzes / 5), // Badges basés sur les quiz terminés
      bestRank: 1, // Rang par défaut
      totalMessages: parentStats.totalMessages,
      unreadMessages: parentStats.unreadMessages,
      totalMeetings: parentStats.totalMeetings,
      pendingMeetings: parentStats.pendingMeetings
    };
  };

  const overallStats = calculateOverallStats();

  return (
    <div className="space-y-6">
      {/* En-tête avec salutation */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold mb-2">
              Tableau de bord familial
            </h1>
            <p className="text-blue-200">
              {parent && parent.children.length > 1 
                ? `Suivi de ${parent.children.length} enfants`
                : selectedChild 
                  ? `Suivi de ${selectedChild.firstName}`
                  : 'Vue d\'ensemble'
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            
            <button 
              onClick={() => window.location.reload()}
              className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all"
              title="Actualiser"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-white text-2xl font-bold">{overallStats.averageScore}%</div>
              <div className="text-blue-300 text-sm">Score moyen</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm">Score des enfants</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-white text-2xl font-bold">{overallStats.completedQuizzes}</div>
              <div className="text-blue-300 text-sm">Quiz terminés</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-blue-300 text-sm">Quiz des enfants</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-white text-2xl font-bold">{overallStats.totalMessages}</div>
              <div className="text-blue-300 text-sm">Messages reçus</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-blue-300 text-sm">{overallStats.unreadMessages} non lus</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-white text-2xl font-bold">{overallStats.totalMeetings}</div>
              <div className="text-blue-300 text-sm">Rendez-vous</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-blue-300 text-sm">{overallStats.pendingMeetings} en attente</span>
          </div>
        </div>
      </div>



      {/* Résumé des enfants */}
      {parent && parent.children.length > 1 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-xl font-bold">Résumé par enfant</h2>
            <button 
              onClick={() => onNavigateToReports?.()}
              className="text-blue-400 hover:text-white transition-all"
            >
              Voir paiements →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {parent.children.map((child) => (
              <div key={child.id} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-4">
                  {child.avatar ? (
                    <img
                      src={child.avatar}
                      alt={child.firstName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-semibold">{child.firstName} {child.lastName}</h3>
                    <p className="text-blue-300 text-sm">{child.class} - {child.school}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-white text-xl font-bold">{child.stats.averageScore}%</div>
                    <div className="text-blue-300 text-xs">Score moyen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white text-xl font-bold">#{child.stats.rank}</div>
                    <div className="text-blue-300 text-xs">Classement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white text-xl font-bold">{child.stats.completedQuizzes}</div>
                    <div className="text-blue-300 text-xs">Quiz terminés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white text-xl font-bold">{child.stats.badges}</div>
                    <div className="text-blue-300 text-xs">Badges</div>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-200 text-sm">Dernière activité</span>
                    <span className="text-blue-400 text-xs">
                      {formatRelativeTime(child.recentActivity.lastActive)}
                    </span>
                  </div>
                  <div className="text-white text-sm">
                    {child.recentActivity.lastQuiz} - {child.recentActivity.lastScore}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h2 className="text-white text-xl font-bold mb-4">Actions rapides</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={onNavigateToMessages}
            className="flex flex-col items-center space-y-2 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
          >
            <MessageSquare className="w-8 h-8 text-blue-400" />
            <span className="text-white text-sm font-medium">Envoyer un message</span>
          </button>
          
          <button 
            onClick={onNavigateToMeetings}
            className="flex flex-col items-center space-y-2 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
          >
            <Calendar className="w-8 h-8 text-green-400" />
            <span className="text-white text-sm font-medium">Planifier RDV</span>
          </button>
          
          <button 
            onClick={onNavigateToReports}
            className="flex flex-col items-center space-y-2 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
          >
            <FileText className="w-8 h-8 text-purple-400" />
            <span className="text-white text-sm font-medium">Paiement</span>
          </button>
          
          <button 
            onClick={onNavigateToSettings}
            className="flex flex-col items-center space-y-2 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
          >
            <Settings className="w-8 h-8 text-orange-400" />
            <span className="text-white text-sm font-medium">Paramètres</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverviewTab;


