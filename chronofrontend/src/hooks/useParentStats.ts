import { useState, useEffect } from 'react';

interface ParentStats {
  totalChildren: number;
  childrenCompletedQuizzes: number;
  childrenAverageScore: number;
  totalQuizzes: number;
  unreadMessages: number;
}

export const useParentStats = () => {
  const [stats, setStats] = useState<ParentStats>({
    totalChildren: 0,
    childrenCompletedQuizzes: 0,
    childrenAverageScore: 0,
    totalQuizzes: 0,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadParentStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Récupérer l'utilisateur connecté
      const userDetails = localStorage.getItem('userDetails');
      const currentUser = userDetails ? JSON.parse(userDetails) : null;
      const currentUserId = currentUser?.id;
      
      if (!currentUserId) {
        throw new Error('Utilisateur non connecté');
      }

      console.log('👨‍👩‍👧‍👦 Chargement des statistiques parent pour:', currentUserId);

      // 1. Récupérer tous les quiz disponibles
      const quizzesResponse = await fetch(`${API_BASE}/quizzes`);
      let totalQuizzes = 0;
      
      if (quizzesResponse.ok) {
        const quizzesData = await quizzesResponse.json();
        const quizzes = quizzesData.items || [];
        totalQuizzes = quizzes.length;
        console.log('📚 Quiz disponibles:', totalQuizzes);
      }

      // 2. Récupérer les enfants du parent
      let totalChildren = 0;
      let childrenCompletedQuizzes = 0;
      let childrenAverageScore = 0;
      
      try {
        // Récupérer les enfants du parent
        const childrenResponse = await fetch(`${API_BASE}/parents/${currentUserId}/children`);
        if (childrenResponse.ok) {
          const children = await childrenResponse.json();
          totalChildren = children.length;
          console.log('👶 Enfants trouvés:', totalChildren);
          
          // Pour chaque enfant, récupérer ses tentatives
          for (const child of children) {
            try {
              const attemptsResponse = await fetch(`${API_BASE}/quizzes/attempts?student_id=${child.id}`);
              if (attemptsResponse.ok) {
                const attempts = await attemptsResponse.json();
                childrenCompletedQuizzes += attempts.length;
                
                if (attempts.length > 0) {
                  const totalScore = attempts.reduce((sum: number, attempt: any) => {
                    return sum + (attempt.percentage || 0);
                  }, 0);
                  const childAverage = totalScore / attempts.length;
                  childrenAverageScore += childAverage;
                }
              }
            } catch (error) {
              console.log('Erreur récupération tentatives enfant:', error);
            }
          }
          
          // Calculer la moyenne des scores des enfants
          if (totalChildren > 0) {
            childrenAverageScore = Math.round(childrenAverageScore / totalChildren);
          }
        }
      } catch (error) {
        console.log('❌ Erreur lors de la récupération des enfants:', error);
      }

      // 3. Récupérer les messages du parent
      let unreadMessages = 0;
      
      try {
        const conversationsResponse = await fetch(`${API_BASE}/messaging/conversations?userId=${currentUserId}`);
        if (conversationsResponse.ok) {
          const conversations = await conversationsResponse.json();
          
          for (const conversation of conversations) {
            try {
              const messagesResponse = await fetch(`${API_BASE}/messaging/conversations/${conversation.id}/messages`);
              if (messagesResponse.ok) {
                const messages = await messagesResponse.json();
                
                const unreadCount = messages.filter((m: any) => 
                  !m.is_read && m.sender_id !== currentUserId
                ).length;
                unreadMessages += unreadCount;
              }
            } catch (error) {
              console.log('Erreur récupération messages conversation:', error);
            }
          }
        }
      } catch (error) {
        console.log('Erreur récupération conversations:', error);
      }

      const finalStats: ParentStats = {
        totalChildren,
        childrenCompletedQuizzes,
        childrenAverageScore,
        totalQuizzes,
        unreadMessages
      };
      
      console.log('✅ Statistiques parent finales:', finalStats);
      setStats(finalStats);
      
    } catch (error) {
      setError('Erreur lors du chargement des statistiques parent');
      console.error('❌ Erreur lors du chargement des statistiques parent:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParentStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refreshStats: loadParentStats
  };
};

