// src/modules/auth/email-verification.service.ts (VERSION COMPL?TE)
import { Injectable, HttpException, HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../utils/email.util';

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    // Configuration du transporteur email
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // V?rification de la configuration au d?marrage
    this.verifyEmailConfig();
  }

  private async verifyEmailConfig() {
    try {
      await this.transporter.verify();
      this.logger.log('? Configuration email valid?e avec succ?s');
    } catch (error) {
      this.logger.error('? Erreur configuration email:', error.message);
    }
  }

  // === V?RIFICATION D'EMAIL PAR CODE ===
  
  async sendVerificationCode(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('Utilisateur non trouv?', HttpStatus.NOT_FOUND);
    }

    if (user.email_verified) {
      throw new HttpException('Email d?j? v?rifi?', HttpStatus.BAD_REQUEST);
    }

    // G?n?rer un code ? 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 15); // Expire dans 15 minutes

    user.email_verification_code = code;
    user.email_verification_code_expiry = expiryTime;
    await this.userRepository.save(user);

    // Envoyer le code par email
    await this.sendVerificationCodeEmail(email, code);

    this.logger.log(`Code de v?rification envoy? ? ${email}`);
    return { message: 'Code de v?rification envoy? par email' };
  }

  async verifyCode(email: string, code: string): Promise<{ message: string; email: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('Utilisateur non trouv?', HttpStatus.NOT_FOUND);
    }

    if (!user.email_verification_code || !user.email_verification_code_expiry) {
      throw new HttpException('Aucun code de v?rification trouv?', HttpStatus.BAD_REQUEST);
    }

    if (new Date() > user.email_verification_code_expiry) {
      throw new HttpException('Code de v?rification expir?', HttpStatus.BAD_REQUEST);
    }

    if (user.email_verification_code !== code) {
      throw new HttpException('Code de v?rification invalide', HttpStatus.BAD_REQUEST);
    }

    // Marquer l'email comme v?rifi?
    user.email_verified = true;
    user.email_verification_code = null;
    user.email_verification_code_expiry = null;
    await this.userRepository.save(user);

    this.logger.log(`? Email v?rifi? avec succ?s pour ${email}`);
    return { message: 'Email v?rifi? avec succ?s', email };
  }

  // === V?RIFICATION D'EMAIL PAR LIEN ===
  
  async sendVerificationLink(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('Utilisateur non trouv?', HttpStatus.NOT_FOUND);
    }

    if (user.email_verified) {
      this.logger.warn(`Tentative d'envoi de v?rification pour email d?j? v?rifi?: ${email}`);
      // Ne pas r?v?ler que l'email est d?j? v?rifi? pour des raisons de s?curit?
      return { message: 'Si un compte existe avec cet email, un lien de v?rification a ?t? envoy?' };
    }

    // G?n?rer un token unique
    const token = uuidv4();
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 24); // Expire dans 24 heures

    user.verification_token = token;
    user.verification_token_expiry = expiryTime;
    await this.userRepository.save(user);

    // Envoyer l'email avec le lien
    await sendVerificationEmail(email, token);

    this.logger.log(`? Lien de v?rification envoy? ? ${email}`);
    return { message: 'Un lien de v?rification a ?t? envoy? ? votre adresse email' };
  }

  async verifyToken(token: string): Promise<{ message: string; email: string }> {
    this.logger.log(`?? V?rification du token: ${token.substring(0, 8)}...`);
    
    const user = await this.userRepository.findOne({ 
      where: { verification_token: token } 
    });

    if (!user) {
      this.logger.error('? Token de v?rification invalide ou expir?');
      throw new HttpException('Token de v?rification invalide ou expir?', HttpStatus.BAD_REQUEST);
    }

    if (!user.verification_token_expiry || new Date() > user.verification_token_expiry) {
      this.logger.error('? Token de v?rification expir?');
      throw new HttpException('Token de v?rification expir?', HttpStatus.BAD_REQUEST);
    }

    // Marquer l'email comme v?rifi?
    user.email_verified = true;
    user.verification_token = null;
    user.verification_token_expiry = null;
    await this.userRepository.save(user);

    this.logger.log(`? Email v?rifi? avec succ?s pour: ${user.email}`);
    return { message: 'Email v?rifi? avec succ?s', email: user.email };
  }

  // === R?INITIALISATION DE MOT DE PASSE PAR CODE ===
  
  async sendPasswordResetCode(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Ne pas r?v?ler si l'utilisateur existe ou non
      return { message: 'Si un compte existe avec cet email, un code de r?initialisation a ?t? envoy?' };
    }

    // G?n?rer un code ? 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 15); // Expire dans 15 minutes

    user.password_reset_code = code;
    user.password_reset_code_expiry = expiryTime;
    await this.userRepository.save(user);

    // Envoyer le code par email
    await this.sendPasswordResetCodeEmail(email, code);

    this.logger.log(`Code de r?initialisation envoy? ? ${email}`);
    return { message: 'Si un compte existe avec cet email, un code de r?initialisation a ?t? envoy?' };
  }

  async verifyPasswordResetCode(email: string, code: string): Promise<{ message: string; resetToken: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('Utilisateur non trouv?', HttpStatus.NOT_FOUND);
    }

    if (!user.password_reset_code || !user.password_reset_code_expiry) {
      throw new HttpException('Aucun code de r?initialisation trouv?', HttpStatus.BAD_REQUEST);
    }

    if (new Date() > user.password_reset_code_expiry) {
      throw new HttpException('Code de r?initialisation expir?', HttpStatus.BAD_REQUEST);
    }

    if (user.password_reset_code !== code) {
      throw new HttpException('Code de r?initialisation invalide', HttpStatus.BAD_REQUEST);
    }

    // G?n?rer un token de r?initialisation
    const resetToken = uuidv4();
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 1); // Expire dans 1 heure

    user.password_reset_token = resetToken;
    user.password_reset_token_expiry = expiryTime;
    user.password_reset_code = null;
    user.password_reset_code_expiry = null;
    await this.userRepository.save(user);

    this.logger.log(`Code de r?initialisation v?rifi? pour ${email}`);
    return { message: 'Code v?rifi? avec succ?s', resetToken };
  }

  // === R?INITIALISATION DE MOT DE PASSE PAR LIEN ===
  
