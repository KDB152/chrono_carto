'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { getChildName, getChildFullName } from '@/lib/userUtils';
import {
  Archive,
  Trash2,
  Mail,
  Check,
  X,
  Filter,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Info,
  MessageSquare,
  Calendar,
  Award,
  TrendingUp,
  FileText,
  CreditCard,
  Settings,
  User,
  Users,
  Clock,
  Tag,
  Star,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
} from 'lucide-react';

export type NotificationType = 'meeting_reminder' | 'quiz_completed' | 'payment_overdue' | 'unread_message' | 'meeting_scheduled' | 'payment_reminder';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  is_urgent: boolean;
  related_entity_type?: string;
  related_entity_id?: number;
  metadata?: any;
  created_at: string;
  read_at?: string;
  type_name: string;
  icon: string;
  color: string;
}

// API functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Fonction pour obtenir l'ID de l'utilisateur parent (pour les tests)
const getParentUserId = (): number => {
  // Pour les tests, on utilise l'ID 42 (Najwa Ettounsi)
  // En production, cela viendrait de l'authentification
  return 42;
};

const fetchNotifications = async (limit = 50, offset = 0): Promise<Notification[]> => {
  const userId = getParentUserId();
  const response = await fetch(`${API_BASE_URL}/notifications/test/user/${userId}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des notifications');
  }
  
  return response.json();
};

const fetchUnreadCount = async (): Promise<number> => {
  const userId = getParentUserId();
  const response = await fetch(`${API_BASE_URL}/notifications/test/user/${userId}/unread-count`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors du chargement du nombre de notifications non lues');
  }
  
  const data = await response.json();
  return data.unreadCount;
};

const markAsRead = async (notificationId: number): Promise<boolean> => {
  // Pour les tests, on simule juste le succès
  // En production, cela ferait un appel API réel
  console.log(`Marquer la notification ${notificationId} comme lue`);
  return true;
};

const markAllAsRead = async (): Promise<boolean> => {
  // Pour les tests, on simule juste le succès
  // En production, cela ferait un appel API réel
  console.log('Marquer toutes les notifications comme lues');
  return true;
};

const deleteNotification = async (notificationId: number): Promise<boolean> => {
  // Pour les tests, on simule juste le succès
  // En production, cela ferait un appel API réel
  console.log(`Supprimer la notification ${notificationId}`);
  return true;
};

const notificationIcon = (typeName: string, iconName: string, color: string) => {
  const iconMap: Record<string, any> = {
    'calendar': Calendar,
    'check-circle': CheckCircle,
    'alert-triangle': AlertTriangle,
    'message-circle': MessageSquare,
    'calendar-plus': Calendar,
    'credit-card': CreditCard,
  };
  
  const Icon = iconMap[iconName] || Mail;
  return <Icon className={`w-5 h-5`} style={{ color }} />;
};

const priorityBadge = (isUrgent: boolean) => {
  if (isUrgent) {
    return <span className="inline-block text-xs px-2 py-1 rounded text-red-300 bg-red-500/20">Urgente</span>;
  }
  return <span className="inline-block text-xs px-2 py-1 rounded text-blue-300 bg-blue-500/20">Normale</span>;
};

const NotificationsTab: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filters, setFilters] = useState<{ type: 'all' | string; status: 'all' | 'read' | 'unread' }>({ type: 'all', status: 'all' });
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Load notifications on component mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const [notificationsData, unreadCountData] = await Promise.all([
          fetchNotifications(),
          fetchUnreadCount()
        ]);
        setNotifications(notificationsData);
        setUnreadCount(unreadCountData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const filtered = useMemo(() => notifications.filter(n => {
    const f1 = filters.type === 'all' || n.type_name === filters.type;
    const f2 = filters.status === 'all' || 
               (filters.status === 'read' && n.is_read) || 
               (filters.status === 'unread' && !n.is_read);
    return f1 && f2;
  }), [notifications, filters]);

  const toggleSelect = (id: number) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelected(newSet);
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(n => n.id)));
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.is_read ? Math.max(0, prev - 1) : prev;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleDeleteMany = async () => {
    try {
      await Promise.all(Array.from(selected).map(id => deleteNotification(id)));
      setNotifications(prev => prev.filter(n => !selected.has(n.id)));
      setUnreadCount(prev => {
        const deletedUnreadCount = notifications.filter(n => selected.has(n.id) && !n.is_read).length;
        return Math.max(0, prev - deletedUnreadCount);
      });
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const refreshNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const [notificationsData, unreadCountData] = await Promise.all([
        fetchNotifications(),
        fetchUnreadCount()
      ]);
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Chargement des notifications...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <h3 className="text-red-300 font-semibold mb-2">Erreur de chargement</h3>
        <p className="text-red-200 mb-4">{error}</p>
        <button 
          onClick={refreshNotifications}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-white text-2xl font-bold">Centre de notifications</h2>
            <p className="text-blue-200">
              {unreadCount > 0 
                ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                : 'Toutes vos alertes et messages importants en un seul endroit'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={refreshNotifications}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg"
            >
              <RefreshCw className="w-4 h-4" /> Actualiser
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg">
              <Settings className="w-4 h-4" /> Paramètres
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <select className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
            <option value="all">Tous les types</option>
            <option value="meeting_reminder">Rappel de rendez-vous</option>
            <option value="quiz_completed">Quiz terminé</option>
            <option value="payment_overdue">Séances non payées</option>
            <option value="unread_message">Message non lu</option>
            <option value="meeting_scheduled">Nouveau rendez-vous</option>
            <option value="payment_reminder">Rappel de paiement</option>
          </select>
          <select className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value as any }))}>
            <option value="all">Tous les statuts</option>
            <option value="unread">Non lues</option>
            <option value="read">Lues</option>
          </select>
        </div>
      </div>

      {/* Actions toolbar */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input type="checkbox" className="w-4 h-4" checked={selected.size > 0 && selected.size === filtered.length} onChange={toggleSelectAll} />
          <span className="text-blue-200 text-sm">{selected.size} sélectionné(s)</span>
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <button onClick={handleMarkAllAsRead} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg inline-flex items-center gap-2"><Eye className="w-4 h-4" /> Marquer comme lu</button>
            <button onClick={handleDeleteMany} className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg inline-flex items-center gap-2"><Trash2 className="w-4 h-4" /> Supprimer</button>
          </div>
        )}
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-300 text-lg font-semibold mb-2">Aucune notification</h3>
            <p className="text-gray-400">Vous n'avez aucune notification pour le moment.</p>
          </div>
        ) : (
          filtered.map(n => (
            <div key={n.id} className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${selected.has(n.id) ? 'bg-blue-500/20 border-blue-400' : 'bg-white/10 border-white/20'} ${!n.is_read ? 'border-l-4 border-l-blue-400' : ''}`}>
              <input type="checkbox" className="w-4 h-4 mt-1" checked={selected.has(n.id)} onChange={() => toggleSelect(n.id)} />
              <div className="flex-shrink-0 mt-1">{notificationIcon(n.type_name, n.icon, n.color)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold">{n.title}</div>
                  <div className="text-blue-300 text-xs flex items-center gap-2">
                    <Clock className="w-3 h-3" /> {new Date(n.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {!n.is_read && (
                      <button onClick={() => handleMarkAsRead(n.id)} className="text-blue-400 hover:text-blue-300">
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDeleteNotification(n.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-blue-200 text-sm mt-1">{n.message}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {priorityBadge(n.is_urgent)}
                    {n.metadata && n.metadata.student_id && (
                      <span className="text-xs text-blue-300 bg-white/10 px-2 py-1 rounded inline-flex items-center gap-1">
                        <User className="w-3 h-3" /> Étudiant #{n.metadata.student_id}
                      </span>
                    )}
                  </div>
                  {n.related_entity_type && (
                    <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                      {n.related_entity_type}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsTab;

