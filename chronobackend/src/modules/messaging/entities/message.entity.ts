import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Groupe } from './groupe.entity';
import { Conversation } from './conversation.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sender_id' })
  sender_id: number;

  @Column({ name: 'recipient_id', nullable: true })
  recipient_id: number;

  @Column({ name: 'groupe_id', nullable: true })
  groupe_id: number;

  @Column({ name: 'conversation_id' })
  conversation_id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'message_type', default: 'text' })
  message_type: string;

  @Column({ name: 'is_read', default: false })
  is_read: boolean;

  @Column({ name: 'file_path', nullable: true })
  file_path: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @ManyToOne(() => Groupe, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupe_id' })
  groupe: Groupe;

  @ManyToOne(() => Conversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;
}
