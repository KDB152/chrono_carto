import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateConversationDto {
  @IsNumber()
  participant1Id: number;

  @IsNumber()
  participant2Id: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(['direct', 'group'])
  @IsOptional()
  type?: 'direct' | 'group';
}
