// src/modules/users/entities/user.entity.ts (VERSION COMPLÈTE)
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';

export enum UserRole {
  STUDENT = 'student',
  PARENT = 'parent',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  password_hash: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @Column({ name: 'is_approved', default: false })
  is_approved: boolean;

  // ✅ CHAMPS POUR VÉRIFICATION EMAIL
  @Column({ name: 'email_verified', default: false })
  email_verified: boolean;

  @Column({ name: 'verification_token', length: 255, nullable: true })
  verification_token: string | null;

  @Column({ name: 'verification_token_expiry', type: 'datetime', nullable: true })
  verification_token_expiry: Date | null;

  @Column({ name: 'email_verification_code', length: 6, nullable: true })
  email_verification_code: string | null;

  @Column({ name: 'email_verification_code_expiry', type: 'datetime', nullable: true })
  email_verification_code_expiry: Date | null;

  // ✅ CHAMPS POUR RÉINITIALISATION MOT DE PASSE
  @Column({ name: 'password_reset_token', length: 255, nullable: true })
  password_reset_token: string | null;

  @Column({ name: 'password_reset_token_expiry', type: 'datetime', nullable: true })
  password_reset_token_expiry: Date | null;

  @Column({ name: 'password_reset_code', length: 6, nullable: true })
  password_reset_code: string | null;

  @Column({ name: 'password_reset_code_expiry', type: 'datetime', nullable: true })
  password_reset_code_expiry: Date | null;

  // ✅ CHAMPS SYSTÈME
  @Column({ name: 'last_login', type: 'datetime', nullable: true })
  last_login: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @OneToOne('Student', 'user')
  student: any;

  @OneToOne('Parent', 'user')
  parent: any;
}