'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  User,
  BookOpen,
  Clock,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { AnimatedPage, AnimatedCard, AnimatedButton, AnimatedTable, AnimatedTableRow, AnimatedStats } from '../../../components/ui/animations';
import { AVAILABLE_CLASSES } from '@/constants/classes';

interface Student {
  id: number;
  studentId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone_number: string;
  classLevel: string;
  birthDate: string;
  progressPercentage: number;
  averageScore: number;
  role: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  notes: string;
  // Champs pour les séances et paiements
  paid_sessions?: number;
  unpaid_sessions?: number;
  montant_paye?: number;
  montant_restant?: number;
  statut_paiement?: string;
  // Prix par séance (fixe pour tous les étudiants)
  prix_seance?: number;
}

const AttendanceTab: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Liste des classes disponibles (même que dans l'enregistrement)
  const classes = AVAILABLE_CLASSES;
  
  const [filterClass, setFilterClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Prix par séance (en dinars tunisiens)
  const PRIX_SEANCE = 25;

  // Charger la liste des étudiants depuis l'API /api/attendance
  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      const response = await fetch('/api/attendance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du chargement de la liste des étudiants');
      }
      
      const data = await response.json();
      
      // Les données viennent déjà avec les séances de la table paiement
      setStudents(data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  // Marquer la présence d'un étudiant et ajouter une séance non payée
  const toggleAttendance = async (studentId: number, isPresent: boolean) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          date: selectedDate,
          isPresent,
          action: isPresent ? 'add_unpaid_session' : 'mark_absent'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour de la présence');
      }

      const result = await response.json();

      // Recharger les données pour avoir les dernières informations de la base de données
      await loadStudents();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  // Filtrer les étudiants par classe et recherche
  const filteredStudents = students.filter(student => {
    const matchesClass = !filterClass || student.classLevel === filterClass;
    const matchesSearch = !searchQuery || 
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesClass && matchesSearch;
  });

  // Calculer les statistiques (sans montants dans AttendanceTab)
  const stats = {
    total: filteredStudents.length,
    active: filteredStudents.filter(s => s.isActive).length,
    totalPaid: filteredStudents.reduce((sum, s) => sum + (s.paid_sessions || 0), 0),
    totalUnpaid: filteredStudents.reduce((sum, s) => sum + (s.unpaid_sessions || 0), 0)
  };

  // Charger les étudiants au montage du composant
  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Si aucune classe n'est sélectionnée, afficher tous les étudiants avec un message
  if (!filterClass) {
    return (
      <AnimatedPage className="space-y-6">
        <AnimatedCard className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="text-center py-12">
            <img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Sélectionnez une classe</h3>
            <p className="text-blue-200 mb-6">
              Veuillez sélectionner une classe pour filtrer les étudiants
            </p>
            
            {/* Sélecteur de classe */}
            <div className="max-w-md mx-auto">
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
              >
                <option value="" className="bg-gray-800 text-white">Toutes les classes</option>
                {AVAILABLE_CLASSES.map(cls => (
                  <option key={cls} value={cls} className="bg-gray-800 text-white">{cls}</option>
                ))}
              </select>
            </div>
          </div>
        </AnimatedCard>
      </AnimatedPage>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-lg text-white">Chargement des étudiants...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <AnimatedButton
            onClick={loadStudents}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </AnimatedButton>
        </div>
      </div>
    );
  }

  return (
    <AnimatedPage className="space-y-6">
      {/* En-tête */}
      <AnimatedCard className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Users className="w-6 h-6 text-blue-300 mr-3" />
              Gestion de la Présence
            </h1>
            <p className="text-blue-200 mt-1">
              Gérez la présence des étudiants et suivez leurs séances
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
      </AnimatedCard>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <AnimatedStats delay={0} className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Total Étudiants</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-300" />
          </div>
        </AnimatedStats>
        
        <AnimatedStats delay={1} className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Actifs</p>
              <p className="text-2xl font-bold text-green-400">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </AnimatedStats>
        
        <AnimatedStats delay={2} className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Séances Payées</p>
              <p className="text-2xl font-bold text-green-400">{stats.totalPaid}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </AnimatedStats>
        
        <AnimatedStats delay={3} className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Séances Non Payées</p>
              <p className="text-2xl font-bold text-orange-400">{stats.totalUnpaid}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
        </AnimatedStats>
        
      </div>

      {/* Barre de progression globale des séances */}
      <AnimatedCard className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Progression globale des séances</h3>
          <span className="text-white text-lg font-semibold">
            {stats.totalPaid + stats.totalUnpaid > 0 ? Math.round((stats.totalPaid / (stats.totalPaid + stats.totalUnpaid)) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-700 shadow-lg"
            style={{ 
              width: `${stats.totalPaid + stats.totalUnpaid > 0 ? (stats.totalPaid / (stats.totalPaid + stats.totalUnpaid)) * 100 : 0}%` 
            }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-blue-300 mt-2">
          <span>Payées: {stats.totalPaid}</span>
          <span>Non payées: {stats.totalUnpaid}</span>
        </div>
      </AnimatedCard>

      {/* Filtres et recherche */}
      <AnimatedCard className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="pl-10 pr-4 py-3 w-full border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
            />
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
            >
              {AVAILABLE_CLASSES.map(cls => (
                <option key={cls} value={cls} className="bg-gray-800 text-white">{cls}</option>
              ))}
            </select>
            <AnimatedButton
              onClick={loadStudents}
              className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualiser</span>
            </AnimatedButton>
          </div>
        </div>
      </AnimatedCard>

      {/* Liste des étudiants */}
      <AnimatedCard className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white flex items-center">
            <User className="w-5 h-5 text-blue-300 mr-2" />
            Étudiants ({filteredStudents.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <AnimatedTable className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  Étudiant
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  Classe
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  Séances
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-200 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredStudents.map((student, index) => (
                <AnimatedTableRow 
                  key={student.id} 
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-sm text-blue-200">{student.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-3 h-3 mr-1" />
                      {student.classLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-400">Payées: {student.paid_sessions || 0}</span>
                        <span className="text-orange-400">Non payées: {student.unpaid_sessions || 0}</span>
                      </div>
                      {/* Barre de progression des séances */}
                      <div className="mt-2">
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(student.paid_sessions || 0) + (student.unpaid_sessions || 0) > 0 ? 
                                ((student.paid_sessions || 0) / ((student.paid_sessions || 0) + (student.unpaid_sessions || 0))) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-blue-300 mt-1">
                          {((student.paid_sessions || 0) + (student.unpaid_sessions || 0)) > 0 ? 
                            Math.round(((student.paid_sessions || 0) / ((student.paid_sessions || 0) + (student.unpaid_sessions || 0))) * 100) : 0}% payé
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {student.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <AnimatedButton
                        onClick={() => toggleAttendance(student.studentId, true)}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                        title="Marquer présent"
                      >
                        Présent
                      </AnimatedButton>
                      <AnimatedButton
                        onClick={() => toggleAttendance(student.studentId, false)}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                        title="Marquer absent"
                      >
                        Absent
                      </AnimatedButton>
                    </div>
                  </td>
                </AnimatedTableRow>
              ))}
            </tbody>
          </AnimatedTable>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-blue-300 mx-auto mb-4" />
            <p className="text-blue-200">Aucun étudiant trouvé</p>
          </div>
        )}
      </AnimatedCard>
    </AnimatedPage>
  );
};

export default AttendanceTab;

