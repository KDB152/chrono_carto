import { IsString, IsOptional, IsNumber, IsInt } from 'class-validator';

export class CreateSousDossierDto {
  @IsString()
  name: string;

  @IsInt()
  dossier_id: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  sous_dossier_id?: number;
}
