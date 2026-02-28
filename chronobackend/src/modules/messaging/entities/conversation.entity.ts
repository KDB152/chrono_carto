import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Groupe } from './groupe.entity';
import { Message } from './message.entity';
import { User } from '../../users/entities/user.entity';

@Entity('conversation')
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'groupe_id', nullable: true })
  groupe_id: number;

  @Column({ name: 'last_message_id', nullable: true })
  last_message_id: number;

  @Column({ type: 'varchar', length: 50, default: 'direct' })
  type: string; // 'direct', 'group', 'class'

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ name: 'participant1_id', nullable: true })
  participant1_id: number;

  @Column({ name: 'participant2_id', nullable: true })
  participant2_id: number;

  @Column({ name: 'class_level', type: 'varchar', length: 100, nullable: true })
  class_level: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Groupe, { nullable: true })
  @JoinColumn({ name: 'groupe_id' })
  groupe: Groupe;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'participant1_id' })
  participant1: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'participant2_id' })
  participant2: User;

  // Relation avec le dernier message (optionnelle)
  // @ManyToOne(() => Message, { nullable: true })
  // @JoinColumn({ name: 'last_message_id' })
  // last_message: Message;

  // @OneToMany(() => Message, message => message.conversation)
  // messages: Message[];
}
