'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentUserFullName } from '@/lib/userUtils';
import { quizzesAPI } from '@/lib/api';
import {
  BookOpen,
  Clock,
  Star,
  Play,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Grid,
  List,
  Calendar,
  Trophy,
  Target,
  Zap,
  Award,
  Users,
  BarChart3,
  TrendingUp,
  Eye,
  Bookmark,
  Share2,
  Download,
  Heart,
  MessageCircle,
  RefreshCw,
  ChevronRight,
  Plus,
  Shuffle,
  Timer,
  Brain,
  Globe,
  Map,
  History,
  Compass,
  Mountain,
  Waves,
  TreePine,
  Building,
  Flag,
  Crown,
  Sword,
  Shield,
  Scroll
} from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: 'history' | 'geography' | 'both';
  duration: number; // en minutes
  questions: number;
  attempts: number;
  bestScore?: number;
  completionRate: number;
  tags: string[];
  createdAt: string;
  dueDate?: string;
  isCompleted: boolean;
  isAvailable: boolean;
  isNew: boolean;
  isFavorite: boolean;
  thumbnail?: string;
  author: string;
  category: string;
  prerequisites?: string[];
  rewards: {
    badges?: string[];
  };
}

interface QuizListTabProps {
  onStartQuiz: (quizId: string) => void;
}

