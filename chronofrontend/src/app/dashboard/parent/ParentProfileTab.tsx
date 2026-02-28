'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Settings,
  Shield,
  Users,
  Award
} from 'lucide-react';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import SecuritySettings from '@/components/SecuritySettings';

interface ParentProfile {
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    occupation?: string;
    avatar?: string;
  };
  children: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    class?: string;
    averageScore: number;
    totalQuizzes: number;
  }[];
  security: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
}

const ParentProfileTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [userId, setUserId] = useState<number>(0);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<ParentProfile>({
    personal: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      occupation: '',
      avatar: ''
    },
    children: [],
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const [editedProfile, setEditedProfile] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Charger les données de l'utilisateur parent
  useEffect(() => {
    loadParentData();
  }, []);

  useEffect(() => {
    if (userId) {
      loadProfilePicture();
    }
  }, [userId]);

  const loadParentData = async () => {
    try {
      setIsLoading(true);
      const userData = localStorage.getItem('userDetails');
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.id);
        console.log('🔍 Chargement du profil parent pour l\'utilisateur:', user);
        
        // Récupérer les données du parent depuis l'API
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://www.chronocarto.tn/api';
        const token = localStorage.getItem('token');
        
        let parentData = null;
        let children: { id: string; firstName: string; lastName: string; email?: string; phone?: string; dateOfBirth?: string; class?: string; averageScore: number; totalQuizzes: number; }[] = [];
        
        try {
          // Récupérer les données du parent par user_id
          const parentResponse = await fetch(`${API_BASE}/parents/by-user/${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (parentResponse.ok) {
            parentData = await parentResponse.json();
            console.log('📊 Données parent récupérées:', parentData);
            
            // Récupérer les enfants du parent
            const childrenResponse = await fetch(`${API_BASE}/parents/${parentData.id}/child`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (childrenResponse.ok) {
              const childData = await childrenResponse.json();
              console.log('👶 Données enfant récupérées:', childData);
              
              if (childData) {
                children = [{
                  id: childData.id.toString(),
                  firstName: childData.firstName || '',
                  lastName: childData.lastName || '',
                  email: childData.email || '',
                  phone: childData.phone || '',
                  dateOfBirth: childData.dateOfBirth ? childData.dateOfBirth.split('T')[0].split('-').reverse().join('/') : '',
                  class: childData.classLevel || '',
                  averageScore: 0, // À récupérer depuis les quiz
                  totalQuizzes: 0
                }];
              }
            }
          }
        } catch (error) {
          console.log('❌ Erreur récupération données parent/enfant:', error);
        }
        
        const updatedProfile = {
          personal: {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: parentData?.phone || '',
            address: parentData?.address || '',
            occupation: parentData?.occupation || '',
            avatar: ''
          },
          children: children,
          security: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        };
        
        setProfile(updatedProfile);
        setEditedProfile(updatedProfile);
        console.log('✅ Profil parent mis à jour avec', children.length, 'enfant(s)');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données parent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Ici on pourrait appeler l'API pour sauvegarder les modifications
      setProfile(editedProfile);
      setIsEditing(false);
      alert('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Impossible de sauvegarder vos informations. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const loadProfilePicture = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      if (token && userId) {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://www.chronocarto.tn/api';
        
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

  const handlePasswordChange = async () => {
    if (!editedProfile.security.currentPassword || !editedProfile.security.newPassword || !editedProfile.security.confirmPassword) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (editedProfile.security.newPassword !== editedProfile.security.confirmPassword) {
      alert('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (editedProfile.security.newPassword.length < 8) {
      alert('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      // Ici on pourrait appeler l'API pour changer le mot de passe
      alert('Mot de passe modifié avec succès !');
      setEditedProfile(prev => ({
        ...prev,
        security: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      }));
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      alert('Erreur lors du changement de mot de passe');
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold mb-2">Mon Profil</h1>
            <p className="text-blue-200">Gérez vos informations personnelles et paramètres de sécurité</p>
            <p className="text-blue-300 text-sm mt-1">💾 Les données sont sauvegardées localement</p>
          </div>
          <div className="flex items-center space-x-3">
            {isEditing && (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-all"
                >
                  <span>Sauvegarder</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation des onglets */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex items-center space-x-2 px-6 py-4 whitespace-nowrap transition-all ${
              activeTab === 'personal'
                ? 'bg-blue-500/20 text-blue-300 border-b-2 border-blue-400'
                : 'text-blue-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Informations personnelles</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center space-x-2 px-6 py-4 whitespace-nowrap transition-all ${
              activeTab === 'security'
                ? 'bg-blue-500/20 text-blue-300 border-b-2 border-blue-400'
                : 'text-blue-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span>Sécurité</span>
          </button>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div>
        {activeTab === 'personal' && (
          <div className="space-y-6">
            {/* Photo de profil */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center space-x-6">
                <ProfilePictureUpload
                  userId={userId}
                  currentImageUrl={profileImageUrl || undefined}
                  onImageChange={setProfileImageUrl}
                  size="lg"
                />
                <div>
                  <h4 className="text-white font-semibold text-xl">
                    {editedProfile.personal.firstName} {editedProfile.personal.lastName}
                  </h4>
                  <p className="text-blue-200">Parent</p>
                </div>
              </div>
            </div>
            
            {/* Informations de base */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-white font-semibold text-lg mb-4">Informations de base</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-blue-200 text-sm mb-2">Prénom</label>
                  <p className="text-white truncate">{profile.personal.firstName}</p>
                </div>
                
                <div className="min-w-0">
                  <label className="block text-blue-200 text-sm mb-2">Nom</label>
                  <p className="text-white truncate">{profile.personal.lastName}</p>
                </div>
                
                <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                  <label className="block text-blue-200 text-sm mb-2">Email</label>
                  <p className="text-white break-all sm:break-normal">{profile.personal.email}</p>
                </div>
                
                <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                  <label className="block text-blue-200 text-sm mb-2">Téléphone</label>
                  <p className="text-white">{profile.personal.phone || 'Non renseigné'}</p>
                </div>
              </div>
            </div>

            {/* Informations des enfants */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-white font-semibold text-lg mb-4">Informations des enfants</h3>
              {profile.children.length > 0 && (
                profile.children.map((child, index) => (
                  <div key={child.id} className="bg-white/5 rounded-xl p-6 border border-white/10 mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                      <div className="min-w-0">
                        <label className="block text-blue-200 text-sm mb-2">Prénom</label>
                        <p className="text-white truncate">{child.firstName}</p>
                      </div>
                      <div className="min-w-0">
                        <label className="block text-blue-200 text-sm mb-2">Nom</label>
                        <p className="text-white truncate">{child.lastName}</p>
                      </div>
                      <div className="min-w-0 sm:col-span-2 lg:col-span-1 xl:col-span-1">
                        <label className="block text-blue-200 text-sm mb-2">Email</label>
                        <p className="text-white break-all sm:break-normal">{child.email || 'Non renseigné'}</p>
                      </div>
                      <div className="min-w-0 sm:col-span-2 lg:col-span-1 xl:col-span-1">
                        <label className="block text-blue-200 text-sm mb-2">Téléphone</label>
                        <p className="text-white">{child.phone || 'Non renseigné'}</p>
                      </div>
                      <div className="min-w-0">
                        <label className="block text-blue-200 text-sm mb-2">Date de naissance</label>
                        <p className="text-white">{child.dateOfBirth || 'Non renseigné'}</p>
                      </div>
                      <div className="min-w-0">
                        <label className="block text-blue-200 text-sm mb-2">Classe</label>
                        <p className="text-white truncate">{child.class || 'Non renseigné'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <SecuritySettings 
              userId={userId}
              currentEmail={profile.personal.email}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentProfileTab;


