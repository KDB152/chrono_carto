'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Award,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Play,
  Clock,
  Users,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  Shield,
  BookOpen,
  Target,
  Star,
  TrendingUp,
  Calendar,
  Settings,
  Save,
  X,
  Loader2,
  FileText,
  Brain,
  Zap,
  Timer,
  HelpCircle,
  Copy,
  Share2,
  List
} from 'lucide-react';
import QuestionManagementModal from './QuestionManagementModal';

interface Question {
  id: string;
  question: string;
  type: 'multiple' | 'single' | 'text' | 'boolean';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  duration: number; // en minutes
  questions: Question[];
  attempts: number;
  averageScore: number;
  status: 'Publié' | 'Brouillon' | 'Archivé';
  createdDate: string;
  lastModified: string;
  isTimeLimited: boolean;
  allowRetake: boolean;
  showResults: boolean;
  targetGroups?: string[]; // Groupes cibles qui peuvent tenter le quiz
}

interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
  answers: Record<string, any>;
}

interface QuizResults {
  quiz: Quiz;
  attempts: QuizAttempt[];
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
}

import { AVAILABLE_CLASSES } from '@/constants/classes';

// Groupes disponibles pour la sélection
const AVAILABLE_GROUPS = AVAILABLE_CLASSES;

// Fonction utilitaire pour formater les pourcentages sans .0
const formatPercentage = (value: number): string => {
  return value % 1 === 0 ? value.toString() : value.toFixed(1);
};

