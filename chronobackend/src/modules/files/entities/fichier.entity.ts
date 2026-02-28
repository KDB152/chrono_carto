import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SousDossier } from './sous-dossier.entity';

@Entity('fichiers')
export class Fichier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, comment: 'Titre du fichier' })
  title: string;

  @Column({ type: 'int', comment: 'ID du sous-dossier parent' })
  sous_dossier_id: number;

  @Column({ type: 'text', nullable: true, comment: 'Description du fichier' })
  description: string;

  @Column({ type: 'varchar', length: 255, comment: 'Nom du fichier original' })
  file_name: string;

  @Column({ type: 'varchar', length: 255, comment: 'Nom de stockage' })
  stored_name: string;

  @Column({ type: 'varchar', length: 500, comment: 'Chemin du fichier' })
  file_path: string;

  @Column({ type: 'varchar', length: 100, comment: 'Type MIME du fichier' })
  file_type: string;

  @Column({ type: 'bigint', comment: 'Taille du fichier en bytes' })
  file_size: number;

  @Column({ type: 'int', default: 0, comment: 'Nombre de téléchargements' })
  download_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => SousDossier, sousDossier => sousDossier.fichiers)
  @JoinColumn({ name: 'sous_dossier_id' })
  sous_dossier: SousDossier;
}
