import { Controller, Get } from '@nestjs/common';
import { FoldersService } from './folders.service';

@Controller('public/files')
export class PublicFoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Get('folders')
  async getFolders() {
    try {
      console.log('🌐 Récupération des dossiers (public)...');
      const folders = await this.foldersService.findAll();
      console.log('🌐 Dossiers trouvés:', folders.length);
      return folders;
    } catch (error) {
      console.error('❌ Erreur dans getFolders:', error);
      throw error;
    }
  }
}
