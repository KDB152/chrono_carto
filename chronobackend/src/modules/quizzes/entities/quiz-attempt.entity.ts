import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quiz_id: number;

  @Column()
  student_id: number;

  @Column({ length: 255 })
  student_name: string;


  @Column({ type: 'int' })
  total_points: number;

  @Column({ type: 'int' })
  percentage: number;

  @Column({ type: 'int', default: 0 })
  time_spent: number; // minutes

  @CreateDateColumn({ name: 'completed_at' })
  completed_at: Date;

  @Column({ type: 'json', nullable: true })
  answers: any;
}
