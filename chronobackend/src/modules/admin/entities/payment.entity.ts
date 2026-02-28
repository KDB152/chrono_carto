import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Parent } from '../../parents/entities/parent.entity';

@Entity('paiement')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  student_id: number;

  @Column({ nullable: true })
  parent_id: number;

  @Column({ default: 0 })
  seances_total: number;

  @Column({ default: 0 })
  seances_non_payees: number;

  @Column({ default: 0 })
  seances_payees: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  montant_total: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  montant_paye: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  montant_restant: number;

  @Column('decimal', { precision: 10, scale: 2, default: 40 })
  prix_seance: number;

  @Column({ length: 50, default: 'en_attente' })
  statut: string;

  @Column({ type: 'date', nullable: true })
  date_derniere_presence: Date;

  @Column({ type: 'date', nullable: true })
  date_dernier_paiement: Date;


  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date_creation: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' })
  date_modification: Date;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Parent)
  @JoinColumn({ name: 'parent_id' })
  parent: Parent;
}
