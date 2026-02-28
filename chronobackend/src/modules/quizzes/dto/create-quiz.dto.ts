import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, IsIn } from 'class-validator';

export class CreateQuizDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  subject: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsIn(['Publié', 'Brouillon', 'Archivé'])
  status?: 'Publié' | 'Brouillon' | 'Archivé';

  @IsOptional()
  @IsBoolean()
  is_time_limited?: boolean;

  @IsOptional()
  @IsBoolean()
  allow_retake?: boolean;

  @IsOptional()
  @IsBoolean()
  show_results?: boolean;


  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  target_groups?: string[];
}
