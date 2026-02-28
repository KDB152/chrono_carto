import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('study_sessions')
export class StudySession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'varchar', length: 100 })
  subject: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  target_class: string;

  @Column({ type: 'varchar', length: 255, default: 'Salle de classe' })
  location: string;

  @Column({ type: 'int', default: 30 })
  max_students: number;

  @Column({ type: 'int', default: 0 })
  current_students: number;

  @Column({ type: 'varchar', length: 100, default: 'admin' })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}