import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('meetings')
export class Meeting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  parent_id: number;

  @Column()
  admin_id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'datetime' })
  meeting_date: Date;

  @Column({ type: 'int', default: 30 })
  duration_minutes: number;

  @Column({ 
    type: 'enum', 
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  })
  status: string;

  @Column({ nullable: true })
  location: string;

  @Column({ 
    type: 'enum', 
    enum: ['in_person', 'online', 'phone'],
    default: 'in_person'
  })
  meeting_type: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
