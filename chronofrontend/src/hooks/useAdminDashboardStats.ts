import { useState, useEffect } from 'react';

interface AdminDashboardStats {
  unreadMessages: number;
  pendingMeetings: number;
}

export const useAdminDashboardStats = () => {
  const [stats, setStats] = useState<AdminDashboardStats>({
    unreadMessages: 0,
    pendingMeetings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdminDashboardStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      const userDetails = localStorage.getItem('userDetails');
      const currentUser = userDetails ? JSON.parse(userDetails) : null;
      const currentUserId = currentUser?.id;
      const userRole = currentUser?.role;

      if (!token || !currentUserId || userRole !== 'admin') {
        console.log('No authentication or not admin');
        setStats({ unreadMessages: 0, pendingMeetings: 0 });
        return;
      }

      let unreadMessages = 0;
      let pendingMeetings = 0;

      // Get unread messages
      try {
        console.log('Fetching conversations for admin:', currentUserId);
        const conversationsResponse = await fetch(`${API_BASE}/messaging/conversations?userId=${currentUserId}&userRole=${userRole}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        console.log('Conversations response status:', conversationsResponse.status);

        if (conversationsResponse.ok) {
          const conversations = await conversationsResponse.json();
          console.log('Conversations found for admin:', conversations.length);

          for (const conversation of conversations) {
            const messagesResponse = await fetch(`${API_BASE}/messaging/conversations/${conversation.id}/messages`, {
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            if (messagesResponse.ok) {
              const messages = await messagesResponse.json();
              console.log('Messages in conversation:', messages.length);
              const unreadCount = messages.filter((msg: any) => 
                msg.sender_id !== currentUserId && !msg.is_read
              ).length;
              unreadMessages += unreadCount;
              console.log('Unread messages in this conversation:', unreadCount);
            }
          }
          console.log('Total unread messages:', unreadMessages);
        } else {
          console.log('Error fetching conversations:', conversationsResponse.status);
        }
      } catch (error) {
        console.log('Error getting admin messages:', error);
      }

      // Get pending meetings
      try {
        console.log('Fetching rendez-vous for admin dashboard');
        const rendezVousResponse = await fetch(`${API_BASE}/rendez-vous`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        console.log('Rendez-vous response status:', rendezVousResponse.status);

        if (rendezVousResponse.ok) {
          const rendezVous = await rendezVousResponse.json();
          console.log('All rendez-vous:', rendezVous);
          pendingMeetings = rendezVous.filter((rdv: any) => rdv.status === 'pending').length;
          console.log('Pending meetings:', pendingMeetings);
        } else {
          console.log('Error fetching rendez-vous:', rendezVousResponse.status);
        }
      } catch (error) {
        console.log('Error getting meetings:', error);
      }

      const finalStats: AdminDashboardStats = {
        unreadMessages,
        pendingMeetings
      };

      console.log('Final admin dashboard stats:', finalStats);
      setStats(finalStats);
    } catch (error) {
      console.error('Error loading admin dashboard stats:', error);
      setError('Error loading statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminDashboardStats();
  }, []);

  return { stats, loading, error, refreshStats: loadAdminDashboardStats };
};
