'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Save,
  Send,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  BookOpen,
  Target,
  Star,
  Award,
  Trophy,
  Zap,
  Heart,
  Brain,
  Lightbulb,
  HelpCircle,
  Info,
  ArrowLeft,
  ArrowRight,
  Square,
  Circle,
  Triangle,
  Diamond,
  Plus,
  Minus,
  X,
  Check,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind,
  Home,
  Settings,
  Bookmark,
  Share2,
  Download,
  Upload,
  RefreshCw,
  Shuffle,
  Filter,
  Search,
  Grid,
  List,
  Calendar,
  Users,
  MessageSquare,
  User,
  LogOut
} from 'lucide-react';

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching' | 'ordering';
  question: string;
  options?: string[];
  correctAnswer: any;
  explanation?: string;
  points: number;
  timeLimit?: number;
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    alt?: string;
  };
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: string;
  duration: number;
  questions: Question[];
  totalPoints: number;
  passingScore: number;
  attempts: number;
  instructions?: string;
  allowRetake: boolean;
  isTimeLimited: boolean;
  showResults: boolean;
}

interface QuizTakeTabProps {
  quizId: string | null;
  onComplete: () => void;
  onBack?: () => void;
  onStart?: () => void;
}

const QuizTakeTab: React.FC<QuizTakeTabProps> = ({ quizId, onComplete, onBack, onStart }) => {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (quizId) {
      loadQuizData();
    }
  }, [quizId]);

  const loadQuizData = async () => {
    try {
      // Load quiz data from API
      const quizResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes/${quizId}`);
      if (!quizResponse.ok) {
        throw new Error('Failed to load quiz');
      }
      const quizData = await quizResponse.json();

      // Load questions for this quiz
      const questionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes/${quizId}/questions`);
      if (!questionsResponse.ok) {
        throw new Error('Failed to load questions');
      }
      const questionsData = await questionsResponse.json();

      // Transform API data to match our interface
      const transformedQuiz: QuizData = {
        id: String(quizData.id),
        title: quizData.title,
        description: quizData.description || '',
        subject: quizData.subject,
        difficulty: 'medium', // Default difficulty
        duration: quizData.duration || 30,
        totalPoints: questionsData.length,
        passingScore: 50, // Default passing score
        attempts: quizData.attempts || 0,
        instructions: 'Lisez attentivement chaque question. Bonne chance !',
        allowRetake: quizData.allow_retake || false,
        isTimeLimited: quizData.is_time_limited || false,
        showResults: quizData.show_results || false,
        questions: questionsData.map((q: any, index: number) => {
          console.log('🔍 Question data:', {
            id: q.id,
            type: q.type,
            question: q.question,
            options: q.options,
            correct_answer: q.correct_answer
          });
          
          const transformedType = q.type === 'single' ? 'multiple_choice' : 
                q.type === 'multiple' ? 'multiple_choice' : 
                q.type === 'boolean' ? 'true_false' : 
                q.type === 'text' ? 'short_answer' : 'multiple_choice';
          
          console.log('🔄 Transformed type:', transformedType);
          
          return {
            id: String(q.id),
            type: transformedType,
            question: q.question,
            options: q.options || [],
            correctAnswer: q.correct_answer,
            explanation: q.explanation || '',
            points: 1,
            difficulty: 'easy' as const,
            hint: q.explanation || ''
          };
        })
      };

      setQuiz(transformedQuiz);
      setTimeRemaining(transformedQuiz.duration * 60); // Convert minutes to seconds
      
      // Check if student has already attempted this quiz
      checkQuizAttempts(quizData.id);
    } catch (error) {
      console.error('Error loading quiz data:', error);
      alert('Erreur lors du chargement du quiz. Veuillez réessayer.');
    }
  };

  const checkQuizAttempts = async (quizId: number) => {
    try {
      // Get current user ID from localStorage
      const userDetails = localStorage.getItem('userDetails');
      if (!userDetails) {
        console.error('User details not found');
        return;
      }
      
      const user = JSON.parse(userDetails);
      const studentId = user.studentDetails?.id || user.id;

      // Check if student has already attempted this quiz
      const attemptsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes/attempts?quiz_id=${quizId}&student_id=${studentId}`);
      if (attemptsResponse.ok) {
        const attempts = await attemptsResponse.json();
        if (attempts && attempts.length > 0) {
          setHasAttempted(true);
          // Load the results but don't show them automatically
          setQuizResults(attempts[0]); // Get the latest attempt
          // Don't automatically show results - let user choose
        }
      }
    } catch (error) {
      console.error('Error checking quiz attempts:', error);
    }
  };

  useEffect(() => {
    // Only start timer if quiz is time limited
    if (quiz && quiz.isTimeLimited && isStarted && !isPaused && !isCompleted && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quiz, isStarted, isPaused, isCompleted, timeRemaining]);

  // Auto-sauvegarde
  useEffect(() => {
    if (autoSave && isStarted && Object.keys(answers).length > 0) {
      const saveTimeout = setTimeout(() => {
        console.log('Auto-sauvegarde des réponses...');
      }, 2000);

      return () => clearTimeout(saveTimeout);
    }
  }, [answers, autoSave, isStarted]);

  const renderDetailedResults = () => {
    if (!quizResults || !quiz) return null;

    // Si show_results = false, afficher seulement le score
    if (!quiz.showResults) {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
              quizResults.percentage >= 50 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                : 'bg-gradient-to-r from-orange-500 to-red-600'
            }`}>
              <Trophy className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-base font-bold text-white mb-2">Quiz terminé</h2>
            <p className="text-blue-200 text-base mb-4">
              Votre score a été enregistré
            </p>

            <div className="flex justify-center space-x-6 mb-6">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className={`text-lg font-bold mb-1 ${
                  quizResults.percentage >= 50 ? 'text-green-400' : 'text-orange-400'
                }`}>
                  {quizResults.percentage}%
                </div>
                <div className="text-blue-300 text-sm">Score final</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-white text-lg font-bold mb-1">
                  {quizResults.time_spent ? `${Math.floor(quizResults.time_spent / 60)}:${(quizResults.time_spent % 60).toString().padStart(2, '0')}` : 'N/A'}
                </div>
                <div className="text-blue-300 text-sm">Temps utilisé</div>
              </div>
            </div>

            <div className="bg-yellow-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 text-yellow-200">
                <Info className="w-5 h-5" />
                <span className="text-sm">
                  Les réponses correctes ne sont pas affichées pour ce quiz
                </span>
              </div>
            </div>

            <button
              onClick={onBack}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              Retour à la liste des quiz
            </button>
          </div>
        </div>
      );
    }

    // Si show_results = true, afficher les résultats détaillés
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-3">
          <h2 className="text-base font-bold text-white mb-4">Résultats détaillés</h2>
          
          <div className="flex justify-center space-x-6 mb-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-white mb-1">{quizResults.percentage}%</div>
              <div className="text-blue-300 text-sm">Score final</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-white mb-1">
                {quizResults.time_spent ? `${Math.floor(quizResults.time_spent / 60)}:${(quizResults.time_spent % 60).toString().padStart(2, '0')}` : 'N/A'}
              </div>
              <div className="text-blue-300 text-sm">Temps utilisé</div>
            </div>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((question, index) => {
              const userAnswer = quizResults.answers?.[question.id];
              const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer);
              
              return (
                <div key={question.id} className={`p-4 rounded-lg border-2 ${
                  isCorrect ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-white">
                      Question {index + 1}: {question.question}
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-blue-300 font-medium">Votre réponse :</span>
                      <div className="mt-1 p-2 bg-white/5 rounded border border-white/20">
                        {userAnswer !== undefined ? (
                          Array.isArray(userAnswer) ? userAnswer.join(', ') : String(userAnswer)
                        ) : (
                          <span className="text-red-400">Aucune réponse</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-green-300 font-medium">Réponse correcte :</span>
                      <div className="mt-1 p-2 bg-green-500/10 rounded border border-green-500/30">
                        {Array.isArray(question.correctAnswer) 
                          ? question.correctAnswer.join(', ') 
                          : String(question.correctAnswer)}
                      </div>
                    </div>

                    {question.explanation && (
                      <div>
                        <span className="text-yellow-300 font-medium">Explication :</span>
                        <div className="mt-1 p-2 bg-yellow-500/10 rounded border border-yellow-500/30 text-yellow-200">
                          {question.explanation}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex justify-center">
            <button
              onClick={onBack}
              className="px-3 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour à la liste des quiz
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  // If student has already attempted and retakes are not allowed, show completion screen
  if (hasAttempted && !quiz.allowRetake) {
    // Show completion screen with score and options
    const percentage = quizResults ? quizResults.percentage : 0;
    const passed = percentage >= quiz.passingScore;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-3 ${
            passed 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-gradient-to-r from-orange-500 to-red-600'
          }`}>
            {passed ? (
              <Trophy className="w-10 h-10 text-white" />
            ) : (
              <Target className="w-10 h-10 text-white" />
            )}
          </div>

          <h1 className="text-white text-base font-bold mb-2">
            {passed ? 'Félicitations !' : 'Quiz terminé'}
          </h1>
          <p className="text-blue-200 text-base mb-4">
            {passed 
              ? 'Vous avez réussi ce quiz avec brio !' 
              : 'Continuez vos efforts, vous progressez !'}
          </p>

          <div className="flex justify-center space-x-6 mb-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className={`text-lg font-bold mb-1 ${passed ? 'text-green-400' : 'text-orange-400'}`}>
                {percentage}%
              </div>
              <div className="text-blue-300 text-sm">Score final</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-white text-lg font-bold mb-1">
                {quizResults?.time_spent ? `${Math.floor(quizResults.time_spent / 60)}:${(quizResults.time_spent % 60).toString().padStart(2, '0')}` : 'N/A'}
              </div>
              <div className="text-blue-300 text-sm">Temps utilisé</div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3">
            {quiz.showResults && quizResults && (
              <button
                onClick={onComplete}
                className="px-3 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all"
              >
                Voir les résultats détaillés
              </button>
            )}
            <button
              onClick={onBack}
              className="px-3 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              Retour à la liste des quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Fallback: utiliser onComplete si onBack n'est pas fourni
      onComplete();
    }
  };

  const handleStartQuiz = () => {
    setIsStarted(true);
    setShowInstructions(false);
    if (onStart) {
      onStart();
    }
    if (soundEnabled) {
      console.log('Son de démarrage');
    }
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowHint(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowHint(false);
    }
  };


  const handleSubmitQuiz = async () => {
    setIsCompleted(true);
    setIsPaused(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Calculer le score
    let correctAnswers = 0;
    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer !== undefined) {
        if (JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer)) {
          correctAnswers++;
        }
      }
    });

    const percentage = Math.round((correctAnswers / quiz.questions.length) * 100);
    console.log(`Quiz terminé ! Réponses correctes: ${correctAnswers}/${quiz.questions.length} (${percentage}%)`);
    
    // Submit results to API
    try {
      const userDetails = localStorage.getItem('userDetails');
      if (!userDetails) {
        throw new Error('User details not found');
      }
      
      const user = JSON.parse(userDetails);
      const submitData = {
        quiz_id: parseInt(quiz.id),
        student_id: user.studentDetails?.id || user.id,
        student_name: `${user.firstName} ${user.lastName}`,
        total_points: quiz.questions.length,
        percentage: percentage,
        time_spent: quiz.isTimeLimited ? (quiz.duration * 60 - timeRemaining) : null,
        answers: answers
      };

      const submitResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes/attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      if (submitResponse.ok) {
        const result = await submitResponse.json();
        setQuizResults(result);
        setHasAttempted(true);
        
        // Ne pas afficher automatiquement les résultats, laisser l'utilisateur choisir
        // setShowResults(true); // Supprimé pour permettre le choix
      } else {
        console.error('Failed to submit quiz results');
        setTimeout(() => {
          onComplete();
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting quiz results:', error);
      setTimeout(() => {
        onComplete();
      }, 3000);
    }
  };

  const renderQuestion = () => {
    const userAnswer = answers[currentQuestion.id];
    
    console.log('🎯 Rendering question:', {
      id: currentQuestion.id,
      type: currentQuestion.type,
      question: currentQuestion.question,
      options: currentQuestion.options,
      userAnswer
    });

    switch (currentQuestion.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-4">
            {currentQuestion.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(currentQuestion.id, option)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  userAnswer === option
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-white/20 bg-white/5 text-blue-200 hover:border-blue-400 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    userAnswer === option
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-white/40'
                  }`}>
                    {userAnswer === option && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className="flex-1">{option}</span>
                </div>
              </button>
            ))}
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-4">
            {[true, false].map((option) => (
              <button
                key={option.toString()}
                onClick={() => handleAnswer(currentQuestion.id, option)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  userAnswer === option
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-white/20 bg-white/5 text-blue-200 hover:border-blue-400 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    userAnswer === option
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-white/40'
                  }`}>
                    {userAnswer === option && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className="flex-1">{option ? 'Vrai' : 'Faux'}</span>
                </div>
              </button>
            ))}
          </div>
        );

      case 'short_answer':
        return (
          <div>
            <textarea
              value={userAnswer || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              placeholder="Tapez votre réponse ici..."
              className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="mt-2 text-blue-300 text-sm">
              {userAnswer ? `${userAnswer.length} caractères` : '0 caractère'}
            </div>
          </div>
        );

      default:
        return <div>Type de question non supporté</div>;
    }
  };

  // Écran d'instructions
  if (showInstructions && !isStarted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-10 h-10" />
            </div>
            <h1 className="text-white text-base font-bold mb-2">{quiz.title}</h1>
            <p className="text-blue-200 text-base">{quiz.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Clock className="w-4 h-4 text-blue-400 mx-auto mb-2" />
              <div className="text-white text-sm font-bold">
                {quiz.isTimeLimited ? `${quiz.duration} min` : 'Illimité'}
              </div>
              <div className="text-blue-300 text-xs">
                {quiz.isTimeLimited ? 'Durée limitée' : 'Pas de limite'}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Target className="w-4 h-4 text-green-400 mx-auto mb-2" />
              <div className="text-white text-sm font-bold">{quiz.questions.length}</div>
              <div className="text-blue-300 text-xs">Questions</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <RefreshCw className="w-4 h-4 text-purple-400 mx-auto mb-2" />
              <div className="text-white text-sm font-bold">
                {quiz.allowRetake ? 'Oui' : 'Non'}
              </div>
              <div className="text-blue-300 text-xs">
                {quiz.allowRetake ? 'Reprises autorisées' : 'Une seule tentative'}
              </div>
            </div>
          </div>

          {quiz.instructions && (
            <div className="bg-blue-500/20 rounded-xl p-6 mb-4">
              <h3 className="text-white font-bold text-base mb-3 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Instructions
              </h3>
              <p className="text-blue-100">{quiz.instructions}</p>
            </div>
          )}

          {/* Informations sur les paramètres du quiz */}
          <div className="bg-yellow-500/20 rounded-xl p-6 mb-4">
            <h3 className="text-white font-bold text-base mb-3 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Paramètres du quiz
            </h3>
            <div className="space-y-2 text-blue-200">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>
                  <strong>Temps :</strong> {quiz.isTimeLimited 
                    ? `Limité à ${quiz.duration} minutes` 
                    : 'Aucune limite de temps - vous pouvez prendre votre temps'}
                </span>
              </div>
              <div className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                <span>
                  <strong>Reprises :</strong> {quiz.allowRetake 
                    ? 'Autorisées - vous pourrez refaire ce quiz' 
                    : 'Non autorisées - une seule tentative possible'}
                </span>
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                <span>
                  <strong>Résultats :</strong> {quiz.showResults 
                    ? 'Affichés après completion - vous verrez vos réponses et les bonnes réponses' 
                    : 'Non affichés - vous ne verrez que votre score final'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={handleBack}
              className="px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
            >
              Retour
            </button>
            <button
              onClick={handleStartQuiz}
              className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Commencer le quiz</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Écran de fin - seulement si on n'affiche pas les résultats
  if (isCompleted && !showResults) {
    const correctAnswers = quiz.questions.reduce((total, question) => {
      const userAnswer = answers[question.id];
      if (userAnswer !== undefined && JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer)) {
        return total + 1;
      }
      return total;
    }, 0);

    const percentage = Math.round((correctAnswers / quiz.questions.length) * 100);
    const passed = percentage >= quiz.passingScore;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-3 ${
            passed 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-gradient-to-r from-orange-500 to-red-600'
          }`}>
            {passed ? (
              <Trophy className="w-10 h-10 text-white" />
            ) : (
              <Target className="w-10 h-10 text-white" />
            )}
          </div>

          <h1 className="text-white text-base font-bold mb-2">
            {passed ? 'Félicitations !' : 'Quiz terminé'}
          </h1>
          <p className="text-blue-200 text-base mb-4">
            {passed 
              ? 'Vous avez réussi ce quiz avec brio !' 
              : 'Continuez vos efforts, vous progressez !'}
          </p>

          <div className="flex justify-center space-x-6 mb-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className={`text-lg font-bold mb-1 ${passed ? 'text-green-400' : 'text-orange-400'}`}>
                {percentage}%
              </div>
              <div className="text-blue-300 text-sm">Score final</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-white text-lg font-bold mb-1">{answeredQuestions}/{quiz.questions.length}</div>
              <div className="text-blue-300 text-sm">Questions répondues</div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3">
            {quiz.showResults && (
              <button
                onClick={onComplete}
                className="px-3 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all"
              >
                Voir les résultats détaillés
              </button>
            )}
            <button
              onClick={onBack}
              className="px-3 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              Retour à la liste des quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show detailed results if enabled and quiz is completed
  if (showResults && quizResults) {
    return renderDetailedResults();
  }

  // Interface principale du quiz
  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50 bg-slate-900' : ''}`}>
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        {/* Header du quiz */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-white text-base font-bold">{quiz.title}</h1>
              <span className="text-blue-300 text-sm">
                Question {currentQuestionIndex + 1} sur {quiz.questions.length}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {/* Timer - Only show if time limited */}
              {quiz.isTimeLimited && (
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  timeRemaining < 300 ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                }`}>
                  <Clock className="w-5 h-5" />
                  <span className="font-mono text-base">{formatTime(timeRemaining)}</span>
                </div>
              )}

                             {/* Contrôles */}
               <div className="flex items-center space-x-2">
                 <button
                   onClick={() => setFullscreen(!fullscreen)}
                   className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
                   title={fullscreen ? 'Quitter plein écran' : 'Plein écran'}
                 >
                   {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                 </button>
               </div>
            </div>
          </div>

        </div>

        {/* Contenu principal */}
        <div className="flex-1">
          {/* Question */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 h-full">
               {/* En-tête de la question */}
               <div className="flex items-center space-x-3 mb-4">
                 <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                   <span className="text-white font-bold text-sm">{currentQuestionIndex + 1}</span>
                 </div>
                 <h2 className="text-white text-lg font-semibold">Question {currentQuestionIndex + 1}</h2>
               </div>

               {/* Question directement au-dessus des réponses */}
               <div className="mb-3">
                 <h3 className="text-white text-base font-medium leading-relaxed">
                   {currentQuestion.question}
                 </h3>
               </div>

              {/* Média si présent */}
              {currentQuestion.media && (
                <div className="mb-3">
                  {currentQuestion.media.type === 'image' && (
                    <img
                      src={currentQuestion.media.url}
                      alt={currentQuestion.media.alt}
                      className="max-w-full h-auto rounded-lg"
                    />
                  )}
                </div>
              )}

              {/* Réponse */}
              <div className="mb-4">
                {renderQuestion()}
              </div>

              {/* Indice */}
              {currentQuestion.hint && (
                <div className="mb-3">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    <Lightbulb className="w-5 h-5" />
                    <span>{showHint ? 'Masquer l\'indice' : 'Voir l\'indice'}</span>
                  </button>
                  {showHint && (
                    <div className="mt-3 p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                      <p className="text-yellow-100">{currentQuestion.hint}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-center">
                {currentQuestionIndex === quiz.questions.length - 1 ? (
                  <button
                    onClick={handleSubmitQuiz}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    <Send className="w-5 h-5" />
                    <span>Terminer le quiz</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-all"
                  >
                    <span>Question suivante</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuizTakeTab;