async sendPasswordResetLink(email: string): Promise<{ success: boolean; message: string }> {
  const user = await this.userRepository.findOne({ where: { email } });
  
  // V�rifier si l'utilisateur existe
  if (!user) {
    this.logger.warn(`Tentative de r�initialisation pour email inexistant: ${email}`);
    throw new NotFoundException("Cette adresse e-mail n'est associee a aucun compte. Veuillez verifier votre saisie ou creer un compte.");
  }

  // G?n?rer un token unique
  const resetToken = uuidv4();
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

  // Sauvegarder le token dans la base de donn?es
  user.password_reset_token = resetToken;
  user.password_reset_token_expiry = resetTokenExpiry;
  await this.userRepository.save(user);

  // Envoyer l'email avec le token
  try {
    await this.sendPasswordResetEmailWithToken(email, resetToken);
    this.logger.log(`? Lien de r?initialisation envoy? ? ${email}`);
  } catch (error) {
    this.logger.error(`? Erreur lors de l'envoi du lien de r?initialisation ? ${email}:`, error);
    // Ne pas r?v?ler l'erreur ? l'utilisateur pour des raisons de s?curit?
  }

  return {
    success: true,
    message: 'Si un compte existe avec cet email, un lien de r?initialisation a ?t? envoy?'
  };
}
  // M?thode supprim?e car non utilis?e

  // === M?THODES PRIV?ES POUR L'ENVOI D'EMAILS ===

  private async sendVerificationCodeEmail(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: `"Chrono Carto" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Code de v?rification - Chrono Carto',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Code de v?rification - Chrono Carto</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: #2563eb; margin-bottom: 30px;">Code de v?rification ??</h1>
            
            <p style="font-size: 16px; margin-bottom: 30px;">
              Voici votre code de v?rification pour finaliser votre inscription sur Chrono-Carto :
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 30px 0; border: 2px dashed #2563eb;">
              <h2 style="font-size: 36px; color: #2563eb; margin: 0; letter-spacing: 5px; font-family: monospace;">
                ${code}
              </h2>
            </div>
            
            <p style="font-size: 14px; color: #f59e0b; background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              ? <strong>Ce code expire dans 15 minutes</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #888;">
              Si vous n'avez pas cr?? de compte sur Chrono-Carto, veuillez ignorer cet email.
            </p>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`? Code de v?rification envoy? ? ${email}`);
    } catch (error) {
      this.logger.error(`? Erreur envoi code ? ${email}:`, error);
      throw new HttpException('Erreur lors de l\'envoi de l\'email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async sendPasswordResetCodeEmail(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: `"Chrono Carto" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Code de r?initialisation - Chrono Carto',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Code de r?initialisation - Chrono Carto</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: #dc2626; margin-bottom: 30px;">?? Code de r?initialisation</h1>
            
            <p style="font-size: 16px; margin-bottom: 30px;">
              Voici votre code de r?initialisation pour changer votre mot de passe :
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 30px 0; border: 2px dashed #dc2626;">
              <h2 style="font-size: 36px; color: #dc2626; margin: 0; letter-spacing: 5px; font-family: monospace;">
                ${code}
              </h2>
            </div>
            
            <p style="font-size: 14px; color: #f59e0b; background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              ? <strong>Ce code expire dans 15 minutes</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #888;">
              Si vous n'avez pas demand? de r?initialisation, veuillez ignorer cet email.
            </p>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`? Code de r?initialisation envoy? ? ${email}`);
    } catch (error) {
      this.logger.error(`? Erreur envoi code reset ? ${email}:`, error);
      throw new HttpException('Erreur lors de l\'envoi de l\'email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

private async sendPasswordResetEmailWithToken(email: string, token: string): Promise<void> {
  // Utiliser le backend pour d?poser un cookie + rediriger instantan?ment
  const resetUrl = `${process.env.BACKEND_URL!}/auth/reset-password-link?t=${token}`;
  
  const mailOptions = {
    from: `"Chrono Carto" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reinitialisation de votre mot de passe - Chrono Carto',
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reinitialisation mot de passe - Chrono Carto</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: #dc2626; margin-bottom: 30px;"> Reinitialisation de mot de passe</h1>
          
          <p style="font-size: 16px; margin-bottom: 30px;">
            Vous avez demande a reinitialiser votre mot de passe sur Chrono-Carto.
            Cliquez sur le bouton ci-dessous pour continuer.
          </p>
          
          <div style="margin: 40px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: #dc2626; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
               Reinitialiser mon mot de passe
            </a>
          </div>
          
          <p style="font-size: 14px; color: #f59e0b; background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
             <strong>Ce lien expirera dans 1 heure</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #888;">
            Si vous n'avez pas demande de reinitialisation, veuillez ignorer cet email.<br>
            Votre mot de passe restera inchange.
          </p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await this.transporter.sendMail(mailOptions);
    console.log(`? Email de r?initialisation envoy? ? ${email}`);
  } catch (error) {
    console.error(`? Erreur d'envoi email de r?initialisation ? ${email}:`, error);
    throw new HttpException(
      'Erreur lors de l\'envoi de l\'email de r?initialisation',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
  }