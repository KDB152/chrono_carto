'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
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
  Map,
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
  Meh
} from 'lucide-react';
import urlapi from '@/config/url';
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
  children: Child[];
}

interface ProgressData {
  childId: string;
  subject: 'history' | 'geography' | 'both';
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

interface ChildrenProgressTabProps {
  selectedChild?: Child;
  parent?: Parent;
  searchQuery?: string;
}

const ChildrenProgressTab: React.FC<ChildrenProgressTabProps> = ({
  selectedChild,
  parent,
  searchQuery
}) => {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'trimester' | 'year'>('month');
  const [selectedSubject, setSelectedSubject] = useState<'all' | 'history' | 'geography' | 'emc'>('all');
  const [comparisonMode, setComparisonMode] = useState<'individual' | 'comparative'>('individual');
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  const [childData, setChildData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [localSelectedChild, setLocalSelectedChild] = useState<Child | null>(null);
  const [parentChildren, setParentChildren] = useState<Child[]>([]);

  // Debug logs
  console.log('🔍 ChildrenProgressTab - selectedChild:', selectedChild);
  console.log('🔍 ChildrenProgressTab - parent:', parent);
  console.log('🔍 ChildrenProgressTab - localSelectedChild:', localSelectedChild);
  console.log('🔍 ChildrenProgressTab - parentChildren:', parentChildren);

  // Charger les enfants du parent
  useEffect(() => {
    const loadParentChildren = async () => {
      try {
        // Récupérer l'ID du parent connecté depuis le localStorage
        const userDetails = localStorage.getItem('userDetails');
        if (!userDetails) {
          console.error('No user data found in localStorage');
          return;
        }
        
        const user = JSON.parse(userDetails);
        console.log('🔍 Chargement des enfants pour le parent ID:', user.id);
        
        // Récupérer l'ID du parent depuis la base de données
      
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        
        // D'abord, récupérer l'ID du parent
        const parentResponse = await fetch(`${urlapi.backendurlsapi.parentbyuser}/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!parentResponse.ok) {
          console.warn('⚠️ Parent non trouvé');
          setParentChildren([]);
          return;
        }
        
        const parentData = await parentResponse.json();
        console.log('✅ Données parent récupérées:', parentData);
        
        // Maintenant récupérer les enfants via la nouvelle API
        const childrenResponse = await fetch(`${urlapi.backendurlsapi.parentbychildren}?parentId=${parentData.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!childrenResponse.ok) {
          console.warn('⚠️ Aucun enfant trouvé');
          setParentChildren([]);
          return;
        }
        
        const children = await childrenResponse.json();
        console.log('✅ Enfants récupérés:', children);
        
        // Transformer les données des enfants et récupérer les scores réels
        const processedChildren: Child[] = children && children.length > 0 
          ? await Promise.all(
              children.map(async (child: any) => {
            let averageScore = 0;
            let totalQuizzes = 0;
            
            // Utiliser les scores déjà fournis par l'API
            averageScore = child.averageScore || 0;
            totalQuizzes = child.totalQuizAttempts || 0;
            
            console.log(`📊 Scores pour ${child.firstName} ${child.lastName}: ${averageScore}% (${totalQuizzes} quiz)`);
            
            return {
              id: child.id ? child.id.toString() : '',
              firstName: child.firstName || '',
              lastName: child.lastName || '',
              avatar: undefined, // Pas d'avatar par défaut
              class: child.classLevel || '',
              level: 'Terminale', // Valeur par défaut
              school: 'École par défaut',
              teacher: 'Professeur par défaut',
              stats: {
                averageScore: averageScore, // Score moyen réel
                totalQuizzes: totalQuizzes, // Nombre réel de quiz
                completedQuizzes: totalQuizzes,
                currentStreak: 0,
                badges: 0,
                rank: 1
              },
              recentActivity: {
                lastQuiz: totalQuizzes > 0 ? 'Quiz récent' : 'Aucun quiz',
                lastScore: averageScore,
                lastActive: new Date().toISOString()
              }
            };
          })
        ) : [];
        
        setParentChildren(processedChildren);
        console.log('✅ Enfants chargés:', processedChildren);
        
      } catch (error) {
        console.error('❌ Erreur lors du chargement des enfants:', error);
        setParentChildren([]);
      }
    };

    loadParentChildren();
  }, []);

  // Charger les données de progression de l'enfant sélectionné
  useEffect(() => {
    const loadChildProgressData = async () => {
      const currentChild = localSelectedChild || selectedChild;
      if (!currentChild?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Utiliser la même API que l'onglet Progrès de l'étudiant
        const response = await fetch(`${urlapi.backendurlsapi.attempts}?student_id=${currentChild.id}`);
        
        if (!response.ok) {
          throw new Error(`Échec de récupération des tentatives: ${response.status}`);
        }

        const attempts = await response.json();
        console.log('📊 Tentatives de quiz récupérées pour l\'enfant:', attempts);

        // Récupérer les détails des quiz pour chaque tentative
        const resultsWithDetails = await Promise.allSettled(
          attempts.map(async (attempt: any) => {
            const quizResponse = await fetch(`${urlapi.backendurlsapi.quizzes}/${attempt.quiz_id}`);
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

        console.log('✅ Résultats valides pour l\'enfant:', validResults);

        // Organiser les résultats par matière
        const resultsBySubject = validResults.reduce((acc: { [key: string]: any[] }, result) => {
          const subject = result.quiz.subject;
          if (!acc[subject]) acc[subject] = [];
          acc[subject].push(result);
          return acc;
        }, {});

        // Créer les données de progression pour chaque matière
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
                         childId: currentChild.id,
            subject: subject.toLowerCase() === 'histoire' ? 'history' : subject.toLowerCase() === 'géographie' ? 'geography' : 'both',
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
        
        // Créer les données de progression par matière
        const subjectProgressData: SubjectProgress[] = progressDataArray.map((data: any) => ({
          subject: data.subject === 'history' ? 'Histoire' : 
                  data.subject === 'geography' ? 'Géographie' : 
                  data.subject === 'emc' ? 'EMC' : 'Autre',
          currentLevel: Math.min(20, Math.max(1, Math.floor(data.averageScore / 5))),
          maxLevel: 20,
          progress: Math.min(100, Math.max(0, data.averageScore)),
          recentScores: data.scores,
          quizzesCompleted: data.totalQuizzes,
          averageScore: data.averageScore,
          lastActivity: new Date().toISOString(),
          strengths: [],
          weaknesses: [],
          trend: data.improvement > 0 ? 'up' : data.improvement < 0 ? 'down' : 'stable',
          nextMilestone: `${Math.min(100, Math.ceil(data.averageScore / 10) * 10)}%`
        }));
        
        // Stocker les données de progression par matière
        setSubjectProgress(subjectProgressData);
        
        // Créer les données de l'enfant
        setChildData({
          id: currentChild.id,
          fullName: `${currentChild.firstName} ${currentChild.lastName}`,
          classLevel: currentChild.class,
          stats: {
            level: currentChild.level,
            averageScore: progressDataArray.length > 0 ? 
              Math.round(progressDataArray.reduce((sum, data) => sum + data.averageScore, 0) / progressDataArray.length) : 0,
            totalQuizzes: validResults.length
          },
          quizResults: validResults.map(result => ({
            id: result.attempt_id,
            quizTitle: result.quiz.title,
            subject: result.quiz.subject,
            percentage: result.percentage,
            questionsCorrect: result.score,
            questionsTotal: result.total_points,
            completedAt: result.completed_at,
            timeSpent: result.time_spent,
          })),
          achievements: []
        });
        
        console.log('✅ Progression chargée pour l\'enfant:', {
          totalSubjects: progressDataArray.length,
          subjects: progressDataArray.map((d: any) => ({ subject: d.subject, quizzes: d.totalQuizzes, average: d.averageScore }))
        });
        
      } catch (error) {
        console.error('⚠ Erreur lors du chargement de la progression de l\'enfant:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChildProgressData();
  }, [selectedChild?.id, localSelectedChild?.id]);

  // Fonction pour filtrer les données par matière
  const getFilteredProgressData = () => {
    if (selectedSubject === 'all') {
      return progressData;
    }
    
    return progressData.filter(data => {
      if (selectedSubject === 'history') return data.subject === 'history';
      if (selectedSubject === 'geography') return data.subject === 'geography';
      if (selectedSubject === 'emc') return data.subject === 'emc';
      return false;
    });
  };

  const getChildProgressData = (childId: string) => {
    return progressData.filter(data => data.childId === childId);
  };

  // Fonctions utilitaires
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  // Composant de graphique en barres pour les parents
  const ParentBarChart: React.FC<{ 
    scores: number[]; 
    dates: string[];
    width?: number; 
    height?: number;
  }> = ({ scores, dates, width = 400, height = 160 }) => {
    if (scores.length === 0) return null;
    
    const maxScore = 100;
    const padding = 20;
    const chartWidth = width - (2 * padding);
    const chartHeight = height - (2 * padding);
    const barSpacing = 4;
    const barWidth = Math.max(20, (chartWidth - (scores.length - 1) * barSpacing) / scores.length);
    
    return (
      <div className="relative w-full">
        <svg 
          width="100%" 
          height={height} 
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradients pour les barres selon le score */}
            <linearGradient id="parentBarGradientHigh" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="parentBarGradientMedium" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="parentBarGradientLow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="parentBarGradientVeryLow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
          </defs>

          {/* Barres */}
          {scores.map((score, index) => {
            const barHeight = (score / maxScore) * chartHeight;
            const x = padding + index * (barWidth + barSpacing);
            const y = padding + chartHeight - barHeight;
            
            const gradientId = score >= 80 ? 'parentBarGradientHigh' :
                              score >= 60 ? 'parentBarGradientMedium' :
                              score >= 40 ? 'parentBarGradientLow' : 'parentBarGradientVeryLow';
            
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };


  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-green-500 to-emerald-600';
    if (progress >= 60) return 'from-blue-500 to-indigo-600';
    if (progress >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const calculateOverallProgress = (child: Child) => {
    const childData = getChildProgressData(child.id);
    if (childData.length === 0) return { average: 0, trend: 'stable', improvement: 0 };

    const totalAverage = childData.reduce((sum, data) => sum + data.averageScore, 0) / childData.length;
    const totalImprovement = childData.reduce((sum, data) => sum + data.improvement, 0) / childData.length;
    
    return {
      average: Math.round(totalAverage),
      trend: totalImprovement > 5 ? 'up' : totalImprovement < -5 ? 'down' : 'stable',
      improvement: Math.round(totalImprovement)
    };
  };

  const renderChildCard = (child: Child) => {
    const progress = calculateOverallProgress(child);
    const TrendIcon = getTrendIcon(progress.trend);
    const childData = getChildProgressData(child.id);

    return (
      <div key={child.id} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        {/* En-tête de l'enfant */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center space-x-4">
            {child.avatar ? (
              <img
                src={child.avatar}
                alt={child.firstName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="text-white text-xl font-bold">{child.firstName} {child.lastName}</h3>
              <p className="text-blue-200">{child.class} - {child.school}</p>
              <p className="text-blue-300 text-sm">Professeur: {child.teacher}</p>
            </div>
            
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(progress.average)}`}>
                {progress.average}%
              </div>
              <div className="flex items-center space-x-1">
                <TrendIcon className={`w-4 h-4 ${getTrendColor(progress.trend)}`} />
                <span className={`text-sm ${getTrendColor(progress.trend)}`}>
                  {progress.improvement > 0 ? '+' : ''}{progress.improvement}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="p-6 border-b border-white/20">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-white text-lg font-bold">{child.stats.completedQuizzes}</div>
              <div className="text-blue-300 text-xs">Quiz terminés</div>
            </div>
            <div className="text-center">
              <div className="text-white text-lg font-bold">#{child.stats.rank}</div>
              <div className="text-blue-300 text-xs">Classement</div>
            </div>
            <div className="text-center">
              <div className="text-white text-lg font-bold">{child.stats.currentStreak}</div>
              <div className="text-blue-300 text-xs">Série actuelle</div>
            </div>
          </div>
        </div>

        {/* Progression par matière */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-semibold">Progression par matière</h4>
            <button
              onClick={() => setShowDetails(prev => ({ ...prev, [child.id]: !prev[child.id] }))}
              className="text-blue-400 hover:text-white transition-all"
            >
              {showDetails[child.id] ? 'Masquer' : 'Détails'}
            </button>
          </div>

          <div className="space-y-4">
            {childData.map((data) => (
              <div key={`${data.childId}-${data.subject}`} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {data.subject === 'history' ? (
                      <History className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Globe className="w-5 h-5 text-green-400" />
                    )}
                    <span className="text-white font-medium capitalize">{data.subject === 'history' ? 'Histoire' : 'Géographie'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-bold ${getScoreColor(data.averageScore)}`}>
                      {data.averageScore}%
                    </span>
                    <div className="flex items-center space-x-1">
                      {data.improvement > 0 ? (
                        <ArrowUp className="w-4 h-4 text-green-400" />
                      ) : data.improvement < 0 ? (
                        <ArrowDown className="w-4 h-4 text-red-400" />
                      ) : (
                        <Minus className="w-4 h-4 text-blue-400" />
                      )}
                      <span className={`text-sm ${
                        data.improvement > 0 ? 'text-green-400' : 
                        data.improvement < 0 ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {data.improvement > 0 ? '+' : ''}{data.improvement}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Graphique de progression simplifié */}
                <div className="mb-3">
                  <div className="flex items-end space-x-1 h-16">
                    {data.scores.slice(-7).map((score, index) => (
                      <div
                        key={index}
                        className={`flex-1 bg-gradient-to-t ${getProgressColor(score)} rounded-t opacity-80`}
                        style={{ height: `${(score / 100) * 100}%` }}
                        title={`${score}%`}
                      />
                    ))}
                  </div>
                  <div className="text-blue-300 text-xs text-center mt-1">
                    Évolution des 7 derniers quiz
                  </div>
                </div>

                {/* Détails étendus */}
                {showDetails[child.id] && (
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    {/* Points forts */}
                    <div>
                      <h5 className="text-green-400 font-medium mb-2 flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Points forts</span>
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {data.strengths.map((strength, index) => (
                          <span key={index} className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Points à améliorer */}
                    <div>
                      <h5 className="text-orange-400 font-medium mb-2 flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>À améliorer</span>
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {data.weaknesses.map((weakness, index) => (
                          <span key={index} className="bg-orange-500/20 text-orange-300 text-xs px-2 py-1 rounded">
                            {weakness}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recommandations */}
                    <div>
                      <h5 className="text-blue-400 font-medium mb-2 flex items-center space-x-2">
                        <Target className="w-4 h-4" />
                        <span>Recommandations</span>
                      </h5>
                      <ul className="space-y-1">
                        {data.recommendations.map((recommendation, index) => (
                          <li key={index} className="text-blue-200 text-sm flex items-start space-x-2">
                            <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderComparativeView = () => {
    if (!parent || parent.children.length < 2) {
      return (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 border border-white/20 text-center">
          <Users className="w-16 h-16 text-blue-300 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">Comparaison non disponible</h3>
          <p className="text-blue-200">Il faut au moins 2 enfants pour afficher la vue comparative</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Comparaison globale */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-white text-xl font-bold mb-6">Comparaison des performances</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {parent.children.map((child) => {
              const progress = calculateOverallProgress(child);
              const TrendIcon = getTrendIcon(progress.trend);
              
              return (
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
                      <h4 className="text-white font-semibold">{child.firstName}</h4>
                      <p className="text-blue-300 text-sm">{child.class}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Score moyen</span>
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${getScoreColor(progress.average)}`}>
                          {progress.average}%
                        </span>
                        <TrendIcon className={`w-4 h-4 ${getTrendColor(progress.trend)}`} />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Classement</span>
                      <span className="text-white font-bold">#{child.stats.rank}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">Quiz terminés</span>
                      <span className="text-white font-bold">{child.stats.completedQuizzes}</span>
                    </div>
                    
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Graphique comparatif */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-white text-xl font-bold mb-6">Évolution comparative</h3>
          
          <div className="h-64 flex items-end space-x-4">
            {parent.children.map((child, childIndex) => {
              const childData = getChildProgressData(child.id);
              const historyData = childData.find(d => d.subject === 'history');
              const geographyData = childData.find(d => d.subject === 'geography');
              
              return (
                <div key={child.id} className="flex-1 space-y-2">
                  <div className="text-center">
                    <div className="text-white font-semibold text-sm">{child.firstName}</div>
                  </div>
                  
                  <div className="space-y-1">
                    {historyData && (
                      <div
                        className="bg-gradient-to-t from-amber-500 to-orange-600 rounded-t"
                        style={{ height: `${(historyData.averageScore / 100) * 200}px` }}
                        title={`Histoire: ${historyData.averageScore}%`}
                      />
                    )}
                    {geographyData && (
                      <div
                        className="bg-gradient-to-t from-green-500 to-emerald-600 rounded-t"
                        style={{ height: `${(geographyData.averageScore / 100) * 200}px` }}
                        title={`Géographie: ${geographyData.averageScore}%`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded"></div>
              <span className="text-blue-200 text-sm">Histoire</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded"></div>
              <span className="text-blue-200 text-sm">Géographie</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-200">Chargement des données de progression...</p>
        </div>
      </div>
    );
  }

  if (!selectedChild && !localSelectedChild) {
    return (
      <div className="space-y-6">
        {/* Sélecteur d'enfant */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-white text-2xl font-bold mb-6">Sélectionner un enfant</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parentChildren.length > 0 && (
              parentChildren.map((child) => (
              <button
                key={child.id}
                onClick={() => {
                  // Sélectionner l'enfant localement
                  setLocalSelectedChild(child);
                }}
                className="p-6 bg-white/5 rounded-xl border border-white/20 hover:border-white/40 transition-all text-left group"
              >
                <div className="flex items-center space-x-4">
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
                    <h3 className="text-white font-semibold text-lg group-hover:text-blue-300 transition-colors">
                      {child.firstName} {child.lastName}
                    </h3>
                    <p className="text-blue-200 text-sm">{child.class} - {child.school}</p>
                    <p className="text-blue-300 text-xs">Score moyen: {child.stats.averageScore}%</p>
                  </div>
                </div>
              </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!childData) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-16 h-16 text-blue-300 mx-auto mb-4 opacity-50" />
        <h3 className="text-white text-lg font-semibold mb-2">Aucune donnée disponible</h3>
        <p className="text-blue-200">Chargement des données de progression...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec informations de l'enfant */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-white text-2xl font-bold">Progrès de {childData.fullName}</h1>
            </div>
            <p className="text-blue-200">
              Classe: {childData.classLevel} | Niveau: {childData.stats.level}
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
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">Toutes matières</option>
              <option value="history">Histoire</option>
              <option value="geography">Géographie</option>
              <option value="emc">EMC</option>
            </select>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-white text-2xl font-bold">{childData.stats.averageScore}%</div>
            <div className="text-blue-300 text-sm">Score moyen</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-white text-2xl font-bold">{childData.stats.completedQuizzes}</div>
            <div className="text-blue-300 text-sm">Quiz terminés</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-white text-2xl font-bold">{childData.stats.currentStreak}</div>
            <div className="text-blue-300 text-sm">Série actuelle</div>
          </div>
        </div>
      </div>

      {/* Progression par matière avec graphiques en barres */}
      <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <h2 className="text-white text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            <span>Progression par matière</span>
          </h2>
          <p className="text-blue-300 mt-2">Évolution des scores aux derniers quiz</p>
        </div>

        <div className="space-y-8 p-8">
          {getFilteredProgressData().length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Aucune donnée disponible</h3>
              <p className="text-blue-300">Votre enfant n'a pas encore de résultats de quiz</p>
            </div>
          ) : (
            getFilteredProgressData().map((data) => (
              <div key={data.subject} className="relative group">
                <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className={`p-4 rounded-2xl ${data.subject === 'history'
                        ? 'bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30'
                        : data.subject === 'geography'
                        ? 'bg-gradient-to-br from-green-400/20 to-emerald-500/20 border border-green-400/30'
                        : 'bg-gradient-to-br from-purple-400/20 to-pink-500/20 border border-purple-400/30'
                      }`}>
                        {data.subject === 'history' ? (
                          <History className="w-8 h-8 text-amber-400" />
                        ) : data.subject === 'geography' ? (
                          <Globe className="w-8 h-8 text-green-400" />
                        ) : (
                          <BookOpen className="w-8 h-8 text-purple-400" />
                        )}
                </div>
                      <div>
                        <h3 className="text-white font-bold text-2xl capitalize">
                          {data.subject === 'history' ? 'Histoire' : 
                           data.subject === 'geography' ? 'Géographie' : 
                           data.subject === 'emc' ? 'EMC' : data.subject}
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
              
                  {/* Graphique en barres */}
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
                          <ParentBarChart
                            scores={data.scores}
                            dates={data.dates}
                            width={400}
                            height={180}
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

                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Activité récente */}
      {childData.quizResults.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-white text-xl font-bold mb-6">Activité récente</h3>
          
          <div className="space-y-4">
            {childData.quizResults.slice(0, 5).map((quiz: any) => (
              <div key={quiz.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold">{quiz.quizTitle}</h4>
                    <p className="text-blue-300 text-sm capitalize">{quiz.subject}</p>
                    <p className="text-blue-200 text-xs">
                      {new Date(quiz.completedAt).toLocaleDateString('fr-FR')} • {quiz.timeSpent} secondes
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-lg font-bold">{quiz.percentage}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ChildrenProgressTab;

