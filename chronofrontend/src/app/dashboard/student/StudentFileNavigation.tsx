'use client';

import React, { useState, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  File,
  ChevronRight,
  Home,
  Download,
  Eye,
  ArrowLeft,
  Loader2,
  RefreshCw,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Code,
  BookOpen,
  Sparkles,
  Star,
  Calendar,
  Users,
  AlertCircle
} from 'lucide-react';

interface Dossier {
  id: number;
  name: string;
  description: string;
  target_class: string;
  created_at: string;
  updated_at: string;
}

interface SousDossier {
  id: number;
  name: string;
  description: string;
  dossier_id: number;
  created_at: string;
  updated_at: string;
}

interface Fichier {
  id: number;
  title: string;
  description: string;
  file_name: string;
  stored_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

interface Breadcrumb {
  id: number;
  name: string;
  type: 'root' | 'dossier' | 'sous-dossier';
}

const StudentFileNavigation: React.FC = () => {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [sousDossiers, setSousDossiers] = useState<SousDossier[]>([]);
  const [fichiers, setFichiers] = useState<Fichier[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ id: 0, name: 'Racine', type: 'root' }]);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Charger les dossiers accessibles à l'étudiant
  const loadDossiers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${API_BASE}/new-structure/student/dossiers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDossiers(data);
      setSousDossiers([]);
      setFichiers([]);
      setBreadcrumbs([{ id: 0, name: 'Racine', type: 'root' }]);
      setCurrentFolderId(null);
    } catch (error) {
      console.error('Erreur lors du chargement des dossiers:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les sous-dossiers d'un dossier
  const loadSousDossiers = async (dossierId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${API_BASE}/new-structure/student/dossiers/${dossierId}/sous-dossiers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSousDossiers(data);
      setFichiers([]);
      setCurrentFolderId(dossierId);
    } catch (error) {
      console.error('Erreur lors du chargement des sous-dossiers:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les fichiers d'un sous-dossier
  const loadFichiers = async (sousDossierId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${API_BASE}/new-structure/student/sous-dossiers/${sousDossierId}/fichiers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setFichiers(data);
      setCurrentFolderId(sousDossierId);
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation vers un dossier
  const navigateToDossier = (dossier: Dossier) => {
    setBreadcrumbs(prev => [...prev, { id: dossier.id, name: dossier.name, type: 'dossier' }]);
    loadSousDossiers(dossier.id);
  };

  // Navigation vers un sous-dossier
  const navigateToSousDossier = (sousDossier: SousDossier) => {
    setBreadcrumbs(prev => [...prev, { id: sousDossier.id, name: sousDossier.name, type: 'sous-dossier' }]);
    loadFichiers(sousDossier.id);
  };

  // Navigation via breadcrumb
  const navigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);

    if (index === 0) {
      // Retour à la racine
      loadDossiers();
    } else if (index === 1) {
      // Retour au dossier global
      const dossier = newBreadcrumbs[1];
      loadSousDossiers(dossier.id);
    } else if (index === 2) {
      // Retour au sous-dossier
      const sousDossier = newBreadcrumbs[2];
      loadFichiers(sousDossier.id);
    }
  };

  // Télécharger un fichier
  const handleDownload = async (fichier: Fichier) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${API_BASE}/new-structure/fichiers/${fichier.id}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fichier.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors du téléchargement');
    }
  };

  // Formater la taille des fichiers
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Obtenir le type de fichier pour l'affichage
  const getFileType = (fileName: string, fileType: string): string => {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('video')) return 'Vidéo';
    if (fileType.includes('image')) return 'Image';
    if (fileType.includes('text')) return 'Document';
    return 'Fichier';
  };

  // Obtenir l'icône et la couleur selon le type de fichier
  const getFileIcon = (fileName: string, fileType: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (fileType.includes('pdf') || extension === 'pdf') {
      return { icon: FileText, color: 'text-red-500', bgColor: 'bg-red-50' };
    }
    if (fileType.includes('video') || ['mp4', 'avi', 'mov', 'wmv'].includes(extension || '')) {
      return { icon: Video, color: 'text-purple-500', bgColor: 'bg-purple-50' };
    }
    if (fileType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension || '')) {
      return { icon: Image, color: 'text-green-500', bgColor: 'bg-green-50' };
    }
    if (fileType.includes('audio') || ['mp3', 'wav', 'flac'].includes(extension || '')) {
      return { icon: Music, color: 'text-pink-500', bgColor: 'bg-pink-50' };
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return { icon: Archive, color: 'text-orange-500', bgColor: 'bg-orange-50' };
    }
    if (['js', 'ts', 'html', 'css', 'py', 'java', 'cpp'].includes(extension || '')) {
      return { icon: Code, color: 'text-blue-500', bgColor: 'bg-blue-50' };
    }
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
      return { icon: BookOpen, color: 'text-indigo-500', bgColor: 'bg-indigo-50' };
    }
    
    return { icon: File, color: 'text-gray-500', bgColor: 'bg-gray-50' };
  };

  // Charger les dossiers au démarrage
  useEffect(() => {
    loadDossiers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800">
      <div className="space-y-8 p-6">
        {/* Header moderne avec dégradé */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">Mes Ressources</h1>
                  <p className="text-blue-100 text-lg">Accédez à vos fichiers organisés par dossiers</p>
                </div>
              </div>
              <button
                onClick={loadDossiers}
                className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="font-medium">Actualiser</span>
              </button>
            </div>
          </div>
          {/* Effet de particules décoratives */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-purple-300/20 rounded-full blur-lg"></div>
        </div>

        {/* Breadcrumbs modernes */}
        <div className="bg-blue-800/80 backdrop-blur-sm rounded-xl p-4 border border-blue-700/50 shadow-lg">
          <div className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.id}>
                {index > 0 && <ChevronRight className="w-4 h-4 text-blue-300" />}
                <button
                  onClick={() => navigateToBreadcrumb(index)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    index === breadcrumbs.length - 1
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg'
                      : 'text-blue-200 hover:text-blue-100 hover:bg-blue-700/50 hover:shadow-md'
                  }`}
                >
                  {breadcrumb.type === 'root' && <Home className="w-4 h-4" />}
                  {breadcrumb.type === 'dossier' && <Folder className="w-4 h-4" />}
                  {breadcrumb.type === 'sous-dossier' && <FolderOpen className="w-4 h-4" />}
                  <span>{breadcrumb.name}</span>
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Erreur moderne */}
        {error && (
          <div className="bg-gradient-to-r from-red-800/50 to-pink-800/50 border border-red-600/50 rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-700/50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-300" />
              </div>
              <p className="text-red-200 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Loading moderne */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="bg-blue-800/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-blue-700/50">
              <div className="flex items-center space-x-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-300" />
                <span className="text-blue-200 font-medium text-lg">Chargement de vos ressources...</span>
              </div>
            </div>
          </div>
        )}

        {/* Contenu avec grille moderne */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Dossiers globaux (niveau racine) */}
            {breadcrumbs.length === 1 && dossiers.map((dossier) => (
              <div
                key={dossier.id}
                onClick={() => navigateToDossier(dossier)}
                className="group bg-blue-800/80 backdrop-blur-sm border border-blue-700/50 rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                {/* Effet de dégradé en arrière-plan */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                      <Folder className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-100 text-lg mb-1">{dossier.name}</h3>
                      <p className="text-sm text-blue-300 line-clamp-2">{dossier.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-300 group-hover:text-blue-200 transition-colors" />
                  </div>
                </div>
              </div>
            ))}

            {/* Sous-dossiers (niveau dossier global) */}
            {breadcrumbs.length === 2 && sousDossiers.map((sousDossier) => (
              <div
                key={sousDossier.id}
                onClick={() => navigateToSousDossier(sousDossier)}
                className="group bg-blue-800/80 backdrop-blur-sm border border-blue-700/50 rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                {/* Effet de dégradé en arrière-plan */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                      <FolderOpen className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-100 text-lg mb-1">{sousDossier.name}</h3>
                      <p className="text-sm text-blue-300 line-clamp-2">{sousDossier.description}</p>
                      <div className="flex items-center mt-2 text-xs text-blue-400">
                        <Users className="w-3 h-3 mr-1" />
                        <span>Sous-dossier</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-300 group-hover:text-indigo-300 transition-colors" />
                  </div>
                </div>
              </div>
            ))}

            {/* Fichiers (niveau sous-dossier) */}
            {breadcrumbs.length === 3 && fichiers.map((fichier) => {
              const fileIcon = getFileIcon(fichier.file_name, fichier.file_type);
              const IconComponent = fileIcon.icon;
              
              return (
                <div
                  key={fichier.id}
                  className="group bg-blue-800/80 backdrop-blur-sm border border-blue-700/50 rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Effet de dégradé en arrière-plan */}
                  <div className={`absolute inset-0 ${fileIcon.bgColor.replace('bg-', 'bg-').replace('-50', '-800/30')} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 ${fileIcon.bgColor} rounded-xl shadow-lg`}>
                        <IconComponent className={`w-8 h-8 ${fileIcon.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-blue-100 text-lg mb-2">{fichier.title}</h3>
                        <p className="text-sm text-blue-300 mb-3 line-clamp-2">{fichier.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-blue-400 mb-3">
                          <span className="px-2 py-1 bg-blue-700/50 rounded-full text-blue-200">{getFileType(fichier.file_name, fichier.file_type)}</span>
                          <span className="px-2 py-1 bg-blue-700/50 rounded-full text-blue-200">{formatFileSize(fichier.file_size)}</span>
                          <span className="px-2 py-1 bg-blue-700/50 rounded-full flex items-center text-blue-200">
                            <Download className="w-3 h-3 mr-1" />
                            {fichier.download_count}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(fichier)}
                        className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                        title="Télécharger"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Message vide moderne */}
            {((breadcrumbs.length === 1 && dossiers.length === 0) ||
              (breadcrumbs.length === 2 && sousDossiers.length === 0) ||
              (breadcrumbs.length === 3 && fichiers.length === 0)) && (
              <div className="col-span-full">
                <div className="bg-blue-800/80 backdrop-blur-sm border border-blue-700/50 rounded-2xl p-12 text-center shadow-lg">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-700 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Folder className="w-12 h-12 text-blue-300" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-100 mb-2">Aucun contenu disponible</h3>
                  <p className="text-blue-300">
                    {breadcrumbs.length === 1 && 'Aucun dossier accessible pour votre classe'}
                    {breadcrumbs.length === 2 && 'Aucun sous-dossier dans ce dossier'}
                    {breadcrumbs.length === 3 && 'Aucun fichier dans ce sous-dossier'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFileNavigation;

