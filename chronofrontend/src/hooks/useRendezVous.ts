import { useState, useEffect, useCallback } from 'react';

export interface RendezVous {
  id: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childName: string;
  childClass: string;
  timing: string; // Date et heure du rendez-vous
  parentReason: string; // Raison du parent
  adminReason?: string; // Raison de l'admin
  status: 'pending' | 'approved' | 'refused' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface RendezVousStats {
  total: number;
  pending: number;
  approved: number;
  refused: number;
  cancelled: number;
  urgent: number; // Demandes récentes ou marquées comme urgentes
}

export function useRendezVous() {
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRendezVous = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/rendez-vous');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des rendez-vous');
      }
      
      const data = await response.json();
      
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
        parentReason: rdv.parent_reason,
        adminReason: rdv.admin_reason,
        status: rdv.status,
        createdAt: rdv.created_at,
        updatedAt: rdv.updated_at
      }));
      
      setRendezVous(transformedRendezVous);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
      
      // En cas d'erreur, utiliser des données simulées comme fallback
      const mockRendezVous: RendezVous[] = [
      ];
      setRendezVous(mockRendezVous);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les données au premier rendu
  useEffect(() => {
    loadRendezVous();
  }, [loadRendezVous]);

  // Calculer les statistiques
  const stats: RendezVousStats = {
    total: rendezVous.length,
    pending: rendezVous.filter(rdv => rdv.status === 'pending').length,
    approved: rendezVous.filter(rdv => rdv.status === 'approved').length,
    refused: rendezVous.filter(rdv => rdv.status === 'refused').length,
    cancelled: rendezVous.filter(rdv => rdv.status === 'cancelled').length,
    urgent: rendezVous.filter(rdv => {
      // Considérer comme urgent: demandes récentes (moins de 24h) ou contenant des mots-clés urgents
      const isRecent = new Date().getTime() - new Date(rdv.createdAt).getTime() < 24 * 60 * 60 * 1000;
      const hasUrgentKeywords = rdv.parentReason.toLowerCase().includes('urgent') || 
                               rdv.parentReason.toLowerCase().includes('harcèlement') ||
                               rdv.parentReason.toLowerCase().includes('urgence');
      return rdv.status === 'pending' && (isRecent || hasUrgentKeywords);
    }).length
  };

  // Obtenir les rendez-vous en attente triés par priorité (urgent en premier, puis par date de création)
  const getPendingRendezVous = useCallback((limit?: number) => {
    const pending = rendezVous.filter(rdv => rdv.status === 'pending');
    
    // Trier par priorité (urgent en premier) puis par date de création (plus récent en premier)
    const sorted = pending.sort((a, b) => {
      const aIsUrgent = a.parentReason.toLowerCase().includes('urgent') || 
                       a.parentReason.toLowerCase().includes('harcèlement') ||
                       a.parentReason.toLowerCase().includes('urgence');
      const bIsUrgent = b.parentReason.toLowerCase().includes('urgent') || 
                       b.parentReason.toLowerCase().includes('harcèlement') ||
                       b.parentReason.toLowerCase().includes('urgence');
      
      if (aIsUrgent && !bIsUrgent) return -1;
      if (!aIsUrgent && bIsUrgent) return 1;
      
      // Si même priorité, trier par date (plus récent en premier)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return limit ? sorted.slice(0, limit) : sorted;
  }, [rendezVous]);

  // Déterminer si une demande est urgente
  const isUrgent = useCallback((rdv: RendezVous) => {
    const isRecent = new Date().getTime() - new Date(rdv.createdAt).getTime() < 24 * 60 * 60 * 1000;
    const hasUrgentKeywords = rdv.parentReason.toLowerCase().includes('urgent') || 
                             rdv.parentReason.toLowerCase().includes('harcèlement') ||
                             rdv.parentReason.toLowerCase().includes('urgence');
    return isRecent || hasUrgentKeywords;
  }, []);

  return {
    rendezVous,
    stats,
    loading,
    error,
    loadRendezVous,
    getPendingRendezVous,
    isUrgent
  };
}

