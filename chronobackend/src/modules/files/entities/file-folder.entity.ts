import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { File } from './file.entity';
import { Folder } from './folder.entity';

@Entity('file_folders')
export class FileFolder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'file_id', type: 'int', comment: 'ID du fichier' })
  fileId: number;

  @Column({ name: 'folder_id', type: 'int', comment: 'ID du dossier' })
  folderId: number;

  @CreateDateColumn({ name: 'created_at', comment: 'Date d\'ajout du fichier au dossier' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => File, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: File;

  @ManyToOne(() => Folder, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'folder_id' })
  folder: Folder;
}
