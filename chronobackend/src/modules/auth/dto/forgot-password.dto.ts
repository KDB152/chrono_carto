import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: "L'adresse email n'est pas valide" })
  @IsNotEmpty({ message: "L'adresse email est requise" })
  email: string;
}
