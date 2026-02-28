'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Clock,
  MapPin,
  Users,
  Star,
  Filter,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Save,
  X,
  Loader2,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Copy,
  ExternalLink,
  Lock,
  Unlock,
  Shield,
  Zap,
  Target,
  Award,
  Trophy,
  Medal,
  Crown,
  Gem,
  Diamond,
  Star as StarIcon,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Wind,
  Thermometer,
  Umbrella,
  Rainbow,
  Snowflake,
  Flame,
  Droplets,
  Leaf,
  TreePine,
  BookOpen
} from 'lucide-react';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  class: string;
  level: string;
  avatar?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  type: 'academic' | 'sports' | 'cultural' | 'social' | 'other';
  location: string;
  participants: string[];
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  reminders: number[];
  attachments: string[];
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CalendarTabProps {
  selectedChild?: Child | null;
  parent?: any;
  searchQuery?: string;
  onNavigateToMessages?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToMeetings?: () => void;
  onNavigateToReports?: () => void;
  onNavigateToSettings?: () => void;
  onChildSelect?: (childId: string) => void;
}

const CalendarTab: React.FC<CalendarTabProps> = ({ selectedChild, parent, onChildSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  const [studySessions, setStudySessions] = useState<any[]>([]);
  const [childEvents, setChildEvents] = useState<Event[]>([]);
  const [appointments, setAppointments] = useState<Event[]>([]);

  // Charger les données de l'enfant sélectionné
  useEffect(() => {
    if (selectedChild) {
      loadChildCalendarData();
    }
  }, [selectedChild]);

  const loadChildCalendarData = async () => {
    if (!selectedChild) return;
    
    try {
      setIsLoading(true);
      
      // Charger les séances d'étude
      const studyResponse = await fetch('/api/study-sessions');
      const studyData = await studyResponse.json();
      
      // Charger les rendez-vous pour ce parent
      console.log('🔍 Chargement des rendez-vous pour le parent:', parent?.id);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      const appointmentsResponse = await fetch(`/api/rendez-vous?parentId=${parent?.id || ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const appointmentsData = await appointmentsResponse.json();
      
      console.log('📡 Réponse API rendez-vous:', {
        status: appointmentsResponse.status,
        ok: appointmentsResponse.ok,
        data: appointmentsData
      });
      
      if (studyResponse.ok) {
        // Filtrer les séances pour la classe de l'enfant sélectionné
        const filteredSessions = Array.isArray(studyData) 
          ? studyData.filter((session: any) => {
              // Si la séance n'a pas de classe cible, la montrer à tous
              if (!session.target_class) return true;
              // Sinon, ne la montrer que si elle correspond à la classe de l'enfant
              return session.target_class === selectedChild.class;
            })
          : [];
        
        setStudySessions(filteredSessions);
        console.log('✅ Séances d\'étude chargées:', filteredSessions);
      }
      
      if (appointmentsResponse.ok) {
        // Filtrer seulement les rendez-vous acceptés
        const acceptedAppointments = (appointmentsData || []).filter((rdv: any) => rdv.status === 'accepted');
        console.log('✅ Tous les rendez-vous:', appointmentsData);
        console.log('✅ Rendez-vous acceptés:', acceptedAppointments);
        
        // Transformer les rendez-vous acceptés pour le calendrier
        const calendarAppointments = acceptedAppointments.map((rdv: any) => {
          console.log('🔍 Rendez-vous brut à transformer:', rdv);
          
          // Utiliser appointment_time si disponible, sinon timing
          let appointmentDateTime = rdv.appointment_time || rdv.timing;
          let appointmentDate = new Date(appointmentDateTime);
          let dateStr = appointmentDate.toISOString().split('T')[0];
          let appointmentTime = appointmentDate.toTimeString().split(' ')[0].substring(0, 5);
          
          // Utiliser les bons noms de propriétés de l'API
          const childName = rdv.childName || rdv.child_name || 'Enfant inconnu';
          const parentName = rdv.parentName || rdv.parent_name || 'Parent inconnu';
          const childClass = rdv.childClass || rdv.child_class || 'Classe inconnue';
          const parentReason = rdv.parentReason || rdv.parent_reason || 'Aucune raison spécifiée';
          const adminReason = rdv.adminReason || rdv.admin_reason || '';
          
          const transformedAppointment = {
            id: `appointment-${rdv.id}`,
            title: `Rendez-vous - ${childName}`,
            description: parentReason,
            date: dateStr,
            time: appointmentTime,
            fullDateTime: appointmentDateTime,
            duration: 60,
            type: 'meeting',
            location: 'Bureau administratif',
            participants: [parentName, childName],
            isRecurring: false,
            priority: 'high',
            status: 'scheduled',
            reminders: [],
            attachments: [],
            notes: `Raison: ${parentReason}${adminReason ? ` | Admin: ${adminReason}` : ''}`,
            createdBy: 'parent',
            createdAt: rdv.createdAt || rdv.created_at,
            updatedAt: rdv.updatedAt || rdv.updated_at,
            isAppointment: true,
            parentName: parentName,
            childName: childName,
            childClass: childClass,
            parentReason: parentReason,
            adminReason: adminReason
          };
          
          console.log('✅ Rendez-vous transformé:', transformedAppointment);
          return transformedAppointment;
        });
        
        setAppointments(calendarAppointments);
        console.log('📊 Nombre de rendez-vous acceptés:', calendarAppointments.length);
        if (calendarAppointments.length > 0) {
          console.log('🔍 Premier rendez-vous transformé:', calendarAppointments[0]);
        }
      } else {
        console.error('❌ Erreur lors du chargement des rendez-vous:', appointmentsResponse.status, appointmentsData);
      }
      
      setChildEvents([]); // Pas d'événements pour l'instant
      
    } catch (error) {
      console.error('Erreur lors du chargement des données du calendrier:', error);
      showNotification('error', 'Erreur lors du chargement du calendrier');
    } finally {
      setIsLoading(false);
    }
  };


  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotifications({ type, message });
    setTimeout(() => setNotifications(null), 5000);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    // This ensures proper alignment with the day names header
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    // Add empty cells to complete the last row if needed
    const totalCells = days.length;
    const remainingCells = 7 - (totalCells % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        days.push(null);
      }
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    console.log('🔍 Recherche d\'événements pour la date:', dateStr);
    console.log('📅 Appointments disponibles:', appointments);
    
    // Récupérer les événements de l'enfant
    const dayEvents = childEvents.filter(event => event.date === dateStr);
    
    // Récupérer les séances d'étude pour cette date
    const daySessions = studySessions.filter(session => session.date === dateStr);
    
    // Récupérer les rendez-vous pour cette date
    const dayAppointments = appointments.filter(appointment => appointment.date === dateStr);
    
    console.log('📋 Rendez-vous trouvés pour cette date:', dayAppointments);
    
    // Convertir les séances en format événement pour l'affichage
    const sessionEvents = daySessions.map(session => ({
      id: `session-${session.id}`,
      title: session.title,
      description: session.description,
      date: session.date,
      time: session.start_time,
      duration: Math.round((new Date(`2000-01-01T${session.end_time}`).getTime() - new Date(`2000-01-01T${session.start_time}`).getTime()) / (1000 * 60)),
      type: 'academic' as const,
      location: session.location,
      participants: [`${session.current_students}/${session.max_students} étudiants`],
      isRecurring: false,
      priority: 'high' as const,
      status: 'scheduled' as const,
      reminders: [],
      attachments: [],
      notes: `Matière: ${session.subject}${session.target_class ? ` | Classe: ${session.target_class}` : ''}`,
      createdBy: session.created_by,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      isStudySession: true,
      subject: session.subject
    }));

    const allEvents = [...dayEvents, ...sessionEvents, ...dayAppointments];
    console.log('🎯 Tous les événements pour cette date:', allEvents);
    
    return allEvents;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'academic':
        return <img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-4 h-4" />;
      case 'sports':
        return <Zap className="w-4 h-4" />;
      case 'cultural':
        return <Award className="w-4 h-4" />;
      case 'social':
        return <Users className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string, isStudySession?: boolean, subject?: string, isAppointment?: boolean) => {
    if (isStudySession) {
      // Couleurs spéciales pour les séances d'études selon la matière
      switch (subject?.toLowerCase()) {
        case 'histoire':
          return 'bg-yellow-600';
        case 'géographie':
          return 'bg-indigo-600';
        case 'emc':
          return 'bg-green-600';
        default:
          return 'bg-gray-600';
      }
    }
    
    if (isAppointment) {
      return 'bg-red-600'; // Rouge pour les rendez-vous
    }
    
    switch (type) {
      case 'academic':
        return 'bg-blue-500';
      case 'sports':
        return 'bg-green-500';
      case 'cultural':
        return 'bg-purple-500';
      case 'social':
        return 'bg-orange-500';
      case 'meeting':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-500';
      case 'in-progress':
        return 'text-yellow-500';
      case 'completed':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowEventDetails(false);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  // Récupérer tous les événements pour le mois actuel
  const getAllEventsForMonth = () => {
    const allEvents: any[] = [];
    const days = getDaysInMonth(currentDate);
    
    days.forEach(day => {
      if (day) {
        const dayEvents = getEventsForDate(day);
        allEvents.push(...dayEvents);
      }
    });
    
    return allEvents;
  };

  const filteredEvents = getAllEventsForMonth().filter(event => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  // Si aucun enfant n'est sélectionné, afficher un sélecteur
  if (!selectedChild) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Calendrier</h2>
          <p className="text-white/70">Sélectionnez un enfant pour voir son calendrier</p>
        </div>
        
        {parent?.children && parent.children.length > 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Choisir un enfant</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parent.children.map((child: Child) => (
                <button
                  key={child.id}
                  onClick={() => onChildSelect?.(child.id)}
                  className="p-4 bg-white/5 rounded-xl border border-white/20 hover:border-white/40 transition-all text-left group"
                >
                  <div className="flex items-center space-x-3">
                    {child.avatar ? (
                      <img
                        src={child.avatar}
                        alt={child.firstName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-white font-semibold group-hover:text-blue-300 transition-colors">
                        {child.firstName} {child.lastName}
                      </h4>
                      <p className="text-blue-200 text-sm">{child.class}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Calendar className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Aucun enfant trouvé</h3>
            <p className="text-white/70">Contactez l'administrateur pour ajouter des enfants à votre compte</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Calendrier</h2>
            {selectedChild && (
              <div className="mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  👶 {selectedChild.firstName} {selectedChild.lastName} - Classe: {selectedChild.class}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h3 className="text-2xl font-bold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-white font-semibold py-3 text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="h-28 border border-white/10 rounded-lg"></div>;
            }

            const dayEvents = getEventsForDate(day);
            const isCurrentDay = isToday(day);
            const isSelectedDay = isSelected(day);

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`h-28 p-2 rounded-lg cursor-pointer transition-all duration-200 border ${
                  isCurrentDay 
                    ? 'bg-blue-600 text-white border-blue-400 shadow-lg' 
                    : isSelectedDay
                    ? 'bg-blue-500/50 text-white border-blue-300'
                    : 'hover:bg-white/10 text-white border-white/20 hover:border-white/40'
                }`}
              >
                <div className="relative h-full">
                  {/* Numéro centré */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                    <span className={`text-sm font-bold ${
                      isCurrentDay ? 'text-white' : 'text-white'
                    }`}>
                      {day.getDate()}
                    </span>
                  </div>
                  
                  {/* Compteur d'événements en haut à droite */}
                  {dayEvents.length > 0 && (
                    <div className="absolute top-1 right-1">
                      <span className="text-xs bg-white/20 rounded-full px-2 py-1 min-w-[20px] text-center">
                        {dayEvents.length}
                      </span>
                    </div>
                  )}
                  
                  {/* Zone des événements */}
                  <div className="pt-8 space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        className={`text-xs p-1 rounded truncate ${getEventColor(event.type, (event as any).isStudySession, (event as any).subject, (event as any).isAppointment)} text-white hover:opacity-80 transition-opacity`}
                      >
                        {(event as any).isStudySession ? '📚 ' : ''}
                        {(event as any).isAppointment ? '📅 ' : ''}
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-white/70">
                        +{dayEvents.length - 2} autres
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h3>
              <button
                onClick={() => setShowEventDetails(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {(selectedEvent as any).isStudySession ? (
                  <BookOpen className="w-5 h-5 text-blue-600" />
                ) : (selectedEvent as any).isAppointment ? (
                  <Users className="w-5 h-5 text-red-600" />
                ) : (
                  getEventIcon(selectedEvent.type)
                )}
                <span className="text-lg font-semibold text-gray-700">
                  {formatDate(new Date(selectedEvent.date))} à {formatTime(selectedEvent.time)}
                </span>
                {(selectedEvent as any).isStudySession && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    📚 Séance d'étude
                  </span>
                )}
                {(selectedEvent as any).isAppointment && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    📅 Rendez-vous
                  </span>
                )}
              </div>


              {(selectedEvent as any).isStudySession && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Matière: {(selectedEvent as any).subject}</span>
                  </div>
                </div>
              )}

              {(selectedEvent as any).isAppointment && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Enfant: {(selectedEvent as any).childName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Classe: {(selectedEvent as any).childClass}</span>
                  </div>
                </div>
              )}


              {selectedEvent.notes && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Notes</h4>
                  <p className="text-gray-700">{selectedEvent.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {notifications && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`p-4 rounded-lg shadow-lg ${
            notifications.type === 'success' ? 'bg-green-500' :
            notifications.type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
          } text-white`}>
            {notifications.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarTab;

