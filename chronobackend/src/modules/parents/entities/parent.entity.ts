// src/modules/parents/entities/parent.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('parents')
export class Parent {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.parent)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', unique: true })
  user_id: number;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  occupation: string;
}