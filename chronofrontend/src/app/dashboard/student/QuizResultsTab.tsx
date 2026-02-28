'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  Star,
  Trophy,
  BarChart3,
  Calendar,
  User
} from 'lucide-react';

interface QuizResult {
  id: number;
  quiz_id: number;
  student_id: number;
  percentage: number;
  time_spent: number;
  completed_at: string;
  answers: any;
  quiz: {
    id: number;
    title: string;
    description: string;
    subject: string;
    show_results: boolean;
    questions: QuizQuestion[];
  };
}

interface QuizQuestion {
  id: number;
  question_text: string;
  question_type: string;
  correct_answer: string;
  options?: string[];
  student_answer?: string;
  is_correct?: boolean;
}

const QuizResultsTab: React.FC = () => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());

  // Fonction pour formater le temps en minutes et secondes
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  useEffect(() => {
    loadQuizResults();
  }, []);

  const loadQuizResults = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'ID de l'étudiant connecté
      const userDetails = localStorage.getItem('userDetails');
      if (!userDetails) {
        console.error('User details not found in localStorage.');
        setResults([]);
        return;
      }

      const user = JSON.parse(userDetails);
      const studentId = user.studentDetails?.id || user.id;

      if (!studentId) {
        console.error('No student ID found');
        setResults([]);
        return;
      }

      // Récupérer les tentatives de l'étudiant
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes/attempts?student_id=${studentId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch quiz attempts: ${response.status}`);
      }

      const attempts = await response.json();
      console.log('Quiz attempts:', attempts);

      // Filtrer seulement les quizzes qui permettent d'afficher les résultats
      const resultsWithDetails = await Promise.all(
        attempts.map(async (attempt: any) => {
          try {
            // Récupérer les détails du quiz
            const quizResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes/${attempt.quiz_id}`);
            if (!quizResponse.ok) return null;
            
            const quiz = await quizResponse.json();
            
            // Vérifier si show_results est activé
            if (!quiz.show_results) return null;

            // Récupérer les questions du quiz
            const questionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes/${attempt.quiz_id}/questions`);
            let questions = [];
            if (questionsResponse.ok) {
              questions = await questionsResponse.json();
            }

            // Récupérer les réponses de l'étudiant
            const answersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes/attempts/${attempt.id}/answers`);
            let studentAnswers = {};
            if (answersResponse.ok) {
              studentAnswers = await answersResponse.json();
            }

            return {
              ...attempt,
              quiz: {
                ...quiz,
                questions: questions.map((q: any) => ({
                  ...q,
                  student_answer: studentAnswers[q.id] || 'Non répondu',
                  is_correct: studentAnswers[q.id] === q.correct_answer
                }))
              }
            };
          } catch (error) {
            console.error(`Error fetching details for attempt ${attempt.id}:`, error);
            return null;
          }
        })
      );

      // Filtrer les résultats null et trier par date
      const validResults = resultsWithDetails
        .filter(result => result !== null)
        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

      setResults(validResults);
    } catch (error) {
      console.error('Error loading quiz results:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleResultExpansion = (resultId: number) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(resultId)) {
      newExpanded.delete(resultId);
    } else {
      newExpanded.add(resultId);
    }
    setExpandedResults(newExpanded);
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Histoire': return 'from-amber-500 to-orange-600';
      case 'Géographie': return 'from-green-500 to-emerald-600';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
        <Trophy className="w-10 h-10 text-blue-300 mx-auto mb-4" />
        <h3 className="text-white text-base font-bold mb-2">Aucun résultat disponible</h3>
        <p className="text-blue-200">Vous n'avez pas encore terminé de quiz ou les résultats ne sont pas encore disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <Trophy className="w-5 h-5" />
          <h2 className="text-base font-bold">Mes Résultats de Quiz</h2>
        </div>
        <p className="text-blue-100">Consultez vos performances et vos réponses</p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-5 h-5" />
            <div>
              <div className="text-white font-semibold">{results.length}</div>
              <div className="text-blue-200 text-sm">Quiz terminés</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <Star className="w-5 h-5 text-yellow-400" />
            <div>
              <div className="text-white font-semibold">
                {Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length)}%
              </div>
              <div className="text-blue-200 text-sm">Moyenne générale</div>
            </div>
          </div>
        </div>


        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-white font-semibold">
                {formatTime(Math.round(results.reduce((acc, r) => acc + r.time_spent, 0) / results.length))}
              </div>
              <div className="text-blue-200 text-sm">Temps moyen</div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des résultats */}
      <div className="space-y-4">
        {results.map((result) => (
          <div key={result.id} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            {/* En-tête du résultat */}
            <div className={`bg-gradient-to-r ${getSubjectColor(result.quiz.subject)} p-4`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-base mb-1">{result.quiz.title}</h3>
                  <p className="text-white/80 text-sm mb-2">{result.quiz.subject}</p>
                  <div className="flex items-center space-x-3 text-white/90 text-sm">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(result.completed_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(result.time_spent)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-base font-bold ${getScoreColor(result.percentage)}`}>
                    {result.percentage}%
                  </div>
                  <div className="text-white/80 text-sm">
                    {result.score}/{result.total_points}
                  </div>
                </div>
              </div>
            </div>

            {/* Détails du résultat */}
            <div className="p-4">
              <button
                onClick={() => toggleResultExpansion(result.id)}
                className="w-full flex items-center justify-between text-left text-blue-200 hover:text-blue-100 transition-colors"
              >
                <span className="font-semibold">
                  {expandedResults.has(result.id) ? 'Masquer les détails' : 'Voir les détails'}
                </span>
                <div className={`transform transition-transform ${expandedResults.has(result.id) ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </button>

              {expandedResults.has(result.id) && (
                <div className="mt-4 space-y-4">
                  {/* Questions et réponses */}
                  {result.quiz.questions.map((question, index) => (
                    <div key={question.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-start space-x-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                          question.is_correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-2">{question.question_text}</h4>
                          
                          {/* Réponse de l'étudiant */}
                          <div className="mb-2">
                            <div className="text-blue-200 text-sm font-medium">Votre réponse :</div>
                            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg ${
                              question.is_correct 
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                              <span>{question.student_answer || 'Non répondu'}</span>
                              {question.is_correct ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400" />
                              )}
                            </div>
                          </div>

                          {/* Réponse correcte */}
                          {!question.is_correct && (
                            <div>
                              <div className="text-green-200 text-sm font-medium">Réponse correcte :</div>
                              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-green-500/20 text-green-300 border border-green-500/30">
                                <span>{question.correct_answer}</span>
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizResultsTab;

