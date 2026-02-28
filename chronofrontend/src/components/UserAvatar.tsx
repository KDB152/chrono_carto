'use client';

import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  userId: number;
  firstName?: string;
  lastName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  userId,
  firstName = '',
  lastName = '',
  size = 'md',
  className = '',
  showOnlineStatus = false,
  isOnline = false
}) => {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  useEffect(() => {
    loadProfilePicture();
  }, [userId]);

  const loadProfilePicture = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (token) {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        const response = await fetch(`${API_BASE}/pdp/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setProfileImageUrl(result.data.url);
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement de la photo de profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    const firstInitial = firstName ? firstName[0].toUpperCase() : '';
    const lastInitial = lastName ? lastName[0].toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  const getGradientClass = () => {
    // Générer une couleur basée sur l'ID utilisateur pour la cohérence
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-green-500 to-emerald-600',
      'from-purple-500 to-violet-600',
      'from-pink-500 to-rose-600',
      'from-orange-500 to-red-600',
      'from-teal-500 to-cyan-600',
      'from-yellow-500 to-orange-600',
      'from-indigo-500 to-blue-600'
    ];
    return colors[userId % colors.length];
  };

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-300 animate-pulse flex items-center justify-center ${className}`}>
        <div className="w-4 h-4 bg-gray-400 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getGradientClass()} flex items-center justify-center overflow-hidden`}>
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={`${firstName} ${lastName}`}
            className="w-full h-full object-cover rounded-full"
            onError={() => setProfileImageUrl(null)}
          />
        ) : (
          <span className="text-white font-semibold">
            {getInitials() || <User className={iconSizes[size]} />}
          </span>
        )}
      </div>
      
      {/* Indicateur de statut en ligne */}
      {showOnlineStatus && (
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`} />
      )}
    </div>
  );
};

export default UserAvatar;


