'use client';

import React from 'react';
import SecuritySettings from '@/components/SecuritySettings';
import { RefreshCw } from 'lucide-react';

interface SettingsTabProps {
  admin: any;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ admin }) => {
  // Récupérer l'ID utilisateur depuis localStorage
  const getUserDetails = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userDetails');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
    }
    return 0;
  };

  const userId = getUserDetails();

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-base font-bold mb-2">Paramètres Administrateur</h1>
            <p className="text-blue-200">Gérez vos préférences et paramètres de sécurité</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
            title="Actualiser"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Paramètres de sécurité */}
      <SecuritySettings 
        userId={userId}
        currentEmail={admin?.email || ''}
      />
    </div>
  );
};

export default SettingsTab;

