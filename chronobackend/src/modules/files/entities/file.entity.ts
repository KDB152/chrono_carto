import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, comment: 'Titre du fichier' })
  title: string;

  @Column({ type: 'text', nullable: true, comment: 'Description du fichier' })
  description: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255, comment: 'Nom du fichier original' })
  fileName: string;

  @Column({ name: 'stored_name', type: 'varchar', length: 255, comment: 'Nom du fichier stocké' })
  storedName: string;

  @Column({ name: 'file_path', type: 'varchar', length: 500, comment: 'Chemin du fichier sur le serveur' })
  filePath: string;

  @Column({ name: 'file_type', type: 'varchar', length: 100, comment: 'Type MIME du fichier' })
  fileType: string;

  @Column({ name: 'file_size', type: 'bigint', comment: 'Taille du fichier en octets' })
  fileSize: number;


  @Column({ name: 'uploaded_by', type: 'int', comment: 'ID de l\'utilisateur qui a uploadé le fichier' })
  uploadedBy: number;

  @Column({ name: 'is_public', type: 'boolean', default: false, comment: 'Fichier public ou privé' })
  isPublic: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true, comment: 'Fichier actif ou supprimé' })
  isActive: boolean;

  @Column({ name: 'download_count', type: 'int', default: 0, comment: 'Nombre de téléchargements' })
  downloadCount: number;

  @CreateDateColumn({ name: 'created_at', comment: 'Date d\'upload' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: 'Date de mise à jour' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;
}