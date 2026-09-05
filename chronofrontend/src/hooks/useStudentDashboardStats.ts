import { useState, useEffect } from 'react';
import urlapi from '../config/url';
interface StudentDashboardStats {
  totalMessages: number;
  unreadMessages: number;
  totalResources: number;
}

export const useStudentDashboardStats = () => {
  const [stats, setStats] = useState<StudentDashboardStats>({
    totalMessages: 0,
    unreadMessages: 0,
    totalResources: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudentDashboardStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
     
      const userDetails = localStorage.getItem('userDetails');
      const currentUser = userDetails ? JSON.parse(userDetails) : null;
      const currentUserId = currentUser?.id;
      const userRole = currentUser?.role;
      const token = localStorage.getItem('token');

      if (!currentUserId || !token) {
        console.log('❌ Pas d\'utilisateur connecté ou token manquant');
        setLoading(false);
        return;
      }

      let totalMessages = 0;
      let unreadMessages = 0;
      let totalResources = 0;

      // 1. Récupérer les messages reçus
      try {
        const conversationsResponse = await fetch(`${urlapi.urlsapi.conversation}?userId=${currentUserId}&userRole=${userRole}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        
        if (conversationsResponse.ok) {
          const conversations = await conversationsResponse.json();
          console.log('💬 Conversations récupérées pour étudiant:', conversations);
          
          if (conversations && conversations.length > 0) {
            // Récupérer tous les messages de toutes les conversations
            for (const conversation of conversations) {
              try {
                const messagesResponse = await fetch(`${urlapi.urlsapi.conversation}/${conversation.id}${urlapi.urlsapi.messages}`, {
                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                
                if (messagesResponse.ok) {
                  const messages = await messagesResponse.json();
                  
                  // Compter les messages reçus (pas envoyés par l'utilisateur actuel)
                  const receivedMessages = messages.filter((msg: any) => msg.sender_id !== currentUserId);
                  totalMessages += receivedMessages.length;
                  
                  // Compter les messages non lus
                  const unreadCount = messages.filter((msg: any) => 
                    !msg.is_read && msg.sender_id !== currentUserId
                  ).length;
                  unreadMessages += unreadCount;
                }
              } catch (error) {
                console.log('❌ Erreur récupération messages conversation:', error);
              }
            }
          }
        }
      } catch (error) {
        console.log('❌ Erreur récupération conversations:', error);
      }

      // 2. Récupérer les ressources (dossiers de la classe de l'étudiant)
      try {
        // D'abord, récupérer la classe de l'étudiant
        let studentClass = null;
        if (currentUser?.studentDetails?.class_level) {
          studentClass = currentUser.studentDetails.class_level;
        } else if (currentUser?.class_level) {
          studentClass = currentUser.class_level;
        }
        
        console.log('🎓 Classe de l\'étudiant:', studentClass);
        
        // Utiliser le même endpoint que l'interface "Mes Ressources"
        const foldersResponse = await fetch(`${urlapi.backendurlsapi.studentdossier}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        console.log('📁 Tentative endpoint dossiers étudiants, status:', foldersResponse.status);
        
        if (foldersResponse.ok) {
          const response = await foldersResponse.json();
          console.log('📁 Réponse dossiers complète:', response);
          
          // L'endpoint /new-structure/student/dossiers retourne directement un tableau
          const dossiers = response;
          console.log('📁 Dossiers extraits:', dossiers);
          console.log('📁 Type de dossiers:', typeof dossiers, 'Longueur:', Array.isArray(dossiers) ? dossiers.length : 'N/A');
          
          if (dossiers && Array.isArray(dossiers) && dossiers.length > 0) {
            console.log('📁 Premier dossier:', dossiers[0]);
            console.log('📁 Propriétés du premier dossier:', Object.keys(dossiers[0]));
            
            // Les dossiers retournés par /new-structure/student/dossiers sont déjà filtrés pour l'étudiant
            // On compte simplement tous les dossiers retournés
            totalResources = dossiers.length;
            console.log('📁 Dossiers accessibles à l\'étudiant:', totalResources, dossiers.map(d => d.name));
          } else {
            console.log('❌ Aucun dossier trouvé ou format invalide');
          }
        } else {
          console.log('❌ Erreur récupération dossiers:', foldersResponse.status, await foldersResponse.text());
          totalResources = 0;
        }
      } catch (error) {
        console.log('❌ Erreur récupération dossiers:', error);
      }

      const finalStats: StudentDashboardStats = {
        totalMessages,
        unreadMessages,
        totalResources
      };
      
      console.log('✅ Statistiques dashboard étudiant finales:', finalStats);
      setStats(finalStats);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des statistiques dashboard étudiant:', error);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentDashboardStats();
  }, []);

  return { 
    stats, 
    loading, 
    error, 
    refreshStats: loadStudentDashboardStats 
  };
};

