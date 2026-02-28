'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';

interface ProfilePictureUploadProps {
  userId: number;
  currentImageUrl?: string;
  onImageChange: (imageUrl: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSaveButton?: boolean;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  userId,
  currentImageUrl,
  onImageChange,
  size = 'md',
  className = '',
  showSaveButton = true
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mettre à jour l'image quand currentImageUrl change
  useEffect(() => {
    setPreviewUrl(currentImageUrl || null);
    setHasUnsavedChanges(false);
  }, [currentImageUrl]);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Type de fichier non autorisé. Formats acceptés: JPEG, PNG, SVG, GIF, WebP');
      return;
    }

    // Vérifier la taille (10 Mo max)
    const maxSize = 10 * 1024 * 1024; // 10 Mo
    if (file.size > maxSize) {
      alert('Fichier trop volumineux. Taille maximum: 10 Mo');
      return;
    }

    // Créer une URL de prévisualisation temporaire
    const tempUrl = URL.createObjectURL(file);
    setTempImageUrl(tempUrl);
    setPreviewUrl(tempUrl);
    setHasUnsavedChanges(true);
    
    // Stocker le fichier pour l'upload ultérieur
    (fileInputRef.current as any).selectedFile = file;
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveImage = async () => {
    const file = (fileInputRef.current as any)?.selectedFile;
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      // Essayer d'abord le backend
      let response;
      try {
        response = await fetch(`${API_BASE}/pdp/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
      } catch (backendError) {
        console.log('⚠️ Backend non accessible, utilisation du fallback frontend');
        // Fallback vers l'endpoint frontend
        response = await fetch('/api/profile-picture/upload', {
          method: 'POST',
          body: formData,
        });
      }

      if (response.ok) {
        const result = await response.json();
        const newImageUrl = result.data.url;
        
        setPreviewUrl(newImageUrl);
        onImageChange(newImageUrl);
        setHasUnsavedChanges(false);
        
        // Nettoyer l'URL temporaire
        if (tempImageUrl) {
          URL.revokeObjectURL(tempImageUrl);
          setTempImageUrl(null);
        }
        
        console.log('✅ Photo de profil sauvegardée avec succès');
        alert('Photo de profil sauvegardée avec succès !');
      } else {
        const error = await response.json();
        alert(`Erreur lors de la sauvegarde: ${error.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la photo de profil');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelChanges = () => {
    // Restaurer l'image précédente
    setPreviewUrl(currentImageUrl || null);
    setHasUnsavedChanges(false);
    
    // Nettoyer l'URL temporaire
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
    
    // Réinitialiser le fichier sélectionné
    (fileInputRef.current as any).selectedFile = null;
  };

  const handleRemoveImage = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const response = await fetch(`${API_BASE}/pdp/me`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPreviewUrl(null);
        onImageChange(null);
        setHasUnsavedChanges(false);
        
        // Nettoyer l'URL temporaire si elle existe
        if (tempImageUrl) {
          URL.revokeObjectURL(tempImageUrl);
          setTempImageUrl(null);
        }
        
        console.log('✅ Photo de profil supprimée avec succès');
        alert('Photo de profil supprimée avec succès !');
      } else {
        alert('Erreur lors de la suppression de la photo de profil');
      }
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      alert('Erreur lors de la suppression de la photo de profil');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Photo de profil */}
      <div 
        className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center cursor-pointer group relative overflow-hidden transition-all hover:scale-105`}
        onClick={handleClick}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Photo de profil"
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <User className="w-8 h-8 text-white" />
        )}

        {/* Overlay au survol */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
          <Camera className="w-6 h-6 text-white" />
        </div>

        {/* Indicateur de chargement */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Bouton de suppression */}
      {previewUrl && !isUploading && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveImage();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
          title="Supprimer la photo de profil"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/svg+xml,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Texte d'aide */}
      <p className="text-xs text-blue-200 mt-2 text-center">
        Cliquez pour changer
      </p>

      {/* Boutons d'action pour les changements non sauvegardés */}
      {hasUnsavedChanges && showSaveButton && (
        <div className="mt-3 flex space-x-2">
          <button
            onClick={handleSaveImage}
            disabled={isUploading}
            className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-sm rounded-lg transition-colors flex items-center justify-center space-x-1"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sauvegarde...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Enregistrer</span>
              </>
            )}
          </button>
          <button
            onClick={handleCancelChanges}
            disabled={isUploading}
            className="px-3 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white text-sm rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;


