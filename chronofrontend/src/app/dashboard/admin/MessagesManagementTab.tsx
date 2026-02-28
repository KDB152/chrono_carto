'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MessagingSystem from '../../../components/MessagingSystem';

const MessagesManagementTab: React.FC = () => {
  const searchParams = useSearchParams();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('admin');

  // Charger les données utilisateur
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = localStorage.getItem('userDetails');
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUserId(user.id);
          setCurrentUserRole(user.role);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
      }
    };

    loadUserData();
  }, []);

  // Gérer les paramètres d'URL pour ouvrir automatiquement la composition de message
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'compose') {
      // Le composant MessagingSystem gérera l'ouverture du modal de composition
      // en fonction de cette prop ou d'un paramètre
    }
  }, [searchParams]);

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <MessagingSystem 
        currentUserId={currentUserId} 
        currentUserRole={currentUserRole}
      />
    </div>
  );
};

export default MessagesManagementTab;


