import { useState, useEffect } from 'react';
import urlapi from '../config/url';
interface SimpleStats {
  completedQuizzes: number;
  averageScore: number;
  totalQuizzes: number;
  unreadMessages: number;
}

export const useSimpleStats = () => {
  const [stats, setStats] = useState<SimpleStats>({
    completedQuizzes: 0,
    averageScore: 0,
    totalQuizzes: 0,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSimpleStats = async () => {
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

      console.log('🎯 Chargement des statistiques simples pour:', currentUserId);

      // 1. Récupérer tous les quiz disponibles (sans authentification pour test)
      let totalQuizzes = 0;
      try {
        const quizzesResponse = await fetch(`${urlapi.backendurlsapi.quizzes}`);
        if (quizzesResponse.ok) {
          const quizzesData = await quizzesResponse.json();
          const quizzes = quizzesData.items || [];
          totalQuizzes = quizzes.length;
          console.log('📚 Quiz disponibles:', totalQuizzes);
        } else {
          console.log('❌ Erreur récupération quiz:', quizzesResponse.status);
        }
      } catch (error) {
        console.log('❌ Erreur lors de la récupération des quiz:', error);
      }

      // 2. Récupérer les tentatives comme dans ProgressTab et QuizListTab
      let completedQuizzes = 0;
      let averageScore = 0;
      
      try {
        // Utiliser la même logique que ProgressTab
        const userDetails = localStorage.getItem('userDetails');
        if (userDetails) {
          const user = JSON.parse(userDetails);
          const studentId = user.studentDetails?.id || user.id;
          
          if (studentId) {
            console.log('📄 Chargement des tentatives pour l\'étudiant:', studentId);
            
            const response = await fetch(`${urlapi.backendurlsapi.attempts}?student_id=${studentId}`);
            
            if (response.ok) {
              const attempts = await response.json();
              completedQuizzes = attempts.length;
              
              console.log('📊 Tentatives de quiz récupérées:', attempts);
              
              if (attempts.length > 0) {
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
                  .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
                  .map(result => result.value)
                  .filter(result => result !== null);

                if (validResults.length > 0) {
                  const totalScore = validResults.reduce((sum: number, result: any) => {
                    return sum + (result.percentage || 0);
                  }, 0);
                  averageScore = Math.round(totalScore / validResults.length);
                  
                  console.log('📊 Score moyen calculé:', averageScore);
                }
              }
            } else {
              console.log('❌ Erreur récupération tentatives:', response.status);
            }
          }
        }
      } catch (error) {
        console.log('❌ Erreur lors de la récupération des tentatives:', error);
      }

      // 3. Essayer de récupérer les messages
      let unreadMessages = 0;
      
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const conversationsResponse = await fetch(`${urlapi.urlsapi.conversation}?userId=${currentUserId}&userRole=student`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('📡 Réponse conversations:', conversationsResponse.status);
          
          if (conversationsResponse.ok) {
            const conversations = await conversationsResponse.json();
            console.log('💬 Conversations trouvées:', conversations.length);
            
            // Compter les messages non lus (simplifié)
            unreadMessages = conversations.length; // Approximation
          } else {
            const errorText = await conversationsResponse.text();
            console.log('❌ Erreur récupération conversations:', conversationsResponse.status, errorText);
          }
        }
      } catch (error) {
        console.log('❌ Erreur récupération conversations:', error);
      }

      const finalStats: SimpleStats = {
        completedQuizzes,
        averageScore,
        totalQuizzes,
        unreadMessages
      };
      
      console.log('✅ Statistiques simples finales:', finalStats);
      setStats(finalStats);
      
    } catch (error) {
      setError('Erreur lors du chargement des statistiques');
      console.error('❌ Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSimpleStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refreshStats: loadSimpleStats
  };
};

