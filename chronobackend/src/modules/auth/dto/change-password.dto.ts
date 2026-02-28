import { IsString, IsNotEmpty, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'Mot de passe actuel doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Mot de passe actuel requis' })
  currentPassword: string;

  @IsString({ message: 'Nouveau mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Nouveau mot de passe requis' })
  @Length(8, 100, { message: 'Nouveau mot de passe doit contenir entre 8 et 100 caractères' })
  newPassword: string;
}
