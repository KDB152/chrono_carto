import { useState, useEffect } from 'react';
import urlapi from '../config/url';
interface StudentStats {
  completedQuizzes: number;
  averageScore: number;
  totalQuizzes: number;
  currentStreak: number;
  timeSpent: number;
  badges: number;
  rank: number;
}

export const useStudentStats = () => {
  const [stats, setStats] = useState<StudentStats>({
    completedQuizzes: 0,
    averageScore: 0,
    totalQuizzes: 0,
    currentStreak: 0,
    timeSpent: 0,
    badges: 0,
    rank: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudentStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
     
      // Récupérer l'utilisateur connecté
      const userDetails = localStorage.getItem('userDetails');
      const currentUser = userDetails ? JSON.parse(userDetails) : null;
      const currentUserId = currentUser?.id;
      
      if (!currentUserId) {
        throw new Error('Utilisateur non connecté');
      }

      console.log('🎓 Chargement des statistiques étudiant pour:', currentUserId);

      // 1. Récupérer tous les quiz disponibles
      const quizzesResponse = await fetch(`${urlapi.backendurlsapi.quizzes}`);
      let totalQuizzes = 0;
      
      if (quizzesResponse.ok) {
        const quizzesData = await quizzesResponse.json();
        const quizzes = quizzesData.items || [];
        totalQuizzes = quizzes.length;
        console.log('📚 Quiz disponibles:', totalQuizzes);
      }

      // 2. Récupérer les tentatives de l'étudiant
      let completedQuizzes = 0;
      let averageScore = 0;
      
      try {
        // Utiliser le bon endpoint avec l'authentification
        const token = localStorage.getItem('token');
        const attemptsResponse = await fetch(`${urlapi.backendurlsapi.attempts}?student_id=${currentUserId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (attemptsResponse.ok) {
          const attempts = await attemptsResponse.json();
          completedQuizzes = attempts.length;
          
          console.log('📝 Tentatives trouvées:', completedQuizzes, attempts);
          
          if (attempts.length > 0) {
            const totalScore = attempts.reduce((sum: number, attempt: any) => {
              return sum + (attempt.percentage || 0);
            }, 0);
            averageScore = Math.round(totalScore / attempts.length);
            
            console.log('📊 Score moyen calculé:', averageScore);
          }
        } else {
          console.log('❌ Erreur récupération tentatives:', attemptsResponse.status, await attemptsResponse.text());
        }
      } catch (error) {
        console.log('❌ Erreur lors de la récupération des tentatives:', error);
      }

      // 3. Récupérer les messages de l'étudiant
      let totalMessages = 0;
      let unreadMessages = 0;
      
      try {
        const token = localStorage.getItem('token');
        const conversationsResponse = await fetch(`${urlapi.urlsapi.conversation}?userId=${currentUserId}&userRole=student`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (conversationsResponse.ok) {
          const conversations = await conversationsResponse.json();
          console.log('💬 Conversations trouvées:', conversations.length);
          
          for (const conversation of conversations) {
            try {
              const messagesResponse = await fetch(`${urlapi.urlsapi.conversation}/${conversation.id}${urlapi.urlsapi.messages}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (messagesResponse.ok) {
                const messages = await messagesResponse.json();
                totalMessages += messages.length;
                
                const unreadCount = messages.filter((m: any) => 
                  !m.is_read && m.sender_id !== currentUserId
                ).length;
                unreadMessages += unreadCount;
              }
            } catch (error) {
              console.log('Erreur récupération messages conversation:', error);
            }
          }
        } else {
          console.log('❌ Erreur récupération conversations:', conversationsResponse.status);
        }
      } catch (error) {
        console.log('Erreur récupération conversations:', error);
      }

      const finalStats: StudentStats = {
        completedQuizzes,
        averageScore,
        totalQuizzes,
        currentStreak: 0, // Pas de données de série dans l'API actuelle
        timeSpent: 0, // Pas de données de temps dans l'API actuelle
        badges: Math.floor(completedQuizzes / 5), // Badges basés sur les quiz terminés
        rank: 1 // Rang par défaut
      };
      
      console.log('✅ Statistiques étudiant finales:', finalStats);
      setStats(finalStats);
      
    } catch (error) {
      setError('Erreur lors du chargement des statistiques étudiant');
      console.error('❌ Erreur lors du chargement des statistiques étudiant:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refreshStats: loadStudentStats
  };
};

