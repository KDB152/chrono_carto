'use client';

import React, { useState, useEffect } from 'react';
import { generateDownloadFileName } from '@/lib/fileUtils';
import StudentFileNavigation from './StudentFileNavigation';
import {
  BookOpen,
  Video,
  FileText,
  Image,
  Download,
  Eye,
  Star,
  Heart,
  Share2,
  Search,
  Filter,
  Grid,
  List,
  Folder,
  FolderOpen,
  File,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Edit,
  Trash2,
  Copy,
  Move,
  Archive,
  Tag,
  Clock,
  Calendar,
  User,
  Users,
  Globe,
  Link,
  ExternalLink,
  Bookmark,
  Flag,
  AlertCircle,
  CheckCircle,
  Info,
  HelpCircle,
  Lightbulb,
  Target,
  Award,
  Trophy,
  Medal,
  Crown,
  Zap,
  Flame,
  Sparkles,
  Brain,
  History,
  Map,
  Compass,
  Mountain,
  Waves,
  TreePine,
  Flower,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Umbrella,
  Thermometer,
  Wind,
  Snowflake,
  Rainbow,
  Camera,
  Mic,
  Headphones,
  Speaker,
  Music,
  Radio,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Keyboard,
  Mouse,
  Printer,
  Scanner,
  Wifi,
  Bluetooth,
  Usb,
  HardDrive,
  SdCard,
  Battery,
  Power,
  Settings,
  Tool,
  Wrench,
  Hammer,
  Screwdriver,
  Ruler,
  Scissors,
  Paperclip,
  Pin,
  Pushpin,
  Magnet,
  Key,
  Lock,
  Unlock,
  Shield,
  Security,
  Safe,
  Vault,
  Bank,
  CreditCard,
  Wallet,
  Coins,
  DollarSign,
  Euro,
  Pound,
  Yen,
  Bitcoin,
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart,
  LineChart,
  Activity,
  Pulse,
  Heart as HeartIcon,
  Smile,
  Frown,
  Meh,
  Angry,
  Surprised,
  Confused,
  Sleepy,
  Cool,
  Wink,
  Kiss,
  Tongue,
  Sunglasses,
  Nerd,
  Monocle,
  Thinking,
  Shushing,
  Lying,
  Cowboy,
  Partying,
  Disguised,
  Robot,
  Ghost,
  Alien,
  Devil,
  Angel,
  Skull,
  Poop,
  Clown,
  Ogre,
  Goblin,
  Zombie
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'audio' | 'image' | 'link' | 'interactive';
  category: 'course' | 'exercise' | 'reference' | 'multimedia' | 'tool';
  subject: 'history' | 'geography' | 'both' | 'general';
  level: 'beginner' | 'intermediate' | 'advanced';
  url: string;
  thumbnail?: string;
  fileSize?: number;
  duration?: number; // en secondes pour les vidéos/audios
  author: string;
  createdAt: string;
  updatedAt?: string;
  tags: string[];
  rating: number;
  ratingsCount: number;
  downloads: number;
  views: number;
  isFavorite: boolean;
  isBookmarked: boolean;
  isDownloaded: boolean;
  language: string;
  difficulty: number; // 1-5
  prerequisites?: string[];
  relatedResources?: string[];
  format?: string;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
}

interface ResourceFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  children: string[];
  resources: string[];
  color: string;
  icon: string;
  isExpanded: boolean;
  createdAt: string;
  isEditable: boolean;
}