const QuizzesManagementTab = () => {
  const searchParams = useSearchParams();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResults[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('Tous');
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [quizToEdit, setQuizToEdit] = useState<Quiz | null>(null);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [quizToViewResults, setQuizToViewResults] = useState<Quiz | null>(null);
  const [quizToManageQuestions, setQuizToManageQuestions] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'quizzes' | 'results'>('quizzes');

  const subjects = ['Histoire', 'Géographie', 'EMC'];

  // Gérer les paramètres d'URL pour ouvrir automatiquement le modal de création
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  // Fonction pour organiser les résultats par quiz
  const organizeResultsByQuiz = (quizzes: Quiz[], attempts: QuizAttempt[]): QuizResults[] => {
    return quizzes.map(quiz => {
      const quizAttempts = attempts.filter(attempt => attempt.quizId === quiz.id);
      const totalAttempts = quizAttempts.length;
      
      // Calculer la moyenne basée sur les étudiants uniques (dernière tentative de chaque étudiant)
      const uniqueStudents = new Map();
      quizAttempts.forEach(attempt => {
        const studentId = attempt.studentId;
        if (!uniqueStudents.has(studentId) || 
            new Date(attempt.completedAt) > new Date(uniqueStudents.get(studentId).completedAt)) {
          uniqueStudents.set(studentId, attempt);
        }
      });
      
      const uniqueStudentAttempts = Array.from(uniqueStudents.values());
      const averageScore = uniqueStudentAttempts.length > 0 
        ? Math.round(uniqueStudentAttempts.reduce((sum, a) => sum + a.percentage, 0) / uniqueStudentAttempts.length)
        : 0;
      const bestScore = totalAttempts > 0 
        ? Math.max(...quizAttempts.map(a => a.percentage))
        : 0;
      const worstScore = totalAttempts > 0 
        ? Math.min(...quizAttempts.map(a => a.percentage))
        : 0;

      return {
        quiz,
        attempts: quizAttempts,
        totalAttempts,
        averageScore,
        bestScore,
        worstScore
      };
    }); // Montrer tous les quiz, même ceux sans tentatives
  };

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const load = async () => {
      setIsLoading(true);
      try {
        // Charger tous les quiz
        const res = await fetch(`${API_BASE}/quizzes`);
        const json = await res.json();
        const mapped: Quiz[] = (json.items || []).map((q: any) => ({
          id: String(q.id),
          title: q.title,
          description: q.description || '',
          subject: q.subject,
          duration: q.duration || 0,
          questions: [],
          attempts: q.attempts || 0,
          averageScore: Number(q.average_score || 0),
          passScore: q.pass_score || 0,
          status: q.status as 'Publié' | 'Brouillon' | 'Archivé',
          createdDate: q.created_at?.slice(0,10) || '',
          lastModified: q.updated_at?.slice(0,10) || '',
          isTimeLimited: !!q.is_time_limited,
          allowRetake: !!q.allow_retake,
          showResults: !!q.show_results,
          randomizeQuestions: !!q.randomize_questions,
          targetGroups: q.target_groups || [],
        }));
        setQuizzes(mapped);

        // Charger toutes les tentatives
        const resA = await fetch(`${API_BASE}/quizzes/attempts`);
        const arr = await resA.json();
        const mappedA: QuizAttempt[] = (arr || []).map((a: any) => ({
          id: String(a.id),
          quizId: String(a.quiz_id),
          studentId: String(a.student_id),
          studentName: a.student_name,
          score: a.score,
          totalPoints: a.total_points,
          percentage: a.percentage,
          timeSpent: a.time_spent,
          completedAt: a.completed_at,
          answers: a.answers || {}
        }));
        setAttempts(mappedA);

        // Organiser les résultats par quiz
        const organizedResults = organizeResultsByQuiz(mapped, mappedA);
        setQuizResults(organizedResults);
      } catch (e) {
      }
      setIsLoading(false);
    };
    load();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleDeleteQuiz = async (quiz: Quiz) => {
    setIsLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      await fetch(`${API_BASE}/quizzes/${quiz.id}`, { method: 'DELETE' });
      setQuizzes(prev => prev.filter(q => q.id !== quiz.id));
      
      // Mettre à jour quizResults pour l'affichage immédiat
      setQuizResults(prev => prev.filter(result => result.quiz.id !== quiz.id));
      
      showNotification('success', 'Quiz supprimé avec succès');
      setShowDeleteModal(false);
      setQuizToDelete(null);
    } catch (error) {
      showNotification('error', 'Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditQuiz = async (updatedQuiz: Quiz) => {
    setIsLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      await fetch(`${API_BASE}/quizzes/${updatedQuiz.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updatedQuiz.title,
          description: updatedQuiz.description,
          subject: updatedQuiz.subject,
          duration: updatedQuiz.duration,
          status: updatedQuiz.status,
          is_time_limited: updatedQuiz.isTimeLimited,
          allow_retake: updatedQuiz.allowRetake,
          show_results: updatedQuiz.showResults,
          target_groups: updatedQuiz.targetGroups
        })
      });
      setQuizzes(prev => prev.map(q => q.id === updatedQuiz.id ? updatedQuiz : q));
      
      // Mettre à jour quizResults pour l'affichage immédiat
      setQuizResults(prev => prev.map(result => 
        result.quiz.id === updatedQuiz.id 
          ? { ...result, quiz: updatedQuiz }
          : result
      ));
      
      showNotification('success', 'Quiz modifié avec succès');
      setShowEditModal(false);
      setQuizToEdit(null);
    } catch (error) {
      showNotification('error', 'Erreur lors de la modification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuiz = async (newQuiz: Partial<Quiz>) => {
    setIsLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_BASE}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newQuiz.title,
          description: newQuiz.description,
          subject: newQuiz.subject,
          duration: newQuiz.duration,
          status: newQuiz.status || 'Brouillon',
          is_time_limited: newQuiz.isTimeLimited,
          allow_retake: newQuiz.allowRetake,
          show_results: newQuiz.showResults,
          target_groups: newQuiz.targetGroups || [],
        })
      });
      const created = await res.json();
      const mapped: Quiz = {
        id: String(created.id),
        title: created.title,
        description: created.description,
        subject: created.subject,
        duration: created.duration,
        questions: [],
        attempts: created.attempts || 0,
        averageScore: Number(created.average_score || 0),
        status: created.status,
        createdDate: created.created_at?.slice(0,10) || '',
        lastModified: created.updated_at?.slice(0,10) || '',
        isTimeLimited: !!created.is_time_limited,
        allowRetake: !!created.allow_retake,
        showResults: !!created.show_results,
        targetGroups: created.target_groups || [],
      };
      setQuizzes(prev => [...prev, mapped]);
      
      // Mettre à jour quizResults pour l'affichage immédiat
      const newQuizResult: QuizResults = {
        quiz: mapped,
        attempts: [],
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0
      };
      setQuizResults(prev => [...prev, newQuizResult]);
      
      showNotification('success', 'Quiz créé avec succès');
      setShowCreateModal(false);
    } catch (error) {
      showNotification('error', 'Erreur lors de la création');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuizStatus = async (quiz: Quiz) => {
    const newStatus = quiz.status === 'Publié' ? 'Brouillon' : 'Publié';
    const updatedQuiz = { ...quiz, status: newStatus as 'Publié' | 'Brouillon' | 'Archivé', lastModified: new Date().toISOString().split('T')[0] };
    await handleEditQuiz(updatedQuiz);
  };

  const duplicateQuiz = async (quiz: Quiz) => {
    try {
      setIsLoading(true);
      
      // Préparer les données pour la création
      const duplicatedQuizData = {
        title: `${quiz.title} (Copie)`,
        description: quiz.description,
        subject: quiz.subject,
        duration: quiz.duration,
        status: 'Brouillon',
        isTimeLimited: quiz.isTimeLimited,
        allowRetake: quiz.allowRetake,
        showResults: quiz.showResults,
        targetGroups: quiz.targetGroups || []
      };

      // Envoyer la requête au backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(duplicatedQuizData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la duplication du quiz');
      }

      const created = await response.json();
      
      // Mapper la réponse du backend
      const mapped: Quiz = {
        id: String(created.id),
        title: created.title,
        description: created.description,
        subject: created.subject,
        duration: created.duration,
        questions: [],
        attempts: created.attempts || 0,
        averageScore: Number(created.average_score || 0),
        status: created.status,
        createdDate: created.created_at?.slice(0,10) || '',
        lastModified: created.updated_at?.slice(0,10) || '',
        isTimeLimited: !!created.is_time_limited,
        allowRetake: !!created.allow_retake,
        showResults: !!created.show_results,
        targetGroups: created.target_groups || [],
      };

      // Mettre à jour l'état local
      setQuizzes(prev => [...prev, mapped]);
      showNotification('success', 'Quiz dupliqué avec succès');
      
    } catch (error) {
      showNotification('error', 'Erreur lors de la duplication du quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionsUpdated = () => {
    // Refresh the quizzes list to update total points
    const load = async () => {
      setIsLoading(true);
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${API_BASE}/quizzes`);
        const json = await res.json();
        const mapped: Quiz[] = (json.items || []).map((q: any) => ({
          id: String(q.id),
          title: q.title,
          description: q.description || '',
          subject: q.subject,
          duration: q.duration || 0,
          questions: [],
          attempts: q.attempts || 0,
          averageScore: Number(q.average_score || 0),
          passScore: q.pass_score || 0,
          status: q.status,
          createdDate: q.created_at?.slice(0,10) || '',
          lastModified: q.updated_at?.slice(0,10) || '',
          isTimeLimited: !!q.is_time_limited,
          allowRetake: !!q.allow_retake,
          showResults: !!q.show_results,
          randomizeQuestions: !!q.randomize_questions,
          targetGroups: q.target_groups || [],
        }));
        setQuizzes(mapped);
      } catch (e) {}
      setIsLoading(false);
    };
    load();
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = (quiz.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (quiz.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'Tous' || quiz.subject === filterSubject;
    const matchesStatus = filterStatus === 'Tous' || quiz.status === filterStatus;
    
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const filteredQuizResults = quizResults.filter(result => {
    const quiz = result.quiz;
    const matchesSearch = (quiz.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (quiz.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'Tous' || quiz.subject === filterSubject;
    const matchesStatus = filterStatus === 'Tous' || quiz.status === filterStatus;
    
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Publié': return 'bg-green-100 text-green-800';
      case 'Brouillon': return 'bg-yellow-100 text-yellow-800';
      case 'Archivé': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-blue-400';
    if (percentage >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getQuizAttempts = (quizId: string) => {
    return attempts.filter(attempt => attempt.quizId === quizId);
  };

  return (
    <div className="space-y-4">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg backdrop-blur-xl border ${
          notification.type === 'success' 
            ? 'bg-green-500/20 border-green-500/30 text-green-100' 
            : 'bg-red-500/20 border-red-500/30 text-red-100'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white flex items-center">
              <Award className="w-5 h-5 text-blue-300 mr-4" />
              Gestion des quiz
            </h1>
            <p className="text-blue-200 mt-2">Créez et gérez vos évaluations interactives</p>
            <div className="flex items-center space-x-3 mt-3 text-sm text-blue-300">
              <span>Total: {quizzes.length} quiz</span>
              <span>Publiés: {quizzes.filter(q => q.status === 'Publié').length}</span>
              <span>Tentatives: {attempts.length}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualiser</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-3 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              <span>Créer un quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="flex">
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`flex-1 px-3 py-4 text-center font-semibold transition-all ${
              activeTab === 'quizzes'
                ? 'bg-blue-600 text-white'
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Quiz ({quizzes.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex-1 px-3 py-4 text-center font-semibold transition-all ${
              activeTab === 'results'
                ? 'bg-blue-600 text-white'
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="w-5 h-5" />
                             <span>Résultats ({attempts.length})</span>
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'quizzes' && (
        <>
          {/* Filtres et recherche */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par titre ou description..."
                  className="pl-10 pr-4 py-3 w-full border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
                />
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white"
                >
                  <option value="Tous">Toutes les matières</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white"
                >
                  <option value="Tous">Tous les statuts</option>
                  <option value="Publié">Publié</option>
                  <option value="Brouillon">Brouillon</option>
                  <option value="Archivé">Archivé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Liste des quiz */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredQuizResults.map((result) => {
              const quiz = result.quiz;
              return (
              <div key={quiz.id} className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                {/* En-tête de la carte */}
                <div className="p-6 border-b border-white/20">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-blue-200 mt-1">{quiz.subject}</p>
                    </div>
                                         <div className="flex items-center space-x-2">
                       <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quiz.status)}`}>
                         {quiz.status}
                       </span>
                       {quiz.attempts > 0 && (
                         <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center space-x-1">
                           <BarChart3 className="w-3 h-3" />
                           <span>{quiz.attempts}</span>
                         </span>
                       )}
                     </div>
                  </div>
                  <p className="text-sm text-blue-300 line-clamp-2">{quiz.description}</p>
                </div>

                                 {/* Statistiques */}
                 <div className="p-6 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div className="text-center">
                       <div className="flex items-center justify-center space-x-1 text-blue-200 mb-1">
                         <Clock className="w-4 h-4" />
                         <span className="text-xs">Durée</span>
                       </div>
                       <p className="text-base font-bold text-white">{quiz.duration}min</p>
                     </div>
                     <div className="text-center">
                       <div className="flex items-center justify-center space-x-1 text-blue-200 mb-1">
                         <Users className="w-4 h-4" />
                         <span className="text-xs">Tentatives</span>
                       </div>
                       <p className="text-base font-bold text-white">{result.totalAttempts}</p>
                     </div>
                     <div className="text-center">
                       <div className="flex items-center justify-center space-x-1 text-blue-200 mb-1">
                         <Star className="w-4 h-4" />
                         <span className="text-xs">Moyenne</span>
                       </div>
                       <p className="text-base font-bold text-white">{formatPercentage(result.averageScore)}%</p>
                     </div>
                   </div>



                  {/* Groupes cibles */}
                  {quiz.targetGroups && quiz.targetGroups.length > 0 && (
                    <div className="border-t border-white/20 pt-4">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Groupes cibles
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {quiz.targetGroups.map((group, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-green-500/20 text-green-200 rounded-lg border border-green-500/30">
                            {group}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Options du quiz */}
                  <div className="flex items-center justify-between text-xs text-blue-300">
                    <div className="flex items-center space-x-3">
                      {quiz.isTimeLimited && (
                        <div className="flex items-center space-x-1">
                          <Timer className="w-3 h-3" />
                          <span>Limité</span>
                        </div>
                      )}
                      {quiz.allowRetake && (
                        <div className="flex items-center space-x-1">
                          <RefreshCw className="w-3 h-3" />
                          <span>Reprise</span>
                        </div>
                      )}
                      {(quiz as any).randomizeQuestions && (
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>Aléatoire</span>
                        </div>
                      )}
                    </div>
                    <span>{quiz.lastModified}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-white/5 border-t border-white/10">
                  <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setQuizToManageQuestions(quiz);
                        setShowQuestionModal(true);
                      }}
                      className="p-2 text-purple-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      title="Gérer les questions"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => duplicateQuiz(quiz)}
                      className="p-2 text-green-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      title="Dupliquer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setQuizToEdit(quiz);
                        setShowEditModal(true);
                      }}
                      className="p-2 text-yellow-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleQuizStatus(quiz)}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                          quiz.status === 'Publié' 
                            ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30' 
                            : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                        }`}
                      >
                        {quiz.status === 'Publié' ? 'Dépublier' : 'Publier'}
                      </button>
                      <button
                        onClick={() => {
                          setQuizToDelete(quiz);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-300 hover:text-white hover:bg-red-500/20 rounded-lg transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {filteredQuizResults.length === 0 && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 text-center">
              <Award className="w-10 h-10 text-blue-300 mx-auto mb-4" />
              <p className="text-blue-200 text-base mb-2">Aucun quiz trouvé</p>
              <p className="text-blue-300 mb-3">Créez votre premier quiz pour commencer à évaluer vos étudiants</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                Créer un quiz
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === 'results' && (
        <div className="space-y-4">
          {attempts.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 text-center">
              <BarChart3 className="w-10 h-10 text-blue-300 mx-auto mb-4" />
              <p className="text-blue-200 text-base mb-2">Aucun résultat disponible</p>
              <p className="text-blue-300">Les résultats apparaîtront ici une fois que les étudiants auront commencé à passer les quiz</p>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              {/* En-tête avec statistiques globales */}
              <div className="p-6 border-b border-white/20 bg-gradient-to-r from-blue-600/20 to-indigo-600/20">
                <h3 className="text-base font-bold text-white mb-4">Statistiques Globales</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-base font-bold text-blue-400">{attempts.length}</div>
                    <div className="text-sm text-blue-300">Total Tentatives</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-base font-bold text-green-400">
                      {attempts.length > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length) : 0}%
                    </div>
                    <div className="text-sm text-blue-300">Score Moyen</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-base font-bold text-purple-400">
                      {new Set(attempts.map(a => a.studentId)).size}
                    </div>
                    <div className="text-sm text-blue-300">Étudiants Uniques</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-base font-bold text-orange-400">
                      {new Set(attempts.map(a => a.quizId)).size}
                    </div>
                    <div className="text-sm text-blue-300">Quiz Tentés</div>
                  </div>
                </div>
              </div>

              {/* Tableau des résultats */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-3 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Étudiant</th>
                      <th className="px-3 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Quiz</th>
                      <th className="px-3 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Pourcentage</th>
                      <th className="px-3 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Temps</th>
                      <th className="px-3 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {attempts.map((attempt) => {
                      const quiz = quizzes.find(q => q.id === attempt.quizId);
                      return (
                        <tr key={attempt.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xs">
                                  {attempt.studentName.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-white">{attempt.studentName}</span>
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-white">{quiz?.title || 'Quiz inconnu'}</p>
                              <p className="text-xs text-blue-300">{quiz?.subject}</p>
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-bold ${getScoreColor(attempt.percentage)}`}>
                                {attempt.percentage}%
                              </span>
                              <div className="w-16 bg-white/20 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    attempt.percentage >= 80 ? 'bg-green-400' :
                                    attempt.percentage >= 60 ? 'bg-blue-400' :
                                    attempt.percentage >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                                  }`}
                                  style={{ width: `${attempt.percentage}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <span className="text-sm text-blue-200">
                              {Math.floor(attempt.timeSpent / 60)}:{(attempt.timeSpent % 60).toString().padStart(2, '0')}
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <span className="text-sm text-blue-200">
                              {new Date(attempt.completedAt).toLocaleDateString('fr-FR')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateQuizModal
          onSave={handleCreateQuiz}
          onClose={() => setShowCreateModal(false)}
          isLoading={isLoading}
          subjects={subjects}
        />
      )}

      {showEditModal && quizToEdit && (
        <EditQuizModal
          quiz={quizToEdit}
          onSave={handleEditQuiz}
          onClose={() => {
            setShowEditModal(false);
            setQuizToEdit(null);
          }}
          isLoading={isLoading}
          subjects={subjects}
        />
      )}

      {showDeleteModal && quizToDelete && (
        <DeleteQuizModal
          quiz={quizToDelete}
          onConfirm={() => handleDeleteQuiz(quizToDelete)}
          onClose={() => {
            setShowDeleteModal(false);
            setQuizToDelete(null);
          }}
          isLoading={isLoading}
        />
      )}

      {showResultsModal && quizToViewResults && (
        <QuizResultsModal
          quiz={quizToViewResults}
          attempts={getQuizAttempts(quizToViewResults.id)}
          onClose={() => {
            setShowResultsModal(false);
            setQuizToViewResults(null);
          }}
        />
      )}

      {showQuestionModal && quizToManageQuestions && (
        <QuestionManagementModal
          quizId={parseInt(quizToManageQuestions.id)}
          quizTitle={quizToManageQuestions.title}
          onClose={() => {
            setShowQuestionModal(false);
            setQuizToManageQuestions(null);
          }}
          onQuestionsUpdated={handleQuestionsUpdated}
        />
      )}
    </div>
  );
};

// Composants modaux
interface CreateQuizModalProps {
  onSave: (quiz: Partial<Quiz>) => void;
  onClose: () => void;
  isLoading: boolean;
  subjects: string[];
}

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({ onSave, onClose, isLoading, subjects }) => {
  const [formData, setFormData] = useState<Partial<Quiz>>({
    title: '',
    description: '',
    subject: 'Histoire',
    duration: 10,
    status: 'Brouillon',
    isTimeLimited: true,
    allowRetake: false,
    showResults: false,
    targetGroups: []
  });


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quiz = {
      ...formData
    };
    onSave(quiz);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-base font-bold text-white flex items-center">
            <Plus className="w-5 h-5 text-blue-300 mr-3" />
            Créer un nouveau quiz
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-white mb-2">Titre du quiz *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
                placeholder="Ex: La Révolution française"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Matière</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Durée (minutes)</label>
              <input
                type="number"
                min="5"
                max="180"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
              placeholder="Description du quiz..."
            />
          </div>


          <div>
            <label className="block text-sm font-semibold text-white mb-2">Groupes cibles *</label>
            <p className="text-sm text-blue-200 mb-3">Sélectionnez les groupes qui peuvent tenter ce quiz</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AVAILABLE_GROUPS.map((group) => (
                <label key={group} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.targetGroups?.includes(group) || false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          targetGroups: [...(prev.targetGroups || []), group]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          targetGroups: prev.targetGroups?.filter(g => g !== group) || []
                        }));
                      }
                    }}
                    className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-white">{group}</span>
                </label>
              ))}
            </div>
            {(!formData.targetGroups || formData.targetGroups.length === 0) && (
              <p className="text-yellow-300 text-sm mt-2">
                ⚠️ Si aucun groupe n'est sélectionné, tous les étudiants pourront tenter ce quiz
              </p>
            )}
          </div>

          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <Settings className="w-5 h-5 text-blue-300 mr-2" />
              Options du quiz
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isTimeLimited}
                  onChange={(e) => setFormData(prev => ({ ...prev, isTimeLimited: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2 mt-0.5"
                />
                <div>
                  <span className="text-white font-medium">Limiter le temps</span>
                  <p className="text-sm text-blue-200 mt-1">Le quiz sera limité par la durée spécifiée</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.allowRetake}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowRetake: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2 mt-0.5"
                />
                <div>
                  <span className="text-white font-medium">Autoriser les reprises</span>
                  <p className="text-sm text-blue-200 mt-1">Les étudiants pourront refaire le quiz plusieurs fois</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.showResults}
                  onChange={(e) => setFormData(prev => ({ ...prev, showResults: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2 mt-0.5"
                />
                <div>
                  <span className="text-white font-medium">Afficher les résultats</span>
                  <p className="text-sm text-blue-200 mt-1">Les étudiants verront leurs réponses et les bonnes réponses après avoir terminé le quiz</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-white/20">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-3 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
              disabled={isLoading || !formData.title}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Créer le quiz</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditQuizModalProps {
  quiz: Quiz;
  onSave: (quiz: Quiz) => void;
  onClose: () => void;
  isLoading: boolean;
  subjects: string[];
}

const EditQuizModal: React.FC<EditQuizModalProps> = ({ quiz, onSave, onClose, isLoading, subjects }) => {
  const [formData, setFormData] = useState<Quiz>(quiz);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(quiz.targetGroups || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedQuiz = {
      ...formData,
      targetGroups: selectedGroups,
      lastModified: new Date().toISOString().split('T')[0]
    };
    onSave(updatedQuiz);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-base font-bold text-white flex items-center">
            <Edit className="w-5 h-5 text-blue-300 mr-3" />
            Modifier le quiz
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-white mb-2">Titre du quiz *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Matière</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Durée (minutes)</label>
              <input
                type="number"
                min="5"
                max="180"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
            />
          </div>


          <div>
            <label className="block text-sm font-semibold text-white mb-2">Groupes cibles</label>
            <p className="text-sm text-blue-200 mb-3">Sélectionnez les groupes qui peuvent tenter ce quiz</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AVAILABLE_GROUPS.map((group) => (
                <label key={group} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGroups(prev => [...prev, group]);
                      } else {
                        setSelectedGroups(prev => prev.filter(g => g !== group));
                      }
                    }}
                    className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-white">{group}</span>
                </label>
              ))}
            </div>
            {(selectedGroups.length === 0) && (
              <p className="text-yellow-300 text-sm mt-2">
                ⚠️ Si aucun groupe n'est sélectionné, tous les étudiants pourront tenter ce quiz
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Statut</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white"
            >
              <option value="Brouillon">Brouillon</option>
              <option value="Publié">Publié</option>
              <option value="Archivé">Archivé</option>
            </select>
          </div>

          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <Settings className="w-5 h-5 text-blue-300 mr-2" />
              Options du quiz
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isTimeLimited}
                  onChange={(e) => setFormData(prev => ({ ...prev, isTimeLimited: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2 mt-0.5"
                />
                <div>
                  <span className="text-white font-medium">Limiter le temps</span>
                  <p className="text-sm text-blue-200 mt-1">Le quiz sera limité par la durée spécifiée</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.allowRetake}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowRetake: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2 mt-0.5"
                />
                <div>
                  <span className="text-white font-medium">Autoriser les reprises</span>
                  <p className="text-sm text-blue-200 mt-1">Les étudiants pourront refaire le quiz plusieurs fois</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.showResults}
                  onChange={(e) => setFormData(prev => ({ ...prev, showResults: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2 mt-0.5"
                />
                <div>
                  <span className="text-white font-medium">Afficher les résultats</span>
                  <p className="text-sm text-blue-200 mt-1">Les étudiants verront leurs réponses et les bonnes réponses après avoir terminé le quiz</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-white/20">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-3 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Sauvegarder</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeleteQuizModalProps {
  quiz: Quiz;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}

const DeleteQuizModal: React.FC<DeleteQuizModalProps> = ({ quiz, onConfirm, onClose, isLoading }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Confirmer la suppression</h3>
              <p className="text-blue-200 text-sm">Cette action est irréversible</p>
            </div>
          </div>
          
          <p className="text-blue-200 mb-3">
            Êtes-vous sûr de vouloir supprimer le quiz <strong className="text-white">"{quiz.title}"</strong> ?
            {quiz.attempts > 0 && (
              <span className="block mt-2 text-yellow-300 text-sm">
                ⚠️ Ce quiz a {quiz.attempts} tentative(s). Toutes les données seront perdues.
              </span>
            )}
          </p>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface QuizResultsModalProps {
  quiz: Quiz;
  attempts: QuizAttempt[];
  onClose: () => void;
}

const QuizResultsModal: React.FC<QuizResultsModalProps> = ({ quiz, attempts, onClose }) => {
  const averageScore = attempts.length > 0 ? attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / attempts.length : 0;
  const passRate = attempts.length > 0 ? (attempts.filter(attempt => attempt.percentage >= 50).length / attempts.length) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-base font-bold text-white flex items-center">
            <BarChart3 className="w-5 h-5 text-blue-300 mr-3" />
            Résultats - {quiz.title}
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Statistiques générales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-base font-bold text-white">{attempts.length}</div>
              <div className="text-sm text-blue-200">Tentatives</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-base font-bold text-white">{formatPercentage(averageScore)}%</div>
              <div className="text-sm text-blue-200">Moyenne</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-base font-bold text-white">{formatPercentage(passRate)}%</div>
              <div className="text-sm text-blue-200">Taux de réussite</div>
            </div>
          </div>

          {/* Liste des tentatives */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Étudiant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Pourcentage</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Temps</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">Résultat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {attempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {attempt.studentName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-white">{attempt.studentName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold ${
                          attempt.percentage >= 80 ? 'text-green-400' :
                          attempt.percentage >= 60 ? 'text-blue-400' :
                          attempt.percentage >= 40 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {attempt.percentage}%
                        </span>
                        <div className="w-16 bg-white/20 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              attempt.percentage >= 80 ? 'bg-green-400' :
                              attempt.percentage >= 60 ? 'bg-blue-400' :
                              attempt.percentage >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${attempt.percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-blue-200">{attempt.timeSpent}min</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-blue-200">
                        {new Date(attempt.completedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        attempt.score >= (quiz as any).passScore 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {attempt.score >= (quiz as any).passScore ? 'Réussi' : 'Échoué'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {attempts.length === 0 && (
              <div className="text-center py-4">
                <BarChart3 className="w-10 h-10 text-blue-300 mx-auto mb-4" />
                <p className="text-blue-200">Aucune tentative pour ce quiz</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizzesManagementTab;

