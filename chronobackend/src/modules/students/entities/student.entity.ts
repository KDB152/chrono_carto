// src/modules/students/entities/student.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ClassLevel {
  TERMINALE_GROUPE_1 = 'Terminale groupe 1',
  TERMINALE_GROUPE_2 = 'Terminale groupe 2',
  TERMINALE_GROUPE_3 = 'Terminale groupe 3',
  TERMINALE_GROUPE_4 = 'Terminale groupe 4',
  TERMINALE_GROUPE_5 = 'Terminale groupe 5',
  PREMIERE_GROUPE_1 = '1ere groupe 1',
  PREMIERE_GROUPE_2 = '1ere groupe 2',
  PREMIERE_GROUPE_3 = '1ere groupe 3',
  PREMIERE_GROUPE_4 = '1ere groupe 4',
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.student)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', unique: true })
  user_id: number;

  @Column({
    type: 'enum',
    enum: ClassLevel,
    nullable: true,
  })
  class_level: ClassLevel;

  @Column({ nullable: true })
  birth_date: Date;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  progress_percentage: number;

  @Column({ default: 0 })
  total_quiz_attempts: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  average_score: number;

  @Column({ nullable: true })
  last_activity: Date;

  @Column({ nullable: true })
  parent_id: number;

  @Column({ default: 0 })
  paid_sessions: number;

  @Column({ default: 0 })
  unpaid_sessions: number;
}
