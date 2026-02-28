// Utilitaires pour la gestion des fichiers

/**
 * Détermine l'extension de fichier basée sur le type MIME
 */
export function getFileExtensionFromMimeType(mimeType: string): string {
  const mimeToExtension: { [key: string]: string } = {
    'application/x-msdownload': '.exe',
    'application/octet-stream': '.bin',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
    'video/avi': '.avi',
    'video/quicktime': '.mov',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
    'application/zip': '.zip',
    'application/x-rar-compressed': '.rar',
    'application/x-7z-compressed': '.7z'
  };

  return mimeToExtension[mimeType] || '';
}

/**
 * S'assure qu'un nom de fichier a la bonne extension
 */
export function ensureFileExtension(fileName: string, mimeType: string): string {
  // Si le fichier a déjà une extension, la garder
  if (fileName.includes('.')) {
    return fileName;
  }

  // Ajouter l'extension basée sur le type MIME
  const extension = getFileExtensionFromMimeType(mimeType);
  return extension ? `${fileName}${extension}` : fileName;
}

/**
 * Nettoie un nom de fichier pour le téléchargement
 */
export function cleanFileNameForDownload(fileName: string): string {
  // Remplacer les caractères problématiques
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_') // Caractères interdits dans les noms de fichiers Windows
    .replace(/\s+/g, '_') // Remplacer les espaces par des underscores
    .trim();
}

/**
 * Vérifie si un fichier est exécutable
 */
export function isExecutableFile(fileName: string, mimeType: string): boolean {
  const executableExtensions = ['.exe', '.msi', '.bat', '.cmd', '.com', '.scr'];
  const executableMimeTypes = ['application/x-msdownload', 'application/x-msi'];
  
  const hasExecutableExtension = executableExtensions.some(ext => 
    fileName.toLowerCase().endsWith(ext)
  );
  
  const hasExecutableMimeType = executableMimeTypes.includes(mimeType);
  
  return hasExecutableExtension || hasExecutableMimeType;
}

/**
 * Génère un nom de fichier de téléchargement sécurisé
 */
export function generateDownloadFileName(originalName: string, mimeType: string): string {
  let fileName = cleanFileNameForDownload(originalName);
  fileName = ensureFileExtension(fileName, mimeType);
  return fileName;
}

/**
 * Détermine le type de fichier à afficher dans l'interface
 */
export function getDisplayFileType(fileName: string, mimeType: string): string {
  // Vérifier par extension de fichier d'abord
  if (fileName.toLowerCase().endsWith('.exe')) {
    return 'EXE';
  }
  if (fileName.toLowerCase().endsWith('.msi')) {
    return 'MSI';
  }
  if (fileName.toLowerCase().endsWith('.pdf')) {
    return 'PDF';
  }
  if (fileName.toLowerCase().endsWith('.doc') || fileName.toLowerCase().endsWith('.docx')) {
    return 'DOC';
  }
  if (fileName.toLowerCase().endsWith('.xls') || fileName.toLowerCase().endsWith('.xlsx')) {
    return 'XLS';
  }
  if (fileName.toLowerCase().endsWith('.ppt') || fileName.toLowerCase().endsWith('.pptx')) {
    return 'PPT';
  }
  if (fileName.toLowerCase().endsWith('.mp4')) {
    return 'MP4';
  }
  if (fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg')) {
    return 'JPG';
  }
  if (fileName.toLowerCase().endsWith('.png')) {
    return 'PNG';
  }
  if (fileName.toLowerCase().endsWith('.zip')) {
    return 'ZIP';
  }
  if (fileName.toLowerCase().endsWith('.rar')) {
    return 'RAR';
  }
  
  // Fallback sur le type MIME
  if (mimeType === 'application/x-msdownload') {
    return 'EXE';
  }
  if (mimeType === 'application/pdf') {
    return 'PDF';
  }
  if (mimeType.startsWith('video/')) {
    return 'VIDEO';
  }
  if (mimeType.startsWith('image/')) {
    return 'IMAGE';
  }
  if (mimeType.startsWith('audio/')) {
    return 'AUDIO';
  }
  
  // Par défaut, utiliser la partie après le slash du MIME type
  return mimeType.split('/')[1]?.toUpperCase() || 'FILE';
}

