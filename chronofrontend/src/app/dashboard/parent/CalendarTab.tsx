'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin,
  X,
  Zap,
  Award,
  BookOpen
} from 'lucide-react';
import { isSameOrAliasClass } from '@/constants/classes';
import urlapi from '@/config/url';

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
  type: 'academic' | 'sports' | 'cultural' | 'social' | 'other' | 'meeting';
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

// --- Helpers ---------------------------------------------------------

// Extrait "YYYY-MM-DD" sans jamais passer par un fuseau horaire
// (evite le bug toISOString() qui peut decaler le jour).
const extractDateStr = (value: string | Date): string => {
  if (!value) return '';
  if (typeof value === 'string') {
    // Si c'est deja "YYYY-MM-DD..." on prend juste la partie date brute,
    // sans reconstruire un objet Date qui appliquerait un fuseau horaire.
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  const d = new Date(value);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const extractTimeStr = (value: string | Date): string => {
  if (typeof value === 'string') {
    const match = value.match(/T(\d{2}:\d{2})/);
    if (match) return match[1];
  }
  const d = new Date(value);
  return d.toTimeString().split(' ')[0].substring(0, 5);
};

// Accepte un tableau brut OU une reponse enveloppee ({items:[...]}, {data:[...]})
const normalizeArrayResponse = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  console.warn('[Calendar] Reponse API inattendue (ni tableau ni {items}/{data}):', payload);
  return [];
};

// -----------------------------------------------------------------------

const CalendarTab: React.FC<CalendarTabProps> = ({ selectedChild, parent, onChildSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [studySessions, setStudySessions] = useState<any[]>([]);
  const [childEvents, setChildEvents] = useState<Event[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Empeche les appels dupliques/en boucle : on garde la trace de la derniere
  // combinaison chargee et du controller de la requete en cours, pour pouvoir
  // l'annuler si un nouveau chargement demarre avant la fin du precedent.
  const lastLoadedKeyRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotifications({ type, message });
    setTimeout(() => setNotifications(null), 5000);
  };

  const loadChildCalendarData = useCallback(async (childId: string, parentId?: string) => {
    // Annule toute requete precedente encore en vol avant d'en lancer une nouvelle.
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    isLoadingRef.current = true;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // --- Seances d'etude ---
      const studyResponse = await fetch(`${urlapi.backendurlsapi.studysessionsapi}`, {
        headers: authHeaders,
        signal: controller.signal
      });

      if (!studyResponse.ok) {
        const errBody = await studyResponse.text();
        console.error('[Calendar] Erreur HTTP study-sessions:', studyResponse.status, errBody);
        showNotification('error', 'Erreur lors du chargement des seances');
      } else {
        const studyPayload = await studyResponse.json();
        const studyData = normalizeArrayResponse(studyPayload);
        console.log('[Calendar] study-sessions brut recu:', studyData.length, 'seances');

        const filteredSessions = studyData.filter((session: any) => {
          if (!session.target_class) return true;
          const matches = !selectedChild?.class || isSameOrAliasClass(session.target_class, selectedChild.class);
          if (!matches) {
            console.log('[Calendar] Seance exclue (classe non matchee):', session.target_class, 'vs', selectedChild?.class);
          }
          return matches;
        });

        setStudySessions(filteredSessions);
        console.log('[Calendar] Seances apres filtrage classe:', filteredSessions.length);
      }

      // --- Rendez-vous ---
      const appointmentsResponse = await fetch(
        `${urlapi.backendurlsapi.apirendivous}?parentId=${parentId || ''}`,
        { headers: authHeaders, signal: controller.signal }
      );

      if (!appointmentsResponse.ok) {
        const errBody = await appointmentsResponse.text();
        console.error('[Calendar] Erreur HTTP rendez-vous:', appointmentsResponse.status, errBody);
        showNotification('error', 'Erreur lors du chargement des rendez-vous');
      } else {
        const appointmentsPayload = await appointmentsResponse.json();
        const appointmentsData = normalizeArrayResponse(appointmentsPayload);
        console.log('[Calendar] rendez-vous bruts recus:', appointmentsData.length);

        const acceptedAppointments = appointmentsData.filter(
          (rdv: any) => String(rdv.status || '').toLowerCase() === 'accepted'
        );
        console.log('[Calendar] rendez-vous acceptes:', acceptedAppointments.length);

        const calendarAppointments = acceptedAppointments.map((rdv: any) => {
          const appointmentDateTime = rdv.appointment_time || rdv.timing;
          const dateStr = extractDateStr(appointmentDateTime);
          const appointmentTime = extractTimeStr(appointmentDateTime);

          const childName = rdv.childName || rdv.child_name || 'Enfant inconnu';
          const parentName = rdv.parentName || rdv.parent_name || 'Parent inconnu';
          const childClass = rdv.childClass || rdv.child_class || 'Classe inconnue';
          const parentReason = rdv.parentReason || rdv.parent_reason || 'Aucune raison specifiee';
          const adminReason = rdv.adminReason || rdv.admin_reason || '';

          return {
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
            parentName,
            childName,
            childClass,
            parentReason,
            adminReason
          };
        });

        setAppointments(calendarAppointments);
        console.log('[Calendar] rendez-vous transformes pour le calendrier:', calendarAppointments);
      }

      setChildEvents([]);

      // On ne marque la cle comme "chargee" qu'apres un succes complet.
      // Si la requete est annulee ou echoue, la cle reste libre et un
      // prochain montage/effet pourra reessayer normalement.
      lastLoadedKeyRef.current = `${childId}:${parentId || ''}`;
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        // Requete annulee volontairement (nouveau chargement ou demontage) :
        // on ne touche pas lastLoadedKeyRef pour permettre un nouvel essai.
        return;
      }
      console.error('[Calendar] Erreur lors du chargement des donnees du calendrier:', error);
      showNotification('error', 'Erreur lors du chargement du calendrier');
    } finally {
      // On ne desactive le loader que si cette requete est toujours la requete active
      // (evite qu'une reponse tardive d'un appel annule ne reactive le state).
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChild?.class]);

  // Ne relance pas un fetch si un chargement identique est deja EN COURS
  // (isLoadingRef), mais autorise toujours un nouvel essai si le precedent
  // a ete annule/a echoue, ou si l'effet se redeclenche normalement.
  useEffect(() => {
    if (!selectedChild?.id) return;

    const key = `${selectedChild.id}:${parent?.id || ''}`;
    if (lastLoadedKeyRef.current === key && isLoadingRef.current === false) {
      // Deja charge avec succes pour cette combinaison et rien n'est en cours : on evite un refetch inutile.
      return;
    }

    loadChildCalendarData(selectedChild.id, parent?.id);

    // Annule la requete en cours si le composant se demonte ou si l'effet
    // se redeclenche avant la fin du chargement precedent.
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [selectedChild?.id, parent?.id, loadChildCalendarData]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(new Date(year, month, day));
    const remainingCells = 7 - (days.length % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) days.push(null);
    }
    return days;
  };

  const getLocalDateStr = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = getLocalDateStr(date);

    const dayEvents = childEvents.filter(event => event.date === dateStr);
    const daySessions = studySessions.filter(session => extractDateStr(session.date) === dateStr);
    const dayAppointments = appointments.filter(appointment => appointment.date === dateStr);

    const sessionEvents = daySessions.map(session => ({
      id: `session-${session.id}`,
      title: session.title,
      description: session.description,
      date: extractDateStr(session.date),
      time: session.start_time,
      duration: Math.round(
        (new Date(`2000-01-01T${session.end_time}`).getTime() -
          new Date(`2000-01-01T${session.start_time}`).getTime()) /
          (1000 * 60)
      ),
      type: 'academic' as const,
      location: session.location,
      participants: [`${session.current_students}/${session.max_students} etudiants`],
      isRecurring: false,
      priority: 'high' as const,
      status: 'scheduled' as const,
      reminders: [],
      attachments: [],
      notes: `Matiere: ${session.subject}${session.target_class ? ` | Classe: ${session.target_class}` : ''}`,
      createdBy: session.created_by,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      isStudySession: true,
      subject: session.subject
    }));

    return [...dayEvents, ...sessionEvents, ...dayAppointments];
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
      switch (subject?.toLowerCase()) {
        case 'histoire':
          return 'bg-yellow-600';
        case 'geographie':
          return 'bg-indigo-600';
        case 'emc':
          return 'bg-green-600';
        default:
          return 'bg-gray-600';
      }
    }
    if (isAppointment) return 'bg-red-600';
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

  const formatDate = (date: Date) =>
    date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const formatTime = (time: string) => time;

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'prev' ? -1 : 1));
      return newDate;
    });
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
  const isSelected = (date: Date) => selectedDate && date.toDateString() === selectedDate.toDateString();

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowEventDetails(false);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
  ];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  if (!selectedChild) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Calendrier</h2>
          <p className="text-white/70">Selectionnez un enfant pour voir son calendrier</p>
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
                      <img src={child.avatar} alt={child.firstName} className="w-10 h-10 rounded-full object-cover" />
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
            <h3 className="text-xl font-bold text-white mb-2">Aucun enfant trouve</h3>
            <p className="text-white/70">Contactez l'administrateur pour ajouter des enfants a votre compte</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Calendrier</h2>
            {selectedChild && (
              <div className="mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {selectedChild.firstName} {selectedChild.lastName} - Classe: {selectedChild.class}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigateMonth('prev')} className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h3 className="text-2xl font-bold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button onClick={() => navigateMonth('next')} className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-white font-semibold py-3 text-sm">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) return <div key={index} className="h-28 border border-white/10 rounded-lg"></div>;

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
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                    <span className="text-sm font-bold text-white">{day.getDate()}</span>
                  </div>

                  {dayEvents.length > 0 && (
                    <div className="absolute top-1 right-1">
                      <span className="text-xs bg-white/20 rounded-full px-2 py-1 min-w-[20px] text-center">
                        {dayEvents.length}
                      </span>
                    </div>
                  )}

                  <div className="pt-8 space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        onClick={e => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        className={`text-xs p-1 rounded truncate ${getEventColor(
                          event.type,
                          (event as any).isStudySession,
                          (event as any).subject,
                          (event as any).isAppointment
                        )} text-white hover:opacity-80 transition-opacity`}
                      >
                        {(event as any).isStudySession ? '[Etude] ' : ''}
                        {(event as any).isAppointment ? '[RDV] ' : ''}
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-white/70">+{dayEvents.length - 2} autres</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h3>
              <button onClick={() => setShowEventDetails(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
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
                  {formatDate(new Date(selectedEvent.date))} a {formatTime(selectedEvent.time)}
                </span>
                {(selectedEvent as any).isStudySession && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    Seance d'etude
                  </span>
                )}
                {(selectedEvent as any).isAppointment && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    Rendez-vous
                  </span>
                )}
              </div>

              {(selectedEvent as any).isStudySession && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Matiere: {(selectedEvent as any).subject}</span>
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
                <button onClick={() => setShowEventDetails(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {notifications && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`p-4 rounded-lg shadow-lg ${
              notifications.type === 'success' ? 'bg-green-500' : notifications.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            } text-white`}
          >
            {notifications.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarTab;