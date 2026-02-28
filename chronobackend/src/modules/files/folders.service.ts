import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Folder } from './entities/folder.entity';
import { FileFolder } from './entities/file-folder.entity';
import { File } from './entities/file.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { AddFileToFolderDto } from './dto/add-file-to-folder.dto';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(Folder)
    private foldersRepository: Repository<Folder>,
    @InjectRepository(FileFolder)
    private fileFoldersRepository: Repository<FileFolder>,
    @InjectRepository(File)
    private filesRepository: Repository<File>,
  ) {}

  async create(createFolderDto: CreateFolderDto, createdBy: number): Promise<Folder> {
    // Vérifier que le dossier parent existe si spécifié
    if (createFolderDto.parentId) {
      const parentFolder = await this.foldersRepository.findOne({
        where: { id: createFolderDto.parentId, isActive: true }
      });
      if (!parentFolder) {
        throw new NotFoundException('Dossier parent non trouvé');
      }
    }

    const folder = this.foldersRepository.create({
      ...createFolderDto,
      createdBy,
    });

    return this.foldersRepository.save(folder);
  }

  async findAll(): Promise<Folder[]> {
    console.log('🔍 findAll() - Début de la requête');
    try {
      // Requête très simple sans relations
      const folders = await this.foldersRepository.find({
        where: { isActive: true },
        order: { createdAt: 'DESC' },
      });
      console.log('✅ findAll() - Dossiers trouvés:', folders.length);
      
      // Retourner les dossiers sans relations pour l'instant
      return folders;
    } catch (error) {
      console.error('❌ findAll() - Erreur:', error.message);
      console.error('❌ findAll() - Stack:', error.stack);
      throw error;
    }
  }

  async findByParent(parentId: number | null): Promise<Folder[]> {
    // Validation pour éviter NaN
    if (parentId !== null && (isNaN(parentId) || parentId < 0)) {
      throw new BadRequestException('ID de dossier parent invalide');
    }
    
    const whereCondition = parentId === null 
      ? { parentId: null, isActive: true }
      : { parentId, isActive: true };
      
    return this.foldersRepository.find({
      where: whereCondition,
      relations: ['creator', 'parent', 'children'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Folder> {
    // Validation pour éviter NaN
    if (isNaN(id) || id < 0) {
      throw new BadRequestException('ID de dossier invalide');
    }
    
    const folder = await this.foldersRepository.findOne({
      where: { id, isActive: true },
      relations: ['creator', 'parent', 'children', 'fileFolders', 'fileFolders.file'],
    });

    if (!folder) {
      throw new NotFoundException(`Dossier avec l'ID ${id} non trouvé`);
    }

    return folder;
  }

  async update(id: number, updateFolderDto: UpdateFolderDto): Promise<Folder> {
    const folder = await this.findOne(id);
    
    // Vérifier que le nouveau dossier parent existe si spécifié
    if (updateFolderDto.parentId) {
      const parentFolder = await this.foldersRepository.findOne({
        where: { id: updateFolderDto.parentId, isActive: true }
      });
      if (!parentFolder) {
        throw new NotFoundException('Dossier parent non trouvé');
      }
      
      // Vérifier qu'on ne crée pas une boucle (un dossier ne peut pas être son propre parent)
      if (updateFolderDto.parentId === id) {
        throw new BadRequestException('Un dossier ne peut pas être son propre parent');
      }
    }

    Object.assign(folder, updateFolderDto);
    return this.foldersRepository.save(folder);
  }

  async remove(id: number): Promise<void> {
    const folder = await this.findOne(id);
    
    // Vérifier qu'il n'y a pas de sous-dossiers
    const children = await this.foldersRepository.find({
      where: { parentId: id, isActive: true }
    });
    
    if (children.length > 0) {
      throw new BadRequestException('Impossible de supprimer un dossier contenant des sous-dossiers');
    }

    // Supprimer les associations avec les fichiers
    await this.fileFoldersRepository.delete({ folderId: id });
    
    // Marquer le dossier comme inactif au lieu de le supprimer
    folder.isActive = false;
    await this.foldersRepository.save(folder);
  }

  async addFilesToFolder(folderId: number, addFileToFolderDto: AddFileToFolderDto): Promise<void> {
    const folder = await this.findOne(folderId);
    
    // Vérifier que tous les fichiers existent
    const files = await this.filesRepository.find({
      where: addFileToFolderDto.fileIds.map(id => ({ id, isActive: true }))
    });
    
    if (files.length !== addFileToFolderDto.fileIds.length) {
      throw new BadRequestException('Un ou plusieurs fichiers non trouvés');
    }

    // Créer les associations
    const fileFolders = addFileToFolderDto.fileIds.map(fileId => 
      this.fileFoldersRepository.create({
        fileId,
        folderId,
      })
    );

    await this.fileFoldersRepository.save(fileFolders);
  }

  async removeFileFromFolder(folderId: number, fileId: number): Promise<void> {
    const fileFolder = await this.fileFoldersRepository.findOne({
      where: { folderId, fileId }
    });

    if (!fileFolder) {
      throw new NotFoundException('Fichier non trouvé dans ce dossier');
    }

    await this.fileFoldersRepository.remove(fileFolder);
  }

  async getFolderContents(folderId: number): Promise<{
    folders: Folder[];
    files: File[];
  }> {
    // Validation pour éviter NaN
    if (isNaN(folderId) || folderId < 0) {
      throw new BadRequestException('ID de dossier invalide');
    }
    
    const folder = await this.findOne(folderId);
    
    // Récupérer les sous-dossiers
    const folders = await this.foldersRepository.find({
      where: { parentId: folderId, isActive: true },
      relations: ['creator'],
      order: { name: 'ASC' },
    });

    // Récupérer les fichiers du dossier
    const fileFolders = await this.fileFoldersRepository.find({
      where: { folderId },
      relations: ['file', 'file.uploader'],
    });

    const files = fileFolders.map(ff => ff.file);

    return { folders, files };
  }

  async getFolderTree(): Promise<Folder[]> {
    // Récupérer tous les dossiers racines (sans parent)
    const rootFolders = await this.foldersRepository.find({
      where: { parentId: null, isActive: true },
      relations: ['creator', 'children'],
      order: { name: 'ASC' },
    });

    // Récursivement charger les sous-dossiers
    const loadChildren = async (folders: Folder[]): Promise<Folder[]> => {
      for (const folder of folders) {
        folder.children = await this.foldersRepository.find({
          where: { parentId: folder.id, isActive: true },
          relations: ['creator'],
          order: { name: 'ASC' },
        });
        
        if (folder.children.length > 0) {
          await loadChildren(folder.children);
        }
      }
      return folders;
    };

    return loadChildren(rootFolders);
  }
}
