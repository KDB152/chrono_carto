'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  X,
  Zap,
  Award,
  BookOpen
} from 'lucide-react';

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

interface StudySession {
  id: number;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  subject: string;
  target_class: string;
  location: string;
  max_students: number;
  current_students: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const CalendarTab: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [studentClass, setStudentClass] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);

  // Charger les données
  useEffect(() => {
    loadEvents();
    loadStudentClass();
  }, []);

  // Charger la classe de l'étudiant quand elle est disponible
  useEffect(() => {
    if (studentClass) {
      loadStudySessions();
    }
  }, [studentClass]);

  const loadEvents = () => {
    const mockEvents: Event[] = [
    ];
    setEvents(mockEvents);
  };

  const loadStudentClass = async () => {
    try {
      // 1) Tenter d'utiliser les infos de l'utilisateur connecté stockées côté client
      const storedUserDetails = typeof window !== 'undefined' ? localStorage.getItem('userDetails') : null;
      let connectedUserEmail: string | null = null;
      if (storedUserDetails) {
        try {
          const parsed = JSON.parse(storedUserDetails);
          // Plusieurs structures possibles dans l'app, gérons-les
          const classFromDetails = parsed?.studentDetails?.class_level || parsed?.class_level || parsed?.classLevel;
          if (classFromDetails) {
            setStudentClass(classFromDetails);
            return; // Classe trouvée, inutile d'appeler l'API
          }
          connectedUserEmail = parsed?.email || parsed?.user?.email || null;
        } catch {}
      }

      // 2) Fallback: récupérer depuis l'API locale des étudiants et matcher sur l'email si possible
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        const students = data.items || data;

        if (Array.isArray(students) && students.length > 0) {
          let currentStudent: any = null;
          if (connectedUserEmail) {
            currentStudent = students.find((s: any) => (s.email || '').toLowerCase() === connectedUserEmail!.toLowerCase());
          }
          if (!currentStudent) {
            // Si pas d'email, on tente de prendre l'étudiant actif (comportement de repli)
            currentStudent = students.find((s: any) => s.isActive === true) || students[0];
          }

          if (currentStudent?.classLevel) {
            setStudentClass(currentStudent.classLevel);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la classe:', error);
    }
  };

  const loadStudySessions = async () => {
    try {
      const response = await fetch('/api/study-sessions');
      const data = await response.json();
      
      if (response.ok) {
        // Filtrer les séances pour ne montrer que celles de la classe de l'étudiant
        const filteredSessions = data.filter((session: StudySession) => {
          // Si la séance n'a pas de classe cible, la montrer à tous
          if (!session.target_class) return true;
          // Sinon, ne la montrer que si elle correspond à la classe de l'étudiant
          return session.target_class === studentClass;
        });
        
        setStudySessions(filteredSessions);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des séances d\'étude:', error);
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
    return events.filter(event => event.date === dateStr);
  };

  const getStudySessionsForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return studySessions.filter(session => session.date === dateStr);
  };

  const getAllItemsForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayEvents = events.filter(event => event.date === dateStr);
    const daySessions = studySessions.filter(session => session.date === dateStr);
    
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

    return [...dayEvents, ...sessionEvents];
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

  const getEventColor = (type: string, isStudySession?: boolean, subject?: string) => {
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
    
    switch (type) {
      case 'academic':
        return 'bg-blue-500';
      case 'sports':
        return 'bg-green-500';
      case 'cultural':
        return 'bg-purple-500';
      case 'social':
        return 'bg-orange-500';
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


  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Calendrier</h2>
            {studentClass && (
              <div className="mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  📚 Classe: {studentClass}
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

            const dayItems = getAllItemsForDate(day);
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
                  {dayItems.length > 0 && (
                    <div className="absolute top-1 right-1">
                      <span className="text-xs bg-white/20 rounded-full px-2 py-1 min-w-[20px] text-center">
                        {dayItems.length}
                        </span>
                      </div>
                    )}
                    
                  {/* Zone des événements */}
                  <div className="pt-8 space-y-1 overflow-hidden">
                    {dayItems.slice(0, 2).map(item => (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(item);
                        }}
                        className={`text-xs p-1 rounded truncate ${getEventColor(item.type, (item as any).isStudySession, (item as any).subject)} text-white hover:opacity-80 transition-opacity`}
                      >
                        {(item as any).isStudySession ? '📚 ' : ''}{item.title}
                      </div>
                    ))}
                    {dayItems.length > 2 && (
                      <div className="text-xs text-white/70">
                        +{dayItems.length - 2} autres
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
              </div>
                    
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{selectedEvent.duration} min</span>
                </div>
              </div>

              {(selectedEvent as any).isStudySession && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Matière: {(selectedEvent as any).subject}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Séance d'étude</span>
                  </div>
                </div>
              )}

              {/* Priorité et statut masqués pour les étudiants */}
                    
              {selectedEvent.description && selectedEvent.description.trim() !== '' && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700">{selectedEvent.description}</p>
                </div>
              )}

              {/* Section Participants masquée pour les étudiants */}

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
                {/* Boutons de modification/suppression masqués pour les étudiants */}
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