const QuizListTab: React.FC<QuizListTabProps> = ({ onStartQuiz }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        // Récupérer l'ID de l'étudiant connecté
        const userDetails = localStorage.getItem('userDetails');
        console.log('🔍 Debug - userDetails from localStorage:', userDetails);
        
        let studentId: number | undefined;
        let user: any;
        
        if (userDetails) {
          try {
            user = JSON.parse(userDetails);
            console.log('🔍 Debug - Parsed user:', user);
            
            // Essayer d'abord studentDetails.id, puis user.id
            if (user.studentDetails && user.studentDetails.id) {
              studentId = user.studentDetails.id;
              console.log('🔍 Debug - Student ID from studentDetails.id:', studentId);
            } else if (user.id) {
              studentId = user.id;
              console.log('🔍 Debug - Student ID from user.id (fallback):', studentId);
            }
            
            console.log('🔍 Debug - Final studentId:', studentId);
          } catch (error) {
            console.error('❌ Error parsing userDetails:', error);
          }
        }
        
        // Si pas d'ID dans userDetails, essayer d'autres méthodes
        if (!studentId) {
          // Essayer de récupérer depuis d'autres clés localStorage
          const userId = localStorage.getItem('userId');
          const userEmail = localStorage.getItem('userEmail');
          const currentUser = localStorage.getItem('currentUser');
          
          console.log('🔍 Debug - Alternative localStorage keys:');
          console.log('  - userId:', userId);
          console.log('  - userEmail:', userEmail);
          console.log('  - currentUser:', currentUser);
          
          if (userId) {
            studentId = parseInt(userId);
            console.log('🔍 Debug - Using userId from localStorage:', studentId);
          } else if (currentUser) {
            try {
              const parsedCurrentUser = JSON.parse(currentUser);
              studentId = parseInt(parsedCurrentUser.id);
              console.log('🔍 Debug - Using currentUser.id:', studentId);
            } catch (error) {
              console.error('❌ Error parsing currentUser:', error);
            }
          }
        }
        
        if (!studentId) {
          console.error('❌ No student ID found in localStorage');
          console.log('🔍 Debug - All localStorage keys:', Object.keys(localStorage));
          setQuizzes([]);
          setFilteredQuizzes([]);
          return;
        }
        
        // Utiliser l'API de filtrage par groupe au lieu de tous les quizzes
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes/accessible/${studentId}`;
        console.log('🔍 Debug - API URL:', apiUrl);
        
        let response;
        let accessibleQuizzes;
        
        try {
          response = await fetch(apiUrl);
          console.log('🔍 Debug - Response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', errorText);
            throw new Error(`Failed to fetch accessible quizzes: ${response.status}`);
          }
          
          const responseData = await response.json();
          console.log('🔍 Debug - Raw API response:', responseData);
          
          // L'API retourne { value: [...], Count: X }
          accessibleQuizzes = responseData.value || responseData;
          console.log('🔍 Debug - Accessible quizzes (extracted):', accessibleQuizzes);
        } catch (error) {
          console.warn('⚠️ Fallback: Using old API with client-side filtering');
          
          // Fallback vers l'ancienne API avec filtrage côté client
          const fallbackResponse = await quizzesAPI.getQuizzes({ status: 'Publié' });
          console.log('🔍 Debug - Fallback response:', fallbackResponse);
          
          const allQuizzes = fallbackResponse.items || fallbackResponse.value || fallbackResponse || [];
          console.log('🔍 Debug - All quizzes from fallback:', allQuizzes);
          
          // Filtrer selon les groupes de l'étudiant
          accessibleQuizzes = allQuizzes.filter((quiz: any) => {
            console.log('🔍 Debug - Checking quiz:', quiz);
            console.log('🔍 Debug - Quiz target_groups:', quiz.target_groups);
            console.log('🔍 Debug - User classLevel:', user?.studentDetails?.class_level);
            
            if (!quiz.target_groups || quiz.target_groups.length === 0) {
              console.log('🔍 Debug - Quiz accessible à tous (pas de target_groups)');
              return true; // Quiz accessible à tous
            }
            
            const isAccessible = quiz.target_groups.includes(user?.studentDetails?.class_level);
            console.log('🔍 Debug - Quiz accessible:', isAccessible);
            return isAccessible;
          });
          
          console.log('🔍 Debug - Fallback quizzes:', accessibleQuizzes);
        }
        
        const originalQuizzes = accessibleQuizzes || [];
        console.log('🔍 Debug - Original quizzes count:', originalQuizzes.length);
        console.log('🔍 Debug - Original quizzes data:', originalQuizzes);
        
        console.log('🔍 Debug - Mapping quizzes from:', originalQuizzes);
        
        const apiQuizzes: Quiz[] = originalQuizzes.map((q: any) => {
          console.log('🔍 Debug - Mapping quiz:', q);
          
          const mappedQuiz = {
            id: String(q.id),
            title: q.title || 'Sans titre',
            description: q.description || '',
            subject: q.subject === 'Histoire' ? 'history' : q.subject === 'Géographie' ? 'geography' : 'both',
            duration: q.duration || 30,
            questions: 0, // Will be updated when questions are loaded
            attempts: q.attempts || 0,
            completionRate: 0, // Will be calculated
            tags: Array.isArray(q.tags) ? q.tags : [],
            createdAt: q.created_at || new Date().toISOString(),
            isCompleted: false, // Will be updated based on user attempts
            isAvailable: true,
            isNew: new Date(q.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // New if created in last 7 days
            isFavorite: false,
            author: 'Admin',
            category: q.subject,
            rewards: {}
          };
          
          console.log('🔍 Debug - Mapped quiz:', mappedQuiz);
          return mappedQuiz;
        });
        
        console.log('🔍 Debug - Final apiQuizzes:', apiQuizzes);
        
        // Load questions count for each quiz
        for (const quiz of apiQuizzes) {
          try {
            const questionsResponse = await quizzesAPI.getQuestions(parseInt(quiz.id));
            quiz.questions = questionsResponse?.length || 0;
          } catch (error) {
            console.error(`Error loading questions for quiz ${quiz.id}:`, error);
          }
        }
        
        // Check user attempts and filter out quizzes that don't allow retakes
        if (studentId) {
          // Check attempts for each quiz
          for (let i = 0; i < apiQuizzes.length; i++) {
            const quiz = apiQuizzes[i];
            const originalQuiz = originalQuizzes[i];
            
            try {
              const attemptsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/quizzes/attempts?quiz_id=${quiz.id}&student_id=${studentId}`);
              if (attemptsResponse.ok) {
                const attempts = await attemptsResponse.json();
                if (attempts && attempts.length > 0) {
                  // User has attempted this quiz
                  quiz.isCompleted = true;
                  
                  // If quiz doesn't allow retakes, mark it as not available
                  if (!originalQuiz.allow_retake) {
                    quiz.isAvailable = false;
                  }
                }
              }
            } catch (error) {
              console.error(`Error checking attempts for quiz ${quiz.id}:`, error);
            }
          }
        }
        
        console.log('🔍 Debug - Setting quizzes state with:', apiQuizzes);
        setQuizzes(apiQuizzes);
        setFilteredQuizzes(apiQuizzes);
        
        // Log final pour debug
        setTimeout(() => {
          console.log('🔍 Debug - Final state check:');
          console.log('  - quizzes state:', apiQuizzes);
          console.log('  - filteredQuizzes state:', apiQuizzes);
        }, 100);
      } catch (error) {
        console.error('Error loading quizzes:', error);
        // No fallback to mock data - only show real quizzes from API
        setQuizzes([]);
        setFilteredQuizzes([]);
      }
    };
    
    loadQuizzes();
  }, []);

  useEffect(() => {
    let filtered = [...quizzes];

    // Filtrage par défaut : ne montrer que les quiz disponibles
    filtered = filtered.filter(quiz => quiz.isAvailable);

    // Recherche supprimée

    // Filtrage par matière
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(quiz => quiz.subject === selectedSubject);
    }

    // Filtrage par difficulté (désactivé si la propriété n'existe pas)
    // if (selectedDifficulty !== 'all') {
    //   filtered = filtered.filter(quiz => (quiz as any).difficulty === selectedDifficulty);
    // }

    // Filtrage par statut
    if (selectedStatus !== 'all') {
      switch (selectedStatus) {
        case 'available':
          filtered = filtered.filter(quiz => quiz.isAvailable && !quiz.isCompleted);
          break;
        case 'completed':
          filtered = filtered.filter(quiz => quiz.isCompleted);
          break;
        case 'new':
          filtered = filtered.filter(quiz => quiz.isNew);
          break;
        case 'favorites':
          filtered = filtered.filter(quiz => quiz.isFavorite);
          break;
      }
    }

    // Tri
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'duration':
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredQuizzes(filtered);
  }, [quizzes, selectedSubject, selectedDifficulty, selectedStatus, sortBy]);


  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'history': return History;
      case 'geography': return Globe;
      case 'both': return Brain;
      default: return BookOpen;
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'history': return 'from-amber-500 to-orange-600';
      case 'geography': return 'from-green-500 to-emerald-600';
      case 'both': return 'from-purple-500 to-violet-600';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  const toggleFavorite = (quizId: string) => {
    setQuizzes(prev => prev.map(quiz =>
      quiz.id === quizId ? { ...quiz, isFavorite: !quiz.isFavorite } : quiz
    ));
  };

  const formatDueDate = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Échéance dépassée';
    if (days === 0) return 'Aujourd\'hui';
    if (days === 1) return 'Demain';
    return `${days} jours`;
  };

  const renderQuizCard = (quiz: Quiz) => {
    const SubjectIcon = getSubjectIcon(quiz.subject);
    
    return (
      <div
        key={quiz.id}
        className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden transition-all hover:scale-105 hover:bg-white/15 ${
          !quiz.isAvailable ? 'opacity-60' : ''
        }`}
      >
        {/* Header de la carte */}
        <div className={`bg-gradient-to-r ${getSubjectColor(quiz.subject)} p-4 relative`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <SubjectIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">{quiz.title}</h3>
                <p className="text-white/80 text-sm">{quiz.category}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {quiz.isNew && (
                <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-semibold">
                  Nouveau
                </span>
              )}
              <button
                onClick={() => toggleFavorite(quiz.id)}
                className={`p-2 rounded-lg transition-all ${
                  quiz.isFavorite 
                    ? 'text-red-300 hover:text-red-200' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${quiz.isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Badges de statut */}
          <div className="flex items-center space-x-2 mt-3">
            {quiz.isCompleted && (
              <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full font-semibold flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Terminé
              </span>
            )}
          </div>
        </div>

        {/* Contenu de la carte */}
        <div className="p-4">
          <p className="text-blue-200 text-sm mb-4 line-clamp-2">{quiz.description}</p>
          
          {/* Statistiques */}
          <div className="flex justify-center space-x-6 mb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-300" />
              <span className="text-white text-sm">{quiz.duration} min</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-blue-300" />
              <span className="text-white text-sm">{quiz.questions} questions</span>
            </div>
          </div>

          {/* Score personnel si terminé */}
          {quiz.isCompleted && quiz.bestScore && (
            <div className="bg-green-500/20 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-green-300 text-sm">Votre meilleur score</span>
                <span className="text-green-300 font-bold text-base">{quiz.bestScore}%</span>
              </div>
              <div className="w-full bg-green-500/20 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all"
                  style={{ width: `${quiz.bestScore}%` }}
                />
              </div>
            </div>
          )}

          {/* Échéance */}
          {quiz.dueDate && !quiz.isCompleted && (
            <div className="flex items-center space-x-2 mb-4 text-orange-300">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Échéance : {formatDueDate(quiz.dueDate)}</span>
            </div>
          )}

          {/* Prérequis */}
          {quiz.prerequisites && quiz.prerequisites.length > 0 && (
            <div className="mb-4">
              <p className="text-blue-300 text-xs mb-2">Prérequis :</p>
              <div className="flex flex-wrap gap-1">
                {quiz.prerequisites.map((prereq, index) => (
                  <span key={index} className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded">
                    {prereq}
                  </span>
                ))}
              </div>
            </div>
          )}


          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {quiz.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="bg-white/10 text-blue-200 text-xs px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
            {quiz.tags.length > 3 && (
              <span className="text-blue-300 text-xs">+{quiz.tags.length - 3}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="text-blue-300 text-xs">
              Par {quiz.author}
            </div>
            <div className="flex items-center space-x-2">
              {quiz.isAvailable ? (
                <button
                  onClick={() => onStartQuiz(quiz.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    quiz.isCompleted
                      ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>{quiz.isCompleted ? 'Refaire' : 'Commencer'}</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span>Bientôt disponible</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderQuizList = (quiz: Quiz) => {
    const SubjectIcon = getSubjectIcon(quiz.subject);
    
    return (
      <div
        key={quiz.id}
        className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 transition-all hover:bg-white/15 ${
          !quiz.isAvailable ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`w-10 h-10 bg-gradient-to-r ${getSubjectColor(quiz.subject)} rounded-xl flex items-center justify-center`}>
              <SubjectIcon className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-white font-bold text-base">{quiz.title}</h3>
                {quiz.isNew && (
                  <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-semibold">
                    Nouveau
                  </span>
                )}
                {quiz.isCompleted && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
              </div>
              <p className="text-blue-200 text-sm mb-2">{quiz.description}</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-blue-300">
                  <Clock className="w-4 h-4" />
                  <span>{quiz.duration} min</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-300">
                  <Target className="w-4 h-4" />
                  <span>{quiz.questions} questions</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {quiz.isCompleted && quiz.bestScore && (
              <div className="text-center">
                <div className="text-green-400 font-bold text-base">{quiz.bestScore}%</div>
                <div className="text-green-300 text-xs">Meilleur score</div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleFavorite(quiz.id)}
                className={`p-2 rounded-lg transition-all ${
                  quiz.isFavorite 
                    ? 'text-red-300 hover:text-red-200' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${quiz.isFavorite ? 'fill-current' : ''}`} />
              </button>
              
              {quiz.isAvailable ? (
                <button
                  onClick={() => onStartQuiz(quiz.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    quiz.isCompleted
                      ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>{quiz.isCompleted ? 'Refaire' : 'Commencer'}</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span>Bientôt</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const availableQuizzes = filteredQuizzes.filter(q => q.isAvailable && !q.isCompleted);
  const completedQuizzes = filteredQuizzes.filter(q => q.isCompleted);
  const upcomingQuizzes = filteredQuizzes.filter(q => !q.isAvailable);

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-base font-bold mb-2">Mes Quiz</h1>
            <p className="text-blue-200">Découvrez et testez vos connaissances</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
              title="Actualiser"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="text-white text-base font-bold">{availableQuizzes.length}</div>
              <div className="text-blue-300 text-sm">Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 text-base font-bold">{completedQuizzes.length}</div>
              <div className="text-green-300 text-sm">Terminés</div>
            </div>
            <div className="text-center">
              <div className="text-orange-400 text-base font-bold">{upcomingQuizzes.length}</div>
              <div className="text-orange-300 text-sm">À venir</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white hover:from-green-600 hover:to-emerald-700 transition-all">
          <div className="flex items-center space-x-3">
            <Shuffle className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">Quiz aléatoire</div>
              <div className="text-green-100 text-sm">Défi surprise</div>
            </div>
          </div>
        </button>

        <button className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl p-4 text-white hover:from-purple-600 hover:to-violet-700 transition-all">
          <div className="flex items-center space-x-3">
            <Timer className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">Mode chrono</div>
              <div className="text-purple-100 text-sm">Contre la montre</div>
            </div>
          </div>
        </button>

        <button className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-4 text-white hover:from-orange-600 hover:to-red-700 transition-all">
          <div className="flex items-center space-x-3">
            <Trophy className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">Défi du jour</div>
              <div className="text-orange-100 text-sm">Quiz spécial</div>
            </div>
          </div>
        </button>
      </div>



      {/* Liste des quiz */}
      <div className="space-y-4">
        {filteredQuizzes.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-10 h-10 mx-auto mb-4" />
            <h3 className="text-white text-base font-bold mb-2">Aucun quiz trouvé</h3>
            <div className="mt-4 text-sm text-blue-300">
            </div>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredQuizzes.map(quiz => 
              viewMode === 'grid' ? renderQuizCard(quiz) : renderQuizList(quiz)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizListTab;


