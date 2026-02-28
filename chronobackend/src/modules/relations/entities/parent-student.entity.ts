// src/modules/relations/entities/parent-student.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Parent } from '../../parents/entities/parent.entity';
import { Student } from '../../students/entities/student.entity';

@Entity('parent_student')
export class ParentStudent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'parent_id' })
  parent_id: number;

  @Column({ name: 'student_id' })
  student_id: number;

  @ManyToOne(() => Parent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: Parent;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
