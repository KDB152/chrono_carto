import { Controller, Get } from '@nestjs/common';
import { FoldersService } from './folders.service';

@Controller('test')
export class TestFoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Get('folders')
  async testFolders() {
    try {
      console.log('🧪 Test des dossiers sans authentification...');
      const folders = await this.foldersService.findAll();
      console.log('✅ Test réussi - Dossiers trouvés:', folders.length);
      return { success: true, count: folders.length, folders };
    } catch (error) {
      console.error('❌ Erreur dans testFolders:', error);
      return { success: false, error: error.message };
    }
  }
}
