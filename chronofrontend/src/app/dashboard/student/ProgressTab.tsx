'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Star,
  Trophy,
  Medal,
  Crown,
  Zap,
  Brain,
  BookOpen,
  Clock,
  Calendar,
  User,
  Users,
  Eye,
  Filter,
  Download,
  Share2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  X,
  Check,
  Info,
  AlertCircle,
  CheckCircle,
  History,
  Globe,
  Compass,
  Flag,
  Mountain,
  Waves,
  TreePine,
  Flower,
  Sun,
  Moon,
  CloudRain,
  Wind,
  Thermometer,
  Umbrella,
  Rainbow,
  Snowflake,
  Flame,
  Sparkles,
  Heart,
  Smile,
  Frown,
  Meh,
  Activity,
  Loader2
} from 'lucide-react';

// Types et interfaces
interface Student {
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
}

interface ProgressData {
  subject: 'history' | 'geography' | 'emc' | 'both';
  period: string;
  scores: number[];
  dates: string[];
  averageScore: number;
  improvement: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  totalQuizzes: number;
}

interface SubjectProgress {
  subject: string;
  currentLevel: number;
  maxLevel: number;
  progress: number;
  recentScores: number[];
  trend: 'up' | 'down' | 'stable';
  nextMilestone: string;
}

interface ProgressTabProps {
  student?: Student;
  searchQuery?: string;
}

// Composant de chargement moderne avec animation
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Chargement en cours..." }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
      </div>
      <p className="text-blue-200 text-lg font-medium">{message}</p>
    </div>
  </div>
);

// Composant d'erreur
const ErrorDisplay: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center bg-red-500/10 backdrop-blur-sm rounded-2xl p-8 border border-red-500/20">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-red-200 mb-6 text-lg">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        Réessayer
      </button>
    </div>
  </div>
);

// État vide
const EmptyState: React.FC = () => (
  <div className="text-center py-16">
    <div className="w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
      <Activity className="w-16 h-16 text-blue-300" />
    </div>
    <h3 className="text-white text-2xl font-bold mb-4">Aucune donnée de progression</h3>
    <p className="text-blue-200 mb-8 max-w-md mx-auto leading-relaxed">
      Vous n'avez pas encore terminé de quiz. Commencez par passer quelques quiz pour voir votre progression !
    </p>
    <button
      onClick={() => window.location.href = '/dashboard/student?tab=quizzes'}
      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
    >
      Voir les quiz disponibles
    </button>
  </div>
);

