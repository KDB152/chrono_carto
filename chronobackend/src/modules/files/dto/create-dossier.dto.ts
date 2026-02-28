import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateDossierDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  target_class?: string;
}
