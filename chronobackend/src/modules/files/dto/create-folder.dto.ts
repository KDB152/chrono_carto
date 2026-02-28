import { IsString, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  parentId?: number;

  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetClasses?: string[];
}