// Graphique en barres responsive
const ModernBarChart: React.FC<{ 
  scores: number[]; 
  dates: string[];
  width?: number; 
  height?: number;
  getScoreColor: (score: number) => string;
  formatDate: (date: string) => string;
}> = ({ scores, dates, width, height = 160, getScoreColor, formatDate }) => {
  if (scores.length === 0) return null;
  
  const maxScore = 100;
  const padding = 20;
  const chartWidth = (width || 500) - (2 * padding);
  const chartHeight = height - (2 * padding);
  const barSpacing = 4;
  const barWidth = Math.max(20, (chartWidth - (scores.length - 1) * barSpacing) / scores.length);
  
  return (
    <div className="relative w-full">
      <svg 
        width="100%" 
        height={height} 
        viewBox={`0 0 ${width || 500} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Gradients pour les barres selon le score */}
          <linearGradient id="barGradientHigh" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="barGradientMedium" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="barGradientLow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="barGradientVeryLow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
        </defs>

        {/* Barres */}
        {scores.map((score, index) => {
          const barHeight = (score / maxScore) * chartHeight;
          const x = padding + index * (barWidth + barSpacing);
          const y = padding + chartHeight - barHeight;
          
          const gradientId = score >= 80 ? 'barGradientHigh' :
                            score >= 60 ? 'barGradientMedium' :
                            score >= 40 ? 'barGradientLow' : 'barGradientVeryLow';
          
          return (
            <g key={index} className="group">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={`url(#${gradientId})`}
                rx="4"
              />
              
              {/* Score au-dessus */}
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                className={`text-sm font-bold ${getScoreColor(score).replace('text-', 'fill-')}`}
              >
                {score}%
              </text>
              
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Grille des scores avec design moderne (gardée pour affichage complémentaire)
const ModernScoreGrid: React.FC<{
  scores: number[];
  dates: string[];
  getScoreColor: (score: number) => string;
  formatDate: (date: string) => string;
}> = ({ scores, dates, getScoreColor, formatDate }) => {
  if (scores.length === 0) return null;

  return (
    <div className="mt-4 grid grid-cols-7 gap-2">
      {scores.map((score, index) => (
        <div key={index} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative text-center p-2 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className={`text-sm font-bold ${getScoreColor(score)} mb-1`}>
              {score}%
            </div>
            <div className="text-xs text-blue-300">
              {dates[index] ? formatDate(dates[index]) : `Quiz ${index + 1}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Composant principal
const ProgressTab: React.FC<ProgressTabProps> = ({ student, searchQuery }) => {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'trimester' | 'year'>('month');
  const [selectedSubject, setSelectedSubject] = useState<'all' | 'history' | 'geography' | 'emc'>('all');
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartWidth, setChartWidth] = useState(400);

  // Hook pour détecter la taille de l'écran
  useEffect(() => {
    const updateChartWidth = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 768) {
        setChartWidth(300); // Mobile
      } else if (screenWidth < 1024) {
        setChartWidth(400); // Tablet
      } else if (screenWidth < 1440) {
        setChartWidth(500); // Desktop
      } else {
        setChartWidth(600); // Large desktop
      }
    };

    updateChartWidth();
    window.addEventListener('resize', updateChartWidth);
    return () => window.removeEventListener('resize', updateChartWidth);
  }, []);

  // Fonctions utilitaires
  const getTrendIcon = useCallback((trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  }, []);

  const getTrendColor = useCallback((trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-blue-400';
    }
  }, []);

  const getScoreColor = useCallback((score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  }, []);

  // Fonction de chargement des données
  const loadProgressData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userDetails = localStorage.getItem('userDetails');
      if (!userDetails) {
        throw new Error('Détails utilisateur non trouvés');
      }

      const user = JSON.parse(userDetails);
      const studentId = user.studentDetails?.id || user.id;

      if (!studentId) {
        throw new Error('ID étudiant non trouvé');
      }

      console.log('📄 Chargement de la progression pour l\'étudiant:', studentId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes/attempts?student_id=${studentId}`);
      
      if (!response.ok) {
        throw new Error(`Échec de récupération des tentatives: ${response.status}`);
      }

      const attempts = await response.json();
      console.log('📊 Tentatives de quiz récupérées:', attempts);

      const resultsWithDetails = await Promise.allSettled(
        attempts.map(async (attempt: any) => {
          const quizResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes/${attempt.quiz_id}`);
          if (!quizResponse.ok) return null;
          
          const quiz = await quizResponse.json();
          return { ...attempt, quiz };
        })
      );

      const validResults = resultsWithDetails
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value)
        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

      console.log('✅ Résultats valides:', validResults);

      const resultsBySubject = validResults.reduce((acc: { [key: string]: any[] }, result) => {
        const subject = result.quiz.subject;
        if (!acc[subject]) acc[subject] = [];
        acc[subject].push(result);
        return acc;
      }, {});

      const progressDataArray = Object.entries(resultsBySubject).map(([subject, subjectResults]) => {
        const recentResults = subjectResults.slice(0, 7).reverse();
        const scores = recentResults.map(r => r.percentage);
        const dates = recentResults.map(r => r.completed_at);
        
        let improvement = 0;
        if (scores.length >= 2) {
          improvement = scores[scores.length - 1] - scores[0];
        }
        
        const averageScore = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
        
        return {
          subject: subject.toLowerCase() === 'histoire' ? 'history' : 
                  subject.toLowerCase() === 'géographie' ? 'geography' : 
                  subject.toLowerCase() === 'emc' ? 'emc' : 'both',
          period: 'recent',
          scores,
          dates,
          averageScore,
          improvement: Math.round(improvement),
          strengths: [],
          weaknesses: [],
          recommendations: [],
          totalQuizzes: subjectResults.length
        };
      });

      setProgressData(progressDataArray as ProgressData[]);
      
      const subjectProgressData: SubjectProgress[] = progressDataArray.map((data: any) => ({
        subject: data.subject === 'history' ? 'Histoire' : 
                data.subject === 'geography' ? 'Géographie' : 
                data.subject === 'emc' ? 'EMC' : 'Mixte',
        currentLevel: Math.min(20, Math.max(1, Math.floor(data.averageScore / 5))),
        maxLevel: 20,
        progress: Math.min(100, Math.max(0, data.averageScore)),
        recentScores: data.scores,
        trend: data.improvement > 5 ? 'up' : data.improvement < -5 ? 'down' : 'stable',
        nextMilestone: data.improvement > 5 
          ? `Continuer la progression en ${data.subject === 'history' ? 'Histoire' : data.subject === 'geography' ? 'Géographie' : data.subject === 'emc' ? 'EMC' : 'cette matière'}`
          : data.improvement < -5
          ? `Améliorer les performances en ${data.subject === 'history' ? 'Histoire' : data.subject === 'geography' ? 'Géographie' : data.subject === 'emc' ? 'EMC' : 'cette matière'}`
          : `Maintenir le niveau en ${data.subject === 'history' ? 'Histoire' : data.subject === 'geography' ? 'Géographie' : data.subject === 'emc' ? 'EMC' : 'cette matière'}`
      }));
      
      setSubjectProgress(subjectProgressData);
      
      console.log('✅ Progression chargée:', {
        totalSubjects: progressDataArray.length,
        subjects: progressDataArray.map((d: any) => ({ subject: d.subject, quizzes: d.totalQuizzes, average: d.averageScore }))
      });
      
    } catch (err) {
      console.error('⚠ Erreur lors du chargement de la progression:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setProgressData([]);
      setSubjectProgress([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  const overallProgress = useMemo(() => {
    if (progressData.length === 0) return { average: 0, trend: 'stable', improvement: 0 };

    const totalAverage = progressData.reduce((sum, data) => sum + data.averageScore, 0) / progressData.length;
    const totalImprovement = progressData.reduce((sum, data) => sum + data.improvement, 0) / progressData.length;
    
    return {
      average: Math.round(totalAverage),
      trend: totalImprovement > 5 ? 'up' : totalImprovement < -5 ? 'down' : 'stable',
      improvement: Math.round(totalImprovement)
    };
  }, [progressData]);

  const filteredProgressData = useMemo(() => 
    progressData.filter(data => selectedSubject === 'all' || data.subject === selectedSubject),
    [progressData, selectedSubject]
  );

  if (loading) {
    return <LoadingSpinner message="Chargement de votre progression..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={loadProgressData} />;
  }

  return (
    <div className="space-y-8">
      {/* En-tête avec filtres modernisé */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/10 to-orange-400/10 rounded-full blur-2xl"></div>
        
        <div className="relative flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Mon Suivi de Progrès
            </h1>
            <p className="text-blue-200 text-lg">
              Analyse détaillée de votre performance académique
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
            
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value as any)}
              className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-300"
            >
              <option value="all">Toutes matières</option>
              <option value="history">Histoire</option>
              <option value="geography">Géographie</option>
              <option value="emc">EMC</option>
            </select>
          </div>
        </div>

        {/* Statistiques globales simplifiées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
            <div className={`text-3xl font-bold ${getScoreColor(overallProgress.average)} mb-2`}>
              {overallProgress.average}%
            </div>
            <div className="text-blue-300 text-sm">Score moyen</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
            <div className="text-white text-3xl font-bold mb-2">
              {progressData.reduce((sum, data) => sum + data.totalQuizzes, 0)}
            </div>
            <div className="text-blue-300 text-sm">Quiz terminés</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
            <div className="text-white text-3xl font-bold mb-2">{progressData.length}</div>
            <div className="text-blue-300 text-sm">Matières suivies</div>
          </div>
        </div>
      </div>

      {/* Progression par matière avec graphique en barres */}
      <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <h2 className="text-white text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            <span>Progression par matière</span>
          </h2>
          <p className="text-blue-300 mt-2">Évolution de vos scores aux derniers quiz</p>
        </div>
        
        <div className="space-y-8 p-8">
          {filteredProgressData.length === 0 ? (
            <EmptyState />
          ) : (
            filteredProgressData.map((data) => (
              <div key={data.subject} className="relative group">
                {/* Effet de brillance au survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                
                <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-2xl">
                  
                  {/* En-tête de la matière */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className={`p-4 rounded-2xl ${data.subject === 'history' 
                        ? 'bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30' 
                        : data.subject === 'geography'
                        ? 'bg-gradient-to-br from-green-400/20 to-emerald-500/20 border border-green-400/30'
                        : 'bg-gradient-to-br from-purple-400/20 to-violet-500/20 border border-purple-400/30'
                      }`}>
                  {data.subject === 'history' ? (
                          <History className="w-8 h-8 text-amber-400" />
                        ) : data.subject === 'geography' ? (
                          <Globe className="w-8 h-8 text-green-400" />
                        ) : (
                          <Brain className="w-8 h-8 text-purple-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-2xl capitalize">
                          {data.subject === 'history' ? 'Histoire' : data.subject === 'geography' ? 'Géographie' : 'EMC'}
                        </h3>
                        <p className="text-blue-300 text-sm">{data.totalQuizzes} quiz terminé{data.totalQuizzes > 1 ? 's' : ''}</p>
                      </div>
                </div>
                    
                    <div className="text-right">
                      <div className={`text-4xl font-bold ${getScoreColor(data.averageScore)} mb-2`}>
    {data.averageScore}%
                      </div>
                      <div className="flex items-center justify-end space-x-2">
    {(() => {
      const TrendIcon = getTrendIcon(data.improvement > 0 ? 'up' : data.improvement < 0 ? 'down' : 'stable');
                          const trendColor = getTrendColor(data.improvement > 0 ? 'up' : data.improvement < 0 ? 'down' : 'stable');
                          return (
                            <>
                              <div className={`p-2 rounded-full ${
                                data.improvement > 0 ? 'bg-green-400/20' : 
                                data.improvement < 0 ? 'bg-red-400/20' : 'bg-blue-400/20'
                              }`}>
                                <TrendIcon className={`w-5 h-5 ${trendColor}`} />
                              </div>
                              <span className={`text-lg font-semibold ${trendColor}`}>
      {data.improvement > 0 ? '+' : ''}{data.improvement}%
    </span>
                            </>
                          );
                        })()}
  </div>
</div>
              </div>

                  {/* Nouveau graphique en barres */}
                  <div className="mb-6">
                    <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-semibold text-lg flex items-center space-x-2">
                          <BarChart3 className="w-5 h-5 text-blue-400" />
                          <span>Scores des derniers quiz</span>
                        </h4>
                        <div className="text-blue-300 text-sm">
                          {data.scores.length} résultat{data.scores.length > 1 ? 's' : ''}
                        </div>
                      </div>
                      
                                             {data.scores.length > 0 ? (
                         <div className="w-full">
                           <ModernBarChart 
                             scores={data.scores} 
                             dates={data.dates}
                             width={chartWidth}
                             height={180}
                             getScoreColor={getScoreColor}
                             formatDate={formatDate}
                           />
                         </div>
                       ) : (
                        <div className="flex items-center justify-center h-32 text-blue-300">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
                              <BarChart3 className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium">Aucune donnée disponible</p>
                          </div>
                </div>
                      )}
              </div>

                    {/* Légende et informations */}
                    <div className="flex justify-between items-center text-sm mt-4 px-2">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                          <span className="text-blue-300">Excellent (≥80%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                          <span className="text-blue-300">Bien (≥60%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                          <span className="text-blue-300">Moyen (≥40%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                          <span className="text-blue-300">À améliorer (&lt;40%)</span>
                  </div>
                </div>
                      <span className="text-blue-300">
                        Moyenne: {data.averageScore}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Statistiques détaillées */}
                  {data.scores.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-400 mb-1">
                            {Math.max(...data.scores)}%
                          </div>
                          <div className="text-blue-300 text-sm">Meilleur score</div>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400 mb-1">
                            {data.averageScore}%
                </div>
                          <div className="text-blue-300 text-sm">Score moyen</div>
                </div>
              </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400 mb-1">
                            {Math.min(...data.scores)}%
                          </div>
                          <div className="text-blue-300 text-sm">Score le plus bas</div>
            </div>
        </div>
      </div>
                  )}
                  
                  {/* Badge de performance */}
                  <div className="pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-xl ${
                          data.averageScore >= 80 ? 'bg-gradient-to-r from-green-400/20 to-emerald-500/20' :
                          data.averageScore >= 60 ? 'bg-gradient-to-r from-blue-400/20 to-indigo-500/20' :
                          data.averageScore >= 40 ? 'bg-gradient-to-r from-yellow-400/20 to-orange-500/20' :
                          'bg-gradient-to-r from-red-400/20 to-pink-500/20'
                        }`}>
                          {data.averageScore >= 80 ? <Trophy className="w-6 h-6 text-green-400" /> :
                           data.averageScore >= 60 ? <Medal className="w-6 h-6 text-blue-400" /> :
                           data.averageScore >= 40 ? <Star className="w-6 h-6 text-yellow-400" /> :
                           <Target className="w-6 h-6 text-red-400" />}
                  </div>
                        <div>
                          <div className="text-white font-semibold">
                            {data.averageScore >= 80 ? 'Excellent niveau !' :
                             data.averageScore >= 60 ? 'Bon niveau' :
                             data.averageScore >= 40 ? 'En progression' :
                             'À améliorer'}
                </div>
                          <div className="text-blue-300 text-sm">
                            Performance globale en {data.subject === 'history' ? 'Histoire' : data.subject === 'geography' ? 'Géographie' : 'EMC'}
                  </div>
                  </div>
                </div>
                
                      {/* Barre de progression circulaire */}
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="4"
                            fill="none"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke={data.averageScore >= 80 ? '#10B981' : 
                                   data.averageScore >= 60 ? '#3B82F6' :
                                   data.averageScore >= 40 ? '#F59E0B' : '#EF4444'}
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - data.averageScore / 100)}`}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{data.averageScore}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressTab;

