'use client';

import React, { useState, useEffect } from 'react';
import MessagingSystem from '../../../components/MessagingSystem';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  avatar?: string;
}

interface Parent {
  id: string;
  firstName: string;
  lastName: string;
}

interface MessagesTabProps {
  selectedChild?: Child;
  parent?: Parent;
  searchQuery?: string;
}

const MessagesTab: React.FC<MessagesTabProps> = ({
  selectedChild,
  parent,
  searchQuery
}) => {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('parent');

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

export default MessagesTab;


