import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { SousDossier } from './sous-dossier.entity';

@Entity('dossiers')
export class Dossier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, comment: 'Nom du dossier global' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: 'Description du dossier' })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Classes cibles (JSON)' })
  target_class: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => SousDossier, sousDossier => sousDossier.dossier)
  sous_dossiers: SousDossier[];
}
