'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Star,
  Award,
  Eye,
  Download,
  Share2,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Brain,
  Zap,
  Trophy,
  Medal,
  Crown,
  Flag,
  Heart,
  ThumbsUp,
  MessageCircle,
  RotateCcw,
  Play,
  Pause,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  X,
  Check,
  Info,
  HelpCircle,
  Lightbulb,
  Globe,
  History,
  Users,
  Bookmark,
  Edit,
  Trash2,
  ExternalLink,
  FileText,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';

interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  subject: 'history' | 'geography' | 'both';
  completedAt: string;
  duration: number;
  percentage: number;
  questionsCorrect: number;
  questionsTotal: number;
  timeSpent: number;
  attempts: number;
  improvement?: number;
  badges?: string[];
  feedback?: string;
  detailedResults: {
    questionId: string;
    question: string;
    userAnswer: any;
    correctAnswer: any;
    isCorrect: boolean;
    timeSpent: number;
    explanation?: string;
    difficulty: string;
  }[];
}

interface ResultsTabProps {}

const ResultsTab: React.FC<ResultsTabProps> = () => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<QuizResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detailed'>('list');
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Optimisation: Mémoisation des données mock
  const mockResults = useMemo(() => [
    {
      id: 'result-1',
      quizId: 'quiz-1',
      quizTitle: 'La Révolution française',
      subject: 'history' as const,
      completedAt: '2025-12-20T10:30:00',
      duration: 1200,
      percentage: 90,
      questionsCorrect: 7,
      questionsTotal: 8,
      timeSpent: 1200,
      attempts: 1,
      rank: 3,
      improvement: 15,
      badges: ['Révolutionnaire', 'Historien en herbe'],
      feedback: 'Excellent travail ! Vous maîtrisez bien les événements de la Révolution française.',
      detailedResults: [
        {
          questionId: 'q1',
          question: 'En quelle année a commencé la Révolution française ?',
          userAnswer: '1789',
          correctAnswer: '1789',
          isCorrect: true,
          timeSpent: 45,
          explanation: 'La Révolution française a commencé en 1789 avec la convocation des États généraux.',
        },
        {
          questionId: 'q2',
          question: 'La Déclaration des droits de l\'homme et du citoyen a été adoptée en 1789.',
          userAnswer: true,
          correctAnswer: true,
          isCorrect: true,
          timeSpent: 30,
          explanation: 'La Déclaration a été adoptée le 26 août 1789.',
        },
        {
          questionId: 'q3',
          question: 'Qui était le roi de France au début de la Révolution ?',
          userAnswer: 'Louis XVI',
          correctAnswer: 'Louis XVI',
          isCorrect: true,
          timeSpent: 60,
        }
      ]
    },
    {
      id: 'result-2',
      quizId: 'quiz-2',
      quizTitle: 'Les climats européens',
      subject: 'geography' as const,
      completedAt: '2025-12-19T14:15:00',
      duration: 900,
      percentage: 85,
      questionsCorrect: 10,
      questionsTotal: 12,
      timeSpent: 900,
      attempts: 2,
      rank: 5,
      improvement: 10,
      badges: ['Géographe'],
      feedback: 'Bonne compréhension des climats européens. Travaillez les nuances entre les différents types.',
      detailedResults: []
    },
    {
      id: 'result-3',
      quizId: 'quiz-4',
      quizTitle: 'Les grandes villes mondiales',
      subject: 'geography' as const,
      completedAt: '2025-12-18T16:45:00',
      duration: 1500,
      percentage: 92,
      questionsCorrect: 16,
      questionsTotal: 18,
      timeSpent: 1500,
      attempts: 1,
      rank: 1,
      improvement: 0,
      badges: ['Explorateur urbain', 'Champion'],
      xpEarned: 165,
      feedback: 'Performance exceptionnelle ! Vous êtes premier de la classe sur ce quiz.',
      detailedResults: []
    },
    {
      id: 'result-4',
      quizId: 'quiz-3',
      quizTitle: 'L\'Empire de Napoléon',
      subject: 'history' as const,
      completedAt: '2025-12-17T11:20:00',
      duration: 1800,
      percentage: 70,
      questionsCorrect: 14,
      questionsTotal: 20,
      timeSpent: 1800,
      attempts: 1,
      rank: 8,
      improvement: 5,
      badges: ['Stratège'],
      xpEarned: 140,
      feedback: 'Quiz difficile bien maîtrisé. Continuez à approfondir vos connaissances sur cette période.',
      detailedResults: []
    }
  ], []);

  // Simulation du chargement initial
  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true);
      // Simulation d'un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 800));
      setResults(mockResults);
      setFilteredResults(mockResults);
      setIsLoading(false);
    };

    loadResults();
  }, [mockResults]);

  // Optimisation: Mémoisation des fonctions utilitaires
  const getSubjectIcon = useCallback((subject: string) => {
    const icons = {
      history: History,
      geography: Globe,
      both: Brain,
      default: BookOpen
    };
    return icons[subject as keyof typeof icons] || icons.default;
  }, []);

  const getSubjectColor = useCallback((subject: string) => {
    const colors = {
      history: 'from-gradient-orange-start to-gradient-orange-end',
      geography: 'from-gradient-teal-start to-gradient-teal-end',
      both: 'from-gradient-purple-start to-gradient-purple-end',
      default: 'from-gradient-primary-start to-gradient-primary-end'
    };
    return colors[subject as keyof typeof colors] || colors.default;
  }, []);


  const getScoreColor = useCallback((percentage: number) => {
    if (percentage >= 90) return 'text-success-400';
    if (percentage >= 75) return 'text-primary-400';
    if (percentage >= 60) return 'text-warning-400';
    return 'text-danger-400';
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  }, []);

  // Optimisation: Mémoisation du filtrage et tri
  useEffect(() => {
    let filtered = [...results];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(result =>
        result.quizTitle.toLowerCase().includes(query) ||
        result.subject.toLowerCase().includes(query)
      );
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(result => result.subject === selectedSubject);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(result => result.difficulty === selectedDifficulty);
    }

    // Optimisation du tri
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
        break;
      case 'score':
        filtered.sort((a, b) => b.percentage - a.percentage);
        break;
      case 'title':
        filtered.sort((a, b) => a.quizTitle.localeCompare(b.quizTitle, 'fr'));
        break;
    }

    setFilteredResults(filtered);
  }, [results, searchQuery, selectedSubject, selectedDifficulty, sortBy]);

  // Optimisation: Mémoisation des statistiques globales
  const stats = useMemo(() => {
    if (results.length === 0) return null;

    const totalScore = results.reduce((sum, result) => sum + result.percentage, 0);
    const averageScore = Math.round(totalScore / results.length);
    
    const totalXP = results.reduce((sum, result) => sum + result.xpEarned, 0);
    const totalBadges = new Set(results.flatMap(result => result.badges || [])).size;
    
    const recentResults = results.slice(0, 5);
    const trend = recentResults.length >= 2 ? 
      recentResults[0].percentage - recentResults[recentResults.length - 1].percentage : 0;

    return {
      averageScore,
      totalQuizzes: results.length,
      totalXP,
      totalBadges,
      trend,
      bestScore: Math.max(...results.map(r => r.percentage)),
      totalTimeSpent: results.reduce((sum, result) => sum + result.timeSpent, 0)
    };
  }, [results]);

  // Optimisation: Callback pour éviter les re-renders
  const handleExpandToggle = useCallback((resultId: string) => {
    setExpandedResult(current => current === resultId ? null : resultId);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSubjectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value);
  }, []);

  const handleDifficultyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDifficulty(e.target.value);
  }, []);

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  }, []);

  // Composant optimisé pour le graphique de progression
  const ProgressChart = useMemo(() => {
    if (!results.length) return null;
    
    const chartData = results.slice(-10);
    const maxPercentage = Math.max(...chartData.map(r => r.percentage));
    
    return (
      <div className="mt-8 bg-surface/50 backdrop-blur-xl rounded-2xl p-8 border border-surface-light/25 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-text-primary font-semibold text-lg flex items-center">
            <TrendingUp className="w-6 h-6 mr-3 text-primary-400" />
            Évolution des scores
          </h3>
          <div className="bg-primary-500/15 text-primary-300 px-4 py-2 rounded-full text-sm font-medium border border-primary-500/20">
            {chartData.length} derniers quiz
          </div>
        </div>
        <div className="h-48 flex items-end justify-center space-x-3 px-4">
          {chartData.map((result, index) => (
            <div key={result.id} className="flex-1 max-w-12 flex flex-col items-center group">
              <div className="relative mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105">
                <div className="bg-surface/95 backdrop-blur-sm text-text-primary text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-xl border border-surface-light/20">
                  <div className="font-semibold text-primary-300">{result.percentage}%</div>
                  <div className="text-text-secondary mt-1">{result.quizTitle.substring(0, 20)}...</div>
                </div>
              </div>
              <div 
                className={`w-full bg-gradient-to-t ${getSubjectColor(result.subject)} rounded-t-lg transition-all duration-500 hover:scale-110 hover:shadow-lg cursor-pointer relative overflow-hidden`}
                style={{ 
                  height: `${Math.max((result.percentage / maxPercentage) * 140, 12)}px`,
                  minHeight: '12px'
                }}
                title={`${result.quizTitle} - ${result.percentage}%`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="text-text-secondary text-xs mt-3 transform -rotate-45 origin-left w-16 truncate font-medium">
                {new Date(result.completedAt).toLocaleDateString('fr-FR', { 
                  day: '2-digit', 
                  month: '2-digit' 
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [results, getSubjectColor]);

  // Composant optimisé pour une carte de résultat
  const ResultCard = React.memo(({ result }: { result: QuizResult }) => {
    const SubjectIcon = getSubjectIcon(result.subject);
    const isExpanded = expandedResult === result.id;
    const formattedDate = new Date(result.completedAt).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div className="bg-surface/60 backdrop-blur-xl rounded-2xl border border-surface-light/30 overflow-hidden hover:bg-surface/80 hover:border-surface-light/50 transition-all duration-300 group shadow-lg hover:shadow-xl">
        {/* Header amélioré avec plus d'informations */}
        <div className={`bg-gradient-to-r ${getSubjectColor(result.subject)} p-6 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
                <SubjectIcon className="w-7 h-7 text-white drop-shadow-sm" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl leading-tight drop-shadow-sm">{result.quizTitle}</h3>
                <div className="flex items-center space-x-6 mt-2">
                  <p className="text-white/90 text-sm flex items-center font-medium">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formattedDate}
                  </p>
                  {result.attempts > 1 && (
                    <span className="text-white/90 text-sm flex items-center font-medium">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Tentative #{result.attempts}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(result.percentage)} drop-shadow-lg`}>
                {result.percentage}%
              </div>
            </div>
          </div>
        </div>

        {/* Contenu de la carte amélioré */}
        <div className="p-8">
          {/* Statistiques en grille améliorée */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-surface/40 rounded-2xl p-4 text-center border border-surface-light/20 hover:bg-surface/60 transition-all duration-200">
              <div className="text-text-primary text-xl font-bold">{result.questionsCorrect}/{result.questionsTotal}</div>
              <div className="text-primary-300 text-xs flex items-center justify-center mt-1 font-medium">
                <CheckCircle className="w-3 h-3 mr-1" />
                Questions
              </div>
            </div>
            <div className="bg-surface/40 rounded-2xl p-4 text-center border border-surface-light/20 hover:bg-surface/60 transition-all duration-200">
              <div className="text-text-primary text-xl font-bold">{formatDuration(result.timeSpent)}</div>
              <div className="text-primary-300 text-xs flex items-center justify-center mt-1 font-medium">
                <Clock className="w-3 h-3 mr-1" />
                Temps
              </div>
            </div>
            <div className="bg-surface/40 rounded-2xl p-4 text-center border border-surface-light/20 hover:bg-surface/60 transition-all duration-200">
              <div className="text-text-primary text-xl font-bold">#{result.rank || 'N/A'}</div>
              <div className="text-primary-300 text-xs flex items-center justify-center mt-1 font-medium">
                <Medal className="w-3 h-3 mr-1" />
                Classement
              </div>
            </div>
            <div className="bg-surface/40 rounded-2xl p-4 text-center border border-surface-light/20 hover:bg-surface/60 transition-all duration-200">
              <div className="text-text-primary text-xl font-bold">{result.xpEarned}</div>
              <div className="text-primary-300 text-xs flex items-center justify-center mt-1 font-medium">
                <Zap className="w-3 h-3 mr-1" />
                Expérience
              </div>
            </div>
          </div>

          {/* Badges améliorés */}
          {result.badges && result.badges.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6">
              {result.badges.map((badge, index) => (
                <span key={index} className="bg-gradient-to-r from-warning-500/15 to-orange-500/15 text-warning-300 text-sm px-4 py-2 rounded-full flex items-center border border-warning-500/25 backdrop-blur-sm font-medium">
                  <Award className="w-4 h-4 mr-2" />
                  {badge}
                </span>
              ))}
            </div>
          )}


          {/* Feedback amélioré */}
          {result.feedback && (
            <div className="bg-gradient-to-r from-primary-500/10 to-indigo-500/10 rounded-2xl p-6 mb-6 border border-primary-500/25">
              <div className="flex items-start space-x-4">
                <div className="bg-primary-500/20 rounded-xl p-2 flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-primary-300" />
                </div>
                <div>
                  <h4 className="text-primary-200 font-semibold text-sm mb-2">Feedback du professeur</h4>
                  <p className="text-text-primary text-sm leading-relaxed">{result.feedback}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions améliorées */}
          <div className="flex items-center justify-between pt-4 border-t border-surface-light/25">
            <div className="flex items-center space-x-3">
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleExpandToggle(result.id)}
                className="flex items-center space-x-2 px-6 py-3 bg-surface/60 rounded-xl text-primary-300 hover:text-text-primary hover:bg-surface/80 transition-all duration-200 text-sm border border-surface-light/25 font-medium"
              >
                <Eye className="w-4 h-4" />
                <span>{isExpanded ? 'Masquer' : 'Détails'}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              <button className="p-3 bg-surface/60 rounded-xl text-primary-300 hover:text-text-primary hover:bg-surface/80 transition-all duration-200 border border-surface-light/25">
                <Download className="w-4 h-4" />
              </button>
              
              <button className="p-3 bg-surface/60 rounded-xl text-primary-300 hover:text-text-primary hover:bg-surface/80 transition-all duration-200 border border-surface-light/25">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Détails étendus améliorés */}
          {isExpanded && result.detailedResults.length > 0 && (
            <div className="mt-8 pt-8 border-t border-surface-light/25 animate-in slide-in-from-top-2 duration-300">
              <h4 className="text-text-primary font-semibold text-lg mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-primary-400" />
                Détail des réponses
              </h4>
              <div className="space-y-6">
                {result.detailedResults.map((detail, index) => (
                  <div key={detail.questionId} className="bg-surface/40 rounded-2xl p-6 border border-surface-light/20">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="bg-primary-500/20 text-primary-300 text-sm px-3 py-1.5 rounded-full font-semibold border border-primary-500/25">
                            Q{index + 1}
                          </span>
                        </div>
                        <h5 className="text-text-primary font-semibold text-base mb-4 leading-relaxed">
                          {detail.question}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <p className="text-primary-200 text-sm font-semibold">Votre réponse :</p>
                            <p className={`text-base font-semibold ${detail.isCorrect ? 'text-success-400' : 'text-danger-400'}`}>
                              {typeof detail.userAnswer === 'boolean' 
                                ? (detail.userAnswer ? 'Vrai' : 'Faux')
                                : detail.userAnswer}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-primary-200 text-sm font-semibold">Réponse correcte :</p>
                            <p className="text-success-400 text-base font-semibold">
                              {typeof detail.correctAnswer === 'boolean' 
                                ? (detail.correctAnswer ? 'Vrai' : 'Faux')
                                : detail.correctAnswer}
                            </p>
                          </div>
                        </div>
                        {detail.explanation && (
                          <div className="mt-6 p-4 bg-primary-500/10 rounded-xl border border-primary-500/20">
                            <div className="flex items-start space-x-3">
                              <Info className="w-5 h-5 text-primary-300 mt-0.5 flex-shrink-0" />
                              <p className="text-text-primary text-sm leading-relaxed">{detail.explanation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="ml-6 text-right flex-shrink-0">
                        <div className={`flex items-center space-x-2 ${detail.isCorrect ? 'text-success-400' : 'text-danger-400'}`}>
                          {detail.isCorrect ? 
                            <CheckCircle className="w-6 h-6" /> : 
                            <XCircle className="w-6 h-6" />
                          }
                        </div>
                        <div className="text-primary-300 text-sm mt-3 flex items-center font-medium">
                          <Clock className="w-4 h-4 mr-2" />
                          {detail.timeSpent}s
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  });

  // État de chargement amélioré
  if (isLoading) {
    return (
      <div className="space-y-8 min-h-screen">
        <div className="bg-surface/50 backdrop-blur-xl rounded-2xl p-8 border border-surface-light/25">
          <div className="animate-pulse">
            <div className="h-10 bg-surface/60 rounded-2xl w-80 mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-surface/40 rounded-2xl p-6">
                  <div className="h-10 bg-surface/60 rounded-xl mb-3"></div>
                  <div className="h-5 bg-surface/40 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface/50 backdrop-blur-xl rounded-2xl p-8 border border-surface-light/25">
              <div className="animate-pulse">
                <div className="h-8 bg-surface/60 rounded-xl w-3/4 mb-6"></div>
                <div className="grid grid-cols-4 gap-6">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-16 bg-surface/40 rounded-2xl"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-background via-background-light to-background">
      <style jsx>{`
        :root {
          /* Couleurs principales */
          --color-primary-400: #60a5fa;
          --color-primary-500: #3b82f6;
          --color-primary-600: #2563eb;
          
          /* Couleurs de surface */
          --color-surface: rgba(15, 23, 42, 0.8);
          --color-surface-light: rgba(30, 41, 59, 0.6);
          
          /* Couleurs de texte */
          --color-text-primary: #f1f5f9;
          --color-text-secondary: #cbd5e1;
          
          /* Couleurs de background */
          --color-background: #0f172a;
          --color-background-light: #1e293b;
          
          /* Couleurs système */
          --color-success-400: #4ade80;
          --color-success-500: #22c55e;
          --color-warning-400: #facc15;
          --color-warning-500: #eab308;
          --color-danger-400: #f87171;
          --color-danger-500: #ef4444;
          --color-neutral-400: #94a3b8;
          --color-neutral-500: #64748b;
          
          /* Gradients */
          --gradient-primary-start: #3b82f6;
          --gradient-primary-end: #1d4ed8;
          --gradient-orange-start: #f97316;
          --gradient-orange-end: #ea580c;
          --gradient-teal-start: #14b8a6;
          --gradient-teal-end: #0d9488;
          --gradient-purple-start: #8b5cf6;
          --gradient-purple-end: #7c3aed;
        }
        
        .bg-surface\\/50 { background-color: rgba(15, 23, 42, 0.5); }
        .bg-surface\\/60 { background-color: rgba(15, 23, 42, 0.6); }
        .bg-surface\\/40 { background-color: rgba(15, 23, 42, 0.4); }
        .border-surface-light\\/25 { border-color: rgba(30, 41, 59, 0.25); }
        .border-surface-light\\/20 { border-color: rgba(30, 41, 59, 0.2); }
        .border-surface-light\\/30 { border-color: rgba(30, 41, 59, 0.3); }
        .text-text-primary { color: #f1f5f9; }
        .text-text-secondary { color: #cbd5e1; }
        .text-primary-200 { color: #bfdbfe; }
        .text-primary-300 { color: #93c5fd; }
        .text-primary-400 { color: #60a5fa; }
        .text-success-400 { color: #4ade80; }
        .text-warning-300 { color: #fde047; }
        .text-warning-400 { color: #facc15; }
        .text-danger-400 { color: #f87171; }
        .text-neutral-400 { color: #94a3b8; }
        .bg-primary-500\\/15 { background-color: rgba(59, 130, 246, 0.15); }
        .bg-primary-500\\/10 { background-color: rgba(59, 130, 246, 0.1); }
        .bg-primary-500\\/20 { background-color: rgba(59, 130, 246, 0.2); }
        .bg-success-500\\/15 { background-color: rgba(34, 197, 94, 0.15); }
        .bg-warning-500\\/15 { background-color: rgba(234, 179, 8, 0.15); }
        .bg-danger-500\\/15 { background-color: rgba(239, 68, 68, 0.15); }
        .border-primary-500\\/20 { border-color: rgba(59, 130, 246, 0.2); }
        .border-primary-500\\/25 { border-color: rgba(59, 130, 246, 0.25); }
        .border-success-500\\/25 { border-color: rgba(34, 197, 94, 0.25); }
        .border-warning-500\\/25 { border-color: rgba(234, 179, 8, 0.25); }
        .border-danger-500\\/25 { border-color: rgba(239, 68, 68, 0.25); }
        .from-gradient-primary-start { --tw-gradient-from: #3b82f6; }
        .to-gradient-primary-end { --tw-gradient-to: #1d4ed8; }
        .from-gradient-orange-start { --tw-gradient-from: #f97316; }
        .to-gradient-orange-end { --tw-gradient-to: #ea580c; }
        .from-gradient-teal-start { --tw-gradient-from: #14b8a6; }
        .to-gradient-teal-end { --tw-gradient-to: #0d9488; }
        .from-gradient-purple-start { --tw-gradient-from: #8b5cf6; }
        .to-gradient-purple-end { --tw-gradient-to: #7c3aed; }
      `}</style>
      
      {/* En-tête avec statistiques globales amélioré */}
      {stats && (
        <div className="bg-surface/50 backdrop-blur-xl rounded-2xl p-8 border border-surface-light/25 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-text-primary text-4xl font-bold mb-3 flex items-center">
                <BarChart3 className="w-10 h-10 mr-4 text-primary-400" />
                Mes Résultats
              </h1>
              <p className="text-text-secondary text-xl">
                Suivez vos performances et votre progression académique
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-6 lg:mt-0">
              <div className="bg-primary-500/15 text-primary-300 px-4 py-2 rounded-full text-sm font-semibold border border-primary-500/25">
                {filteredResults.length} résultat{filteredResults.length > 1 ? 's' : ''} affiché{filteredResults.length > 1 ? 's' : ''}
              </div>
              <button className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end hover:shadow-xl rounded-xl text-white transition-all duration-300 shadow-lg hover:scale-105 font-semibold">
                <Download className="w-5 h-5" />
                <span>Exporter PDF</span>
              </button>
            </div>
          </div>

          {/* Grille de statistiques améliorée */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-gradient-to-br from-success-500/15 to-green-600/15 rounded-2xl p-6 text-center border border-success-500/25 hover:scale-105 transition-transform duration-300">
              <div className="text-success-400 text-4xl font-bold mb-2">{stats.averageScore}%</div>
              <div className="text-success-300 text-sm font-semibold">Score moyen</div>
              <div className="text-success-200/60 text-xs mt-2">Performance globale</div>
            </div>
            <div className="bg-gradient-to-br from-primary-500/15 to-indigo-600/15 rounded-2xl p-6 text-center border border-primary-500/25 hover:scale-105 transition-transform duration-300">
              <div className="text-primary-400 text-4xl font-bold mb-2">{stats.totalQuizzes}</div>
              <div className="text-primary-300 text-sm font-semibold">Quiz terminés</div>
              <div className="text-primary-200/60 text-xs mt-2">Activité totale</div>
            </div>
            <div className="bg-gradient-to-br from-warning-500/15 to-orange-600/15 rounded-2xl p-6 text-center border border-warning-500/25 hover:scale-105 transition-transform duration-300">
              <div className="text-warning-400 text-4xl font-bold mb-2">{stats.bestScore}%</div>
              <div className="text-warning-300 text-sm font-semibold">Meilleur score</div>
              <div className="text-warning-200/60 text-xs mt-2">Meilleure performance</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/15 to-violet-600/15 rounded-2xl p-6 text-center border border-purple-500/25 hover:scale-105 transition-transform duration-300">
              <div className="text-purple-400 text-4xl font-bold mb-2">{stats.totalXP}</div>
              <div className="text-purple-300 text-sm font-semibold">XP total</div>
              <div className="text-purple-200/60 text-xs mt-2">Expérience acquise</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500/15 to-yellow-600/15 rounded-2xl p-6 text-center border border-amber-500/25 hover:scale-105 transition-transform duration-300">
              <div className="text-amber-400 text-4xl font-bold mb-2">{stats.totalBadges}</div>
              <div className="text-amber-300 text-sm font-semibold">Badges</div>
              <div className="text-amber-200/60 text-xs mt-2">Récompenses</div>
            </div>
            <div className="bg-gradient-to-br from-rose-500/15 to-pink-600/15 rounded-2xl p-6 text-center border border-rose-500/25 hover:scale-105 transition-transform duration-300">
              <div className={`text-4xl font-bold flex items-center justify-center mb-2 ${
                stats.trend > 0 ? 'text-success-400' : stats.trend < 0 ? 'text-danger-400' : 'text-primary-400'
              }`}>
                {stats.trend > 0 ? <TrendingUp className="w-10 h-10" /> : 
                 stats.trend < 0 ? <TrendingDown className="w-10 h-10" /> : 
                 <Target className="w-10 h-10" />}
              </div>
              <div className="text-rose-300 text-sm font-semibold">Tendance</div>
              <div className={`text-xs mt-2 font-bold ${
                stats.trend > 0 ? 'text-success-300' : stats.trend < 0 ? 'text-danger-300' : 'text-primary-300'
              }`}>
                {stats.trend > 0 ? `+${stats.trend}%` : stats.trend < 0 ? `${stats.trend}%` : 'Stable'}
              </div>
            </div>
          </div>

          {/* Graphique de progression */}
          {ProgressChart}
        </div>
      )}

      {/* Section filtres et recherche améliorée */}
      <div className="bg-surface/50 backdrop-blur-xl rounded-2xl p-8 border border-surface-light/25 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
          {/* Contrôles de filtrage */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 text-text-secondary text-sm">
              <span className="font-medium">Affichage:</span>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-primary-500 text-white shadow-lg' 
                    : 'bg-surface/60 text-primary-300 hover:bg-surface/80'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  viewMode === 'detailed' 
                    ? 'bg-primary-500 text-white shadow-lg' 
                    : 'bg-surface/60 text-primary-300 hover:bg-surface/80'
                }`}
              >
                <FileText className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-200 border font-medium ${
                showFilters 
                  ? 'bg-primary-500 text-white border-primary-400 shadow-lg' 
                  : 'bg-surface/60 text-text-primary border-surface-light/30 hover:bg-surface/80'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filtres</span>
              {showFilters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Panneau de filtres étendu */}
        {showFilters && (
          <div className="mt-8 pt-8 border-t border-surface-light/25 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="block text-text-primary text-sm font-semibold">Matière</label>
                <select
                  value={selectedSubject}
                  onChange={handleSubjectChange}
                  className="w-full px-5 py-4 bg-surface/60 border border-surface-light/30 rounded-xl text-text-primary focus:ring-2 focus:ring-primary-400 backdrop-blur-sm text-base"
                >
                  <option value="all">?? Toutes les matières</option>
                  <option value="history">?? Histoire</option>
                  <option value="geography">?? Géographie</option>
                  <option value="both">?? EMC</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-text-primary text-sm font-semibold">Difficulté</label>
                <select
                  value={selectedDifficulty}
                  onChange={handleDifficultyChange}
                  className="w-full px-5 py-4 bg-surface/60 border border-surface-light/30 rounded-xl text-text-primary focus:ring-2 focus:ring-primary-400 backdrop-blur-sm text-base"
                >
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-text-primary text-sm font-semibold">Trier par</label>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full px-5 py-4 bg-surface/60 border border-surface-light/30 rounded-xl text-text-primary focus:ring-2 focus:ring-primary-400 backdrop-blur-sm text-base"
                >
                  <option value="recent">?? Plus récents</option>
                  <option value="score">?? Meilleur score</option>
                  <option value="title">?? Titre (A-Z)</option>
                  <option value="difficulty">? Difficulté</option>
                </select>
              </div>
            </div>
            
            {/* Résumé des filtres actifs */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-text-primary text-sm font-medium">Filtres actifs:</span>
              {selectedSubject !== 'all' && (
                <span className="bg-primary-500/15 text-primary-300 px-3 py-2 rounded-full text-sm border border-primary-500/25 font-medium">
                  {selectedSubject === 'history' ? 'Histoire' : selectedSubject === 'geography' ? 'Géographie' : 'Histoire-Géographie'}
                </span>
              )}
              {searchQuery && (
                <span className="bg-purple-500/15 text-purple-300 px-3 py-2 rounded-full text-sm border border-purple-500/25 font-medium">
                  "{searchQuery}"
                </span>
              )}
              {(selectedSubject !== 'all' || selectedDifficulty !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedSubject('all');
                    setSelectedDifficulty('all');
                    setSearchQuery('');
                  }}
                  className="text-danger-300 hover:text-danger-200 text-sm underline ml-3 font-medium"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Liste des résultats */}
      <div className="space-y-8">
        {filteredResults.length === 0 ? (
          <div className="bg-surface/50 backdrop-blur-xl rounded-2xl p-16 border border-surface-light/25 text-center shadow-lg">
            <div className="w-32 h-32 bg-primary-500/15 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary-500/25">
              <BarChart3 className="w-16 h-16 text-primary-300" />
            </div>
            <h3 className="text-text-primary text-3xl font-bold mb-4">Aucun résultat trouvé</h3>
            <p className="text-text-secondary text-lg mb-8 max-w-lg mx-auto">
              {searchQuery || selectedSubject !== 'all' || selectedDifficulty !== 'all'
                ? 'Essayez de modifier vos critères de recherche et filtres'
                : 'Vous n\'avez pas encore terminé de quiz. Commencez dès maintenant !'}
            </p>
            <div className="flex items-center justify-center space-x-6">
              {(searchQuery || selectedSubject !== 'all' || selectedDifficulty !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedSubject('all');
                    setSelectedDifficulty('all');
                    setSearchQuery('');
                  }}
                  className="px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-xl text-white transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredResults.map(result => (
              <ResultCard key={result.id} result={result} />
            ))}
          </div>
        )}
      </div>

      {/* Modal d'analyse détaillée */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface/95 backdrop-blur-xl rounded-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-surface-light/30 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-text-primary text-3xl font-bold flex items-center">
                <Activity className="w-8 h-8 mr-4 text-primary-400" />
                Analyse détaillée
              </h2>
              <button
                onClick={() => setSelectedResult(null)}
                className="p-3 rounded-xl bg-surface/60 text-text-primary hover:bg-surface/80 transition-all border border-surface-light/30"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-8">
              <div className="bg-surface/40 rounded-2xl p-8 border border-surface-light/20">
                <h3 className="text-text-primary text-xl font-semibold mb-4">Fonctionnalité en développement</h3>
                <p className="text-text-secondary text-lg">
                  L'analyse détaillée avec graphiques interactifs, comparaisons temporelles et recommandations personnalisées sera bientôt disponible.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsTab;

