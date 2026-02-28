// src/modules/auth/dto/verify-email.dto.ts
import { IsEmail, IsString, IsNotEmpty, Length } from 'class-validator';

export class SendVerificationCodeDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'Email requis' })
  email: string;
}

export class VerifyCodeDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'Email requis' })
  email: string;

  @IsString({ message: 'Code doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Code requis' })
  @Length(6, 6, { message: 'Code doit contenir exactement 6 caractères' })
  code: string;
}

export class VerifyTokenDto {
  @IsString({ message: 'Token doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Token requis' })
  token: string;
}

export class SendPasswordResetDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'Email requis' })
  email: string;
}

export class VerifyPasswordResetCodeDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'Email requis' })
  email: string;

  @IsString({ message: 'Code doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Code requis' })
  @Length(6, 6, { message: 'Code doit contenir exactement 6 caractères' })
  code: string;
}

export class ResetPasswordDto {
  @IsString({ message: 'Token doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Token requis' })
  token: string;

  @IsString({ message: 'Mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Nouveau mot de passe requis' })
  @Length(8, 100, { message: 'Mot de passe doit contenir entre 8 et 100 caractères' })
  newPassword: string;
}

