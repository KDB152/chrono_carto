import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ name: 'class_level' })
  classLevel: string;

  @Column({ name: 'session_date', type: 'date' })
  sessionDate: Date;

  @Column({ name: 'is_present', default: false })
  isPresent: boolean;

  @Column({ name: 'notes', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Student, { eager: true })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
