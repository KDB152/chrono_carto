import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('rendez_vous')
export class RendezVous {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  parent_id: string;

  @Column()
  parent_name: string;

  @Column()
  parent_email: string;

  @Column()
  parent_phone: string;

  @Column()
  child_name: string;

  @Column()
  child_class: string;

  @Column({ type: 'timestamp' })
  timing: Date;

  @Column({ type: 'datetime', nullable: true })
  appointment_time: Date;

  @Column({ type: 'text' })
  parent_reason: string;

  @Column({ type: 'text', nullable: true })
  admin_reason: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  child_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
