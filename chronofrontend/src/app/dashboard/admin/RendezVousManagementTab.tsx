'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Plus,
  ChevronDown,
  ChevronUp,
  Star,
  Badge,
  FileText,
  Send,
  Archive,
  Clock3,
  CalendarDays,
  Users,
  Building,
  Home,
  Car,
  Wifi,
  Video,
  PhoneCall,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Info,
  ExternalLink,
  Download,
  Share2,
  Bookmark,
  Flag,
  Shield,
  Lock,
  Unlock,
  Settings,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Save,
  X,
  Check,
  Minus,
  Plus as PlusIcon,
  Heart,
  Zap,
  Target,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  AreaChart,
  Grid3X3,
  List,
  Grid,
  Columns,
  Rows,
  Layout,
  Sidebar,
  SidebarClose,
  SidebarOpen,
  Maximize2,
  Minimize2,
  Move,
  GripVertical,
  GripHorizontal,
  MousePointer,
  Hand,
  HandMetal,
  MousePointer2,
  MousePointerClick,
  MousePointerSquareDashed
} from 'lucide-react';

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
  status: 'pending' | 'accepted' | 'refused' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface RendezVousManagementTabProps {
  onRefresh?: () => void;
}

const RendezVousManagementTab: React.FC<RendezVousManagementTabProps> = ({ onRefresh }) => {
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [filteredRendezVous, setFilteredRendezVous] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRendezVous, setSelectedRendezVous] = useState<RendezVous | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseType, setResponseType] = useState<'approve' | 'refuse'>('approve');
  const [adminReason, setAdminReason] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  // Suppression des états de suppression - remplacé par refus avec raison

  // Fonction pour charger les rendez-vous
  const loadRendezVous = useCallback(async () => {
    try {
      setLoading(true);
      
      // Récupérer le token d'authentification
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      const response = await fetch('/api/admin/rendez-vous', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Impossible de charger les rendez-vous. Veuillez réessayer.');
      }
      
      const data = await response.json();
      console.log('✅ Rendez-vous loaded from admin API:', data);
      
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
      
      setRendezVous(transformedRendezVous);
      setFilteredRendezVous(transformedRendezVous);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les données au montage du composant
  useEffect(() => {
    loadRendezVous();
  }, [loadRendezVous]);

  // Filtrer les rendez-vous
  useEffect(() => {
    let filtered = rendezVous;

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(rdv =>
        rdv.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rdv.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rdv.parentReason.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(rdv => rdv.status === statusFilter);
    }

    setFilteredRendezVous(filtered);
  }, [rendezVous, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'refused': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Accepté';
      case 'refused': return 'Refusé';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
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

  const handleResponse = (rdv: RendezVous, type: 'approve' | 'refuse') => {
    setSelectedRendezVous(rdv);
    setResponseType(type);
    setAdminReason('');
    setShowResponseModal(true);
  };

  const submitResponse = async () => {
    if (!selectedRendezVous) return;

    // Validation : la raison est obligatoire pour les deux actions
    if (!adminReason.trim()) {
      alert(`Veuillez fournir une raison pour ${responseType === 'approve' ? 'approuver' : 'refuser'} ce rendez-vous.`);
      return;
    }

    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      // Appeler l'API appropriée selon le type de réponse
      const endpoint = responseType === 'approve' ? 'accept' : 'refuse';
      const response = await fetch(`/api/admin/rendez-vous/${selectedRendezVous.id}/${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminReason: adminReason.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Impossible de modifier le rendez-vous. Veuillez réessayer.');
      }

      // Rafraîchir les données depuis la base
      await loadRendezVous();

      setShowResponseModal(false);
      setSelectedRendezVous(null);
      setAdminReason('');
      
      console.log('Rendez-vous mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du rendez-vous. Veuillez réessayer.');
    }
  };

  // Fonction de suppression supprimée - remplacée par refus avec raison

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-200">Chargement des rendez-vous...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Gestion des Rendez-vous</h1>
          <p className="text-blue-200">
            Gérez les demandes de rendez-vous des parents
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onRefresh?.()}
            className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all"
            title="Actualiser"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Filtre par statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="accepted">Accepté</option>
            <option value="refused">Refusé</option>
            <option value="cancelled">Annulé</option>
          </select>

          {/* Statistiques rapides */}
          <div className="flex items-center justify-between text-sm text-blue-200">
            <span>{filteredRendezVous.length} rendez-vous</span>
            <span className="text-yellow-400">
              {filteredRendezVous.filter(r => r.status === 'pending').length} en attente
            </span>
          </div>
        </div>
      </div>

      {/* Liste des rendez-vous */}
      <div className="space-y-4">
        {filteredRendezVous.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-blue-300 mx-auto mb-4 opacity-50" />
            <h3 className="text-white text-lg font-semibold mb-2">Aucun rendez-vous trouvé</h3>
            <p className="text-blue-200">Aucun rendez-vous ne correspond à vos critères.</p>
          </div>
        ) : (
          filteredRendezVous.map((rdv) => (
            <div
              key={rdv.id}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-blue-300" />
                      <span className="text-white font-semibold">{rdv.parentName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-200">•</span>
                      <span className="text-blue-200">{rdv.childName}</span>
                      <span className="text-blue-300">({rdv.childClass})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="text-white font-semibold mb-2">Raison du parent</h3>
                      <p className="text-blue-200 text-sm mb-3">{rdv.parentReason}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-300" />
                        <span className="text-white text-sm">
                          {getAppointmentTime(rdv)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-blue-300" />
                        <span className="text-white text-sm">{rdv.parentEmail}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-blue-300" />
                        <span className="text-white text-sm">{rdv.parentPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(rdv.status)}`}>
                      {getStatusLabel(rdv.status)}
                    </span>
                    <span className="text-blue-300 text-xs">
                      {formatDate(rdv.createdAt)}
                    </span>
                  </div>

                  {rdv.adminReason && (
                    <div className="mt-3 p-3 bg-white/5 rounded-lg">
                      <p className="text-blue-200 text-sm font-medium mb-1">Réponse de l'admin :</p>
                      <p className="text-white text-sm">{rdv.adminReason}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedRendezVous(rdv);
                      setShowDetailsModal(true);
                    }}
                    className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all"
                    title="Voir les détails"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {rdv.status === 'pending' && (
                    <button
                      onClick={() => handleResponse(rdv, 'approve')}
                      className="p-2 bg-green-500/20 rounded-lg text-green-400 hover:bg-green-500/30 transition-all"
                      title="Approuver"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* Bouton de refus avec raison pour tous les statuts (sauf déjà refusé) */}
                  {rdv.status !== 'refused' && (
                    <button
                      onClick={() => handleResponse(rdv, 'refuse')}
                      className="p-2 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
                      title="Refuser avec raison"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de réponse */}
      {showResponseModal && selectedRendezVous && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">
                {responseType === 'approve' ? 'Approuver' : 'Refuser'} le rendez-vous
              </h3>
              <button
                onClick={() => setShowResponseModal(false)}
                className="text-blue-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-blue-200 text-sm mb-2">
                <strong>Parent:</strong> {selectedRendezVous.parentName}
              </p>
              <p className="text-blue-200 text-sm mb-2">
                <strong>Enfant:</strong> {selectedRendezVous.childName} ({selectedRendezVous.childClass})
              </p>
              <p className="text-blue-200 text-sm mb-2">
                <strong>Date demandée:</strong> {getAppointmentTime(selectedRendezVous)}
              </p>
              <p className="text-blue-200 text-sm mb-4">
                <strong>Raison:</strong> {selectedRendezVous.parentReason}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">
                Raison de votre décision (obligatoire)
              </label>
              <textarea
                value={adminReason}
                onChange={(e) => setAdminReason(e.target.value)}
                placeholder={`Ajoutez une raison pour ${responseType === 'approve' ? 'l\'approbation' : 'le refus'}...`}
                className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none ${
                  !adminReason.trim() 
                    ? 'border-red-500/50 focus:ring-red-400' 
                    : 'border-white/20'
                }`}
                rows={3}
                required
              />
              {!adminReason.trim() && (
                <p className="text-red-400 text-xs mt-1">Une raison est obligatoire pour {responseType === 'approve' ? 'approuver' : 'refuser'} un rendez-vous</p>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowResponseModal(false)}
                className="px-4 py-2 text-blue-300 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={submitResponse}
                disabled={!adminReason.trim()}
                className={`px-4 py-2 rounded-lg text-white font-medium transition-all ${
                  !adminReason.trim()
                    ? 'bg-gray-500 cursor-not-allowed opacity-50'
                    : responseType === 'approve'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {responseType === 'approve' ? 'Approuver' : 'Refuser'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showDetailsModal && selectedRendezVous && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl mx-4 border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-xl font-semibold">Détails du rendez-vous</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-blue-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informations du parent */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Informations du parent
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-blue-200 text-sm">Nom</p>
                      <p className="text-white font-medium">{selectedRendezVous.parentName}</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">Téléphone</p>
                      <p className="text-white font-medium">{selectedRendezVous.parentPhone}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-blue-200 text-sm">Email</p>
                      <p className="text-white font-medium break-all">{selectedRendezVous.parentEmail}</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">Enfant</p>
                      <p className="text-white font-medium">{selectedRendezVous.childName} ({selectedRendezVous.childClass})</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails du rendez-vous */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Détails du rendez-vous
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-blue-200 text-sm">Date et heure demandées</p>
                    <p className="text-white font-medium">{getAppointmentTime(selectedRendezVous)}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">Raison du parent</p>
                    <p className="text-white">{selectedRendezVous.parentReason}</p>
                  </div>
                </div>
              </div>

              {/* Statut */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Statut et informations
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-200 text-sm">Statut</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedRendezVous.status)}`}>
                      {getStatusLabel(selectedRendezVous.status)}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-blue-200 text-sm">Date de création</p>
                  <p className="text-white">{formatDate(selectedRendezVous.createdAt)}</p>
                </div>
              </div>

              {/* Réponse de l'admin */}
              {selectedRendezVous.adminReason && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Réponse de l'administrateur
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-blue-200 text-sm">Réponse</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                        selectedRendezVous.status === 'accepted' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {selectedRendezVous.status === 'accepted' ? 'Accepté' : 'Refusé'}
                      </span>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">Raison</p>
                      <p className="text-white">{selectedRendezVous.adminReason}</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-sm">Date de réponse</p>
                      <p className="text-white">{selectedRendezVous.updatedAt && formatDate(selectedRendezVous.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression supprimé - remplacé par refus avec raison */}
    </div>
  );
};

export default RendezVousManagementTab;

