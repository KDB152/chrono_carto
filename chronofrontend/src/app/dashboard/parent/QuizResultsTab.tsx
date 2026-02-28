'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Target,
  Award,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  User,
  Eye,
  Download,
  Share2,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  BarChart3,
  PieChart,
  LineChart,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  BookOpen,
  History,
  Globe,
  X,
  Trophy,
  Medal,
  Crown,
  Zap,
  Brain,
  Heart,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  MoreHorizontal,
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
  Users,
  Shield,
  Lock,
  Key,
  CreditCard,
  Wallet,
  Coins,
  DollarSign,
  Euro,
  Bitcoin,
  Receipt,
  Calculator,
  PiggyBank,
  Gauge,
  Timer,
  Hourglass,
  AlarmClock,
  Watch,
  Sunrise,
  Sunset,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Umbrella,
  Rainbow,
  Snowflake,
  Droplets,
  Waves,
  TreePine,
  Flower,
  Leaf,
  Sprout,
  Shell,
  Bug,
  Bird,
  Fish,
  Rabbit,
  Turtle,
  Snail,
  Worm,
  Dna,
  Atom,
  Magnet,
  Flashlight,
  Lightbulb,
  Sparkles,
  Gift,
  Cake,
  IceCream,
  Coffee,
  Wine,
  Beer,
  Milk,
  MessageSquare
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
}

interface Parent {
  id: string;
  children: Child[];
}

interface QuizResult {
  id: string;
  childId: string;
  quizTitle: string;
  subject: 'history' | 'geography' | 'both';
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
  questionsTotal: number;
  questionsCorrect: number;
  questionsIncorrect: number;
  teacherComment?: string;
  strengths: string[];
  weaknesses: string[];
  badges: string[];
  attempts: number;
  isImprovement: boolean;
  previousScore?: number;
}

interface QuizResultsTabProps {
  selectedChild?: Child;
  parent?: Parent;
  searchQuery?: string;
}

