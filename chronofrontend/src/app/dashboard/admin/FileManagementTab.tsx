'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { getAuthToken, checkAuthAndRedirect } from '../../../utils/auth';
import { generateDownloadFileName, getDisplayFileType } from '@/lib/fileUtils';
import { AVAILABLE_CLASSES } from '@/constants/classes';
import { 
  Upload, 
  File, 
  FileText, 
  Video, 
  X, 
  Check, 
  AlertCircle,
  Plus,
  BookOpen,
  Play,
  Trash2,
  Eye,
  Download,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Clock,
  User,
  Tag,
  Save,
  RefreshCw,
  Edit,
  Settings,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  Folder,
  FolderPlus,
  Home,
  ChevronRight
} from 'lucide-react';

// Types pour TypeScript - Interface pour les fichiers de la base de données
interface FileFromDB {
  id: number;
  title: string;
  description: string;
  fileName: string;
  storedName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedBy: number;
  isPublic: boolean;
  isActive: boolean;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  targetClass: string;
  targetClasses: string[];
}

// Interface pour l'affichage dans l'interface
interface Course {
  id: string;
  name: string;
  title: string;
  type: string;
  subject: string;
  level: string;
  size: string;
  uploadDate: string;
  views: number;
  status: 'Publié' | 'Brouillon';
  description?: string;
  tags?: string[];
  fileName?: string;
  fileUrl?: string;
  targetClasses?: string[];
}

interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

// Types pour les dossiers
interface FolderFromDB {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
  createdBy: number;
  isGlobal: boolean;
  targetClasses: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: number;
    name: string;
    email: string;
  };
  parent?: FolderFromDB;
  children?: FolderFromDB[];
}

interface BreadcrumbItem {
  id: number | null;
  name: string;
}

