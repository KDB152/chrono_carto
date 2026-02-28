'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield } from 'lucide-react';
import SecuritySettings from '@/components/SecuritySettings';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';

interface AdminProfile {
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
  };
  security: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
}

const AdminProfileTab = () => {
  const [userId, setUserId] = useState<number>(0);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<AdminProfile>({
    personal: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      avatar: ''
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'security'>('personal');

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (userId) {
      loadProfilePicture();
    }
  }, [userId]);

  const loadAdminData = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (token) {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('👤 Données utilisateur récupérées:', userData);
          
          setUserId(userData.id);
          setProfile(prev => ({
            ...prev,
            personal: {
              ...prev.personal,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: userData.email || '',
              phone: userData.phone || '',
              avatar: userData.avatar || ''
            }
          }));
        } else {
          console.error('❌ Erreur lors de la récupération des données utilisateur:', response.status, response.statusText);
        }
      } else {
        console.error('❌ Aucun token d\'authentification trouvé');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données admin:', error);
    }
  };

  const loadProfilePicture = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (token) {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        const response = await fetch(`${API_BASE}/pdp/me`, {
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
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/update-profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profile.personal),
        });
        
        if (response.ok) {
          setIsEditing(false);
          alert('Profil mis à jour avec succès !');
        } else {
          alert('Erreur lors de la mise à jour du profil');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du profil');
    }
  };

  const handleCancel = () => {
    loadAdminData();
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (profile.security.newPassword !== profile.security.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (profile.security.newPassword.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/change-password`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentPassword: profile.security.currentPassword,
            newPassword: profile.security.newPassword,
          }),
        });
        
        if (response.ok) {
          setProfile(prev => ({
            ...prev,
            security: {
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            }
          }));
          alert('Mot de passe modifié avec succès !');
        } else {
          alert('Erreur lors du changement de mot de passe');
        }
      }
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      alert('Erreur lors du changement de mot de passe');
    }
  };

  const renderPersonalInformationTab = () => (
    <div className="space-y-6">
      {/* Avatar et informations de base */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center space-x-6">
          <ProfilePictureUpload
            userId={userId}
            currentImageUrl={profileImageUrl || undefined}
            onImageChange={setProfileImageUrl}
            size="lg"
          />
          <div className="flex-1">
            <h3 className="text-white font-semibold text-xl">
              {profile.personal.firstName} {profile.personal.lastName}
            </h3>
            <p className="text-blue-200">Administrateur</p>
            <p className="text-blue-300 text-sm">{profile.personal.email}</p>
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-white font-semibold text-lg mb-6">Informations personnelles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-blue-200 text-sm mb-2">Prénom</label>
            <p className="text-white">{profile.personal.firstName}</p>
          </div>
          <div>
            <label className="block text-blue-200 text-sm mb-2">Nom</label>
            <p className="text-white">{profile.personal.lastName}</p>
          </div>
          <div>
            <label className="block text-blue-200 text-sm mb-2">Email</label>
            <p className="text-white">{profile.personal.email}</p>
          </div>
          <div>
            <label className="block text-blue-200 text-sm mb-2">Téléphone</label>
            <p className="text-white">{profile.personal.phone || 'Non renseigné'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <SecuritySettings 
        userId={userId}
        currentEmail={profile.personal.email}
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* En-tête avec onglets */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/20">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
              activeTab === 'personal'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Informations personnelles</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Sécurité</span>
          </button>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'personal' && renderPersonalInformationTab()}
      {activeTab === 'security' && renderSecurityTab()}
    </div>
  );
};

export default AdminProfileTab;

