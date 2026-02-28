import { IsString, IsOptional, IsNumber, IsInt } from 'class-validator';

export class CreateFichierDto {
  @IsString()
  title: string;

  @IsInt()
  sous_dossier_id: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  file_name: string;

  @IsString()
  stored_name: string;

  @IsString()
  file_path: string;

  @IsString()
  file_type: string;

  @IsNumber()
  file_size: number;

  @IsOptional()
  @IsNumber()
  download_count?: number;
}
