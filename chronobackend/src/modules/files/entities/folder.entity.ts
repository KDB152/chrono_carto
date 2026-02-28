import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { FileFolder } from './file-folder.entity';

@Entity('folders')
export class Folder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, comment: 'Nom du dossier' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: 'Description du dossier' })
  description: string;

  @Column({ name: 'parent_id', type: 'int', nullable: true, comment: 'ID du dossier parent (null pour la racine)' })
  parentId: number;

  @Column({ name: 'created_by', type: 'int', comment: 'ID de l\'utilisateur qui a créé le dossier' })
  createdBy: number;

  @Column({ name: 'is_global', type: 'boolean', default: false, comment: 'Dossier global accessible à tous' })
  isGlobal: boolean;

  @Column({ 
    name: 'target_classes', 
    type: 'json', 
    nullable: true, 
    comment: 'Classes cibles du dossier (JSON array)',
    transformer: {
      to: (value: string[]) => value ? JSON.stringify(value) : null,
      from: (value: string | string[]) => {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return [];
          }
        }
        return Array.isArray(value) ? value : [];
      }
    }
  })
  targetClasses: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true, comment: 'Dossier actif ou supprimé' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', comment: 'Date de création' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: 'Date de mise à jour' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => Folder, folder => folder.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Folder;

  @OneToMany(() => Folder, folder => folder.parent)
  children: Folder[];

  @OneToMany(() => FileFolder, fileFolder => fileFolder.folder)
  fileFolders: FileFolder[];
}
