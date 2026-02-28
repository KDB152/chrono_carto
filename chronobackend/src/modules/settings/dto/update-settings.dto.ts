import { IsString, IsOptional, IsBoolean, IsNumber, IsArray } from 'class-validator';

export class UpdateSystemSettingsDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_encrypted?: boolean;
}

export class UpdateUserPreferencesDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  category?: string;
}

export class BulkUpdateSettingsDto {
  @IsArray()
  settings: UpdateSystemSettingsDto[];
}

export class BulkUpdateUserPreferencesDto {
  @IsArray()
  preferences: UpdateUserPreferencesDto[];
}
