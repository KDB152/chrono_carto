'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  User,
  BookOpen,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Euro,
  Download,
  Loader2,
  Edit
} from 'lucide-react';
import { AnimatedPage, AnimatedCard, AnimatedButton, AnimatedTable, AnimatedTableRow, AnimatedStats } from '../../../components/ui/animations';

import { AVAILABLE_CLASSES } from '@/constants/classes';

interface Payment {
  id: number;
  student_id: number;
  parent_id: number | null;
  seances_total: number;
  seances_non_payees: number;
  seances_payees: number;
  montant_total: number;
  montant_paye: number;
  montant_restant: number;
  prix_seance: number;
  statut: string;
  date_derniere_presence: string | null;
  date_dernier_paiement: string | null;
  student_first_name: string;
  student_last_name: string;
  class_level: string;
  parent_first_name: string | null;
  parent_last_name: string | null;
  date_creation: string;
}

interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  overdueAmount: number;
}

const PaymentsManagementTab: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Tous');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSessions, setEditingSessions] = useState({
    seances_payees: 0,
    seances_non_payees: 0
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Charger la liste des étudiants depuis l'API students
  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      // Récupérer les données depuis l'API attendance qui contient les vraies données de présence
      const response = await fetch('/api/attendance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du chargement des données de présence');
      }
      
      const data = await response.json();
      
      // Adapter les données de présence en format paiement
      let students = [];
      if (Array.isArray(data)) {
        students = data;
      } else if (data.items) {
        students = data.items;
      }
      
      const adaptedPayments = students.map((student: any, index: number) => ({
        id: index + 1,
        student_id: student.studentId || student.id,
        parent_id: null,
        seances_total: (student.paid_sessions || 0) + (student.unpaid_sessions || 0),
        seances_non_payees: student.unpaid_sessions || 0,
        seances_payees: student.paid_sessions || 0,
        montant_total: ((student.paid_sessions || 0) + (student.unpaid_sessions || 0)) * 40,
        montant_paye: (student.paid_sessions || 0) * 40,
        montant_restant: (student.unpaid_sessions || 0) * 40,
        prix_seance: 40,
        statut: (student.unpaid_sessions || 0) === 0 ? 'paye' : (student.paid_sessions || 0) > 0 ? 'partiel' : 'en_attente',
        date_derniere_presence: null,
        date_dernier_paiement: null,
        student_first_name: student.firstName || student.first_name || '',
        student_last_name: student.lastName || student.last_name || '',
        class_level: student.classLevel || student.class_level || '',
        parent_first_name: student.parent_first_name || null,
        parent_last_name: student.parent_last_name || null,
        parent_email: student.parent_email || null,
        date_creation: student.createdAt || new Date().toISOString()
      }));
      
      setPayments(adaptedPayments);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedStatus, searchQuery]);

  // Filtrer les paiements - Les statistiques se basent sur ce tableau filtré
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchQuery === '' || 
      payment.student_first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.student_last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.class_level.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = selectedClass === '' || payment.class_level === selectedClass;
    const matchesStatus = selectedStatus === 'Tous' || payment.statut === selectedStatus;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  // Fonction pour calculer un total de manière sécurisée
  const calculateTotal = (payments: Payment[], field: keyof Payment): number => {
    
    const result = payments.reduce((sum, p) => {
      const value = p[field];
      
      // Convertir en nombre
      const numValue = parseFloat(String(value));
      
      if (!isNaN(numValue)) {
        return sum + numValue;
      }
      return sum;
    }, 0);
    
    return result;
  };

  // Statistiques - Calculer les totaux à partir du tableau filtré affiché
  const stats: PaymentStats = {
    totalPayments: filteredPayments.length, // Nombre de paiements filtrés
    totalAmount: calculateTotal(filteredPayments, 'montant_total'), // Total du tableau affiché
    paidAmount: calculateTotal(filteredPayments, 'montant_paye'), // Total payé du tableau affiché
    unpaidAmount: calculateTotal(filteredPayments, 'montant_restant'), // Total non payé du tableau affiché
    overdueAmount: 0 // Supprimé
  };

  // Obtenir la couleur de fond selon le statut
  const getStatusBgColor = (statut: string) => {
    switch (statut) {
      case 'paye': return 'bg-green-500/20 border-green-500/30';
      case 'partiel': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'en_attente': return 'bg-blue-500/20 border-blue-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  // Formater les dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Formater les montants
  const formatAmount = (amount: number) => {
    // Vérifier que le montant est un nombre valide
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '0,00 dt';
    }
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' dt';
  };


  // Fonction pour éditer un paiement
  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setEditingSessions({
      seances_payees: payment.seances_payees,
      seances_non_payees: payment.seances_non_payees
    });
    setShowEditModal(true);
  };

  // Fonction pour marquer comme payé
  const handleMarkAsPaid = async (payment: Payment) => {
    try {
      // Calculer les nouvelles valeurs
      const newSeancesPayees = payment.seances_payees + payment.seances_non_payees;
      const newSeancesNonPayees = 0;
      const newMontantTotal = newSeancesPayees * 40;
      const newMontantPaye = newMontantTotal;
      const newMontantRestant = 0;
      
      // Mettre à jour localement les données
      setPayments(prevPayments => 
        prevPayments.map(p => {
          if (p.id === payment.id) {
            return {
              ...p,
              statut: 'paye',
              seances_payees: newSeancesPayees,
              seances_non_payees: newSeancesNonPayees,
              seances_total: newSeancesPayees,
              montant_total: newMontantTotal,
              montant_paye: newMontantPaye,
              montant_restant: newMontantRestant
            };
          }
          return p;
        })
      );
      
      // Synchroniser avec l'API attendance
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        const response = await fetch('/api/attendance', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId: payment.student_id,
            action: 'update_sessions',
            seances_payees: newSeancesPayees,
            seances_non_payees: newSeancesNonPayees
          })
        });
        
        if (response.ok) {
          // Recharger les données pour avoir les dernières informations
          await loadPayments();
        }
      } catch (apiError) {
        console.warn('Erreur de synchronisation avec l\'API attendance:', apiError);
      }
      
      // Afficher un message de succès
      alert(`Paiement marqué comme payé avec succès ! ${payment.seances_non_payees} séances non payées ont été transférées vers les séances payées.`);
      
    } catch (err) {
      alert('Erreur lors du marquage comme payé');
    }
  };

  // Fonction pour sauvegarder les modifications des séances
  const handleSaveSessions = async () => {
    if (!selectedPayment) return;
    
    try {
      setIsUpdating(true);
      
      // Mettre à jour localement les données
      setPayments(prevPayments => 
        prevPayments.map(payment => {
          if (payment.id === selectedPayment.id) {
            const newSeancesTotal = editingSessions.seances_payees + editingSessions.seances_non_payees;
            const newMontantTotal = newSeancesTotal * 40;
            const newMontantPaye = editingSessions.seances_payees * 40;
            const newMontantRestant = editingSessions.seances_non_payees * 40;
            const newStatut = editingSessions.seances_non_payees === 0 ? 'paye' : 
                             editingSessions.seances_payees > 0 ? 'partiel' : 'en_attente';
            
            return {
              ...payment,
              seances_total: newSeancesTotal,
              seances_payees: editingSessions.seances_payees,
              seances_non_payees: editingSessions.seances_non_payees,
              montant_total: newMontantTotal,
              montant_paye: newMontantPaye,
              montant_restant: newMontantRestant,
              statut: newStatut
            };
          }
          return payment;
        })
      );
      
      // Synchroniser avec l'API attendance
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        const response = await fetch('/api/attendance', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId: selectedPayment.student_id,
            action: 'update_sessions',
            seances_payees: editingSessions.seances_payees,
            seances_non_payees: editingSessions.seances_non_payees
          })
        });
        
        if (response.ok) {
          // Recharger les données pour avoir les dernières informations
          await loadPayments();
        }
      } catch (apiError) {
        console.warn('Erreur de synchronisation avec l\'API attendance:', apiError);
      }
      
      // Fermer le modal
      setShowEditModal(false);
      setSelectedPayment(null);
      
      // Afficher un message de succès
      alert('Séances mises à jour avec succès !');
      
    } catch (err) {
      alert('Erreur lors de la mise à jour des séances');
    } finally {
      setIsUpdating(false);
    }
  };

  // Fermer les modales
  const closeModals = () => {
    setShowEditModal(false);
    setSelectedPayment(null);
  };



  useEffect(() => {
    // Charger les paiements au montage du composant
    loadPayments();
  }, [loadPayments]);

  // Si aucune classe n'est sélectionnée, afficher le sélecteur de classe
  if (!selectedClass) {
    return (
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="text-center py-12">
            <img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Sélectionnez une classe</h3>
            <p className="text-blue-200 mb-6">
              Veuillez sélectionner une classe pour afficher les paiements
            </p>
            
            {/* Sélecteur de classe */}
            <div className="max-w-md mx-auto">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
              >
                <option value="" className="bg-gray-800 text-white">Sélectionnez une classe</option>
                {AVAILABLE_CLASSES.map(cls => (
                  <option key={cls} value={cls} className="bg-gray-800 text-white">{cls}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-base text-white">Chargement des paiements...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
                 <div className="text-center">
           <XCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
           <h3 className="text-base font-semibold text-red-600 mb-2">Erreur de chargement</h3>
           <p className="text-gray-600 mb-4">{error}</p>
           <button
             onClick={loadPayments}
             className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
           >
             Réessayer
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white flex items-center">
              <CreditCard className="w-5 h-5 text-blue-300 mr-3" />
              Gestion des Paiements
            </h1>
            <p className="text-blue-200 mt-1">
              Gérez les paiements des étudiants et suivez leur statut financier
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
              title="Actualiser"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Total Paiements</p>
              <p className="text-base font-bold text-white">{stats.totalPayments}</p>
            </div>
            <CreditCard className="w-5 h-5 text-blue-300" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Montant Total</p>
              <p className="text-base font-bold text-white">{formatAmount(stats.totalAmount)}</p>
            </div>
            <Euro className="w-5 h-5 text-blue-300" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Payé</p>
              <p className="text-base font-bold text-green-400">{formatAmount(stats.paidAmount)}</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Non Payé</p>
              <p className="text-base font-bold text-orange-400">{formatAmount(stats.unpaidAmount)}</p>
            </div>
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Barre de progression globale des paiements */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Progression globale des paiements</h3>
          <span className="text-white text-lg font-semibold">
            {stats.totalAmount > 0 ? Math.round((stats.paidAmount / stats.totalAmount) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-700 shadow-lg"
            style={{ 
              width: `${stats.totalAmount > 0 ? (stats.paidAmount / stats.totalAmount) * 100 : 0}%` 
            }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-blue-300 mt-2">
          <span>Payé: {formatAmount(stats.paidAmount)}</span>
          <span>Restant: {formatAmount(stats.unpaidAmount)}</span>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, email ou classe..."
              className="pl-10 pr-4 py-3 w-full border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
            />
          </div>
          <div className="flex items-center space-x-3">
                                      {/* Filtre par classe */}
            <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
              >
                <option value="" className="bg-gray-800 text-white">Sélectionnez une classe</option>
                {AVAILABLE_CLASSES.map(cls => (
                  <option key={cls} value={cls} className="bg-gray-800 text-white">{cls}</option>
              ))}
            </select>
            
          </div>
        </div>
      </div>

      {/* Liste des paiements */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-base font-bold text-white flex items-center">
            <User className="w-5 h-5 text-blue-300 mr-2" />
            Paiements ({filteredPayments.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-3 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  Étudiant
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  Classe
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  Séances
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  Montants
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-3 py-4">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {payment.student_first_name} {payment.student_last_name}
                      </div>
                      <div className="text-sm text-blue-200">
                        {payment.parent_first_name && payment.parent_last_name 
                          ? `${payment.parent_first_name} ${payment.parent_last_name}`
                          : 'Aucun parent'
                        }
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-3 h-3 mr-1" />
                      {payment.class_level}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm text-white">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-400">Payées: {payment.seances_payees}</span>
                        <span className="text-orange-400">Non payées: {payment.seances_non_payees}</span>
                      </div>
                      <div className="text-xs text-blue-200">
                        Total: {payment.seances_total}
                      </div>
                      {/* Barre de progression des séances */}
                      <div className="mt-2">
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${payment.seances_total > 0 ? (payment.seances_payees / payment.seances_total) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-blue-300 mt-1">
                          {payment.seances_total > 0 ? Math.round((payment.seances_payees / payment.seances_total) * 100) : 0}% complété
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm text-white">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-400">Payé: {formatAmount(payment.montant_paye)}</span>
                        <span className="text-orange-400">Restant: {formatAmount(payment.montant_restant)}</span>
                      </div>
                      <div className="text-xs text-blue-200">
                        Total: {formatAmount(payment.montant_total)}
                      </div>
                      {/* Barre de progression des montants */}
                      <div className="mt-2">
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${payment.montant_total > 0 ? (payment.montant_paye / payment.montant_total) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-blue-300 mt-1">
                          {payment.montant_total > 0 ? Math.round((payment.montant_paye / payment.montant_total) * 100) : 0}% payé
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBgColor(payment.statut)}`}>
                       {payment.statut === 'paye' && <CheckCircle className="w-3 h-3 mr-1" />}
                       {payment.statut === 'partiel' && <Clock className="w-3 h-3 mr-1" />}
                       {payment.statut === 'en_attente' && <Clock className="w-3 h-3 mr-1" />}
                       {payment.statut}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                        onClick={() => handleMarkAsPaid(payment)}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                        title="Marquer comme payé"
                      >
                        <CheckCircle className="w-3 h-3" />
                        </button>
                      <button
                        onClick={() => handleEdit(payment)}
                        className="px-3 py-1 bg-yellow-600 text-white text-xs rounded-lg hover:bg-yellow-700 transition-colors"
                        title="Éditer"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-4">
            <CreditCard className="w-10 h-10 text-blue-300 mx-auto mb-4" />
            <p className="text-blue-200">Aucun paiement trouvé</p>
          </div>
        )}
      </div>

      {/* Modal d'édition des séances */}
      {showEditModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white">Modifier les séances</h3>
              <button
                onClick={closeModals}
                className="text-blue-300 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-blue-200 text-sm mb-2">
                  Étudiant: <span className="text-white font-medium">
                    {selectedPayment.student_first_name} {selectedPayment.student_last_name}
                  </span>
                </p>
                <p className="text-blue-200 text-sm mb-4">
                  Parent: <span className="text-white font-medium">
                    {selectedPayment.parent_first_name && selectedPayment.parent_last_name 
                      ? `${selectedPayment.parent_first_name} ${selectedPayment.parent_last_name}`
                      : 'Aucun parent'
                    }
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">
                    Séances payées
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingSessions.seances_payees}
                    onChange={(e) => setEditingSessions(prev => ({
                      ...prev,
                      seances_payees: parseInt(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">
                    Séances non payées
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingSessions.seances_non_payees}
                    onChange={(e) => setEditingSessions(prev => ({
                      ...prev,
                      seances_non_payees: parseInt(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-blue-200 text-sm">
                  Total: <span className="text-white font-medium">
                    {editingSessions.seances_payees + editingSessions.seances_non_payees} séances
                  </span>
                </p>
                <p className="text-blue-200 text-sm">
                  Montant total: <span className="text-white font-medium">
                    {formatAmount((editingSessions.seances_payees + editingSessions.seances_non_payees) * selectedPayment.prix_seance)}
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={closeModals}
                  className="px-4 py-2 text-blue-300 hover:text-white transition-colors"
                  disabled={isUpdating}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveSessions}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mise à jour...</span>
                    </>
                  ) : (
                    <span>Sauvegarder</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsManagementTab;

