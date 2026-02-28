import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateStudySessionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  date: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  targetClass?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  maxStudents?: number;
}
