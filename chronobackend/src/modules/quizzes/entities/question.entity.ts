import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type QuestionType = 'multiple' | 'single' | 'text' | 'boolean';

@Entity('quiz_questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'quiz_id' })
  quiz_id: number;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'varchar', length: 20 })
  type: QuestionType;

  @Column({ type: 'simple-array', nullable: true })
  options?: string[];

  @Column({ type: 'text', nullable: true })
  correct_answer?: string; // could be JSON string if needed

  @Column({ type: 'text', nullable: true })
  explanation?: string;
}
