import { IsNumber, IsArray } from 'class-validator';

export class AddFileToFolderDto {
  @IsArray()
  @IsNumber({}, { each: true })
  fileIds: number[];
}
