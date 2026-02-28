'use client';

import React, { useState } from 'react';
import { authAPI } from '@/lib/api';
import { Lock, Mail, Eye, EyeOff, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

interface SecuritySettingsProps {
  userId: number;
  currentEmail: string;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ userId, currentEmail }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Debug: Log des props reçues
  console.log('🔍 Debug - SecuritySettings props:', { userId, currentEmail, userIdType: typeof userId });
  
  // État pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // État pour le changement d'email
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Messages de succès/erreur
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async () => {
    // Validation des champs
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs' });
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      setMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas' });
      return;
    }

    if (passwordData.new.length < 8) {
      setMessage({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
      return;
    }

    if (passwordData.current === passwordData.new) {
      setMessage({ type: 'error', text: 'Le nouveau mot de passe doit être différent de l\'actuel' });
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.changePassword(passwordData.current, passwordData.new, userId);
      
      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès !' });
      setPasswordData({ current: '', new: '', confirm: '' });
      
      // Fermer le modal après 2 secondes
      setTimeout(() => {
        setShowPasswordModal(false);
        setMessage(null);
      }, 2000);
      
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors du changement de mot de passe';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail.trim()) {
      setMessage({ type: 'error', text: 'Veuillez saisir un nouvel email' });
      return;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setMessage({ type: 'error', text: 'Format d\'email invalide' });
      return;
    }

    if (newEmail === currentEmail) {
      setMessage({ type: 'error', text: 'Le nouvel email doit être différent de l\'actuel' });
      return;
    }

    // Vérifier que userId est valide
    if (!userId || userId === 0) {
      setMessage({ type: 'error', text: 'ID utilisateur non trouvé. Veuillez rafraîchir la page.' });
      return;
    }

    // S'assurer que userId est un nombre
    const numericUserId = parseInt(userId.toString());
    if (isNaN(numericUserId)) {
      setMessage({ type: 'error', text: 'ID utilisateur invalide.' });
      return;
    }

    setIsLoading(true);
    try {
      // Utilisation de l'API NestJS pour le changement d'email
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      console.log('🔍 Debug - Changement d\'email:', { newEmail, userId, numericUserId, API_BASE });
      
      const response = await fetch(`${API_BASE}/auth/change-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newEmail, userId: numericUserId }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors du changement d\'email');
      }
      
      setMessage({ type: 'success', text: result.message });
      setNewEmail('');
      
      // Fermer le modal après 3 secondes
      setTimeout(() => {
        setShowEmailModal(false);
        setMessage(null);
      }, 3000);
      
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors du changement d\'email';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordForm = () => {
    setPasswordData({ current: '', new: '', confirm: '' });
    setShowPasswords({ current: false, new: false, confirm: false });
    setMessage(null);
  };

  const resetEmailForm = () => {
    setNewEmail('');
    setEmailError('');
    setMessage(null);
  };

  const handleOpenEmailModal = () => {
    console.log('🔍 Debug - Ouverture modal email:', { userId, currentEmail, newEmail });
    setShowEmailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Changement de mot de passe */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg mb-2">Mot de passe</h3>
            <p className="text-blue-200 text-sm">Modifiez votre mot de passe pour sécuriser votre compte</p>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-all flex items-center space-x-2"
          >
            <Lock className="w-4 h-4" />
            <span>Changer</span>
          </button>
        </div>
      </div>

      {/* Changement d'email */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg mb-2">Adresse email</h3>
            <p className="text-blue-200 text-sm">Modifiez votre adresse email de connexion</p>
            <p className="text-blue-300 text-xs mt-1">Email actuel : {currentEmail}</p>
          </div>
          <button
            onClick={handleOpenEmailModal}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-all flex items-center space-x-2"
          >
            <Mail className="w-4 h-4" />
            <span>Changer</span>
          </button>
        </div>
      </div>

      {/* Modal de changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">Changer le mot de passe</h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  resetPasswordForm();
                }}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {message && (
              <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
                message.type === 'success' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span className="text-sm">{message.text}</span>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-blue-200 text-sm mb-2">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.current}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 pr-10"
                    placeholder="Votre mot de passe actuel"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-blue-200 text-sm mb-2">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.new}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 pr-10"
                    placeholder="Votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-blue-200 text-sm mb-2">Confirmer le nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 pr-10"
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    resetPasswordForm();
                  }}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={isLoading || !passwordData.current || !passwordData.new || passwordData.new !== passwordData.confirm}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Modification...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Changer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de changement d'email */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">Changer l'adresse email</h2>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  resetEmailForm();
                }}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {message && (
              <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
                message.type === 'success' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span className="text-sm">{message.text}</span>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-blue-200 text-sm mb-2">Nouvelle adresse email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                  placeholder="nouvelle.email@exemple.com"
                />
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-300 text-sm">
                  <strong>Note :</strong> Après le changement d'email, votre compte sera marqué comme non vérifié. 
                  Vous devrez vérifier votre nouvelle adresse email.
                </p>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    resetEmailForm();
                  }}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleEmailChange}
                  disabled={isLoading || !newEmail.trim() || newEmail === currentEmail}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Modification...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Changer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;


