import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { FoldersService } from './folders.service';
import { DossiersService } from './dossiers.service';
import { SousDossiersService } from './sous-dossiers.service';
import { FichiersService } from './fichiers.service';
import { StudentsService } from '../students/students.service';
import { FilesController } from './files.controller';
import { TestFoldersController } from './test-folders.controller';
import { PublicFoldersController } from './public-folders.controller';
import { TrulyPublicFoldersController } from './truly-public-folders.controller';
import { NewStructureController } from './new-structure.controller';
import { File } from './entities/file.entity';
import { Folder } from './entities/folder.entity';
import { FileFolder } from './entities/file-folder.entity';
import { Dossier } from './entities/dossier.entity';
import { SousDossier } from './entities/sous-dossier.entity';
import { Fichier } from './entities/fichier.entity';
import { Student } from '../students/entities/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File, Folder, FileFolder, Dossier, SousDossier, Fichier, Student])],
  controllers: [FilesController, TestFoldersController, PublicFoldersController, TrulyPublicFoldersController, NewStructureController],
  providers: [FilesService, FoldersService, DossiersService, SousDossiersService, FichiersService, StudentsService],
  exports: [FilesService, FoldersService, DossiersService, SousDossiersService, FichiersService],
})
export class FilesModule {}
