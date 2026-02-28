import { IsString, IsOptional, IsNumber, IsArray, IsIn } from 'class-validator';

export class CreateQuestionDto {
  @IsNumber()
  quiz_id: number;

  @IsString()
  question: string;

  @IsIn(['multiple', 'single', 'text', 'boolean'])
  type: 'multiple' | 'single' | 'text' | 'boolean';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsString()
  correct_answer?: string;

  @IsOptional()
  @IsString()
  explanation?: string;
}
