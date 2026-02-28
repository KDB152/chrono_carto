// src/config/multer.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('multer', () => ({
  dest: './uploads',
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // Vérifier le type de fichier pour les images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers image sont autorisés'), false);
    }
  },
}));
