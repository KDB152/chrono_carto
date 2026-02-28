import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class ChangeEmailDto {
  @IsEmail()
  @IsNotEmpty()
  newEmail: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