const ResourcesTab: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [folders, setFolders] = useState<ResourceFolder[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Fonction de téléchargement
  const handleDownload = async (resource: Resource) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      if (!token) {
        console.error('❌ Token d\'authentification manquant');
        return;
      }

      console.log('📥 Téléchargement du fichier:', resource.title);
      
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
      
      const response = await fetch(`${API_BASE}/files/${resource.id}/download`, {
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
          alert('Le fichier téléchargé est vide. Veuillez contacter l\'administrateur.');
          return;
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Utiliser le nom de fichier original ou le titre
        const originalFileName = resource.fileName || resource.title || 'document';
        
        // Générer un nom de fichier sécurisé avec la bonne extension
        const fileName = generateDownloadFileName(originalFileName, resource.fileType);
        
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
        
        console.log('✅ Téléchargement réussi:', fileName);
        
        // Afficher une notification de succès
        const successElement = document.createElement('div');
        successElement.innerHTML = '✅ Téléchargement réussi!';
        successElement.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 12px 20px;
          border-radius: 6px;
          z-index: 10000;
          font-family: system-ui;
        `;
        document.body.appendChild(successElement);
        setTimeout(() => document.body.removeChild(successElement), 3000);
        
      } else {
        console.error('❌ Erreur lors du téléchargement:', response.status);
        
        // Gérer les erreurs spécifiques
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          if (errorData.message && errorData.message.includes('Fichier non trouvé')) {
            alert('Le fichier n\'est pas disponible sur le serveur. Veuillez contacter l\'administrateur.');
            return;
          }
        }
        
        alert(`Erreur lors du téléchargement du fichier (${response.status}). Veuillez réessayer.`);
      }
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement:', error);
      alert('Erreur de connexion lors du téléchargement. Vérifiez votre connexion internet.');
    }
  };

  // Fonction d'ouverture de fichier
  const handleOpenFile = async (resource: Resource) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      if (!token) {
        console.error('❌ Token d\'authentification manquant');
        return;
      }

      console.log('👁️ Ouverture du fichier:', resource.title);
      
      const response = await fetch(`${API_BASE}/files/${resource.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Ouvrir le fichier dans un nouvel onglet
        window.open(url, '_blank');
        
        console.log('✅ Fichier ouvert avec succès');
      } else {
        console.error('❌ Erreur lors de l\'ouverture:', response.status);
        
        // Gérer les erreurs spécifiques
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          if (errorData.message && errorData.message.includes('Fichier non trouvé')) {
            alert('Le fichier n\'est pas disponible sur le serveur. Veuillez contacter l\'administrateur.');
            return;
          }
        }
        
        alert('Erreur lors de l\'ouverture du fichier. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'ouverture:', error);
    }
  };

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const load = async () => {
      try {
        // Récupérer les détails de l'utilisateur
        const userDetails = localStorage.getItem('userDetails');
        if (!userDetails) {
          console.error('❌ Détails utilisateur non trouvés');
          return;
        }

        const user = JSON.parse(userDetails);
        console.log('🔍 Utilisateur connecté:', user);

        // Récupérer la classe de l'étudiant depuis l'API
        let userClass = 'Terminale groupe 1'; // Valeur par défaut
        
        try {
          const studentResponse = await fetch(`${API_BASE}/students/by-user/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('accessToken')}`
            }
          });
          
          if (studentResponse.ok) {
            const studentData = await studentResponse.json();
            userClass = studentData.class_level || userClass;
            console.log('✅ Classe de l\'étudiant récupérée:', userClass);
          } else {
            console.warn('⚠️ Impossible de récupérer la classe de l\'étudiant, utilisation de la valeur par défaut');
          }
        } catch (error) {
          console.warn('⚠️ Erreur lors de la récupération de la classe:', error);
        }
        
        // Charger les fichiers pour la classe de l'étudiant
        console.log('📁 Chargement des fichiers pour la classe:', userClass);
        const res = await fetch(`${API_BASE}/files?class=${encodeURIComponent(userClass)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('accessToken')}`
          }
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            console.error('❌ Token d\'authentification invalide');
            throw new Error('Session expirée. Veuillez vous reconnecter.');
          }
          throw new Error(`Erreur ${res.status}: ${res.statusText}`);
        }
        
        const json = await res.json();
        console.log('📄 Fichiers récupérés pour la classe', userClass, ':', json);
        
        const mapped: Resource[] = (json || []).map((file: any) => ({
          id: String(file.id),
          title: file.title || file.fileName,
          description: file.description || '',
          type: (file.fileType?.includes('pdf') ? 'document' : 
                 file.fileType?.includes('video') ? 'video' : 
                 file.fileType?.includes('audio') ? 'audio' : 
                 file.fileType?.includes('image') ? 'image' : 'document') as any,
          category: 'course',
          subject: (Array.isArray(file.targetClass) 
                   ? (file.targetClass.some((cls: string) => cls.toLowerCase().includes('histoire')) ? 'history' : 
                      file.targetClass.some((cls: string) => cls.toLowerCase().includes('géographie')) ? 'geography' : 'general')
                   : (file.targetClass?.toLowerCase().includes('histoire') ? 'history' : 
                      file.targetClass?.toLowerCase().includes('géographie') ? 'geography' : 'general')) as any,
          level: 'intermediate',
          url: file.filePath || '#',
          thumbnail: undefined,
          fileSize: file.fileSize,
          duration: undefined,
          author: file.uploader?.firstName ? `${file.uploader.firstName} ${file.uploader.lastName}` : 'Administration',
          createdAt: file.createdAt || new Date().toISOString(),
          updatedAt: file.updatedAt,
          tags: [],
          rating: 0,
          ratingsCount: 0,
          downloads: file.downloadCount || 0,
          views: 0,
          isFavorite: false,
          isBookmarked: false,
          isDownloaded: false,
          language: 'fr',
          difficulty: 2,
          format: file.fileType || 'Document',
        }));
        setResources(mapped);
        console.log(`✅ ${mapped.length} fichiers chargés pour la classe ${userClass}`);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des fichiers:', error);
        // Afficher un message d'erreur à l'utilisateur
        setResources([]);
      }
      setFolders([]);
    };
    load();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return FileText;
      case 'video': return Video;
      case 'audio': return Headphones;
      case 'image': return Image;
      case 'link': return Link;
      case 'interactive': return Target;
      default: return File;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'from-blue-500 to-indigo-600';
      case 'video': return 'from-red-500 to-pink-600';
      case 'audio': return 'from-green-500 to-emerald-600';
      case 'image': return 'from-purple-500 to-violet-600';
      case 'link': return 'from-orange-500 to-red-600';
      case 'interactive': return 'from-yellow-500 to-orange-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getFolderIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      history: History,
      flag: Flag,
      crown: Crown,
      globe: Globe,
      map: Map,
      star: Star,
      download: Download,
      folder: Folder
    };
    return icons[iconName] || Folder;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const toggleFavorite = (resourceId: string) => {
    setResources(prev => prev.map(resource =>
      resource.id === resourceId 
        ? { ...resource, isFavorite: !resource.isFavorite }
        : resource
    ));
  };

  const toggleBookmark = (resourceId: string) => {
    setResources(prev => prev.map(resource =>
      resource.id === resourceId 
        ? { ...resource, isBookmarked: !resource.isBookmarked }
        : resource
    ));
  };

  const getFilteredResources = () => {
    let filtered = [...resources];

    // Filtrage par dossier
    if (selectedFolder && selectedFolder !== 'all') {
      const folder = folders.find(f => f.id === selectedFolder);
      if (folder) {
        filtered = filtered.filter(resource => folder.resources.includes(resource.id));
      }
    }

    // Filtrage par recherche
    if (searchQuery) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filtrage par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    // Filtrage par matière
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(resource => resource.subject === selectedSubject);
    }

    // Filtrage par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    // Tri
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'size':
        filtered.sort((a, b) => (b.fileSize || 0) - (a.fileSize || 0));
        break;
    }

    return filtered;
  };

  const renderFolderTree = (folderId?: string, level: number = 0) => {
    const folderList = folders.filter(folder => folder.parentId === folderId);
    
    return folderList.map(folder => {
      const IconComponent = getFolderIcon(folder.icon);
      const hasChildren = folders.some(f => f.parentId === folder.id);
      
      return (
        <div key={folder.id}>
          <div
            onClick={() => {
              if (hasChildren) {
                setFolders(prev => prev.map(f =>
                  f.id === folder.id ? { ...f, isExpanded: !f.isExpanded } : f
                ));
              }
              setSelectedFolder(folder.id);
            }}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
              selectedFolder === folder.id
                ? 'bg-blue-500/20 text-blue-300'
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            }`}
            style={{ paddingLeft: `${12 + level * 20}px` }}
          >
            {hasChildren && (
              <button className="p-0.5">
                {folder.isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}
            <div className={`w-5 h-5 bg-gradient-to-br ${folder.color} rounded flex items-center justify-center`}>
              <IconComponent className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm truncate">{folder.name}</span>
            <span className="text-xs text-blue-400 ml-auto">
              {folder.resources.length}
            </span>
          </div>
          
          {folder.isExpanded && hasChildren && (
            <div>
              {renderFolderTree(folder.id, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const renderResourceCard = (resource: Resource) => {
    const TypeIcon = getTypeIcon(resource.type);
    
    return (
      <div
        key={resource.id}
        className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden transition-all hover:scale-105 hover:bg-white/15 cursor-pointer"
        onClick={() => {
          setSelectedResource(resource);
          setShowResourceModal(true);
        }}
      >
        {/* Thumbnail */}
        <div className={`h-32 bg-gradient-to-br ${getTypeColor(resource.type)} relative`}>
          {resource.thumbnail ? (
            <img
              src={resource.thumbnail}
              alt={resource.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <TypeIcon className="w-12 h-12 text-white" />
            </div>
          )}
          
          
          {/* Durée pour les vidéos/audios */}
          {resource.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {formatDuration(resource.duration)}
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4">
          <div className="mb-2">
            <h3 className="text-white font-semibold text-sm line-clamp-2">
              {resource.title}
            </h3>
          </div>
          
          <p className="text-blue-200 text-xs mb-3 line-clamp-2">
            {resource.description}
          </p>
          
          {/* Métadonnées */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-300">{resource.author}</span>
              <span className="text-blue-400">{resource.format}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              {resource.fileSize && (
                <span className="text-blue-400">{formatFileSize(resource.fileSize)}</span>
              )}
              <span className="text-blue-400">{resource.downloads} téléchargements</span>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="bg-white/10 text-blue-300 text-xs px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="text-blue-400 text-xs">+{resource.tags.length - 3}</span>
            )}
          </div>
          
          {/* Boutons d'action */}
          <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-white/10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(resource);
              }}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 rounded-lg transition-all text-xs font-medium"
            >
              <Download className="w-3 h-3" />
              <span>Télécharger</span>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenFile(resource);
              }}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 hover:text-green-200 rounded-lg transition-all text-xs font-medium"
            >
              <Eye className="w-3 h-3" />
              <span>Ouvrir</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderResourceList = (resource: Resource) => {
    const TypeIcon = getTypeIcon(resource.type);
    
    return (
      <div
        key={resource.id}
        className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 transition-all hover:bg-white/15 cursor-pointer"
        onClick={() => {
          setSelectedResource(resource);
          setShowResourceModal(true);
        }}
      >
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${getTypeColor(resource.type)} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <TypeIcon className="w-8 h-8 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white font-semibold text-lg truncate flex-1">
                {resource.title}
              </h3>
              <div className="flex items-center space-x-2 ml-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-yellow-400 text-sm">{resource.rating}</span>
                </div>
                {resource.isFavorite && (
                  <Heart className="w-4 h-4 text-red-400 fill-current" />
                )}
                {resource.isDownloaded && (
                  <Download className="w-4 h-4 text-green-400" />
                )}
              </div>
            </div>
            
            <p className="text-blue-200 text-sm mb-3 line-clamp-2">
              {resource.description}
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-blue-300">
              <span>{resource.author}</span>
              <span>{resource.format}</span>
              {resource.fileSize && <span>{formatFileSize(resource.fileSize)}</span>}
              {resource.duration && <span>{formatDuration(resource.duration)}</span>}
              <span>{resource.views} vues</span>
              <span>{resource.downloads} téléchargements</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(resource.id);
              }}
              className={`p-2 rounded-lg transition-all ${
                resource.isFavorite 
                  ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-500/20' 
                  : 'text-white/60 hover:text-white bg-white/10'
              }`}
            >
              <Heart className={`w-5 h-5 ${resource.isFavorite ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                  const response = await fetch(`${API_BASE}/files/${resource.id}/download`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                  });
                  
                  if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = resource.title;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } else {
                    console.error('Erreur lors du téléchargement');
                  }
                } catch (error) {
                  console.error('Erreur lors du téléchargement:', error);
                }
              }}
              className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:text-blue-300 hover:bg-blue-500/30 transition-all"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Logique de partage
              }}
              className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const filteredResources = getFilteredResources();

  return (
    <div className="h-full">
      <StudentFileNavigation />
    </div>
  );
};
          
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-400 text-sm"
            />
          </div>
        </div>

        {/* Dossiers */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {/* Tous les éléments */}
            <div
              onClick={() => setSelectedFolder('all')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                selectedFolder === 'all'
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Folder className="w-5 h-5" />
              <span className="text-sm">Toutes les ressources</span>
              <span className="text-xs text-blue-400 ml-auto">{resources.length}</span>
            </div>
            
            {/* Arbre des dossiers */}
            {renderFolderTree()}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Header avec filtres */}
        <div className="p-6 border-b border-white/20 bg-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-white text-2xl font-bold mb-2">
                {selectedFolder === 'all' 
                  ? 'Toutes les ressources' 
                  : folders.find(f => f.id === selectedFolder)?.name || 'Ressources'}
              </h1>
              <p className="text-blue-200">{filteredResources.length} ressource(s) trouvée(s)</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
              >
                <Filter className="w-4 h-4" />
                <span>Filtres</span>
              </button>
              
              <div className="flex items-center bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-blue-300 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-blue-300 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filtres détaillés */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-white/20">
              <div>
                <label className="block text-blue-200 text-sm mb-2">Catégorie</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                >
                  <option value="all">Toutes</option>
                  <option value="course">Cours</option>
                  <option value="exercise">Exercices</option>
                  <option value="reference">Référence</option>
                  <option value="multimedia">Multimédia</option>
                  <option value="tool">Outils</option>
                </select>
              </div>

              <div>
                <label className="block text-blue-200 text-sm mb-2">Matière</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                >
                  <option value="all">Toutes</option>
                  <option value="history">Histoire</option>
                  <option value="geography">Géographie</option>
                  <option value="both">Histoire-Géographie</option>
                  <option value="general">Général</option>
                </select>
              </div>

              <div>
                <label className="block text-blue-200 text-sm mb-2">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                >
                  <option value="all">Tous</option>
                  <option value="document">Documents</option>
                  <option value="video">Vidéos</option>
                  <option value="audio">Audio</option>
                  <option value="image">Images</option>
                  <option value="interactive">Interactif</option>
                  <option value="link">Liens</option>
                </select>
              </div>

              <div>
                <label className="block text-blue-200 text-sm mb-2">Trier par</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400"
                >
                  <option value="recent">Plus récents</option>
                  <option value="popular">Plus populaires</option>
                  <option value="rating">Mieux notés</option>
                  <option value="title">Alphabétique</option>
                  <option value="size">Taille</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Liste des ressources */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredResources.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-white text-xl font-bold mb-2">Aucune ressource trouvée</h3>
                <p className="text-blue-200">Essayez de modifier vos critères de recherche</p>
              </div>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {filteredResources.map(resource => 
                viewMode === 'grid' ? renderResourceCard(resource) : renderResourceList(resource)
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de détail de ressource */}
      {showResourceModal && selectedResource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-2xl font-bold">Détails de la ressource</h2>
              <button
                onClick={() => setShowResourceModal(false)}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Aperçu */}
              <div className="lg:col-span-2">
                <div className={`h-64 bg-gradient-to-br ${getTypeColor(selectedResource.type)} rounded-xl flex items-center justify-center mb-4`}>
                  {selectedResource.thumbnail ? (
                    <img
                      src={selectedResource.thumbnail}
                      alt={selectedResource.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    React.createElement(getTypeIcon(selectedResource.type), { className: "w-24 h-24 text-white" })
                  )}
                </div>
                
                <h3 className="text-white text-2xl font-bold mb-4">{selectedResource.title}</h3>
                <p className="text-blue-200 text-lg mb-6">{selectedResource.description}</p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedResource.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-500/20 text-blue-300 text-sm px-3 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleOpenFile(selectedResource)}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold transition-all"
                  >
                    <Eye className="w-5 h-5" />
                    <span>Ouvrir</span>
                  </button>
                  
                  <button 
                    onClick={() => handleDownload(selectedResource)}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold transition-all"
                  >
                    <Download className="w-5 h-5" />
                    <span>Télécharger</span>
                  </button>
                  
                  <button
                    onClick={() => toggleFavorite(selectedResource.id)}
                    className={`p-3 rounded-lg transition-all ${
                      selectedResource.isFavorite 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                        : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${selectedResource.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button className="p-3 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Informations */}
              <div className="space-y-6">
                {/* Métadonnées */}
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-3">Informations</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-200">Auteur</span>
                      <span className="text-white">{selectedResource.author}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">Type</span>
                      <span className="text-white">{selectedResource.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">Format</span>
                      <span className="text-white">{selectedResource.format}</span>
                    </div>
                    {selectedResource.fileSize && (
                      <div className="flex justify-between">
                        <span className="text-blue-200">Taille</span>
                        <span className="text-white">{formatFileSize(selectedResource.fileSize)}</span>
                      </div>
                    )}
                    {selectedResource.duration && (
                      <div className="flex justify-between">
                        <span className="text-blue-200">Durée</span>
                        <span className="text-white">{formatDuration(selectedResource.duration)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-blue-200">Langue</span>
                      <span className="text-white">{selectedResource.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">Niveau</span>
                      <span className="text-white">{selectedResource.level}</span>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="bg-white/10 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-3">Actions</h4>
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={() => handleDownload(selectedResource)}
                      className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 font-semibold"
                    >
                      <Download className="w-5 h-5" />
                      <span>Télécharger</span>
                    </button>
                    
                    <button
                      onClick={() => handleOpenFile(selectedResource)}
                      className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 font-semibold"
                    >
                      <Eye className="w-5 h-5" />
                      <span>Ouvrir</span>
                    </button>
                  </div>
                </div>
                
                {/* Prérequis */}
                {selectedResource.prerequisites && selectedResource.prerequisites.length > 0 && (
                  <div className="bg-white/10 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-3">Prérequis</h4>
                    <ul className="space-y-1">
                      {selectedResource.prerequisites.map((prereq, index) => (
                        <li key={index} className="text-blue-200 text-sm flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                          <span>{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesTab;


