'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { getChildName, getSchoolName } from '@/lib/userUtils';
import { useRendezVousCache } from '@/hooks/useRendezVousCache';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  X,
  Send,
  User,
  Phone,
  Mail,
  BookOpen,
  RefreshCw,
} from 'lucide-react';

type MeetingStatus = 'pending' | 'accepted' | 'refused' | 'cancelled';

interface RendezVous {
  id: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childName: string;
  childClass: string;
  timing: string; // Date et heure du rendez-vous
  appointmentTime?: string; // Heure spécifique du rendez-vous
  parentReason: string; // Raison du parent
  adminReason?: string; // Raison de l'admin
  status: MeetingStatus;
  createdAt: string;
  updatedAt: string;
}

interface ParentProfile {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone_number: string;
  address: string;
  occupation: string;
  children: Child[];
}

interface Child {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  classLevel: string;
  birthDate: string;
  phone_number: string;
  address: string;
}

const MeetingsTab: React.FC = () => {
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState({
    parentId: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    childId: '',
    childName: '',
    childClass: '',
    timing: new Date().toISOString().slice(0, 16),
    appointmentTime: '', // Heure spécifique choisie par le parent
    parentReason: '',
  });

  // Fonction pour charger le profil du parent avec les informations détaillées
  const loadParentProfile = useCallback(async () => {
    try {
      // Récupérer l'ID du parent connecté depuis le localStorage ou la session
      const userDetails = localStorage.getItem('userDetails');
      let parentUserId = null;
      
      if (userDetails) {
        const user = JSON.parse(userDetails);
        parentUserId = user.id;
        console.log('🔍 Parent connecté - ID:', parentUserId);
      } else {
        // Fallback pour les tests
        parentUserId = 21;
        console.log('⚠️ Utilisation de l\'ID de test:', parentUserId);
      }
      
      // Utiliser la nouvelle API pour récupérer les informations complètes
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      // D'abord, récupérer l'ID du parent
      const parentResponse = await fetch(`${API_BASE}/parents/by-user/${parentUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!parentResponse.ok) {
        throw new Error('Parent non trouvé');
      }
      
      const parentData = await parentResponse.json();
      
      // Maintenant récupérer les enfants
      const response = await fetch(`${API_BASE}/parents/children?parentId=${parentData.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du profil parent');
      }
      
      const children = await response.json();
      
      // Transformer les données pour correspondre à l'interface ParentProfile
      const transformedProfile: ParentProfile = {
        id: parentData.id,
        firstName: parentData.firstName || '',
        lastName: parentData.lastName || '',
        fullName: `${parentData.firstName || ''} ${parentData.lastName || ''}`.trim(),
        email: parentData.email || '',
        phone_number: parentData.phone_number || '',
        address: parentData.address || '',
        occupation: parentData.occupation || '',
        children: children.map((child: any) => ({
          id: child.id,
          firstName: child.firstName || '',
          lastName: child.lastName || '',
          fullName: `${child.firstName || ''} ${child.lastName || ''}`.trim(),
          email: child.email || '',
          classLevel: child.classLevel || '',
          birthDate: child.dateOfBirth || '',
          phone_number: child.phone || '',
          address: ''
        }))
      };
      
      setParentProfile(transformedProfile);
      
      // Mettre à jour le draft avec les informations du parent
      setDraft(prev => ({
        ...prev,
        parentId: transformedProfile.id.toString(),
        parentName: transformedProfile.fullName,
        parentEmail: transformedProfile.email,
        parentPhone: transformedProfile.phone_number || '',
        childId: transformedProfile.children.length > 0 ? transformedProfile.children[0].id.toString() : '',
        childName: transformedProfile.children.length > 0 ? transformedProfile.children[0].fullName : '',
        childClass: transformedProfile.children.length > 0 ? transformedProfile.children[0].classLevel : '',
      }));
      
      console.log('✅ Profil parent chargé avec succès:', transformedProfile);
      console.log('🔍 Draft mis à jour avec:', {
        parentId: transformedProfile.id.toString(),
        parentName: transformedProfile.fullName,
        parentEmail: transformedProfile.email,
        parentPhone: transformedProfile.phone_number || ''
      });
      console.log('📱 Téléphone parent:', transformedProfile.phone_number);
      console.log('👶 Enfants:', transformedProfile.children.map(c => `${c.fullName} (${c.classLevel}) - Tél: ${c.phone_number}`));
    } catch (error) {
      console.error('❌ Erreur lors du chargement du profil parent:', error);
    }
  }, []);

  // Fonction pour charger les rendez-vous
  const loadRendezVous = useCallback(async () => {
    try {
      setLoading(true);
      
      // Utiliser l'ID du parent connecté pour filtrer les rendez-vous
      const parentId = parentProfile?.id;
      if (!parentId) {
        console.log('⚠️ Pas d\'ID parent, chargement de tous les rendez-vous');
        setRendezVous([]);
        return;
      }
      
      console.log('🔍 Chargement des rendez-vous pour le parent:', parentId);
      
      // Récupérer le token d'authentification
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      const response = await fetch(`/api/rendez-vous?parentId=${parentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des rendez-vous');
      }
      
      const data = await response.json();
      console.log('📋 Rendez-vous récupérés:', data);
      
      // Transformer les données de la base pour correspondre à l'interface
      const transformedRendezVous: RendezVous[] = data.map((rdv: any) => ({
        id: rdv.id.toString(),
        parentId: rdv.parent_id,
        parentName: rdv.parent_name,
        parentEmail: rdv.parent_email,
        parentPhone: rdv.parent_phone,
        childName: rdv.child_name,
        childClass: rdv.child_class,
        timing: rdv.timing,
        appointmentTime: rdv.appointment_time,
        parentReason: rdv.parent_reason,
        adminReason: rdv.admin_reason,
        status: rdv.status,
        createdAt: rdv.created_at,
        updatedAt: rdv.updated_at
      }));
      
      console.log('🔄 Rendez-vous transformés:', transformedRendezVous);
      setRendezVous(transformedRendezVous);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  }, [parentProfile?.id]);

  // Fonction pour rafraîchir les données
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    await loadRendezVous();
    setRefreshing(false);
  }, [loadRendezVous]);

  // Charger le profil du parent et les rendez-vous au montage du composant
  useEffect(() => {
    const loadData = async () => {
      await loadParentProfile();
      await loadRendezVous();
    };
    loadData();
  }, [loadParentProfile, loadRendezVous]);

  // Rafraîchir automatiquement toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [refreshData]);

  const filtered = useMemo(() => {
    const now = new Date();
    return rendezVous.filter(m => {
      const meetingDate = new Date(m.timing);
      
      // Toujours montrer les rendez-vous acceptés ou refusés, peu importe la date
      if (m.status === 'accepted' || m.status === 'refused') {
        return true;
      }
      
      // Pour les rendez-vous en attente, appliquer le filtre de date
      if (filters === 'all') return true;
      if (filters === 'upcoming') return meetingDate.getTime() >= now.getTime();
      return meetingDate.getTime() < now.getTime();
    });
  }, [rendezVous, filters]);

  const save = async () => {
    // Validation
    if (!draft.childId || !draft.childName) {
      alert('Veuillez sélectionner un enfant pour ce rendez-vous.');
      return;
    }
    
    if (!draft.parentReason.trim()) {
      alert('Veuillez indiquer la raison du rendez-vous.');
      return;
    }
    
    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      const requestData = {
        parentId: draft.parentId,
        parentName: draft.parentName,
        parentEmail: draft.parentEmail,
        parentPhone: draft.parentPhone,
        childName: draft.childName,
        childClass: draft.childClass,
        timing: draft.timing,
        appointmentTime: draft.appointmentTime, // Heure spécifique choisie par le parent
        parentReason: draft.parentReason,
        status: 'pending'
      };
      
      console.log('📅 Données du rendez-vous à envoyer:', requestData);
      
      const response = await fetch('/api/rendez-vous', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du rendez-vous');
      }

      const newRendezVous = await response.json();
      
      // Ajouter le nouveau rendez-vous à la liste
      setRendezVous(prev => [{
        id: newRendezVous.id.toString(),
        parentId: draft.parentId,
        parentName: draft.parentName,
        parentEmail: draft.parentEmail,
        parentPhone: draft.parentPhone,
        childName: draft.childName,
        childClass: draft.childClass,
        timing: draft.timing,
        parentReason: draft.parentReason,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, ...prev]);

      setShowCreate(false);
      
      // Réinitialiser le formulaire avec les données du parent
      if (parentProfile) {
        setDraft({
          parentId: parentProfile.id.toString(),
          parentName: parentProfile.fullName,
          parentEmail: parentProfile.email,
          parentPhone: parentProfile.phone_number,
          childId: parentProfile.children.length > 0 ? parentProfile.children[0].id.toString() : '',
          childName: parentProfile.children.length > 0 ? parentProfile.children[0].fullName : '',
          childClass: parentProfile.children.length > 0 ? parentProfile.children[0].classLevel : '',
          timing: new Date().toISOString().slice(0, 16),
          parentReason: '',
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      alert('Erreur lors de la création du rendez-vous. Veuillez réessayer.');
    }
  };

  const getStatusBadge = (status: MeetingStatus) => {
    const map: Record<MeetingStatus, { text: string; class: string; icon: React.ReactNode }> = {
      pending: { 
        text: 'En attente', 
        class: 'text-yellow-300 bg-yellow-500/20 border border-yellow-500/30',
        icon: <AlertCircle className="w-3 h-3" />
      },
      accepted: { 
        text: 'Accepté', 
        class: 'text-green-300 bg-green-500/20 border border-green-500/30',
        icon: <CheckCircle className="w-3 h-3" />
      },
      refused: { 
        text: 'Refusé', 
        class: 'text-red-300 bg-red-500/20 border border-red-500/30',
        icon: <XCircle className="w-3 h-3" />
      },
      cancelled: { 
        text: 'Annulé', 
        class: 'text-gray-300 bg-gray-500/20 border border-gray-500/30',
        icon: <X className="w-3 h-3" />
      },
    };
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-3 py-2 rounded-full font-medium ${map[status].class}`}>
        {map[status].icon}
        {map[status].text}
      </span>
    );
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAppointmentTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAppointmentTime = (rdv: RendezVous) => {
    // Utiliser appointmentTime si disponible, sinon utiliser timing
    if (rdv.appointmentTime) {
      // Traiter appointmentTime comme une date locale sans conversion de fuseau horaire
      const appointmentDate = new Date(rdv.appointmentTime);
      // Utiliser toLocaleString avec timeZone: 'UTC' pour éviter le décalage
      return appointmentDate.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      });
    }
    // Fallback: utiliser timing
    return formatDateTime(rdv.timing);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-5 h-5 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-200">Chargement des rendez-vous...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-base font-bold">Rendez-vous</h1>
            <p className="text-blue-200">Planifiez et suivez vos réunions avec les professeurs</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
              <Plus className="w-4 h-4" /> Nouveau rendez-vous
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="w-10 h-10 text-blue-300 mx-auto mb-4 opacity-50" />
            <h3 className="text-white text-base font-semibold mb-2">Aucun rendez-vous trouvé</h3>
            <p className="text-blue-200">Aucun rendez-vous ne correspond à vos critères.</p>
          </div>
        ) : (
          filtered.map(m => (
            <div key={m.id} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-base">Rendez-vous avec l'administration</h3>
                    <div className="text-blue-200 text-sm flex flex-wrap gap-3 mt-1">
                      <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> {getAppointmentTime(m)}</span>
                      <span className="inline-flex items-center gap-1"><img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-4 h-4" /> {m.childName} ({m.childClass})</span>
                    </div>
                  </div>
                </div>
                <div>{getStatusBadge(m.status)}</div>
              </div>
              <div className="mt-3 text-blue-200 text-sm">
                <strong>Votre demande :</strong> {m.parentReason}
              </div>
              
              {/* Réponse de l'administration */}
              {m.adminReason && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  m.status === 'accepted' 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {m.status === 'accepted' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={`font-semibold text-sm ${
                      m.status === 'accepted' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {m.status === 'accepted' ? '✅ Rendez-vous Accepté' : '❌ Rendez-vous Refusé'}
                    </span>
                  </div>
                  <div className="text-white text-sm">
                    <strong>Réponse de l'administration :</strong>
                    <p className="mt-1 text-blue-100">{m.adminReason}</p>
                  </div>
                </div>
              )}
              
              {/* Message d'attente si pas encore de réponse */}
              {!m.adminReason && m.status === 'pending' && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">
                      En attente de réponse de l'administration
                    </span>
                  </div>
                </div>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-blue-300 bg-white/10 px-2 py-1 rounded">
                  <User className="w-3 h-3 inline mr-1" />
                  {m.parentName}
                </span>
                <span className="text-xs text-blue-300 bg-white/10 px-2 py-1 rounded">
                  <Mail className="w-3 h-3 inline mr-1" />
                  {m.parentEmail}
                </span>
                <span className="text-xs text-blue-300 bg-white/10 px-2 py-1 rounded">
                  <Phone className="w-3 h-3 inline mr-1" />
                  {m.parentPhone}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white text-base font-bold">Nouveau rendez-vous</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-200 text-sm mb-2">Enfant</label>
                <select 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" 
                  value={draft.childId} 
                  onChange={e => {
                    const selectedChild = parentProfile?.children.find(child => child.id.toString() === e.target.value);
                    setDraft(d => ({ 
                      ...d, 
                      childId: e.target.value,
                      childName: selectedChild?.fullName || '',
                      childClass: selectedChild?.classLevel || ''
                    }));
                  }}
                >
                  <option value="">Sélectionner un enfant</option>
                  {parentProfile?.children.map(child => (
                    <option key={child.id} value={child.id}>
                      {child.fullName} ({child.classLevel})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-blue-200 text-sm mb-2">Classe</label>
                <input 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" 
                  value={draft.childClass} 
                  readOnly
                />
              </div>
              <div>
                <label className="block text-blue-200 text-sm mb-2">Date et heure</label>
                <input 
                  type="datetime-local" 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" 
                  value={draft.timing} 
                  onChange={e => {
                    const newTiming = e.target.value;
                    // appointmentTime contient maintenant la date et heure complètes
                    setDraft(d => ({ 
                      ...d, 
                      timing: newTiming,
                      appointmentTime: newTiming // Date et heure complètes
                    }));
                  }} 
                />
              </div>
              <div>
                <label className="block text-blue-200 text-sm mb-2">Votre téléphone</label>
                <input 
                  type="tel" 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" 
                  value={draft.parentPhone} 
                  onChange={e => setDraft(d => ({ ...d, parentPhone: e.target.value }))} 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-blue-200 text-sm mb-2">Raison du rendez-vous</label>
                <textarea 
                  rows={4} 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" 
                  value={draft.parentReason} 
                  onChange={e => setDraft(d => ({ ...d, parentReason: e.target.value }))}
                  placeholder="Expliquez la raison de votre demande de rendez-vous..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all">Annuler</button>
              <button 
                onClick={save} 
                disabled={!draft.childName || !draft.childClass || !draft.parentReason || !draft.timing} 
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white disabled:opacity-60"
              >
                <Send className="w-4 h-4" /> Envoyer la demande
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsTab;



