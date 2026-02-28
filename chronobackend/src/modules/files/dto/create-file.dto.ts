import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsArray } from 'class-validator';

export class CreateFileDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  storedName: string;

  @IsString()
  @IsNotEmpty()
  filePath: string;

  @IsString()
  @IsNotEmpty()
  fileType: string;

  @IsNumber()
  @IsNotEmpty()
  fileSize: number;


  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
