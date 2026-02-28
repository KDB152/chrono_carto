'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface UniversalFeatureProps {
  title: string;
  description?: string;
  apiEndpoint: string;
  renderContent: (data: any, loading: boolean, error: string | null) => React.ReactNode;
  refreshInterval?: number;
}

const UniversalFeature: React.FC<UniversalFeatureProps> = ({
  title,
  description,
  apiEndpoint,
  renderContent,
  refreshInterval = 0
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(apiEndpoint);
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          {description && (
            <p className="text-white/70 text-sm mt-1">{description}</p>
          )}
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {error && (
        <div className="flex items-center space-x-2 text-red-400 mb-4">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {loading && !data && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-white/50" />
        </div>
      )}
      
      {renderContent(data, loading, error)}
    </div>
  );
};

export default UniversalFeature;