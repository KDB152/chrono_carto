import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { DossiersService } from './dossiers.service';
import { SousDossiersService } from './sous-dossiers.service';
import { FichiersService } from './fichiers.service';
import { StudentsService } from '../students/students.service';
import { CreateDossierDto } from './dto/create-dossier.dto';
import { CreateSousDossierDto } from './dto/create-sous-dossier.dto';
import { CreateFichierDto } from './dto/create-fichier.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('new-structure')
@UseGuards(JwtAuthGuard)
export class NewStructureController {
  constructor(
    private readonly dossiersService: DossiersService,
    private readonly sousDossiersService: SousDossiersService,
    private readonly fichiersService: FichiersService,
    private readonly studentsService: StudentsService,
  ) {}

  // === DOSSERS ===
  @Post('dossiers')
  async createDossier(@Body() createDossierDto: CreateDossierDto, @Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Seuls les administrateurs peuvent créer des dossiers');
    }
    return this.dossiersService.create(createDossierDto);
  }

  @Get('dossiers')
  async findAllDossiers() {
    return this.dossiersService.findAll();
  }

  // Endpoint pour les étudiants - récupérer les dossiers accessibles selon leur classe
  @Get('student/dossiers')
  @UseGuards(JwtAuthGuard)
  async findDossiersForStudent(@Request() req) {
    // Récupérer la classe de l'étudiant depuis la base de données
    let userClass = req.user.class_level;
    
    // Si pas de class_level dans le token, récupérer depuis la base de données
    if (!userClass) {
      const student = await this.studentsService.findByUserId(req.user.sub);
      userClass = student?.class_level || 'Terminale groupe 1';
    }
    
    console.log(`?? Étudiant ${req.user.email} - Classe: ${userClass}`);
    
    // Récupérer tous les dossiers et filtrer selon la classe
    const allDossiers = await this.dossiersService.findAll();
    
    // Filtrer les dossiers qui contiennent la classe de l'étudiant
    const accessibleDossiers = allDossiers.filter(dossier => {
      if (!dossier.target_class) return false;
      
      try {
        const targetClasses = JSON.parse(dossier.target_class);
        const isAccessible = Array.isArray(targetClasses) && targetClasses.includes(userClass);
        console.log(`?? Dossier "${dossier.name}" (${dossier.target_class}) - Accessible: ${isAccessible}`);
        return isAccessible;
      } catch (error) {
        // Si ce n'est pas du JSON, comparer directement
        const isAccessible = dossier.target_class === userClass;
        console.log(`?? Dossier "${dossier.name}" (${dossier.target_class}) - Accessible: ${isAccessible}`);
        return isAccessible;
      }
    });
    
    console.log(`? ${accessibleDossiers.length} dossiers accessibles pour ${userClass}`);
    return accessibleDossiers;
  }

  @Get('dossiers/:id')
  async findOneDossier(@Param('id') id: string) {
    const dossierId = parseInt(id);
    if (isNaN(dossierId)) {
      throw new BadRequestException('ID de dossier invalide');
    }
    return this.dossiersService.findOne(dossierId);
  }

  @Patch('dossiers/:id')
  async updateDossier(@Param('id') id: string, @Body() updateData: Partial<CreateDossierDto>, @Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Seuls les administrateurs peuvent modifier des dossiers');
    }
    const dossierId = parseInt(id);
    if (isNaN(dossierId)) {
      throw new BadRequestException('ID de dossier invalide');
    }
    return this.dossiersService.update(dossierId, updateData);
  }

  @Delete('dossiers/:id')
  async removeDossier(@Param('id') id: string, @Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Seuls les administrateurs peuvent supprimer des dossiers');
    }
    const dossierId = parseInt(id);
    if (isNaN(dossierId)) {
      throw new BadRequestException('ID de dossier invalide');
    }
    await this.dossiersService.remove(dossierId);
    return { message: 'Dossier supprimé avec succès' };
  }

  // === SOUS-DOSSIERS ===
  @Post('sous-dossiers')
  async createSousDossier(@Body() createSousDossierDto: CreateSousDossierDto, @Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Seuls les administrateurs peuvent créer des sous-dossiers');
    }
    return this.sousDossiersService.create(createSousDossierDto);
  }

  @Get('dossiers/:dossierId/sous-dossiers')
  async findSousDossiersByDossier(@Param('dossierId') dossierId: string) {
    const id = parseInt(dossierId);
    if (isNaN(id)) {
      throw new BadRequestException('ID de dossier invalide');
    }
    return this.sousDossiersService.findByDossier(id);
  }

  // Endpoint pour les étudiants - accéder aux sous-dossiers d'un dossier
  @Get('student/dossiers/:id/sous-dossiers')
  @UseGuards(JwtAuthGuard)
  async findSousDossiersForStudent(@Param('id') id: string, @Request() req) {
    const dossierId = parseInt(id);
    if (isNaN(dossierId)) {
      throw new BadRequestException('ID de dossier invalide');
    }
    
    console.log(`?? [DEBUG] Student ${req.user.email} requesting sous-dossiers for dossier ${dossierId}`);
    console.log(`?? [DEBUG] User class_level from token:`, req.user.class_level);
    
    // Vérifier que l'étudiant a accès à ce dossier
    const dossier = await this.dossiersService.findOne(dossierId);
    if (!dossier) {
      console.log(`? [DEBUG] Dossier ${dossierId} not found`);
      throw new BadRequestException('Dossier non trouvé');
    }
    
    console.log(`?? [DEBUG] Dossier found:`, {
      id: dossier.id,
      name: dossier.name,
      target_class: dossier.target_class
    });
    
    const userClass = req.user.class_level || 'Terminale groupe 1';
    let hasAccess = false;
    
    if (dossier.target_class) {
      try {
        const targetClasses = JSON.parse(dossier.target_class);
        hasAccess = Array.isArray(targetClasses) && targetClasses.includes(userClass);
        console.log(`?? [DEBUG] Target classes (JSON):`, targetClasses);
        console.log(`?? [DEBUG] User class:`, userClass);
        console.log(`?? [DEBUG] Has access (JSON):`, hasAccess);
      } catch (error) {
        hasAccess = dossier.target_class === userClass;
        console.log(`?? [DEBUG] Target class (string):`, dossier.target_class);
        console.log(`?? [DEBUG] User class:`, userClass);
        console.log(`?? [DEBUG] Has access (string):`, hasAccess);
      }
    } else {
      console.log(`?? [DEBUG] Dossier has no target_class set`);
    }
    
    if (!hasAccess) {
      console.log(`? [DEBUG] Access denied for student ${req.user.email} to dossier ${dossierId}`);
      throw new BadRequestException('Accès non autorisé à ce dossier');
    }
    
    console.log(`? [DEBUG] Access granted, fetching sous-dossiers for dossier ${dossierId}`);
    return this.sousDossiersService.findByDossier(dossierId);
  }

  @Get('sous-dossiers/:id')
  async findOneSousDossier(@Param('id') id: string) {
    const sousDossierId = parseInt(id);
    if (isNaN(sousDossierId)) {
      throw new BadRequestException('ID de sous-dossier invalide');
    }
    return this.sousDossiersService.findOne(sousDossierId);
  }

  @Patch('sous-dossiers/:id')
  async updateSousDossier(@Param('id') id: string, @Body() updateData: Partial<CreateSousDossierDto>, @Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Seuls les administrateurs peuvent modifier des sous-dossiers');
    }
    const sousDossierId = parseInt(id);
    if (isNaN(sousDossierId)) {
      throw new BadRequestException('ID de sous-dossier invalide');
    }
    return this.sousDossiersService.update(sousDossierId, updateData);
  }

  @Delete('sous-dossiers/:id')
  async removeSousDossier(@Param('id') id: string, @Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Seuls les administrateurs peuvent supprimer des sous-dossiers');
    }
    const sousDossierId = parseInt(id);
    if (isNaN(sousDossierId)) {
      throw new BadRequestException('ID de sous-dossier invalide');
    }
    await this.sousDossiersService.remove(sousDossierId);
    return { message: 'Sous-dossier supprimé avec succès' };
  }

  // === FICHIERS ===
  @Post('fichiers')
  async createFichier(@Body() createFichierDto: CreateFichierDto, @Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Seuls les administrateurs peuvent créer des fichiers');
    }
    return this.fichiersService.create(createFichierDto);
  }

  @Get('sous-dossiers/:sousDossierId/fichiers')
  async findFichiersBySousDossier(@Param('sousDossierId') sousDossierId: string) {
    const id = parseInt(sousDossierId);
    if (isNaN(id)) {
      throw new BadRequestException('ID de sous-dossier invalide');
    }
    return this.fichiersService.findBySousDossier(id);
  }

  // Endpoint pour les étudiants - accéder aux fichiers d'un sous-dossier
  @Get('student/sous-dossiers/:id/fichiers')
  @UseGuards(JwtAuthGuard)
  async findFichiersForStudent(@Param('id') id: string, @Request() req) {
    const sousDossierId = parseInt(id);
    if (isNaN(sousDossierId)) {
      throw new BadRequestException('ID de sous-dossier invalide');
    }
    
    // Vérifier que l'étudiant a accès à ce sous-dossier via le dossier parent
    const sousDossier = await this.sousDossiersService.findOne(sousDossierId);
    if (!sousDossier) {
      throw new BadRequestException('Sous-dossier non trouvé');
    }
    
    const dossier = await this.dossiersService.findOne(sousDossier.dossier_id);
    if (!dossier) {
      throw new BadRequestException('Dossier parent non trouvé');
    }
    
    const userClass = req.user.class_level || 'Terminale groupe 1';
    let hasAccess = false;
    
    if (dossier.target_class) {
      try {
        const targetClasses = JSON.parse(dossier.target_class);
        hasAccess = Array.isArray(targetClasses) && targetClasses.includes(userClass);
      } catch (error) {
        hasAccess = dossier.target_class === userClass;
      }
    }
    
    if (!hasAccess) {
      throw new BadRequestException('Accès non autorisé à ce sous-dossier');
    }
    
    return this.fichiersService.findBySousDossier(sousDossierId);
  }

  @Get('fichiers/:id')
  async findOneFichier(@Param('id') id: string) {
    const fichierId = parseInt(id);
    if (isNaN(fichierId)) {
      throw new BadRequestException('ID de fichier invalide');
    }
    return this.fichiersService.findOne(fichierId);
  }

  @Patch('fichiers/:id')
  async updateFichier(@Param('id') id: string, @Body() updateData: Partial<CreateFichierDto>, @Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Seuls les administrateurs peuvent modifier des fichiers');
    }
    const fichierId = parseInt(id);
    if (isNaN(fichierId)) {
      throw new BadRequestException('ID de fichier invalide');
    }
    return this.fichiersService.update(fichierId, updateData);
  }

  @Delete('fichiers/:id')
  async removeFichier(@Param('id') id: string, @Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Seuls les administrateurs peuvent supprimer des fichiers');
    }
    const fichierId = parseInt(id);
    if (isNaN(fichierId)) {
      throw new BadRequestException('ID de fichier invalide');
    }
    await this.fichiersService.remove(fichierId);
    return { message: 'Fichier supprimé avec succès' };
  }

  // Endpoint de téléchargement pour les fichiers du nouveau système
  @Get('fichiers/:id/download')
  async downloadFichier(@Param('id') id: string, @Res() res: Response, @Request() req) {
    const fichierId = parseInt(id);
    if (isNaN(fichierId)) {
      throw new BadRequestException('ID de fichier invalide');
    }

    const fichier = await this.fichiersService.findOne(fichierId);
    if (!fichier) {
      throw new BadRequestException('Fichier non trouvé');
    }

    // Vérifier que l'étudiant a accès à ce fichier via le sous-dossier parent
    if (req.user.role === UserRole.STUDENT) {
      const sousDossier = await this.sousDossiersService.findOne(fichier.sous_dossier_id);
      if (!sousDossier) {
        throw new BadRequestException('Sous-dossier parent non trouvé');
      }

      const dossier = await this.dossiersService.findOne(sousDossier.dossier_id);
      if (!dossier) {
        throw new BadRequestException('Dossier parent non trouvé');
      }

      const userClass = req.user.class_level || 'Terminale groupe 1';
      let hasAccess = false;
      
      if (dossier.target_class) {
        try {
          const targetClasses = JSON.parse(dossier.target_class);
          hasAccess = Array.isArray(targetClasses) && targetClasses.includes(userClass);
        } catch (error) {
          hasAccess = dossier.target_class === userClass;
        }
      }
      
      if (!hasAccess) {
        throw new BadRequestException('Accès non autorisé à ce fichier');
      }
    }

    // Construire le chemin du fichier
    const filePath = path.join(process.cwd(), fichier.file_path);
    
    console.log('?? Recherche du fichier:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.log('? Fichier non trouvé:', filePath);
      throw new BadRequestException('Fichier non trouvé sur le serveur. Veuillez contacter l\'administrateur.');
    }

    // Incrémenter le compteur de téléchargements
    await this.fichiersService.incrementDownloadCount(fichierId);

    // Obtenir la taille réelle du fichier
    const stats = fs.statSync(filePath);
    
    // Déterminer le type MIME
    const ext = path.extname(fichier.file_name).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.mp4') contentType = 'video/mp4';
    else if (ext === '.mp3') contentType = 'audio/mpeg';
    else if (ext === '.doc') contentType = 'application/msword';
    else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else if (ext === '.xls') contentType = 'application/vnd.ms-excel';
    else if (ext === '.xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    // Configurer les headers de réponse
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    const encodedFileName = encodeURIComponent(fichier.file_name);
    res.setHeader('Content-Disposition', `attachment; filename="${fichier.file_name}"; filename*=UTF-8''${encodedFileName}`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Envoyer le fichier
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  // === UPLOAD DE FICHIERS ===
  @Post('fichiers/upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 100 * 1024 * 1024,
    }
  }))
  async uploadFichier(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('sous_dossier_id') sousDossierId: string,
    @Request() req
  ) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Seuls les administrateurs peuvent uploader des fichiers');
    }

    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    if (!title) {
      throw new BadRequestException('Le titre est requis');
    }

    if (!sousDossierId) {
      throw new BadRequestException('L\'ID du sous-dossier est requis');
    }

    const sousDossierIdNum = parseInt(sousDossierId);
    if (isNaN(sousDossierIdNum)) {
      throw new BadRequestException('ID de sous-dossier invalide');
    }

    // Vérifier que le sous-dossier existe
    const sousDossier = await this.sousDossiersService.findOne(sousDossierIdNum);
    if (!sousDossier) {
      throw new BadRequestException('Sous-dossier non trouvé');
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.originalname.split('.').pop();
    const storedName = `${timestamp}_${randomString}.${fileExtension}`;
    
    // Créer le dossier de stockage s'il n'existe pas
    const uploadDir = path.join(process.cwd(), 'uploads', 'fichiers');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Créer le chemin de stockage
    const uploadPath = `uploads/fichiers/${storedName}`;
    const fullPath = path.join(process.cwd(), uploadPath);
    
    // Sauvegarder le fichier
    fs.writeFileSync(fullPath, file.buffer);
    
    // Créer l'entrée dans la base de données
    const createFichierDto = {
      title,
      sous_dossier_id: sousDossierIdNum,
      description: description || '',
      file_name: file.originalname,
      stored_name: storedName,
      file_path: uploadPath,
      file_type: file.mimetype,
      file_size: file.size,
      download_count: 0
    };

    return this.fichiersService.create(createFichierDto);
  }
}
