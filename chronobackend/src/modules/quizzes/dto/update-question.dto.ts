import { IsString, IsOptional, IsNumber, IsArray, IsIn } from 'class-validator';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsIn(['multiple', 'single', 'text', 'boolean'])
  type?: 'multiple' | 'single' | 'text' | 'boolean';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsString()
  correct_answer?: string;

  @IsOptional()
  @IsNumber()
  points?: number;

  @IsOptional()
  @IsString()
  explanation?: string;
}
