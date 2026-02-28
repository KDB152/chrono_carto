'use client';

import React from 'react';
import SecuritySettings from '@/components/SecuritySettings';

interface SettingsTabProps {
  parent: any;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ parent }) => {
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
        <h1 className="text-white text-base font-bold mb-2">Paramètres</h1>
        <p className="text-blue-200">Gérez vos préférences et paramètres de sécurité</p>
      </div>

      {/* Paramètres de sécurité */}
      <SecuritySettings 
        userId={userId}
        currentEmail={parent?.email || ''}
      />

      {/* Autres paramètres peuvent être ajoutés ici */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-white font-semibold text-base mb-4">Préférences de notification</h3>
        <p className="text-blue-200 text-sm">Configuration des notifications à venir...</p>
      </div>
    </div>
  );
};

export default SettingsTab;



