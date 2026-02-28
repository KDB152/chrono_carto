import { IsString, IsOptional, IsBoolean, IsArray, IsNumber } from 'class-validator';

export class UpdateFileDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsString()
  @IsOptional()
  storedName?: string;

  @IsString()
  @IsOptional()
  filePath?: string;

  @IsString()
  @IsOptional()
  fileType?: string;

  @IsNumber()
  @IsOptional()
  fileSize?: number;


  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
