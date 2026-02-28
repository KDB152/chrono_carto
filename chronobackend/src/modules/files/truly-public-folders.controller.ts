import { Controller, Get } from '@nestjs/common';
import { FoldersService } from './folders.service';

@Controller('api/public')
export class TrulyPublicFoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Get('folders')
  async getFolders() {
    try {
      console.log('🌐 Récupération des dossiers (vraiment public)...');
      const folders = await this.foldersService.findAll();
      console.log('🌐 Dossiers trouvés:', folders.length);
      return folders;
    } catch (error) {
      console.error('❌ Erreur dans getFolders (public):', error);
      throw error;
    }
  }
}
