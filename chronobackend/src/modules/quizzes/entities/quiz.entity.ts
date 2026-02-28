import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type QuizStatus = 'Publié' | 'Brouillon' | 'Archivé';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 100 })
  subject: string; // ex: Histoire, Géographie

  @Column({ length: 50, nullable: true })
  level?: string; // ex: Seconde, Première, Terminale

  @Column({ type: 'int', default: 10 })
  duration: number; // minutes

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  average_score: number;

  @Column({ type: 'varchar', length: 20, default: 'Brouillon' })
  status: QuizStatus;

  @Column({ default: false })
  is_time_limited: boolean;

  @Column({ default: false })
  allow_retake: boolean;

  @Column({ default: true })
  show_results: boolean;

  @Column({ type: 'json', nullable: true })
  target_groups?: string[]; // ex: ['Terminale groupe 1', 'Terminale groupe 2']

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
