'use client';

import React, { useState, useEffect } from 'react';
import MessagingSystem from '../../../components/MessagingSystem';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  avatar?: string;
}

interface MessagesTabProps {
  student?: Student;
  searchQuery?: string;
}

const MessagesTab: React.FC<MessagesTabProps> = ({
  student,
  searchQuery
}) => {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('student');

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <MessagingSystem 
        currentUserId={currentUserId} 
        currentUserRole={currentUserRole} 
      />
    </div>
  );
};

export default MessagesTab;

