// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';
import { ClassLevel } from '../../students/entities/student.entity';

export class RegisterDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(UserRole)
  userType: UserRole | 'student' | 'parent';

  // Student-specific
  @IsOptional()
  @IsString()
  studentBirthDate?: string;

  @IsOptional()
  @IsEnum(ClassLevel)
  studentClass?: ClassLevel;

  // Parent-specific
  @IsOptional()
  @IsString()
  childFirstName?: string;

  @IsOptional()
  @IsString()
  childLastName?: string;

  @IsOptional()
  @IsString()
  childBirthDate?: string;

  @IsOptional()
  @IsEnum(ClassLevel)
  childClass?: ClassLevel;

  // Student requires parent contacts
  @IsOptional()
  @IsString()
  parentFirstName?: string;

  @IsOptional()
  @IsString()
  parentLastName?: string;

  @IsOptional()
  @IsEmail()
  parentEmail?: string;

  @IsOptional()
  @IsString()
  parentPhone?: string;

  @IsOptional()
  @IsString()
  parentPassword?: string;

  @IsOptional()
  @IsString()
  childPassword?: string;

  @IsOptional()
  @IsEmail()
  childEmail?: string;

  @IsOptional()
  @IsString()
  childPhone?: string;
}