const QuizResultsTab: React.FC<QuizResultsTabProps> = ({
  selectedChild,
  parent,
  searchQuery
}) => {
  // Debug logs
  console.log('🔍 QuizResultsTab - selectedChild reçu:', selectedChild);
  console.log('🔍 QuizResultsTab - parent reçu:', parent);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'trimester' | 'year'>('month');
  const [selectedSubject, setSelectedSubject] = useState<'all' | 'history' | 'geography'>('all');
  const [selectedChild_, setSelectedChild_] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'score' | 'subject' | 'difficulty'>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [childData, setChildData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Charger les données de quiz
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setLoading(true);
        
        // Récupérer l'ID utilisateur depuis localStorage
        const userData = localStorage.getItem('userDetails');
        if (!userData) {
          throw new Error('Utilisateur non connecté');
        }
        
        const user = JSON.parse(userData);
        console.log('🔍 QuizResultsTab - selectedChild:', selectedChild);
        console.log('🔍 QuizResultsTab - user.id:', user.id);
        
        // Si un enfant spécifique est sélectionné, charger ses résultats
        if (selectedChild?.id && selectedChild.id !== 'all' && selectedChild.id !== undefined) {
          console.log('🔍 Chargement des résultats pour l\'enfant:', selectedChild.id);
          
          // Utiliser directement l'endpoint /api/quizzes/attempts comme dans le student dashboard
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://www.chronocarto.tn/api';
          const response = await fetch(`${API_BASE}/quizzes/attempts?student_id=${selectedChild.id}`);
          
          if (response.ok) {
            const attempts = await response.json();
            console.log('✅ Tentatives récupérées:', attempts);
            
            // Récupérer les détails des quiz pour chaque tentative
            const resultsWithDetails = await Promise.allSettled(
              attempts.map(async (attempt: any) => {
                try {
                  // Récupérer les détails du quiz
                  const quizResponse = await fetch(`${API_BASE}/quizzes/${attempt.quiz_id}`);
                  if (!quizResponse.ok) return null;
                  
                  const quiz = await quizResponse.json();
                  
                  // Récupérer les questions du quiz pour calculer les statistiques
                  const questionsResponse = await fetch(`${API_BASE}/quizzes/${attempt.quiz_id}/questions`);
                  let questions = [];
                  if (questionsResponse.ok) {
                    questions = await questionsResponse.json();
                  }
                  
                  // Récupérer les réponses de l'étudiant
                  const answersResponse = await fetch(`${API_BASE}/quizzes/attempts/${attempt.id}/answers`);
                  let studentAnswers = {};
                  if (answersResponse.ok) {
                    studentAnswers = await answersResponse.json();
                  }
                  
                  // Calculer les statistiques
                  const questionsTotal = questions.length;
                  const questionsCorrect = Object.values(studentAnswers).filter((answer: any, index: number) => {
                    const question = questions[index];
                    return question && answer === question.correct_answer;
                  }).length;
                  
                  return {
                    id: attempt.id.toString(),
                    childId: attempt.student_id.toString(),
                    quizTitle: quiz.title,
                    subject: quiz.subject === 'Histoire' ? 'history' : quiz.subject === 'Géographie' ? 'geography' : 'both',
                    score: attempt.score,
                    maxScore: attempt.total_points,
                    percentage: attempt.percentage,
                    completedAt: attempt.completed_at,
                    questionsTotal: questionsTotal,
                    questionsCorrect: questionsCorrect,
                    questionsIncorrect: questionsTotal - questionsCorrect,
                    teacherComment: undefined,
                    strengths: ['Compréhension'],
                    weaknesses: ['À améliorer'],
                    badges: [],
                    attempts: 1,
                    isImprovement: attempt.percentage > 60,
                    previousScore: undefined
                  };
                } catch (error) {
                  console.error(`Error fetching details for attempt ${attempt.id}:`, error);
                  return null;
                }
              })
            );
            
            // Filtrer les résultats null et trier par date
            const validResults = resultsWithDetails
              .filter((result): result is PromiseFulfilledResult<QuizResult> => 
                result.status === 'fulfilled' && result.value !== null
              )
              .map(result => result.value)
              .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
            
            console.log('✅ Résultats transformés:', validResults);
            setResults(validResults);
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.warn('⚠️ Erreur lors du chargement des tentatives:', response.status, errorData);
            setResults([]);
          }
        } else {
          // Aucun enfant sélectionné, ne pas charger de résultats
          console.log('🔍 Aucun enfant sélectionné, pas de résultats à charger');
          setResults([]);
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement des données enfant:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, [selectedChild?.id]); // Se déclenche au montage ET quand selectedChild change


  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'history': return History;
      case 'geography': return Globe;
      case 'both': return BookOpen;
      default: return FileText;
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'history': return 'from-amber-500 to-orange-600';
      case 'geography': return 'from-green-500 to-emerald-600';
      case 'both': return 'from-blue-500 to-indigo-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };


  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 70) return 'from-blue-500 to-indigo-600';
    if (score >= 50) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const getChildName = (childId: string) => {
    // Essayer d'abord avec les données parent
    if (parent?.children) {
      const child = parent.children.find(c => c.id === childId);
      if (child) {
        return `${child.firstName} ${child.lastName}`;
      }
    }
    
    // Utiliser le nom de l'enfant sélectionné
    if (selectedChild?.firstName && selectedChild?.lastName) {
      return `${selectedChild.firstName} ${selectedChild.lastName}`;
    }
    
    return 'Étudiant';
  };

  const filteredResults = results.filter(result => {
    const matchesSearch = result.quizTitle.toLowerCase().includes(searchQuery?.toLowerCase() || '');
    const matchesSubject = selectedSubject === 'all' || result.subject === selectedSubject;
    const matchesChild = selectedChild_ === 'all' || result.childId === selectedChild_;
    
    return matchesSearch && matchesSubject && matchesChild;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      case 'score':
        return b.percentage - a.percentage;
      case 'subject':
        return a.subject.localeCompare(b.subject);
      default:
        return 0;
    }
  });

  const calculateStats = () => {
    if (filteredResults.length === 0) {
      return {
        averageScore: 0,
        totalQuizzes: 0,
        improvements: 0,
        totalBadges: 0,
      };
    }

    const stats = filteredResults.reduce((acc, result) => {
      acc.averageScore += result.percentage;
      acc.totalQuizzes += 1;
      acc.improvements += result.isImprovement ? 1 : 0;
      acc.totalBadges += result.badges.length;
      return acc;
    }, {
      averageScore: 0,
      totalQuizzes: 0,
      improvements: 0,
      totalBadges: 0,
    });

    return {
      ...stats,
      averageScore: Math.round(stats.averageScore / stats.totalQuizzes),
    };
  };

  const stats = calculateStats();

  const renderResultCard = (result: QuizResult) => {
    const SubjectIcon = getSubjectIcon(result.subject);
    const childName = getChildName(result.childId);
    
    return (
      <div
        key={result.id}
        onClick={() => {
          setSelectedResult(result);
          setShowResultModal(true);
        }}
        className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 cursor-pointer transition-all hover:scale-105 hover:bg-white/15"
      >
        {/* En-tête */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${getSubjectColor(result.subject)} rounded-xl flex items-center justify-center`}>
              <SubjectIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base">{result.quizTitle}</h3>
              <p className="text-blue-200 text-sm">{childName} - {formatDate(result.completedAt)}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-base font-bold ${getScoreColor(result.percentage)}`}>
              {result.percentage}%
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-white text-base font-bold">{result.questionsCorrect}/{result.questionsTotal}</div>
            <div className="text-blue-300 text-xs">Bonnes réponses</div>
          </div>
          <div className="text-center">
            <div className="text-white text-base font-bold">{result.percentage}%</div>
            <div className="text-blue-300 text-xs">Score</div>
          </div>
        </div>

        {/* Badges et amélioration */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-wrap gap-1">
            {result.badges.slice(0, 2).map((badge, index) => (
              <span key={index} className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                {badge}
              </span>
            ))}
            {result.badges.length > 2 && (
              <span className="text-yellow-400 text-xs">+{result.badges.length - 2}</span>
            )}
          </div>
          
          {result.isImprovement && result.previousScore && (
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">
                +{result.percentage - result.previousScore}%
              </span>
            </div>
          )}
        </div>


        {/* Tentatives */}
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-2 text-blue-300 text-sm">
            <Clock className="w-4 h-4" />
            <span>{result.attempts} tentative{result.attempts > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-5 h-5 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-200">Chargement des résultats de quiz...</p>
        </div>
      </div>
    );
  }

  // Afficher les résultats dès qu'ils sont chargés, même sans childData
  if (!loading && results.length === 0) {
    return (
      <div className="text-center py-6">
        <FileText className="w-10 h-10 text-blue-300 mx-auto mb-4 opacity-50" />
        <h3 className="text-white text-base font-semibold mb-2">Aucun quiz trouvé</h3>
        <p className="text-blue-200">Vos enfants n'ont pas encore passé de quiz</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-white text-base font-bold mb-2">Résultats des quiz</h1>
            <p className="text-blue-200">Total: {results.length} quiz terminé{results.length > 1 ? 's' : ''}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
            >
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
            
            <button className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className={`text-base font-bold ${getScoreColor(stats.averageScore)}`}>
              {stats.averageScore}%
            </div>
            <div className="text-blue-300 text-sm">Score moyen</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-white text-base font-bold">{stats.totalQuizzes}</div>
            <div className="text-blue-300 text-sm">Quiz terminés</div>
          </div>
        </div>
      </div>

      {/* Filtres détaillés */}
      {showFilters && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-blue-200 text-sm mb-2">Enfant</label>
              <select
                value={selectedChild_}
                onChange={(e) => setSelectedChild_(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">Tous les enfants</option>
                {parent?.children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.firstName} {child.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-blue-200 text-sm mb-2">Matière</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value as any)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">Toutes matières</option>
                <option value="history">Histoire</option>
                <option value="geography">Géographie</option>
              </select>
            </div>

            <div>
              <label className="block text-blue-200 text-sm mb-2">Période</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
              >
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="trimester">Ce trimestre</option>
                <option value="year">Cette année</option>
              </select>
            </div>

            <div>
              <label className="block text-blue-200 text-sm mb-2">Trier par</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
              >
                <option value="recent">Plus récents</option>
                <option value="score">Meilleur score</option>
                <option value="subject">Par matière</option>
                <option value="difficulty">Par difficulté</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Liste des résultats */}
      <div>
        {sortedResults.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <FileText className="w-10 h-10 text-blue-300 mx-auto mb-4" />
            <h3 className="text-white text-base font-bold mb-2">Aucun résultat trouvé</h3>
            <p className="text-blue-200">Aucun quiz ne correspond à vos critères de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedResults.map(result => renderResultCard(result))}
          </div>
        )}
      </div>

      {/* Modal de détail du résultat */}
      {showResultModal && selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white text-base font-bold">Détails du résultat</h2>
              <button
                onClick={() => setShowResultModal(false)}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Informations principales */}
              <div className="lg:col-span-2 space-y-4">
                {/* En-tête du quiz */}
                <div className="bg-white/10 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-10 h-10 bg-gradient-to-br ${getSubjectColor(selectedResult.subject)} rounded-xl flex items-center justify-center`}>
                      {React.createElement(getSubjectIcon(selectedResult.subject), { className: "w-5 h-5 text-white" })}
                    </div>
                    <div>
                      <h3 className="text-white text-base font-bold">{selectedResult.quizTitle}</h3>
                      <p className="text-blue-200">{getChildName(selectedResult.childId)}</p>
                      <p className="text-blue-300 text-sm">{formatDate(selectedResult.completedAt)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className={`text-base font-bold ${getScoreColor(selectedResult.percentage)}`}>
                        {selectedResult.percentage}%
                      </div>
                      <div className="text-blue-300 text-sm">Score obtenu</div>
                    </div>
                  </div>
                </div>

                {/* Commentaire du professeur */}
                {selectedResult.teacherComment && (
                  <div className="bg-blue-500/20 rounded-xl p-6 border border-blue-400/30">
                    <h4 className="text-blue-300 font-semibold mb-3 flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5" />
                      <span>Commentaire du professeur</span>
                    </h4>
                    <p className="text-white">{selectedResult.teacherComment}</p>
                  </div>
                )}

                {/* Points forts et faibles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/10 rounded-xl p-6">
                    <h4 className="text-green-400 font-semibold mb-4 flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Points forts</span>
                    </h4>
                    <div className="space-y-2">
                      {selectedResult.strengths.map((strength, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <ThumbsUp className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-green-200 text-sm">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-6">
                    <h4 className="text-orange-400 font-semibold mb-4 flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>À améliorer</span>
                    </h4>
                    <div className="space-y-2">
                      {selectedResult.weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <ThumbsDown className="w-4 h-4 text-orange-400 flex-shrink-0" />
                          <span className="text-orange-200 text-sm">{weakness}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Badges obtenus */}
                {selectedResult.badges.length > 0 && (
                  <div className="bg-white/10 rounded-xl p-6">
                    <h4 className="text-yellow-400 font-semibold mb-4 flex items-center space-x-2">
                      <Award className="w-5 h-5" />
                      <span>Badges obtenus</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedResult.badges.map((badge, index) => (
                        <span key={index} className="bg-yellow-500/20 text-yellow-300 px-3 py-2 rounded-lg font-medium">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Statistiques détaillées */}
              <div className="space-y-4">
                {/* Métriques */}
                <div className="bg-white/10 rounded-xl p-6">
                  <h4 className="text-white font-semibold mb-4">Statistiques</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-blue-200">Questions correctes</span>
                      <span className="text-white font-semibold">
                        {selectedResult.questionsCorrect}/{selectedResult.questionsTotal}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">Tentatives</span>
                      <span className="text-white font-semibold">{selectedResult.attempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">Score obtenu</span>
                      <span className="text-yellow-400 font-semibold">{selectedResult.percentage}%</span>
                    </div>
                  </div>
                </div>

                {/* Comparaison avec la classe */}
                <div className="bg-white/10 rounded-xl p-6">
                  <h4 className="text-white font-semibold mb-4">Comparaison classe</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-blue-200 text-sm">Votre enfant</span>
                        <span className="text-white font-semibold">{selectedResult.percentage}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${getScoreGradient(selectedResult.percentage)} h-2 rounded-full`}
                          style={{ width: `${selectedResult.percentage}%` }}
                        />
                      </div>
                    </div>
                    
                    
                  </div>
                </div>

                {/* Amélioration */}
                {selectedResult.isImprovement && selectedResult.previousScore && (
                  <div className="bg-green-500/20 rounded-xl p-6 border border-green-400/30">
                    <h4 className="text-green-400 font-semibold mb-4 flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>Amélioration</span>
                    </h4>
                    <div className="text-center">
                      <div className="text-green-300 text-base font-bold">
                        +{selectedResult.percentage - selectedResult.previousScore}%
                      </div>
                      <div className="text-green-200 text-sm">
                        Par rapport à la tentative précédente ({selectedResult.previousScore}%)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizResultsTab;