const FileManagementTabImproved = () => {
  // États existants
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Course[]>([]);
  const [currentFiles, setCurrentFiles] = useState<FileUpload[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSubject, setCourseSubject] = useState('Histoire');
  const [courseDescription, setCourseDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // États pour la gestion des dossiers
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: null, name: 'Racine' }]);
  const [folders, setFolders] = useState<FolderFromDB[]>([]);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<FolderFromDB | null>(null);
  const [showEditFolderModal, setShowEditFolderModal] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<FolderFromDB | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [newFolderTargetClasses, setNewFolderTargetClasses] = useState<string[]>([]);
  const [isInFolder, setIsInFolder] = useState(false); // Nouveau : indique si on est dans un dossier
  const [showActionChoice, setShowActionChoice] = useState(false); // Nouveau : affiche le choix d'action

  // Classes disponibles pour la sélection
  const availableClasses = AVAILABLE_CLASSES;

  // Nouveaux états pour les fonctionnalités améliorées
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<Course | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [fileToEdit, setFileToEdit] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);


  // Fonctions pour la gestion des dossiers
  const loadFolders = async () => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = getAuthToken();
      
      if (!token) {
        showNotification('error', 'Token d\'authentification manquant');
        return;
      }

      // Utiliser la nouvelle API pour les dossiers globaux
      const endpoint = `${API_BASE}/new-structure/dossiers`;
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const dossiers = await response.json();
      // Adapter les champs du backend (created_at, sous_dossiers) au modèle frontend
      const mapped = (dossiers || []).map((d: any) => {
        // Parser les classes cibles depuis le JSON stocké
        let targetClasses = [];
        try {
          if (d.target_class) {
            if (typeof d.target_class === 'string') {
              targetClasses = JSON.parse(d.target_class);
            } else if (Array.isArray(d.target_class)) {
              targetClasses = d.target_class;
            }
          }
        } catch (error) {
          console.warn('Erreur lors du parsing des classes cibles:', error);
          targetClasses = [];
        }

        return {
          id: d.id,
          name: d.name,
          description: d.description,
          parentId: null,
          createdBy: 0,
          isGlobal: true,
          targetClasses: targetClasses,
          isActive: true,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          creator: { id: 0, name: '', email: '' },
          children: d.sous_dossiers || []
        };
      });
      setFolders(mapped);
      setUploadedFiles([]);
    } catch (error) {
      showNotification('error', `Erreur lors du chargement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const loadFolderContents = async (folderId: number) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = getAuthToken();
      
      if (!token) {
        showNotification('error', 'Token d\'authentification manquant');
        return;
      }

      // Récupérer les sous-dossiers du dossier global
      const sousDossiersResponse = await fetch(`${API_BASE}/new-structure/dossiers/${folderId}/sous-dossiers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!sousDossiersResponse.ok) {
        throw new Error(`Erreur ${sousDossiersResponse.status}: ${sousDossiersResponse.statusText}`);
      }

      const sousDossiers = await sousDossiersResponse.json();
      
      // Dans un dossier global : afficher seulement les sous-dossiers
      // Mapper created_at → createdAt pour l'affichage
      const mappedSous = (sousDossiers || []).map((sd: any) => ({
        id: sd.id,
        name: sd.name,
        description: sd.description,
        parentId: sd.dossier_id,
        createdBy: 0,
        isGlobal: false,
        targetClasses: [],
        isActive: true,
        createdAt: sd.created_at,
        updatedAt: sd.updated_at,
        creator: { id: 0, name: '', email: '' },
        children: []
      }));
      setFolders(mappedSous);
      setUploadedFiles([]); // Pas de fichiers dans les dossiers globaux
    } catch (error) {
      showNotification('error', 'Erreur lors du chargement du contenu du dossier');
    }
  };

  const loadSousDossierFiles = async (sousDossierId: number) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = getAuthToken();
      
      if (!token) {
        showNotification('error', 'Token d\'authentification manquant');
        return;
      }

      // Récupérer les fichiers du sous-dossier
      const fichiersResponse = await fetch(`${API_BASE}/new-structure/sous-dossiers/${sousDossierId}/fichiers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!fichiersResponse.ok) {
        throw new Error(`Erreur ${fichiersResponse.status}: ${fichiersResponse.statusText}`);
      }

      const fichiers = await fichiersResponse.json();
      
      // Dans un sous-dossier : afficher seulement les fichiers
      setFolders([]); // Pas de sous-dossiers dans les sous-dossiers
      const folderFiles = (fichiers || []).map((f: any) => ({
        id: String(f.id),
        name: f.file_name,
        title: f.title,
        type: getDisplayFileType(f.file_name, f.file_type),
        subject: 'Général',
        level: 'Tous niveaux',
        size: formatFileSize(f.file_size),
        uploadDate: f.created_at ? new Date(f.created_at).toISOString().split('T')[0] : '',
        views: f.download_count || 0,
        status: 'Publié',
        description: f.description || '',
        tags: [],
        fileName: f.file_name,
        fileUrl: f.file_path,
        targetClasses: []
      }));
      setUploadedFiles(folderFiles);
    } catch (error) {
      showNotification('error', 'Erreur lors du chargement des fichiers');
    }
  };

  const navigateToFolder = (folder: FolderFromDB) => {
    setCurrentFolderId(folder.id);
    setIsInFolder(true);
    setShowActionChoice(true);
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
    
    // Si on est à la racine, on entre dans un dossier global (sous-dossiers)
    if (!currentFolderId) {
      loadFolderContents(folder.id);
    } else {
      // Si on est dans un dossier global, on entre dans un sous-dossier (fichiers)
      loadSousDossierFiles(folder.id);
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolderId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
    
    // Si on revient à la racine, réinitialiser l'état
    if (index === 0) {
      setIsInFolder(false);
      setShowActionChoice(false);
      loadFolders(); // Recharger les dossiers globaux
    } else if (index === 1) {
      // Si on revient au dossier global, charger les sous-dossiers
      const folderId = newBreadcrumbs[newBreadcrumbs.length - 1].id;
      if (folderId) {
        setIsInFolder(true);
        setShowActionChoice(true);
        loadFolderContents(folderId);
      }
    } else {
      // Si on revient à un sous-dossier, charger les fichiers
      const folderId = newBreadcrumbs[newBreadcrumbs.length - 1].id;
      if (folderId) {
        setIsInFolder(true);
        setShowActionChoice(true);
        loadSousDossierFiles(folderId);
      }
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      showNotification('error', 'Le nom du dossier est requis');
      return;
    }

    setIsUploading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = getAuthToken();
      
      let response;
      
      if (!currentFolderId) {
        // Créer un dossier global
        response = await fetch(`${API_BASE}/new-structure/dossiers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: newFolderName,
            description: newFolderDescription,
            target_class: JSON.stringify(newFolderTargetClasses)
          })
        });
      } else {
        // Créer un sous-dossier
        response = await fetch(`${API_BASE}/new-structure/sous-dossiers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: newFolderName,
            description: newFolderDescription,
            dossier_id: currentFolderId
          })
        });
      }

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      showNotification('success', 'Dossier créé avec succès');
      setNewFolderName('');
      setNewFolderDescription('');
      setNewFolderTargetClasses([]);
      setShowCreateFolderModal(false);
      
      // Recharger selon le contexte
      if (isInFolder && currentFolderId) {
        loadFolderContents(currentFolderId); // Recharger le contenu du dossier
      } else {
        loadFolders(); // Recharger les dossiers globaux
      }
    } catch (error) {
      showNotification('error', `Erreur lors de la création: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFolder = async (folder: FolderFromDB) => {
    setIsUploading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = getAuthToken();
      
      let response;
      
      if (!currentFolderId) {
        // Supprimer un dossier global
        response = await fetch(`${API_BASE}/new-structure/dossiers/${folder.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // Supprimer un sous-dossier
        response = await fetch(`${API_BASE}/new-structure/sous-dossiers/${folder.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      showNotification('success', 'Dossier supprimé avec succès');
      setShowDeleteFolderModal(false);
      setFolderToDelete(null);
      
      // Recharger selon le contexte
      if (isInFolder && currentFolderId) {
        loadFolderContents(currentFolderId);
      } else {
        loadFolders();
      }
    } catch (error) {
      showNotification('error', `Erreur lors de la suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const editFolder = async (folder: FolderFromDB, updatedData: { name: string; description: string; targetClasses: string[] }) => {
    setIsUploading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = getAuthToken();
      
      let response;
      
      if (!currentFolderId) {
        // Modifier un dossier global
        response = await fetch(`${API_BASE}/new-structure/dossiers/${folder.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: updatedData.name,
            description: updatedData.description,
            target_class: JSON.stringify(updatedData.targetClasses)
          })
        });
      } else {
        // Modifier un sous-dossier
        response = await fetch(`${API_BASE}/new-structure/sous-dossiers/${folder.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: updatedData.name,
            description: updatedData.description
          })
        });
      }

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      showNotification('success', 'Dossier modifié avec succès');
      setShowEditFolderModal(false);
      setFolderToEdit(null);
      
      // Recharger selon le contexte
      if (isInFolder && currentFolderId) {
        loadFolderContents(currentFolderId);
      } else {
        loadFolders();
      }
    } catch (error) {
      showNotification('error', `Erreur lors de la modification: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Charger les dossiers au démarrage
  useEffect(() => {
    loadFolders();
    
    // Note: loadFiles supprimé car nous utilisons maintenant la navigation hiérarchique
    // Les fichiers sont chargés via loadSousDossierFiles() quand on entre dans un sous-dossier
  }, []);

  // Types de fichiers acceptés - tous les types maintenant acceptés
  const getFileTypeInfo = (fileType: string) => {
    const typeMap: { [key: string]: { label: string; icon: any; color: string } } = {
      'application/pdf': { label: 'PDF', icon: FileText, color: 'text-red-500 bg-red-100' },
      'text/plain': { label: 'TXT', icon: File, color: 'text-blue-500 bg-blue-100' },
      'video/mp4': { label: 'MP4', icon: Video, color: 'text-purple-500 bg-purple-100' },
      'video/avi': { label: 'AVI', icon: Video, color: 'text-purple-500 bg-purple-100' },
      'video/mov': { label: 'MOV', icon: Video, color: 'text-purple-500 bg-purple-100' },
      'image/jpeg': { label: 'JPG', icon: File, color: 'text-green-500 bg-green-100' },
      'image/png': { label: 'PNG', icon: File, color: 'text-green-500 bg-green-100' },
      'application/msword': { label: 'DOC', icon: FileText, color: 'text-blue-500 bg-blue-100' },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { label: 'DOCX', icon: FileText, color: 'text-blue-500 bg-blue-100' },
      'application/vnd.ms-excel': { label: 'XLS', icon: FileText, color: 'text-green-500 bg-green-100' },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { label: 'XLSX', icon: FileText, color: 'text-green-500 bg-green-100' },
      'application/vnd.ms-powerpoint': { label: 'PPT', icon: FileText, color: 'text-orange-500 bg-orange-100' },
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': { label: 'PPTX', icon: FileText, color: 'text-orange-500 bg-orange-100' },
      'application/zip': { label: 'ZIP', icon: File, color: 'text-gray-500 bg-gray-100' },
      'application/x-rar-compressed': { label: 'RAR', icon: File, color: 'text-gray-500 bg-gray-100' },
      'application/x-msdownload': { label: 'EXE', icon: Settings, color: 'text-yellow-500 bg-yellow-100' },
      'application/octet-stream': { label: 'BIN', icon: File, color: 'text-gray-500 bg-gray-100' }
    };
    
    // Vérifier si c'est un fichier exécutable par extension
    if (fileType === 'application/octet-stream' || fileType === 'application/x-msdownload') {
      return typeMap['application/x-msdownload'];
    }
    
    return typeMap[fileType] || { 
      label: fileType.split('/')[1]?.toUpperCase() || 'FILE', 
      icon: File, 
      color: 'text-gray-500 bg-gray-100' 
    };
  };

  const subjects = ['Histoire', 'Géographie', 'EMC'];
  const levels = ['Seconde', 'Première', 'Terminale'];
  const classes = AVAILABLE_CLASSES;

  // Fonction pour afficher les notifications
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Gestion du drag & drop améliorée
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      return file.size <= 100 * 1024 * 1024; // 100MB max - tous les types acceptés
    });

    const newFileUploads: FileUpload[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));

    setCurrentFiles(prev => [...prev, ...newFileUploads]);
  };

  const removeFile = (index: number) => {
    setCurrentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Upload réel de fichier vers le serveur
  const uploadFile = async (fileUpload: FileUpload, index: number): Promise<{success: boolean, url?: string, error?: string}> => {
    const { file } = fileUpload;
    
    try {
      // Mise à jour du statut
      setCurrentFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'uploading' as const } : f
      ));

      // Créer FormData pour l'upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', courseTitle);
      formData.append('description', courseDescription);
      formData.append('sous_dossier_id', currentFolderId?.toString() || '');

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Upload du fichier vers la nouvelle API
      const response = await fetch(`${API_BASE}/new-structure/fichiers/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'upload');
      }

      const result = await response.json();
      
      // Succès
      setCurrentFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'success' as const } : f
      ));

      return { success: true, url: result.filePath };
    } catch (error) {
      // Erreur
      setCurrentFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : 'Erreur inconnue' } : f
      ));
      
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  };

  // Soumission améliorée avec gestion d'erreurs
  const handleSubmit = async () => {
    if (!courseTitle.trim()) {
      showNotification('error', 'Veuillez remplir le titre du cours');
      return;
    }
    
    if (currentFiles.length === 0) {
      showNotification('error', 'Veuillez ajouter au moins un fichier');
      return;
    }

    // Validation des fichiers
    const invalidFiles = currentFiles.filter(fileUpload => {
      const file = fileUpload.file;
      return file.size > 100 * 1024 * 1024; // 100MB max
    });
    
    if (invalidFiles.length > 0) {
      showNotification('error', `${invalidFiles.length} fichier(s) trop volumineux. Taille maximum autorisée : 100MB`);
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload des fichiers
      const uploadPromises = currentFiles.map((fileUpload, index) => uploadFile(fileUpload, index));
      const results = await Promise.all(uploadPromises);
      
      // Vérifier s'il y a des erreurs
      const errors = results.filter(r => !r.success);
      if (errors.length > 0) {
        showNotification('error', `Erreur lors de l'upload de ${errors.length} fichier(s)`);
        return;
      }
      
      // Créer côté backend puis rafraîchir la liste
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Vérifier l'authentification
      const token = getAuthToken();
      
      if (!token) {
        showNotification('error', 'Token d\'authentification manquant. Veuillez vous reconnecter.');
        return;
      }
      
      // Les fichiers ont déjà été créés lors de l'upload, pas besoin de les recréer
      
      // Recharger les fichiers du sous-dossier actuel (sans bloquer en cas d'erreur)
      if (currentFolderId && breadcrumbs.length === 3) {
        try {
          await loadSousDossierFiles(currentFolderId);
        } catch (error) {
          console.warn('Erreur lors du rechargement des fichiers:', error);
          // Ne pas bloquer la fermeture du modal pour cette erreur
        }
      }
      
      // Reset du formulaire
      setCourseTitle('');
      setCourseDescription('');
      // setCourseTags(''); // Supprimé car non utilisé dans la nouvelle structure
      // setCourseClass(['Terminale groupe 1']); // Supprimé car non utilisé dans la nouvelle structure
      setCurrentFiles([]);
      setShowUploadModal(false);
      
      showNotification('success', `${currentFiles.length} fichier(s) ajouté(s) avec succès !`);
    } catch (error) {
      showNotification('error', 'Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  // Fonction de suppression
  const handleDelete = async (course: Course) => {
    setIsLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = getAuthToken();
      
      
      const response = await fetch(`${API_BASE}/new-structure/fichiers/${course.id}`, { 
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur de connexion au serveur' }));
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Recharger les fichiers du sous-dossier actuel
      if (currentFolderId && breadcrumbs.length === 3) {
        await loadSousDossierFiles(currentFolderId);
      }
      
      showNotification('success', 'Fichier supprimé avec succès');
      setShowDeleteModal(false);
      setFileToDelete(null);
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour modifier les classes cibles
  const handleUpdateTargetClasses = async (fileId: string, newTargetClasses: string[]) => {
    setIsLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE}/new-structure/fichiers/${fileId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          // Note: Les classes cibles sont maintenant gérées au niveau du dossier global
          // Cette fonction peut être simplifiée ou supprimée selon les besoins
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la modification des classes cibles');
      }
      
      // Mettre à jour l'état local
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, targetClasses: newTargetClasses }
          : f
      ));
      
      showNotification('success', 'Classes cibles mises à jour avec succès');
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Erreur lors de la modification des classes cibles');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'édition
  const handleEdit = async (updatedCourse: Course) => {
    setIsLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/files/${updatedCourse.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: updatedCourse.title,
          description: updatedCourse.description,
          fileName: updatedCourse.name,
          targetClass: updatedCourse.targetClasses?.[0] || '',
          targetClasses: updatedCourse.targetClasses || []
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la modification');
      }
      
      setUploadedFiles(prev => prev.map(f => f.id === updatedCourse.id ? updatedCourse : f));
      
      showNotification('success', 'Cours modifié avec succès');
      setShowEditModal(false);
      setFileToEdit(null);
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Erreur lors de la modification');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de téléchargement
  const handleDownload = async (course: Course) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Afficher un indicateur de chargement
      const loadingElement = document.createElement('div');
      loadingElement.innerHTML = 'Téléchargement en cours...';
      loadingElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1f2937;
        color: white;
        padding: 20px;
        border-radius: 8px;
        z-index: 10000;
        font-family: system-ui;
      `;
      document.body.appendChild(loadingElement);
      
      const token = getAuthToken();
      
      // Utiliser le nouvel endpoint aligné avec la nouvelle structure (table `fichiers`)
      const response = await fetch(`${API_BASE}/new-structure/fichiers/${course.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      
      // Supprimer l'indicateur de chargement
      document.body.removeChild(loadingElement);
      
      if (response.ok) {
        const blob = await response.blob();
        
        // Vérifier que le blob n'est pas vide
        if (blob.size === 0) {
          showNotification('error', 'Le fichier téléchargé est vide');
          return;
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Utiliser le nom de fichier original
        const originalFileName = course.fileName || course.name || 'document';
        
        // Générer un nom de fichier sécurisé avec la bonne extension
        const fileName = generateDownloadFileName(originalFileName, (course as any).fileType);
        
        a.download = fileName;
        
        // Ajouter des attributs pour forcer le téléchargement
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // Nettoyer après un délai
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 1000);
        
        showNotification('success', `Téléchargement réussi: ${fileName}`);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Erreur de téléchargement' }));
        showNotification('error', errorData.message || `Erreur lors du téléchargement (${response.status})`);
      }
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Erreur de connexion lors du téléchargement');
    }
  };

  // Fonction de changement de statut
  const toggleStatus = async (course: Course) => {
    const newStatus = course.status === 'Publié' ? 'Brouillon' : 'Publié';
    const updatedCourse = { ...course, status: newStatus as 'Publié' | 'Brouillon' };
    await handleEdit(updatedCourse);
  };

  const getFileIcon = (type: string, fileName?: string) => {
    // Utiliser la fonction utilitaire pour déterminer le type d'affichage
    const displayType = getDisplayFileType(fileName || '', type);
    
    // Mapper le type d'affichage vers le type MIME pour getFileTypeInfo
    let mimeType = type;
    if (displayType === 'EXE' || displayType === 'MSI') {
      mimeType = 'application/x-msdownload';
    }
    
    return getFileTypeInfo(mimeType);
  };


  return (
    <div className="space-y-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg backdrop-blur-xl border ${
          notification.type === 'success' 
            ? 'bg-green-500/20 border-green-500/30 text-green-100' 
            : 'bg-red-500/20 border-red-500/30 text-red-100'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* En-tête amélioré */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Shield className="w-8 h-8 text-blue-300 mr-4" />
              Administration - Gestion des Fichiers
            </h1>
            <p className="text-blue-200 mt-2">
              Organisez vos fichiers dans des dossiers hiérarchiques
            </p>
            <div className="flex items-center space-x-4 mt-3 text-sm text-blue-300">
              <span>Dossiers: {folders.length}</span>
              <span>Fichiers: {uploadedFiles.length}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualiser</span>
            </button>
            
             {isInFolder ? (
               // Choix d'action selon le contexte
               <div className="flex items-center space-x-3">
                 {breadcrumbs.length === 2 ? (
                   // Dans un dossier global (niveau 2) : créer un sous-dossier
                   <button
                     onClick={() => setShowCreateFolderModal(true)}
                     className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold"
                   >
                     <FolderPlus className="w-4 h-4" />
                     <span>Créer un sous-dossier</span>
                   </button>
                 ) : (
                   // Dans un sous-dossier (niveau 3) : ajouter un fichier
                   <button
                     onClick={() => setShowUploadModal(true)}
                     className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold"
                   >
                     <Plus className="w-4 h-4" />
                     <span>Ajouter un fichier</span>
                   </button>
                 )}
               </div>
             ) : (
              // Bouton pour créer un dossier global (à la racine)
              <button
                onClick={() => setShowCreateFolderModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
              >
                <FolderPlus className="w-5 h-5" />
                <span>Nouveau Dossier Global</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fil d'Ariane pour les dossiers */}
      {isInFolder && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-4 border border-white/20">
          <div className="flex items-center space-x-2 text-white">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={item.id || 'root'}>
                <button
                  onClick={() => navigateToBreadcrumb(index)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
                    index === breadcrumbs.length - 1
                      ? 'bg-blue-500/20 text-blue-200'
                      : 'hover:bg-white/10 text-blue-300'
                  }`}
                >
                  {index === 0 ? <Home className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                  <span>{item.name}</span>
                </button>
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}


      {/* Liste des fichiers/dossiers améliorée */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
           <h2 className="text-xl font-bold text-white flex items-center">
             <Folder className="w-5 h-5 text-blue-300 mr-2" />
             {!currentFolderId ? 'Dossiers globaux' : 
              folders.length > 0 ? 'Sous-dossiers' : 'Fichiers'} 
             ({!currentFolderId ? folders.length : 
               folders.length > 0 ? folders.length : uploadedFiles.length})
           </h2>
        </div>
        
        {/* Vue dossiers et fichiers - grille */}
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Dossiers seulement à la racine */}
              {!currentFolderId && folders.map((folder) => (
                <div
                  key={folder.id}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                  onClick={() => navigateToFolder(folder)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Folder className="w-8 h-8 text-blue-400" />
                      <div className="text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full">
                        Cliquer pour entrer
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFolderToEdit(folder);
                          setShowEditFolderModal(true);
                        }}
                        className="p-1 text-blue-300 hover:text-white hover:bg-blue-500/20 rounded"
                        title="Modifier le dossier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFolderToDelete(folder);
                          setShowDeleteFolderModal(true);
                        }}
                        className="p-1 text-red-300 hover:text-white hover:bg-red-500/20 rounded"
                        title="Supprimer le dossier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-white mb-1 truncate">{folder.name}</h3>
                  {folder.description && (
                    <p className="text-sm text-blue-300 mb-2 line-clamp-2">{folder.description}</p>
                  )}
                  {folder.targetClasses && folder.targetClasses.length > 0 && (
                    <div className="mb-2">
                      <div className="flex flex-wrap gap-1">
                        {folder.targetClasses.slice(0, 2).map((cls, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {cls.replace(/1ère/g, '1ere')}
                          </span>
                        ))}
                        {folder.targetClasses.length > 2 && (
                          <span className="text-xs text-blue-400">
                            +{folder.targetClasses.length - 2} autres
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-blue-400">
                    <span>{folder.children?.length || 0} sous-dossiers</span>
                    <span>{new Date(folder.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}

               {/* Sous-dossiers dans un dossier global */}
               {currentFolderId && folders.length > 0 && folders.map((folder) => (
                 <div
                   key={folder.id}
                   className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                   onClick={() => navigateToFolder(folder)}
                 >
                   <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center space-x-2">
                       <Folder className="w-8 h-8 text-blue-400" />
                       <div className="text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full">
                         Sous-dossier
                       </div>
                     </div>
                     <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           setFolderToEdit(folder);
                           setShowEditFolderModal(true);
                         }}
                         className="p-1 text-blue-300 hover:text-white hover:bg-blue-500/20 rounded"
                         title="Modifier le sous-dossier"
                       >
                         <Edit className="w-4 h-4" />
                       </button>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           setFolderToDelete(folder);
                           setShowDeleteFolderModal(true);
                         }}
                         className="p-1 text-red-300 hover:text-white hover:bg-red-500/20 rounded"
                         title="Supprimer le sous-dossier"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                   <h3 className="font-semibold text-white mb-2 truncate">{folder.name}</h3>
                   {folder.description && (
                     <p className="text-sm text-blue-300 mb-3 line-clamp-2">{folder.description}</p>
                   )}
                   <div className="flex items-center justify-between text-xs text-blue-400">
                     <span>Sous-dossier</span>
                     <span>{new Date(folder.createdAt).toLocaleDateString()}</span>
                   </div>
                 </div>
               ))}

               {/* Fichiers seulement dans les sous-dossiers (niveau 3) */}
               {currentFolderId && breadcrumbs.length === 3 && uploadedFiles.map((file) => {
                const iconConfig = getFileIcon(file.type, file.fileName);
                const IconComponent = iconConfig.icon;
                return (
                  <div
                    key={file.id}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <IconComponent className="w-8 h-8 text-green-400" />
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-1 text-blue-300 hover:text-white hover:bg-blue-500/20 rounded"
                          title="Télécharger"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFileToDelete(file);
                            setShowDeleteModal(true);
                          }}
                          className="p-1 text-red-300 hover:text-white hover:bg-red-500/20 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-white mb-1 truncate">{file.name}</h3>
                    {file.title && (
                      <p className="text-sm text-blue-300 mb-2 line-clamp-2">{file.title}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-blue-400">
                      <span>{file.size}</span>
                      <span>{file.views} téléchargements</span>
                    </div>
                  </div>
                );
              })}

               {!currentFolderId && folders.length === 0 && (
                 <div className="col-span-full text-center py-12">
                   <Folder className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                   <p className="text-blue-200 text-lg">Aucun dossier global créé</p>
                   <p className="text-blue-300 text-sm">Créez votre premier dossier global pour commencer</p>
                 </div>
               )}
               
               {currentFolderId && folders.length === 0 && uploadedFiles.length === 0 && (
                 <div className="col-span-full text-center py-12">
                   <Folder className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                   <p className="text-blue-200 text-lg">Aucun contenu</p>
                   <p className="text-blue-300 text-sm">
                     {breadcrumbs.length === 2 ? 
                       'Créez des sous-dossiers pour organiser vos fichiers' : 
                       'Ajoutez des fichiers dans ce sous-dossier'}
                   </p>
                 </div>
               )}
            </div>
          </div>
      </div>

      {/* Modal d'upload amélioré */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* En-tête de la modal */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Upload className="w-6 h-6 text-blue-300 mr-3" />
                Ajouter un nouveau cours
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations du cours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Titre du cours *</label>
                  <input
                    type="text"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="Ex: La Révolution française"
                    className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Description</label>
                <textarea
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder="Description détaillée du cours..."
                  rows={3}
                  className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
                />
              </div>

              {/* Zone de drop améliorée */}
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-400/10' 
                    : 'border-white/30 hover:border-white/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                <p className="text-white text-lg font-semibold mb-2">
                  Glissez-déposez vos fichiers ici
                </p>
                <p className="text-blue-200 mb-4">
                  ou cliquez pour sélectionner (Tous types de fichiers - max 100MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all border border-white/20"
                >
                  Sélectionner des fichiers
                </button>
              </div>

              {/* Liste des fichiers sélectionnés avec statut */}
              {currentFiles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">Fichiers sélectionnés</h3>
                  {currentFiles.map((fileUpload, index) => {
                    const { file, progress, status, error } = fileUpload;
                    const iconConfig = getFileTypeInfo(file.type);
                    const IconComponent = iconConfig.icon;
                    
                    return (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconConfig.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{file.name}</p>
                          <p className="text-xs text-blue-200">{formatFileSize(file.size)}</p>
                          
                          {status === 'uploading' && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-blue-200 mb-1">
                                <span>Upload en cours...</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="w-full bg-white/20 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                          
                          {status === 'success' && (
                            <div className="flex items-center space-x-1 mt-1">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-xs text-green-400">Upload réussi</span>
                            </div>
                          )}
                          
                          {status === 'error' && (
                            <div className="flex items-center space-x-1 mt-1">
                              <XCircle className="w-4 h-4 text-red-400" />
                              <span className="text-xs text-red-400">{error || 'Erreur d\'upload'}</span>
                            </div>
                          )}
                        </div>
                        
                        {status === 'pending' && (
                          <button
                            onClick={() => removeFile(index)}
                            className="p-2 text-red-300 hover:text-white hover:bg-red-500/20 rounded-lg transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        
                        {status === 'uploading' && (
                          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-white/20">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
                  disabled={isUploading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isUploading || currentFiles.length === 0 || !courseTitle.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Upload en cours...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Publier le cours</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && fileToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Confirmer la suppression</h3>
                  <p className="text-blue-200 text-sm">Cette action est irréversible</p>
                </div>
              </div>
              
              <p className="text-blue-200 mb-6">
                Êtes-vous sûr de vouloir supprimer le cours <strong className="text-white">"{fileToDelete.title || fileToDelete.name}"</strong> ?
              </p>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setFileToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(fileToDelete)}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && fileToEdit && (
        <EditCourseModal
          course={fileToEdit}
          onSave={handleEdit}
          onClose={() => {
            setShowEditModal(false);
            setFileToEdit(null);
          }}
          isLoading={isLoading}
          subjects={subjects}
          levels={levels}
        />
      )}

      {/* Modal de création de dossier */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <FolderPlus className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Nouveau Dossier</h3>
                <p className="text-blue-300 text-sm">
                  {currentFolderId ? 'Créer un sous-dossier dans ce dossier' : 'Créer un dossier global'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nom du dossier</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Ex: Cours d'Histoire, Exercices de Math..."
                  className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Description (optionnel)</label>
                <textarea
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  placeholder="Description du dossier..."
                  rows={3}
                  className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300 resize-none"
                />
              </div>
              
              {/* Sélection des classes cibles - seulement pour le premier dossier (racine) */}
              {!currentFolderId && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Classes cibles *
                  </label>
                  <p className="text-xs text-blue-300 mb-3">
                    Sélectionnez les classes qui pourront accéder à ce dossier global
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-white/20 rounded-xl p-3 bg-white/5">
                    {availableClasses.map(cls => {
                      const isChecked = newFolderTargetClasses.includes(cls);
                      return (
                        <label key={cls} className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewFolderTargetClasses(prev => [...prev, cls]);
                              } else {
                                setNewFolderTargetClasses(prev => prev.filter(c => c !== cls));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-sm text-white">{cls.replace(/1ère/g, '1ere')}</span>
                        </label>
                      );
                    })}
                  </div>
                  {newFolderTargetClasses.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-green-300">
                        ✓ Classes sélectionnées : {newFolderTargetClasses.map(cls => cls.replace(/1ère/g, '1ere')).join(', ')}
                      </p>
                    </div>
                  )}
                  {newFolderTargetClasses.length === 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-red-300">
                        ⚠️ Veuillez sélectionner au moins une classe
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateFolderModal(false);
                  setNewFolderName('');
                  setNewFolderDescription('');
                  setNewFolderTargetClasses([]);
                }}
                className="px-4 py-2 text-blue-300 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={createFolder}
                disabled={isUploading || !newFolderName.trim() || (!currentFolderId && newFolderTargetClasses.length === 0)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Créer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition de dossier */}
      {showEditFolderModal && folderToEdit && (
        <EditFolderModal
          folder={folderToEdit}
          onSave={(updatedData) => editFolder(folderToEdit, updatedData)}
          onClose={() => {
            setShowEditFolderModal(false);
            setFolderToEdit(null);
          }}
          isLoading={isUploading}
          availableClasses={availableClasses}
          isGlobalFolder={!currentFolderId}
        />
      )}

      {/* Modal de suppression de dossier */}
      {showDeleteFolderModal && folderToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Supprimer le dossier</h3>
                <p className="text-blue-300 text-sm">Cette action est irréversible</p>
              </div>
            </div>
            <p className="text-white mb-6">
              Êtes-vous sûr de vouloir supprimer le dossier <strong>"{folderToDelete.name}"</strong> ?
              <br />
              <span className="text-red-300 text-sm">Tous les fichiers et sous-dossiers seront également supprimés.</span>
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteFolderModal(false);
                  setFolderToDelete(null);
                }}
                className="px-4 py-2 text-blue-300 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => deleteFolder(folderToDelete)}
                disabled={isUploading}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant Modal d'édition séparé
interface EditCourseModalProps {
  course: Course;
  onSave: (course: Course) => void;
  onClose: () => void;
  isLoading: boolean;
  subjects: string[];
  levels: string[];
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({ 
  course, 
  onSave, 
  onClose, 
  isLoading, 
  subjects, 
  levels 
}) => {
  const [editedCourse, setEditedCourse] = useState<Course>(course);

  const handleSave = () => {
    onSave(editedCourse);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Edit className="w-6 h-6 text-blue-300 mr-3" />
            Modifier le cours
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Nom du fichier</label>
              <input
                type="text"
                value={editedCourse.name}
                onChange={(e) => setEditedCourse(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Titre du cours</label>
              <input
                type="text"
                value={editedCourse.title}
                onChange={(e) => setEditedCourse(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Matière</label>
              <select
                value={editedCourse.subject}
                onChange={(e) => setEditedCourse(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Niveau</label>
              <select
                value={editedCourse.level}
                onChange={(e) => setEditedCourse(prev => ({ ...prev, level: e.target.value }))}
                className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Description</label>
            <textarea
              value={editedCourse.description || ''}
              onChange={(e) => setEditedCourse(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Classes cibles</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-white/20 rounded-xl p-3 bg-white/5">
              {AVAILABLE_CLASSES.map(cls => (
                <label key={cls} className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={editedCourse.targetClasses?.includes(cls) || false}
                    onChange={(e) => {
                      const currentClasses = editedCourse.targetClasses || [];
                      if (e.target.checked) {
                        setEditedCourse(prev => ({ 
                          ...prev, 
                          targetClasses: [...currentClasses, cls] 
                        }));
                      } else {
                        setEditedCourse(prev => ({ 
                          ...prev, 
                          targetClasses: currentClasses.filter(c => c !== cls) 
                        }));
                      }
                    }}
                    className="rounded border-white/20 text-blue-500 focus:ring-blue-400"
                  />
                  <span className="text-sm text-white">{cls}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Tags (séparés par des virgules)</label>
            <input
              type="text"
              value={editedCourse.tags?.join(', ') || ''}
              onChange={(e) => setEditedCourse(prev => ({ 
                ...prev, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              }))}
              className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-white/20">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Sauvegarder</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Modal d'édition de dossier
interface EditFolderModalProps {
  folder: FolderFromDB;
  onSave: (updatedData: { name: string; description: string; targetClasses: string[] }) => void;
  onClose: () => void;
  isLoading: boolean;
  availableClasses: string[];
  isGlobalFolder: boolean;
}

const EditFolderModal: React.FC<EditFolderModalProps> = ({ 
  folder, 
  onSave, 
  onClose, 
  isLoading, 
  availableClasses,
  isGlobalFolder 
}) => {
  const [editedFolder, setEditedFolder] = useState({
    name: folder.name,
    description: folder.description,
    targetClasses: folder.targetClasses || []
  });

  // Réinitialiser les classes cibles quand le dossier change
  useEffect(() => {
    setEditedFolder({
      name: folder.name,
      description: folder.description,
      targetClasses: folder.targetClasses || []
    });
  }, [folder]);

  const handleSave = () => {
    onSave(editedFolder);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 max-w-md w-full">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Edit className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Modifier le dossier</h3>
            <p className="text-blue-300 text-sm">
              {isGlobalFolder ? 'Modifier un dossier global' : 'Modifier un sous-dossier'}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Nom du dossier</label>
            <input
              type="text"
              value={editedFolder.name}
              onChange={(e) => setEditedFolder(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Cours d'Histoire, Exercices de Math..."
              className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Description (optionnel)</label>
            <textarea
              value={editedFolder.description}
              onChange={(e) => setEditedFolder(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description du dossier..."
              rows={3}
              className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/10 backdrop-blur-md text-white placeholder-blue-300 resize-none"
            />
          </div>
          
          {/* Sélection des classes cibles - seulement pour les dossiers globaux */}
          {isGlobalFolder && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Classes cibles *
              </label>
              <p className="text-xs text-blue-300 mb-3">
                Sélectionnez les classes qui pourront accéder à ce dossier global
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-white/20 rounded-xl p-3 bg-white/5">
                {availableClasses.map(cls => {
                  const isChecked = editedFolder.targetClasses.includes(cls);
                  return (
                    <label key={cls} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditedFolder(prev => ({
                              ...prev,
                              targetClasses: [...prev.targetClasses, cls]
                            }));
                          } else {
                            setEditedFolder(prev => ({
                              ...prev,
                              targetClasses: prev.targetClasses.filter(c => c !== cls)
                            }));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-white">{cls.replace(/1ère/g, '1ere')}</span>
                    </label>
                  );
                })}
              </div>
              {editedFolder.targetClasses.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-green-300">
                    ✓ Classes sélectionnées : {editedFolder.targetClasses.map(cls => cls.replace(/1ère/g, '1ere')).join(', ')}
                  </p>
                </div>
              )}
              {editedFolder.targetClasses.length === 0 && (
                <div className="mt-2">
                  <p className="text-xs text-red-300">
                    ⚠️ Veuillez sélectionner au moins une classe
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-blue-300 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !editedFolder.name.trim() || (isGlobalFolder && editedFolder.targetClasses.length === 0)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Sauvegarder</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileManagementTabImproved;


