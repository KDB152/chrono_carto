import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('pdp')
export class Pdp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'stored_name', type: 'varchar', length: 255 })
  storedName: string;

  @Column({ name: 'file_path', type: 'varchar', length: 500 })
  filePath: string;

  @Column({
    name: 'file_type',
    type: 'enum',
    enum: ['JPEG', 'PNG', 'SVG', 'GIF', 'WebP']
  })
  fileType: 'JPEG' | 'PNG' | 'SVG' | 'GIF' | 'WebP';

  @Column({ name: 'file_size', type: 'int' })
  fileSize: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relation avec l'utilisateur
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
