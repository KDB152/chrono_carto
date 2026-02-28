import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Dossier } from './dossier.entity';
import { Fichier } from './fichier.entity';

@Entity('sous_dossiers')
export class SousDossier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, comment: 'Nom du sous-dossier' })
  name: string;

  @Column({ type: 'int', comment: 'ID du dossier parent (dossiers)' })
  dossier_id: number;

  @Column({ type: 'text', nullable: true, comment: 'Description du sous-dossier' })
  description: string;

  @Column({ type: 'int', nullable: true, comment: 'ID du sous-dossier parent (pour hiérarchie)' })
  sous_dossier_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Dossier, dossier => dossier.sous_dossiers)
  @JoinColumn({ name: 'dossier_id' })
  dossier: Dossier;

  @ManyToOne(() => SousDossier, sousDossier => sousDossier.children)
  @JoinColumn({ name: 'sous_dossier_id' })
  parent: SousDossier;

  @OneToMany(() => SousDossier, sousDossier => sousDossier.parent)
  children: SousDossier[];

  @OneToMany(() => Fichier, fichier => fichier.sous_dossier)
  fichiers: Fichier[];
}
