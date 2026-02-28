import { useState, useEffect } from 'react';

interface ParentDashboardStats {
  completedQuizzes: number;
  averageScore: number;
  totalMessages: number;
  unreadMessages: number;
  totalMeetings: number;
  pendingMeetings: number;
}

export const useParentDashboardStats = () => {
  const [stats, setStats] = useState<ParentDashboardStats>({
    completedQuizzes: 0,
    averageScore: 0,
    totalMessages: 0,
    unreadMessages: 0,
    totalMeetings: 0,
    pendingMeetings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadParentDashboardStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const userDetails = localStorage.getItem('userDetails');
      const currentUser = userDetails ? JSON.parse(userDetails) : null;
      const currentUserId = currentUser?.id;
      const token = localStorage.getItem('token');

      if (!currentUserId || !token) {
        console.log('No user connected or missing token');
        setLoading(false);
        return;
      }

      let completedQuizzes = 0;
      let totalScore = 0;
      let totalValidResults = 0;
      let totalMessages = 0;
      let unreadMessages = 0;
      let totalMeetings = 0;
      let pendingMeetings = 0;

       // Get parent ID first
       let currentParentId = null;
       try {
         console.log('?? Getting parent ID for user:', currentUserId);
         const parentResponse = await fetch(`${API_BASE}/parents/by-user/${currentUserId}`, {
           headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
         });
         
         if (parentResponse.ok) {
           const parentData = await parentResponse.json();
           currentParentId = parentData.id;
           console.log('??????????? Parent ID found:', currentParentId);
         } else {
           console.error('? Error getting parent ID:', parentResponse.status);
         }
       } catch (error) {
         console.error('? Error getting parent ID:', error);
       }

       // Get children
       try {
         console.log('?? Fetching children for parent:', currentParentId);
         // Utiliser directement l'API backend au lieu de l'API frontend
         const childrenResponse = await fetch(`${API_BASE}/parents/children?parentId=${currentParentId}`, {
           headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
         });
         
         if (childrenResponse.ok && currentParentId) {
           const children = await childrenResponse.json();
           console.log('?? Children found:', children);
           
           if (children && children.length > 0) {
             for (const child of children) {
               try {
                 console.log('?? Fetching quiz attempts for child', child.id);
                 const resultsResponse = await fetch(`${API_BASE}/quizzes/attempts?student_id=${child.id}`);
                 
                 console.log('?? API Response status:', resultsResponse.status);
                 
                 if (resultsResponse.ok) {
                   const attempts = await resultsResponse.json();
                   console.log('? Quiz attempts for child', child.id, ':', attempts);
                   
                   if (attempts && attempts.length > 0) {
                     completedQuizzes += attempts.length;
                     console.log('?? Updated completedQuizzes:', completedQuizzes);
                     
                     const validResults = attempts.filter((result: any) => result.percentage !== null && result.percentage !== undefined);
                     console.log('? Valid results for child', child.id, ':', validResults.length);
                     
                     if (validResults.length > 0) {
                       validResults.forEach((result: any) => {
                         totalScore += (result.percentage || 0);
                         totalValidResults += 1;
                         console.log('?? Added score:', result.percentage, 'Total score now:', totalScore);
                       });
                     }
                   } else {
                     console.log('?? No attempts found for child', child.id);
                   }
                 } else {
                   const errorText = await resultsResponse.text();
                   console.error('? API Error for child', child.id, ':', resultsResponse.status, errorText);
                 }
               } catch (error) {
                 console.error('? Error getting quiz attempts for child', child.id, ':', error);
               }
             }
           } else {
             console.log('?? No children found for parent');
           }
         } else {
           const errorText = await childrenResponse.text();
           console.error('? Error fetching children:', childrenResponse.status, errorText);
         }
       } catch (error) {
         console.error('? Error getting children:', error);
       }

      // Get messages
      try {
        const conversationsResponse = await fetch(`${API_BASE}/messaging/conversations?userId=${currentUserId}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        
        if (conversationsResponse.ok) {
          const conversations = await conversationsResponse.json();
          
          for (const conversation of conversations) {
            try {
              const messagesResponse = await fetch(`${API_BASE}/messaging/conversations/${conversation.id}/messages`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
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
              console.log('Error getting messages:', error);
            }
          }
        }
      } catch (error) {
        console.log('Error getting conversations:', error);
      }

       // Get meetings
       if (currentParentId) {
         try {
           const rendezVousResponse = await fetch(`${API_BASE}/rendez-vous?parentId=${currentParentId}`, {
             headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
           });
         
           if (rendezVousResponse.ok) {
             const rendezVous = await rendezVousResponse.json();
             
             if (rendezVous && rendezVous.length > 0) {
               totalMeetings = rendezVous.length;
               pendingMeetings = rendezVous.filter((rdv: any) => rdv.status === 'pending').length;
             }
           }
         } catch (error) {
           console.log('Error getting meetings:', error);
         }
       }

      const averageScore = totalValidResults > 0 ? Math.round(totalScore / totalValidResults) : 0;

      console.log('?? Final calculation:');
      console.log('  - completedQuizzes:', completedQuizzes);
      console.log('  - totalScore:', totalScore);
      console.log('  - totalValidResults:', totalValidResults);
      console.log('  - averageScore:', averageScore);

      const finalStats: ParentDashboardStats = {
        completedQuizzes,
        averageScore,
        totalMessages,
        unreadMessages,
        totalMeetings,
        pendingMeetings
      };
      
      console.log('? Final parent dashboard stats:', finalStats);
      setStats(finalStats);
      
    } catch (error) {
      console.error('Error loading parent dashboard stats:', error);
      setError('Error loading statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParentDashboardStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refreshStats: loadParentDashboardStats
  };
};
