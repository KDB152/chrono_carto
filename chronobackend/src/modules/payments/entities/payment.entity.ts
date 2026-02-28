import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue'
}

export enum PaymentType {
  SESSION = 'session',
  MONTHLY = 'monthly',
  EXAM = 'exam'
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ name: 'class_level' })
  classLevel: string;

  @Column({ name: 'session_date', type: 'date' })
  sessionDate: Date;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ 
    name: 'status', 
    type: 'enum', 
    enum: PaymentStatus, 
    default: PaymentStatus.PENDING 
  })
  status: PaymentStatus;

  @Column({ 
    name: 'type', 
    type: 'enum', 
    enum: PaymentType, 
    default: PaymentType.SESSION 
  })
  type: PaymentType;

  @Column({ name: 'description', nullable: true })
  description: string;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date;

  @Column({ name: 'paid_at', type: 'datetime', nullable: true })
  paidAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Student, { eager: true })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
