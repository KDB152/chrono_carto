import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  UseInterceptors, 
  UploadedFile, 
  UseGuards, 
  Req, 
  Res,
  Param,
  ParseIntPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PdpService } from './pdp.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('pdp')
@UseGuards(JwtAuthGuard)
export class PdpController {
  constructor(private readonly pdpService: PdpService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('profilePicture', {
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Type de fichier non autorisé'), false);
      }
    }
  }))
  async uploadProfilePicture(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    const userId = req.user.id;
    const pdp = await this.pdpService.uploadProfilePicture(userId, file);
    
    return {
      success: true,
      message: 'Photo de profil uploadée avec succès',
      data: {
        id: pdp.id,
        fileName: pdp.fileName,
        fileType: pdp.fileType,
        fileSize: pdp.fileSize,
        url: await this.pdpService.getProfilePictureUrl(userId)
      }
    };
  }

  @Get('me')
  async getMyProfilePicture(@Req() req: any) {
    const userId = req.user.id;
    const pdp = await this.pdpService.getProfilePicture(userId);
    
    if (!pdp) {
      return {
        success: false,
        message: 'Aucune photo de profil trouvée',
        data: null
      };
    }

    return {
      success: true,
      data: {
        id: pdp.id,
        fileName: pdp.fileName,
        fileType: pdp.fileType,
        fileSize: pdp.fileSize,
        url: await this.pdpService.getProfilePictureUrl(userId),
        createdAt: pdp.createdAt
      }
    };
  }

  @Get('user/:userId')
  async getUserProfilePicture(@Param('userId', ParseIntPipe) userId: number) {
    const pdp = await this.pdpService.getProfilePicture(userId);
    
    if (!pdp) {
      return {
        success: false,
        message: 'Aucune photo de profil trouvée',
        data: null
      };
    }

    return {
      success: true,
      data: {
        id: pdp.id,
        fileName: pdp.fileName,
        fileType: pdp.fileType,
        fileSize: pdp.fileSize,
        url: await this.pdpService.getProfilePictureUrl(userId),
        createdAt: pdp.createdAt
      }
    };
  }

  @Get('serve/:userId')
  async serveProfilePicture(
    @Param('userId', ParseIntPipe) userId: number,
    @Res() res: Response
  ) {
    const pdp = await this.pdpService.getProfilePicture(userId);
    
    if (!pdp || !fs.existsSync(pdp.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Photo de profil non trouvée'
      });
    }

    // Définir le type de contenu approprié
    let contentType = 'image/jpeg';
    switch (pdp.fileType) {
      case 'PNG':
        contentType = 'image/png';
        break;
      case 'SVG':
        contentType = 'image/svg+xml';
        break;
      case 'GIF':
        contentType = 'image/gif';
        break;
      case 'WebP':
        contentType = 'image/webp';
        break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 an
    
    const fileStream = fs.createReadStream(pdp.filePath);
    fileStream.pipe(res);
  }

  @Delete('me')
  async deleteMyProfilePicture(@Req() req: any) {
    const userId = req.user.id;
    await this.pdpService.deleteProfilePicture(userId);
    
    return {
      success: true,
      message: 'Photo de profil supprimée avec succès'
    };
  }
}
