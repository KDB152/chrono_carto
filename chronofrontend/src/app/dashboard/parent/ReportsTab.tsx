'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Filter,
  Calendar,
  User,
  Users,
  BarChart3,
  Trophy,
  Award,
  MessageSquare,
  RefreshCw,
  ClipboardList,
} from 'lucide-react';

interface ChildRef {
  id: string;
  firstName: string;
  lastName: string;
}

interface ReportsTabProps {
  selectedChild?: { id: string; firstName: string; lastName: string };
  parent?: { id: string; firstName: string; lastName: string; children: ChildRef[] };
  searchQuery?: string;
}

type ReportType = 'weekly' | 'monthly' | 'trimester' | 'custom';

interface ReportItem {
  id: string;
  title: string;
  description: string;
  period: string;
  type: ReportType;
  childId?: string;
  createdAt: string;
  stats: {
    averageScore: number;
    quizzesCompleted: number;
    badgesEarned: number;
    improvements: number;
  };
}

const mockReports: ReportItem[] = [
  {
    id: 'rep-1',
    title: 'Résumé hebdomadaire - Lucas',
    description: 'Synthèse des activités et résultats de la semaine',
    period: 'Semaine 51, 2025',
    type: 'weekly',
    childId: 'child-1',
    createdAt: '2025-12-21T09:00:00',
    stats: { averageScore: 86, quizzesCompleted: 3, badgesEarned: 1, improvements: 2 }
  },
  {
    id: 'rep-2',
    title: 'Résumé hebdomadaire - Emma',
    description: 'Synthèse des activités et résultats de la semaine',
    period: 'Semaine 51, 2025',
    type: 'weekly',
    childId: 'child-2',
    createdAt: '2025-12-21T09:10:00',
    stats: { averageScore: 95, quizzesCompleted: 4, badgesEarned: 2, improvements: 1 }
  },
  {
    id: 'rep-3',
    title: 'Rapport mensuel - Famille Dubois',
    description: 'Vue d’ensemble des progrès du mois',
    period: 'Décembre 2025',
    type: 'monthly',
    createdAt: '2025-12-31T18:00:00',
    stats: { averageScore: 91, quizzesCompleted: 10, badgesEarned: 5, improvements: 6 }
  },
];

const ReportsTab: React.FC<ReportsTabProps> = ({ selectedChild, parent, searchQuery }) => {
  const [typeFilter, setTypeFilter] = useState<'all' | ReportType>('all');
  const [childFilter, setChildFilter] = useState<string>('all');
  const [childData, setChildData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Charger les données de l'enfant sélectionné
  useEffect(() => {
    const loadChildData = async () => {
      if (!selectedChild?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/child/${selectedChild.id}/data`);
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des données enfant');
        }
        
        const data = await response.json();
        setChildData(data);
        
      } catch (error) {
        console.error('Erreur lors du chargement des données enfant:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChildData();
  }, [selectedChild?.id]);

  const filtered = useMemo(() => {
    return mockReports.filter(r => {
      const f1 = typeFilter === 'all' || r.type === typeFilter;
      const f2 = childFilter === 'all' || r.childId === childFilter || (!r.childId && childFilter === 'all');
      const f3 = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase());
      return f1 && f2 && f3;
    });
  }, [typeFilter, childFilter, searchQuery]);

  const getChildName = (childId?: string) => {
    if (!childId) return 'Tous les enfants';
    const c = parent?.children.find(x => x.id === childId);
    return c ? `${c.firstName} ${c.lastName}` : 'Enfant';
  };

  const download = (id: string, fmt: 'pdf' | 'csv') => {
    // Simulation de téléchargement
    alert(`Téléchargement du rapport ${id} en ${fmt.toUpperCase()}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-200">Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  if (!childData) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="w-16 h-16 text-blue-300 mx-auto mb-4 opacity-50" />
        <h3 className="text-white text-lg font-semibold mb-2">Aucune donnée disponible</h3>
        <p className="text-blue-200">Sélectionnez un enfant pour voir ses rapports</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-2xl font-bold">Rapports et synthèses - {childData.fullName}</h1>
            <p className="text-blue-200">Classe: {childData.classLevel} | Niveau: {childData.stats.level}</p>
          </div>
          <button className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
          >
            <option value="all">Tous les types</option>
            <option value="weekly">Hebdomadaire</option>
            <option value="monthly">Mensuel</option>
            <option value="trimester">Trimestriel</option>
            <option value="custom">Personnalisé</option>
          </select>

          <select
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            value={childFilter}
            onChange={(e) => setChildFilter(e.target.value)}
          >
            <option value="all">Tous les enfants</option>
            {parent?.children.map((c) => (
              <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
            ))}
          </select>

          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white">
            <FileText className="w-4 h-4" /> Générer un rapport personnalisé
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((rep) => (
          <div key={rep.id} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">{rep.title}</h3>
                  <p className="text-blue-200 text-sm">{rep.period} • {getChildName(rep.childId)}</p>
                </div>
              </div>
              <div className="text-right text-blue-300 text-sm">
                {new Date(rep.createdAt).toLocaleString('fr-FR')}
              </div>
            </div>

            <p className="text-blue-200 mb-4">{rep.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-white text-xl font-bold">{rep.stats.averageScore}%</div>
                <div className="text-blue-300 text-xs">Score moyen</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-white text-xl font-bold">{rep.stats.quizzesCompleted}</div>
                <div className="text-blue-300 text-xs">Quiz terminés</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-white text-xl font-bold">{rep.stats.badgesEarned}</div>
                <div className="text-blue-300 text-xs">Badges</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-white text-xl font-bold">+{rep.stats.improvements}</div>
                <div className="text-blue-300 text-xs">Améliorations</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button onClick={() => download(rep.id, 'pdf')} className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white inline-flex items-center gap-2">
                <Download className="w-4 h-4" /> PDF
              </button>
              <button onClick={() => download(rep.id, 'csv')} className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white inline-flex items-center gap-2">
                <Download className="w-4 h-4" /> CSV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsTab;



