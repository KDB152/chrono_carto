'use client';

import React, { useState, useEffect } from 'react';
import { settingsAPI, authAPI } from '../../../lib/api';
import {
  Settings,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Key,
  Globe,
  Palette,
  Shield
} from 'lucide-react';

// Interface simplifiée avec seulement les paramètres essentiels
interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    language: string;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
  };
  security: {
    allowRegistration: boolean;
    emailVerification: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    systemAlerts: boolean;
  };
}

export default function SettingsManagementTab() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'Chrono-Carto',
      siteDescription: 'Plateforme pédagogique pour l\'Histoire-Géographie',
      adminEmail: 'chronocarto7@gmail.com',
      language: 'Français'
    },
    appearance: {
      theme: 'dark'
    },
    security: {
      allowRegistration: true,
      emailVerification: true
    },
    notifications: {
      emailNotifications: true,
      systemAlerts: true
    }
  });

  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'security' | 'notifications'>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    loadSettings();
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      const userData = localStorage.getItem('userDetails');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadSettings = async () => {
    try {
      const systemSettings = await settingsAPI.getSystemSettingsAsObject();
      
      // Map database settings to simplified component state
      const mappedSettings: SystemSettings = {
        general: {
          siteName: systemSettings['site.name'] || 'Chrono-Carto',
          siteDescription: systemSettings['site.description'] || 'Plateforme pédagogique pour l\'Histoire-Géographie',
          adminEmail: systemSettings['site.admin_email'] || 'chronocarto7@gmail.com',
          language: systemSettings['site.language'] || 'Français'
        },
        appearance: {
          theme: (systemSettings['appearance.theme'] as 'light' | 'dark' | 'auto') || 'dark'
        },
        security: {
          allowRegistration: systemSettings['security.allow_registration'] !== 'false',
          emailVerification: systemSettings['security.email_verification'] !== 'false'
        },
        notifications: {
          emailNotifications: systemSettings['notifications.email'] !== 'false',
          systemAlerts: systemSettings['notifications.system_alerts'] !== 'false'
        }
      };
      
      setSettings(mappedSettings);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      showNotification('error', 'Erreur lors du chargement des paramètres');
    }
  };

  const handleSettingsChange = (section: keyof SystemSettings, field: string, value: any) => {
    console.log(`🔄 Modification: ${section}.${field} = ${value}`);
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      console.log('💾 Sauvegarde des paramètres...');
      console.log('📋 Paramètres à sauvegarder:', settings);
      
      // Convert simplified settings back to database format
      const settingsToSave = [
        { key: 'site.name', value: settings.general.siteName, category: 'general' },
        { key: 'site.description', value: settings.general.siteDescription, category: 'general' },
        { key: 'site.admin_email', value: settings.general.adminEmail, category: 'general' },
        { key: 'site.language', value: settings.general.language, category: 'general' },
        { key: 'appearance.theme', value: settings.appearance.theme, category: 'appearance' },
        { key: 'security.allow_registration', value: settings.security.allowRegistration.toString(), category: 'security' },
        { key: 'security.email_verification', value: settings.security.emailVerification.toString(), category: 'security' },
        { key: 'notifications.email', value: settings.notifications.emailNotifications.toString(), category: 'notifications' },
        { key: 'notifications.system_alerts', value: settings.notifications.systemAlerts.toString(), category: 'notifications' }
      ];

      console.log('📤 Envoi des paramètres:', settingsToSave);
      const result = await settingsAPI.bulkUpdateSystemSettings(settingsToSave);
      console.log('✅ Résultat de la sauvegarde:', result);
      
      showNotification('success', 'Paramètres sauvegardés avec succès');
      setUnsavedChanges(false);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      showNotification('error', 'Erreur lors de la sauvegarde des paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ?')) {
      try {
        await settingsAPI.initializeSystemSettings();
        await loadSettings();
        showNotification('success', 'Paramètres réinitialisés avec succès');
        setUnsavedChanges(false);
      } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
        showNotification('error', 'Erreur lors de la réinitialisation');
      }
    }
  };

  const changeAdminPassword = async () => {
    // Validation côté frontend
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      showNotification('error', 'Veuillez remplir tous les champs');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      showNotification('error', 'Les mots de passe ne correspondent pas');
      return;
    }
    
    if (passwords.new.length < 8) {
      showNotification('error', 'Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (passwords.current === passwords.new) {
      showNotification('error', 'Le nouveau mot de passe doit être différent de l\'actuel');
      return;
    }

    if (!currentUserId) {
      showNotification('error', 'ID utilisateur non trouvé');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.changePassword(passwords.current, passwords.new, currentUserId);
      showNotification('success', 'Mot de passe modifié avec succès');
      setPasswords({ current: '', new: '', confirm: '' });
      setShowPasswordFields(false);
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du changement de mot de passe';
      
      if (errorMessage.includes('Mot de passe actuel incorrect')) {
        showNotification('error', 'Mot de passe actuel incorrect');
      } else if (errorMessage.includes('différent de l\'actuel')) {
        showNotification('error', 'Le nouveau mot de passe doit être différent de l\'actuel');
      } else if (errorMessage.includes('Token d\'authentification manquant')) {
        showNotification('error', 'Session expirée, veuillez vous reconnecter');
      } else {
        showNotification('error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
        <div className="flex items-center justify-between">
          <div>
          <h1 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Paramètres
            </h1>
          <p className="text-gray-600 dark:text-gray-400">Configuration simplifiée du système</p>
              </div>
        
        <div className="flex gap-2">
            <button
            onClick={resetToDefaults}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30 flex items-center gap-2"
            >
            <RefreshCw className="w-4 h-4" />
            Réinitialiser
            </button>
          
            <button
              onClick={saveSettings}
              disabled={isLoading || !unsavedChanges}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
              <Save className="w-4 h-4" />
              )}
            Sauvegarder
            </button>
          </div>
        </div>

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
          notification.type === 'error' ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
          'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
           notification.type === 'error' ? <XCircle className="w-5 h-5" /> :
           <Info className="w-5 h-5" />}
          {notification.message}
      </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'general', label: 'Général', icon: Globe },
            { id: 'appearance', label: 'Apparence', icon: Palette },
            { id: 'security', label: 'Sécurité', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
                Paramètres généraux
            </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom du site
                </label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => handleSettingsChange('general', 'siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Chrono-Carto"
                  />
                </div>
              
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email administrateur
                </label>
                  <input
                  type="email"
                  value={settings.general.adminEmail}
                  onChange={(e) => handleSettingsChange('general', 'adminEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="admin@chronocarto.fr"
                  />
                </div>
              
                <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description du site
                </label>
                  <textarea
                    value={settings.general.siteDescription}
                    onChange={(e) => handleSettingsChange('general', 'siteDescription', e.target.value)}
                    rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Plateforme pédagogique pour l'Histoire-Géographie"
                  />
                </div>
              
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Langue
                </label>
                  <select
                    value={settings.general.language}
                    onChange={(e) => handleSettingsChange('general', 'language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Français">Français</option>
                  <option value="English">English</option>
                  <option value="Español">Español</option>
                  </select>
                </div>
                </div>
              </div>
        )}

        {/* Appearance Settings */}
        {activeTab === 'appearance' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Apparence
              </h3>
              
                    <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Thème
              </label>
              <select
                value={settings.appearance.theme}
                onChange={(e) => handleSettingsChange('appearance', 'theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
                <option value="auto">Automatique</option>
              </select>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Sécurité
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                    <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Autoriser les inscriptions
                      </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Permettre aux nouveaux utilisateurs de s'inscrire
                  </p>
                    </div>
                <button
                  onClick={() => handleSettingsChange('security', 'allowRegistration', !settings.security.allowRegistration)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.security.allowRegistration ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.security.allowRegistration ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                </div>

              <div className="flex items-center justify-between">
                    <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Vérification email
                      </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Exiger la vérification de l'email lors de l'inscription
                  </p>
                    </div>
                    <button
                  onClick={() => handleSettingsChange('security', 'emailVerification', !settings.security.emailVerification)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.security.emailVerification ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.security.emailVerification ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                    </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Notifications
            </h3>
            
                  <div className="space-y-4">
              <div className="flex items-center justify-between">
                    <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notifications par email
                    </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Envoyer des notifications par email
                  </p>
                  </div>
                <button
                  onClick={() => handleSettingsChange('notifications', 'emailNotifications', !settings.notifications.emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                </div>

              <div className="flex items-center justify-between">
            <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Alertes système
                        </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Afficher les alertes système importantes
                  </p>
                    </div>
                <button
                  onClick={() => handleSettingsChange('notifications', 'systemAlerts', !settings.notifications.systemAlerts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.systemAlerts ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.systemAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                        </div>
                        </div>
                      </div>
                    )}
                </div>

      {/* Admin Password Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Mot de passe administrateur
        </h3>
        
        {!showPasswordFields ? (
                    <button
            onClick={() => setShowPasswordFields(true)}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30"
                    >
            Modifier le mot de passe
                    </button>
        ) : (
                  <div className="space-y-4">
                    <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mot de passe actuel
              </label>
                      <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
            
                    <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nouveau mot de passe
              </label>
                      <input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
                </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmer le nouveau mot de passe
                    </label>
                      <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
                </div>

            <div className="flex gap-2">
              <button
                onClick={changeAdminPassword}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Changer le mot de passe
              </button>
              <button
                onClick={() => {
                  setShowPasswordFields(false);
                  setPasswords({ current: '', new: '', confirm: '' });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

