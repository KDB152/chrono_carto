import { useState, useCallback, useRef } from 'react';
import { cachedFetch } from '@/lib/api-cache';

interface RendezVous {
  id: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childName: string;
  childClass: string;
  timing: string;
  parentReason: string;
  adminReason?: string;
  status: 'pending' | 'approved' | 'refused' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export function useRendezVousCache() {
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadRendezVous = useCallback(async (parentId?: string, forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const url = parentId ? `/api/rendez-vous?parentId=${parentId}` : '/api/rendez-vous';
      console.log('🔄 Chargement des rendez-vous:', url);
      
      // Utiliser le cache avec TTL de 30 secondes
      const data = await cachedFetch.get<any[]>(url, { 
        ttl: forceRefresh ? 0 : 30000 // 0 TTL pour forcer le refresh
      });
      
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
      console.log('✅ Rendez-vous chargés:', transformedRendezVous.length);
      
      return transformedRendezVous;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('🚫 Requête annulée');
        return [];
      }
      
      console.error('Erreur lors du chargement des rendez-vous:', error);
      setError('Erreur lors du chargement des rendez-vous');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRendezVous = useCallback((parentId?: string) => {
    return loadRendezVous(parentId, true);
  }, [loadRendezVous]);

  const clearCache = useCallback(() => {
    cachedFetch.invalidate('rendez-vous');
    console.log('🗑️ Cache des rendez-vous vidé');
  }, []);

  return {
    rendezVous,
    loading,
    error,
    loadRendezVous,
    refreshRendezVous,
    clearCache
  };
}
