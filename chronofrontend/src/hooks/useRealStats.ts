import { useState, useEffect } from 'react';

interface RealStats {
  totalUsers: number;
  totalStudents: number;
  totalParents: number;
  totalQuizzes: number;
  totalMessages: number;
  unreadMessages: number;
  completedQuizzes: number;
  averageScore: number;
  userConversations: number;
  userUnreadMessages: number;
}

export const useRealStats = () => {
  const [stats, setStats] = useState<RealStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalParents: 0,
    totalQuizzes: 0,
    totalMessages: 0,
    unreadMessages: 0,
    completedQuizzes: 0,
    averageScore: 0,
    userConversations: 0,
    userUnreadMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRealStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Recuperer l'utilisateur connecte
      const userDetails = localStorage.getItem('userDetails');
      const currentUser = userDetails ? JSON.parse(userDetails) : null;
      const currentUserId = currentUser?.id;
      const userRole = currentUser?.role;
      
      let totalStudents = 0;
      let totalParents = 0;
      let totalUsers = 0;
      
      // Recuperer les statistiques selon le role de l'utilisateur
      if (userRole === 'admin') {
        // Pour les admins, recuperer toutes les donnees avec authentification
        const token = localStorage.getItem('token');
        
        try {
          // Recuperer le total d'etudiants avec une limite elevee pour obtenir tous les resultats
          const studentsResponse = await fetch(`${API_BASE}/admin/students?limit=1000`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (studentsResponse.ok) {
            const studentsData = await studentsResponse.json();
            const students = studentsData.items || [];
            totalStudents = students.length;
            console.log('Etudiants trouves:', totalStudents);
          } else {
            console.log('Erreur recuperation etudiants:', studentsResponse.status);
          }
        } catch (error) {
          console.log('Erreur recuperation etudiants:', error);
        }

        try {
          // Recuperer le total de parents avec une limite elevee pour obtenir tous les resultats
          const parentsResponse = await fetch(`${API_BASE}/admin/parents?limit=1000`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (parentsResponse.ok) {
            const parentsData = await parentsResponse.json();
            const parents = parentsData.items || [];
            totalParents = parents.length;
            console.log('Parents trouves:', totalParents);
          } else {
            console.log('Erreur recuperation parents:', parentsResponse.status);
          }
        } catch (error) {
          console.log('Erreur recuperation parents:', error);
        }
        
        totalUsers = totalStudents + totalParents;
      } else {
        // Pour les etudiants et parents, utiliser des valeurs par defaut ou des estimations
        totalUsers = 1; // Au minimum l'utilisateur connecte
        totalStudents = userRole === 'student' ? 1 : 0;
        totalParents = userRole === 'parent' ? 1 : 0;
      }

      // 2. Recuperer tous les quiz
      const quizzesResponse = await fetch(`${API_BASE}/quizzes`);
      let totalQuizzes = 0;
      let quizzes: any[] = [];
      
      if (quizzesResponse.ok) {
        const quizzesData = await quizzesResponse.json();
        quizzes = quizzesData.items || [];
        totalQuizzes = quizzes.length;
      }

      // 3. Recuperer les conversations de l'utilisateur connecte
      let userConversations = 0;
      let userUnreadMessages = 0;
      let totalMessages = 0;
      
      if (currentUserId) {
        try {
          // Recuperer les conversations de l'utilisateur avec authentification
          const token = localStorage.getItem('token');
          const conversationsResponse = await fetch(`${API_BASE}/messaging/conversations?userId=${currentUserId}&userRole=${userRole}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (conversationsResponse.ok) {
            const conversations = await conversationsResponse.json();
            userConversations = conversations.length;
            
            // Pour chaque conversation, recuperer les messages non lus
            for (const conversation of conversations) {
              try {
                const messagesResponse = await fetch(`${API_BASE}/messaging/conversations/${conversation.id}/messages`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (messagesResponse.ok) {
                  const messages = await messagesResponse.json();
                  totalMessages += messages.length;
                  
                  // Compter les messages non lus (pas envoyes par l'utilisateur actuel)
                  const unreadCount = messages.filter((m: any) => 
                    !m.is_read && m.sender_id !== currentUserId
                  ).length;
                  userUnreadMessages += unreadCount;
                }
              } catch (error) {
                console.error('Erreur lors de la recuperation des messages:', error);
              }
            }
          } else {
            console.log('Erreur recuperation conversations:', conversationsResponse.status);
          }
        } catch (error) {
          console.error('Erreur lors de la recuperation des conversations:', error);
        }
      }

      // 4. Recuperer les tentatives de quiz
      let totalAttempts = 0;
      let averageScore = 0;
      
      if (currentUserId) {
        try {
          // Recuperer les tentatives de l'utilisateur connecte avec authentification
          const token = localStorage.getItem('token');
          const attemptsResponse = await fetch(`${API_BASE}/quizzes/attempts?student_id=${currentUserId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (attemptsResponse.ok) {
            const attempts = await attemptsResponse.json();
            totalAttempts = attempts.length;
            
            if (attempts.length > 0) {
              const totalScore = attempts.reduce((sum: number, attempt: any) => {
                return sum + (attempt.percentage || 0);
              }, 0);
              averageScore = totalScore / attempts.length;
            }
          } else {
            console.log('Erreur recuperation tentatives:', attemptsResponse.status);
          }
        } catch (error) {
          console.log('Erreur recuperation tentatives:', error);
        }
      }

      const finalStats = {
        totalUsers,
        totalStudents,
        totalParents,
        totalQuizzes,
        totalMessages,
        unreadMessages: userUnreadMessages, // Messages non lus de l'utilisateur connecte
        completedQuizzes: totalAttempts,
        averageScore,
        userConversations,
        userUnreadMessages
      };
      
      console.log('Statistiques reelles chargees:', finalStats);
      console.log('Utilisateur connecte:', { id: currentUserId, role: userRole });
      console.log('Mise a jour de l\'interface avec les nouvelles donnees');
      
      setStats(finalStats);
      
    } catch (error) {
      setError('Erreur lors du chargement des statistiques');
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refreshStats: loadRealStats
  };
};