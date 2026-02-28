'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  BarChart3,
  Clock,
  Target,
  Star,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Calendar,
  Award,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';

interface QuizAttempt {
  id: number;
  quiz_id: number;
  student_id: number;
  student_name: string;
  score: number;
  total_points: number;
  percentage: number;
  time_spent: number;
  completed_at: string;
  answers: Record<string, any>;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  duration: number;
  totalPoints: number;
  attempts: number;
  averageScore: number;
  passScore: number;
  status: string;
  createdDate: string;
  lastModified: string;
  tags: string[];
  isTimeLimited: boolean;
  allowRetake: boolean;
  showResults: boolean;
  randomizeQuestions: boolean;
}

interface QuizStatisticsModalProps {
  quiz: Quiz | null;
  isOpen: boolean;
  onClose: () => void;
}

// Fonction utilitaire pour formater les pourcentages sans .0
const formatPercentage = (value: number): string => {
  return value % 1 === 0 ? value.toString() : value.toFixed(1);
};

const QuizStatisticsModal: React.FC<QuizStatisticsModalProps> = ({ quiz, isOpen, onClose }) => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (isOpen && quiz) {
      loadQuizAttempts();
    }
  }, [isOpen, quiz]);

  const loadQuizAttempts = async () => {
    if (!quiz) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes/${quiz.id}/attempts`);
      if (response.ok) {
        const data = await response.json();
        setAttempts(data);
      } else {
        console.error('Failed to load quiz attempts');
      }
    } catch (error) {
      console.error('Error loading quiz attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedAttempts = attempts
    .filter(attempt => 
      attempt.student_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
          break;
        case 'score':
          comparison = a.percentage - b.percentage;
          break;
        case 'name':
          comparison = a.student_name.localeCompare(b.student_name);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStatistics = () => {
    if (attempts.length === 0) return null;

    const totalAttempts = attempts.length;
    const averageScore = attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts;
    const highestScore = Math.max(...attempts.map(a => a.percentage));
    const lowestScore = Math.min(...attempts.map(a => a.percentage));
    const passedAttempts = attempts.filter(a => a.percentage >= (quiz?.passScore || 60)).length;
    const passRate = (passedAttempts / totalAttempts) * 100;
    const averageTime = attempts.reduce((sum, a) => sum + a.time_spent, 0) / totalAttempts;

    // Group attempts by student to count unique students
    const uniqueStudents = new Set(attempts.map(a => a.student_id)).size;

    return {
      totalAttempts,
      uniqueStudents,
      averageScore,
      highestScore,
      lowestScore,
      passedAttempts,
      passRate,
      averageTime
    };
  };

  const stats = getStatistics();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !quiz) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-white/20 max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Statistiques du Quiz</h2>
              <p className="text-blue-300 text-sm">{quiz.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-blue-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Quiz Info */}
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-base font-semibold text-white mb-3">Informations du Quiz</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-base font-bold text-white">{quiz.subject}</div>
                  <div className="text-blue-300 text-sm">Matière</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-bold text-white">{quiz.level}</div>
                  <div className="text-blue-300 text-sm">Niveau</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-bold text-white">{quiz.duration}min</div>
                  <div className="text-blue-300 text-sm">Durée</div>
                </div>
              </div>
            </div>

            {/* Statistics Overview */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl p-4 border border-blue-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-5 h-5 text-blue-300" />
                    <span className="text-blue-300 text-sm">Tentatives</span>
                  </div>
                  <div className="text-base font-bold text-white">{stats.totalAttempts}</div>
                  <div className="text-blue-300 text-xs">{stats.uniqueStudents} étudiants uniques</div>
                </div>

                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="w-5 h-5 text-green-300" />
                    <span className="text-green-300 text-sm">Moyenne</span>
                  </div>
                  <div className="text-base font-bold text-white">{formatPercentage(stats.averageScore)}%</div>
                  <div className="text-green-300 text-xs">
                    {stats.highestScore}% max / {stats.lowestScore}% min
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-purple-300" />
                    <span className="text-purple-300 text-sm">Taux de réussite</span>
                  </div>
                  <div className="text-base font-bold text-white">{formatPercentage(stats.passRate)}%</div>
                  <div className="text-purple-300 text-xs">{stats.passedAttempts}/{stats.totalAttempts} réussis</div>
                </div>

                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-orange-300" />
                    <span className="text-orange-300 text-sm">Temps moyen</span>
                  </div>
                  <div className="text-base font-bold text-white">{formatTime(stats.averageTime)}</div>
                  <div className="text-orange-300 text-xs">Par tentative</div>
                </div>
              </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher par nom d'étudiant..."
                    className="pl-10 pr-4 py-2 w-full border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white"
                  >
                    <option value="date">Date</option>
                    <option value="score">Score</option>
                    <option value="name">Nom</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 text-blue-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    {sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={loadQuizAttempts}
                    className="p-2 text-blue-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    title="Actualiser"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Attempts Table */}
            <div className="bg-white/5 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                        Étudiant
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                        Pourcentage
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                        Temps
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            <span className="text-blue-300">Chargement des tentatives...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredAndSortedAttempts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 text-center">
                          <div className="text-center">
                            <BarChart3 className="w-10 h-10 text-blue-300 mx-auto mb-2" />
                            <p className="text-blue-200">Aucune tentative trouvée</p>
                            <p className="text-blue-300 text-sm">Aucun étudiant n'a encore tenté ce quiz</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedAttempts.map((attempt) => {
                        const isPassed = attempt.percentage >= (quiz?.passScore || 60);
                        return (
                          <tr key={attempt.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-semibold">
                                    {attempt.student_name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-white font-medium">{attempt.student_name}</div>
                                  <div className="text-blue-300 text-xs">ID: {attempt.student_id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className={`text-base font-bold ${isPassed ? 'text-green-400' : 'text-red-400'}`}>
                                {attempt.percentage}%
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-blue-300">{formatTime(attempt.time_spent)}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-blue-300 text-sm">{formatDate(attempt.completed_at)}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                                isPassed 
                                  ? 'bg-green-500/20 text-green-300' 
                                  : 'bg-red-500/20 text-red-300'
                              }`}>
                                {isPassed ? (
                                  <>
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Réussi</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3 h-3" />
                                    <span>Échoué</span>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/20 flex items-center justify-between">
          <div className="text-blue-300 text-sm">
            {filteredAndSortedAttempts.length} tentative(s) affichée(s) sur {attempts.length}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                // TODO: Implement export functionality
                console.log('Export functionality to be implemented');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizStatisticsModal;

