import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>,
  ) {}

  async create(createFileDto: CreateFileDto, uploadedBy: number): Promise<File> {
    const file = this.filesRepository.create({
      ...createFileDto,
      uploadedBy,
    });

    return this.filesRepository.save(file);
  }

  async findAll(): Promise<File[]> {
    return this.filesRepository.find({
      where: { isActive: true },
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });
  }


  async findOne(id: number): Promise<File> {
    const file = await this.filesRepository.findOne({
      where: { id, isActive: true },
      relations: ['uploader'],
    });

    if (!file) {
      throw new NotFoundException(`Fichier avec l'ID ${id} non trouvé`);
    }

    return file;
  }

  async update(id: number, updateFileDto: UpdateFileDto): Promise<File> {
    const file = await this.findOne(id);
    
    // Appliquer les modifications
    Object.assign(file, updateFileDto);
    
    console.log(`📝 Mise à jour du fichier ID ${id}:`, {
      title: file.title
    });
    
    return this.filesRepository.save(file);
  }

  async remove(id: number): Promise<void> {
    const file = await this.findOne(id);
    
    // Supprimer le fichier physique du serveur
    try {
      if (file.filePath && require('fs').existsSync(file.filePath)) {
        require('fs').unlinkSync(file.filePath);
        console.log(`🗑️ Fichier physique supprimé: ${file.filePath}`);
      }
    } catch (error) {
      console.warn(`⚠️ Impossible de supprimer le fichier physique: ${error.message}`);
    }
    
    // Supprimer l'enregistrement de la base de données
    await this.filesRepository.remove(file);
    console.log(`🗑️ Fichier supprimé de la base de données: ID ${id}`);
  }

  async incrementDownloadCount(id: number): Promise<void> {
    await this.filesRepository.increment({ id }, 'downloadCount', 1);
  }


  async getFileStats(): Promise<{
    totalFiles: number;
    totalDownloads: number;
  }> {
    const totalFiles = await this.filesRepository.count({
      where: { isActive: true }
    });

    const totalDownloads = await this.filesRepository
      .createQueryBuilder('file')
      .select('SUM(file.downloadCount)', 'total')
      .where('file.isActive = :isActive', { isActive: true })
      .getRawOne();

    return {
      totalFiles,
      totalDownloads: parseInt(totalDownloads.total) || 0,
    };
  }
}