'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  Receipt,
  Wallet,
  User,
  Clock,
  Info,
  Euro,
  BookOpen
} from 'lucide-react';

interface PaymentsTabProps {
  selectedChild: { id: string | number; name?: string; firstName?: string; lastName?: string; fullName?: string } | null;
  parent: any;
  searchQuery: string;
}

interface Payment {
  id: number;
  student_id: number;
  parent_id: number | null;
  seances_total: number;
  seances_non_payees: number;
  seances_payees: number;
  montant_total: number; // Maintenant toujours un nombre après transformation
  montant_paye: number;  // Maintenant toujours un nombre après transformation
  montant_restant: number; // Maintenant toujours un nombre après transformation
  prix_seance: number;   // Maintenant toujours un nombre après transformation
  statut: string;
  date_derniere_presence: string | null;
  date_dernier_paiement: string | null;
  student_first_name: string;
  student_last_name: string;
  class_level: string;
  parent_first_name: string | null;
  parent_last_name: string | null;
  date_creation: string;
  date_modification: string;
}

interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
  totalSessions: number;
  totalUnpaidSessions: number;
  totalPaidSessions: number;
}

const PaymentsTab: React.FC<PaymentsTabProps> = ({ parent, selectedChild, searchQuery }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer l'ID utilisateur depuis localStorage
      let userId = null;
      
      // Essayer d'abord avec l'objet parent (si il contient user_id)
      if (parent?.user_id) {
        userId = parent.user_id;
      } else {
        // Sinon, récupérer depuis localStorage
        const userData = localStorage.getItem('userDetails');
        if (userData) {
          const user = JSON.parse(userData);
          userId = user.id;
        }
      }
      
      if (!userId) {
        throw new Error('Utilisateur non identifié - Veuillez vous reconnecter');
      }

      console.log('🔍 Chargement des paiements pour userId:', userId);

      const response = await fetch(`/api/attendance`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du chargement des paiements');
      }

      const data = await response.json();
      
      console.log('📊 Données attendance reçues:', data);
      
      // Adapter les données de l'API attendance au format paiement
      const students = Array.isArray(data) ? data : [];
      
      const paymentsWithNumbers = students.map((student: any, index: number) => ({
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
        parent_first_name: null,
        parent_last_name: null,
        date_creation: student.createdAt || new Date().toISOString(),
        date_modification: new Date().toISOString()
      }));
      
      // Calculer les statistiques
      const stats = {
        totalPayments: paymentsWithNumbers.length,
        totalAmount: paymentsWithNumbers.reduce((sum, p) => sum + p.montant_total, 0),
        totalPaid: paymentsWithNumbers.reduce((sum, p) => sum + p.montant_paye, 0),
        totalRemaining: paymentsWithNumbers.reduce((sum, p) => sum + p.montant_restant, 0),
        totalSessions: paymentsWithNumbers.reduce((sum, p) => sum + p.seances_total, 0),
        totalUnpaidSessions: paymentsWithNumbers.reduce((sum, p) => sum + p.seances_non_payees, 0),
        totalPaidSessions: paymentsWithNumbers.reduce((sum, p) => sum + p.seances_payees, 0)
      };
      
      setPayments(paymentsWithNumbers);
      setStats(stats);

    } catch (err) {
      console.error('❌ Erreur lors du chargement des paiements:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Charger les paiements dès que le composant est monté
    loadPayments();
  }, []); // Pas de dépendance sur parent car on utilise localStorage

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'paye': return 'text-green-400';
      case 'partiel': return 'text-yellow-400';
      case 'en_retard': return 'text-red-400';
      case 'en_attente': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'paye': return <CheckCircle className="w-5 h-5" />;
      case 'partiel': return <AlertTriangle className="w-5 h-5" />;
      case 'en_retard': return <XCircle className="w-5 h-5" />;
      case 'en_attente': return <Clock className="w-5 h-5" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  // Fonction pour obtenir la couleur de fond du statut
  const getStatusBgColor = (statut: string) => {
    switch (statut) {
      case 'paye': return 'bg-green-500/20 border-green-500/30';
      case 'partiel': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'en_retard': return 'bg-red-500/20 border-red-500/30';
      case 'en_attente': return 'bg-blue-500/20 border-blue-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  // Formater les dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Filtrer les paiements selon la recherche et l'enfant sélectionné
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchQuery === '' || 
      payment.student_first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.student_last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.class_level.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesChild = !selectedChild || 
      selectedChild.id === 'all' || 
      payment.student_id.toString() === selectedChild.id.toString();

    return matchesSearch && matchesChild;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-base text-white">Chargement des paiements...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <XCircle className="w-5 h-5 text-red-400" />
          <h3 className="text-base font-semibold text-red-400">Erreur</h3>
        </div>
        <p className="text-red-200 mb-4">{error}</p>
        <button
          onClick={loadPayments}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Réessayer</span>
        </button>
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
              Paiements et Séances
            </h1>
            <p className="text-blue-200 mt-1">
              Suivez les séances et paiements de vos enfants
            </p>
          </div>
          <button
            onClick={loadPayments}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Séances Totales</p>
                <p className="text-base font-bold text-white">{stats.totalSessions}</p>
              </div>
              <img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-5 h-5" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Séances Non Payées</p>
                <p className="text-base font-bold text-red-400">{stats.totalUnpaidSessions}</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Montant Total</p>
                <p className="text-base font-bold text-white">{stats.totalAmount.toFixed(2)}dt</p>
              </div>
              <Euro className="w-5 h-5 text-blue-300" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Montant Restant</p>
                <p className="text-base font-bold text-orange-400">{stats.totalRemaining.toFixed(2)}dt</p>
              </div>
              <Wallet className="w-5 h-5 text-orange-400" />
            </div>
          </div>
        </div>
      )}

      {/* Liste des paiements */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-base font-bold text-white flex items-center">
            <Receipt className="w-5 h-5 text-blue-300 mr-2" />
            Détails des Paiements ({filteredPayments.length})
          </h2>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="text-center py-6">
            <Receipt className="w-10 h-10 text-blue-300 mx-auto mb-4 opacity-50" />
            <h3 className="text-base font-semibold text-white mb-2">Aucun paiement trouvé</h3>
            <p className="text-blue-200">
              {payments.length === 0 
                ? "Aucune séance enregistrée pour le moment."
                : "Aucun paiement ne correspond à votre recherche."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <User className="w-5 h-5 text-blue-300" />
                      <h3 className="text-base font-semibold text-white">
                        {payment.student_first_name} {payment.student_last_name}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {payment.class_level}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-blue-200 text-sm">Séances Total</span>
                          <span className="text-white font-semibold">{payment.seances_total}</span>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-blue-200 text-sm">Non Payées</span>
                          <span className="text-red-400 font-semibold">{payment.seances_non_payees}</span>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-blue-200 text-sm">Payées</span>
                          <span className="text-green-400 font-semibold">{payment.seances_payees}</span>
                        </div>
                      </div>
                    </div>

                    {/* Barre de progression des séances */}
                    <div className="bg-white/5 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-200 text-sm font-medium">Progression des séances</span>
                        <span className="text-white text-sm font-semibold">
                          {payment.seances_total > 0 ? Math.round((payment.seances_payees / payment.seances_total) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                          style={{ 
                            width: `${payment.seances_total > 0 ? (payment.seances_payees / payment.seances_total) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-blue-300 mt-1">
                        <span>{payment.seances_payees} payées</span>
                        <span>{payment.seances_non_payees} restantes</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-blue-200 text-sm">Montant Total</span>
                          <span className="text-white font-semibold">{payment.montant_total.toFixed(2)}dt</span>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-blue-200 text-sm">Payé</span>
                          <span className="text-green-400 font-semibold">{payment.montant_paye.toFixed(2)}dt</span>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-blue-200 text-sm">Restant</span>
                          <span className="text-orange-400 font-semibold">{payment.montant_restant.toFixed(2)}dt</span>
                        </div>
                      </div>
                    </div>

                    {/* Barre de progression des montants */}
                    <div className="bg-white/5 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-200 text-sm font-medium">Progression des paiements</span>
                        <span className="text-white text-sm font-semibold">
                          {payment.montant_total > 0 ? Math.round((payment.montant_paye / payment.montant_total) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                          style={{ 
                            width: `${payment.montant_total > 0 ? (payment.montant_paye / payment.montant_total) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-blue-300 mt-1">
                        <span>{payment.montant_paye.toFixed(2)}dt payé</span>
                        <span>{payment.montant_restant.toFixed(2)}dt restant</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-blue-200">
                      <div className="flex items-center space-x-3">
                        <span>Prix/séance: {payment.prix_seance.toFixed(2)}dt</span>
                        {payment.date_derniere_presence && (
                          <span>Dernière présence: {formatDate(payment.date_derniere_presence)}</span>
                        )}
                      </div>
                      <span>Modifié: {formatDate(payment.date_modification)}</span>
                    </div>
                  </div>

                  <div className="ml-3">
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getStatusBgColor(payment.statut)}`}>
                      <span className={getStatusColor(payment.statut)}>
                        {getStatusIcon(payment.statut)}
                      </span>
                      <span className={`font-medium capitalize ${getStatusColor(payment.statut)}`}>
                        {payment.statut.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informations sur les paiements */}
      <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-base font-semibold text-blue-200 mb-2">Information sur les paiements</h3>
            <div className="text-blue-200 text-sm space-y-1">
              <p>• Les séances sont automatiquement ajoutées lors de la présence de votre enfant</p>
              <p>• Le prix par défaut est de 40dt par séance</p>
              <p>• Contactez l'administration pour effectuer un paiement ou modifier les informations</p>
              <p>• Les statistiques sont mises à jour en temps réel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsTab;

