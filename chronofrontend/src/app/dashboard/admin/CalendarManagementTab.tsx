'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  BookOpen,
  Edit,
  Trash2,
  X,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { AVAILABLE_CLASSES } from '@/constants/classes';

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

const CalendarManagementTab: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  // Formulaire pour nouvelle séance
  const subjects = ['Histoire', 'Géographie', 'EMC'];
  const classes = AVAILABLE_CLASSES;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    subject: '',
    targetClass: ''
  });

  // Charger les séances d'étude et les rendez-vous
  useEffect(() => {
    loadStudySessions();
    loadAppointments();
  }, []);

  const loadStudySessions = async () => {
    try {
      const response = await fetch('/api/study-sessions');
      const data = await response.json();
      
      if (response.ok) {
        setStudySessions(data);
      } else {
        showNotification('error', 'Erreur lors du chargement des séances');
      }
    } catch (error) {
      showNotification('error', 'Erreur lors du chargement des séances');
    }
  };

  const loadAppointments = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const response = await fetch('/api/rendez-vous', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        // Filtrer seulement les rendez-vous acceptés
        const acceptedAppointments = (data || []).filter((rdv: any) => rdv.status === 'accepted');
        
        // Transformer les rendez-vous acceptés pour le calendrier
        const calendarAppointments = acceptedAppointments.map((rdv: any) => {
          
          // Utiliser appointment_time si disponible, sinon timing
          let appointmentDateTime = rdv.appointment_time || rdv.timing;
          
          let appointmentDate = new Date(appointmentDateTime);
          let dateStr = appointmentDate.toISOString().split('T')[0];
          
          // FORCER L'EXTRACTION DE L'HEURE - SOLUTION DIRECTE
          let appointmentTime = '';
          
          
          // PRIORITÉ 1: appointment_time
          if (rdv.appointment_time) {
            try {
              const date = new Date(rdv.appointment_time);
              
              if (!isNaN(date.getTime())) {
                appointmentTime = date.toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'UTC'
                });
              }
            } catch (error) {
            }
          }
          
          // PRIORITÉ 2: timing si pas d'heure
          if (!appointmentTime && rdv.timing) {
            try {
              const date = new Date(rdv.timing);
              if (!isNaN(date.getTime())) {
                appointmentTime = date.toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'UTC'
                });
              }
            } catch (error) {
            }
          }
          
          // FORCER une heure si toujours vide
          if (!appointmentTime) {
            appointmentTime = '08:00'; // Heure forcée
          }

          
          // Utiliser les bons noms de propriétés de l'API
          const childName = rdv.childName || rdv.child_name || 'Enfant inconnu';
          const parentName = rdv.parentName || rdv.parent_name || 'Parent inconnu';
          const childClass = rdv.childClass || rdv.child_class || 'Classe inconnue';
          const parentReason = rdv.parentReason || rdv.parent_reason || 'Aucune raison spécifiée';
          const adminReason = rdv.adminReason || rdv.admin_reason || '';
          
          const transformedAppointment = {
            id: `appointment-${rdv.id}`,
            title: `Rendez-vous - ${parentName}`,
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
            adminReason: adminReason,
            appointmentTime: rdv.appointment_time,
            timing: rdv.timing
          };
          
          return transformedAppointment;
        });
        
        setAppointments(calendarAppointments);
      } else {
      }
    } catch (error) {
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotifications({ type, message });
    setTimeout(() => setNotifications(null), 5000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatAppointmentTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAppointmentTime = (rdv: any) => {
    
    // Utiliser appointmentTime si disponible, sinon utiliser timing
    if (rdv.appointmentTime) {
      // Traiter appointmentTime comme une date locale sans conversion de fuseau horaire
      const appointmentDate = new Date(rdv.appointmentTime);
      // Utiliser toLocaleString avec timeZone: 'UTC' pour éviter le décalage
      const formattedTime = appointmentDate.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      });
      return formattedTime;
    }
    // Fallback: utiliser timing
    if (rdv.timing) {
      const timingDate = new Date(rdv.timing);
      const formattedTime = timingDate.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      });
      return formattedTime;
    }
    return 'Heure non disponible';
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    const totalCells = days.length;
    const remainingCells = 7 - (totalCells % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        days.push(null);
      }
    }
    
    return days;
  };

  const getSessionsForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return studySessions.filter(session => session.date === dateStr);
  };

  const getAppointmentsForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return appointments.filter(appointment => appointment.date === dateStr);
  };

  const getAllItemsForDate = (date: Date) => {
    const sessions = getSessionsForDate(date);
    const appointments = getAppointmentsForDate(date);
    
    // Convertir les rendez-vous en format compatible
    const appointmentItems = appointments.map(appointment => ({
      id: appointment.id,
      title: appointment.title,
      description: appointment.description,
      date: appointment.date,
      start_time: appointment.time,
      end_time: new Date(new Date(`2000-01-01T${appointment.time}`).getTime() + appointment.duration * 60000).toTimeString().substring(0, 5),
      subject: 'Rendez-vous',
      target_class: appointment.childClass,
      location: appointment.location,
      max_students: 1,
      current_students: 1,
      created_by: 'admin',
      created_at: appointment.createdAt,
      updated_at: appointment.updatedAt,
      isAppointment: true,
      parentName: appointment.parentName,
      childName: appointment.childName,
      childClass: appointment.childClass,
      parentReason: appointment.parentReason,
      adminReason: appointment.adminReason
    }));

    return [...sessions, ...appointmentItems];
  };

  const getSessionColor = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'mathématiques':
      case 'maths':
        return 'bg-blue-500';
      case 'physique':
        return 'bg-green-500';
      case 'chimie':
        return 'bg-purple-500';
      case 'français':
        return 'bg-orange-500';
      case 'anglais':
        return 'bg-red-500';
      case 'histoire':
        return 'bg-yellow-500';
      case 'géographie':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
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
    setShowSessionDetails(false);
    // Pré-remplir la date dans le formulaire
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    setFormData(prev => ({
      ...prev,
      date: dateStr
    }));
  };

  const handleSessionClick = (session: StudySession) => {
    setSelectedSession(session);
    setShowSessionDetails(true);
  };

  const handleAddSession = () => {
    setEditingSession(null);
    setFormData({
      title: '',
      description: '',
      date: selectedDate ? (() => {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })() : '',
      startTime: '',
      endTime: '',
      subject: '',
      targetClass: ''
    });
    setShowSessionModal(true);
  };

  const handleEditSession = (session: StudySession) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      description: session.description,
      date: session.date,
      startTime: session.start_time,
      endTime: session.end_time,
      subject: session.subject,
      targetClass: session.target_class || ''
    });
    setShowSessionModal(true);
  };

  const handleSubmitSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const url = editingSession 
        ? `/api/study-sessions/${editingSession.id}`
        : '/api/study-sessions';
      const method = editingSession ? 'PATCH' : 'POST';
      const body = {
        ...formData,
        location: 'Salle de classe', // Valeur par défaut
        maxStudents: 30 // Valeur par défaut
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', editingSession ? 'Séance mise à jour avec succès' : 'Séance créée avec succès');
        setShowSessionModal(false);
        setFormData({
          title: '',
          description: '',
          date: '',
          startTime: '',
          endTime: '',
          subject: '',
          targetClass: ''
        });
        loadStudySessions();
      } else {
        showNotification('error', data.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      showNotification('error', 'Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/study-sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showNotification('success', 'Séance supprimée avec succès');
        setShowSessionDetails(false);
        loadStudySessions();
      } else {
        const data = await response.json();
        showNotification('error', data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      showNotification('error', 'Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-white">Gestion du Calendrier</h2>
          <button
            onClick={handleAddSession}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle Séance</span>
          </button>
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
              return <div key={index} className="h-32 border border-white/10 rounded-lg"></div>;
            }

            const dayItems = getAllItemsForDate(day);
            const isCurrentDay = isToday(day);
            const isSelectedDay = isSelected(day);
          
            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`h-32 p-2 rounded-lg cursor-pointer transition-all duration-200 border ${
                  isCurrentDay 
                    ? 'bg-blue-600 text-white border-blue-400 shadow-lg' 
                    : isSelectedDay
                    ? 'bg-blue-500/50 text-white border-blue-300'
                    : 'hover:bg-white/10 text-white border-white/20 hover:border-white/40'
                }`}
              >
                <div className="relative h-full">
                  {/* Numéro du jour */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                    <span className={`text-sm font-bold ${
                      isCurrentDay ? 'text-white' : 'text-white'
                    }`}>
                      {day.getDate()}
                    </span>
                  </div>
                    
                  {/* Compteur de séances */}
                  {dayItems.length > 0 && (
                    <div className="absolute top-1 right-1">
                      <span className="text-xs bg-white/20 rounded-full px-2 py-1 min-w-[20px] text-center">
                        {dayItems.length}
                      </span>
                    </div>
                  )}
                    
                  {/* Zone des événements */}
                  <div className="pt-8 space-y-1 overflow-hidden">
                    {dayItems.slice(0, 2).map((item: any) => (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.isAppointment) {
                            // Ouvrir le modal des détails du rendez-vous
                            handleEventClick(item);
                          } else {
                            handleSessionClick(item);
                          }
                        }}
                        className={`text-xs p-1 rounded truncate ${
                          item.isAppointment 
                            ? 'bg-red-600' 
                            : getSessionColor(item.subject)
                        } text-white hover:opacity-80 transition-opacity`}
                      >
                        {item.isAppointment ? '📅 ' : ''}{item.title}
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

      {/* Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingSession ? 'Modifier la séance' : 'Nouvelle séance d\'étude'}
              </h3>
              <button
                onClick={() => setShowSessionModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitSession} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de la séance *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matière *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner une matière</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classe cible
                  </label>
                  <select
                    value={formData.targetClass}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetClass: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  >
                    <option value="">Sélectionner une classe</option>
                    {classes.map(classe => (
                      <option key={classe} value={classe}>{classe}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de début *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de fin *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>
              </div>


              <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingSession ? 'Modifier' : 'Créer'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      {showSessionDetails && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{selectedSession.title}</h3>
              <button
                onClick={() => setShowSessionDetails(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-gray-500" />
                <span className="text-lg font-semibold text-gray-700">
                  {selectedSession.subject}
                </span>
                {selectedSession.target_class && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {selectedSession.target_class}
                  </span>
                )}
              </div>
                    
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    {new Date(selectedSession.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    {selectedSession.start_time} - {selectedSession.end_time}
                  </span>
                </div>
              </div>

                    
              {selectedSession.description && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700">{selectedSession.description}</p>
                </div>
              )}

              <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={() => setShowSessionDetails(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setShowSessionDetails(false);
                    handleEditSession(selectedSession);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Modifier</span>
                </button>
                <button
                  onClick={() => handleDeleteSession(selectedSession.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <BookOpen className="w-5 h-5 text-blue-600" />
                )}
                {(selectedEvent as any).isStudySession && (
                  <span className="text-lg font-semibold text-gray-700">
                    {selectedEvent.time || 'Heure non disponible'}
                  </span>
                )}
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
                <div className="space-y-3">
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
                  
                  {(selectedEvent as any).parentReason && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Raison du rendez-vous</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {(selectedEvent as any).parentReason}
                      </p>
                    </div>
                  )}
                  
                  {(selectedEvent as any).adminReason && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Réponse de l'administration</h4>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                        {(selectedEvent as any).adminReason}
                      </p>
                    </div>
                  )}
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
          <div className={`p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
            notifications.type === 'success' ? 'bg-green-500' :
            notifications.type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
          } text-white`}>
            {notifications.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : notifications.type === 'error' ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{notifications.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarManagementTab;
