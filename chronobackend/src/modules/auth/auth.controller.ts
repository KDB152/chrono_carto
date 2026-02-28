// src/modules/auth/auth.controller.ts (VERSION AVEC DEBUG)
import { Controller, Post, Body, Get, Logger, Query, Res, UseGuards, Request, NotFoundException } from '@nestjs/common';  // <--- AJOUTEZ UseGuards, Request
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { EmailVerificationService } from './email-verification.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';  // <--- AJOUTEZ CET IMPORT
import { ChangeEmailDto } from './dto/change-email.dto';
import { 
  SendVerificationCodeDto, 
  VerifyCodeDto, 
  VerifyTokenDto,
  SendPasswordResetDto,
  VerifyPasswordResetCodeDto,
  ResetPasswordDto
} from './dto/verify-email.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';  // <--- AJOUTEZ CET IMPORT
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private emailVerificationService: EmailVerificationService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Tentative d'inscription pour: ${registerDto.email}`);
    try {
      const result = await this.authService.register(registerDto);
      this.logger.log(`Inscription réussie pour: ${registerDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Erreur lors de l'inscription pour ${registerDto.email}:`, error.message);
      throw error;
    }
  }

    @Post('login')
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Tentative de login pour: ${loginDto.email}`);
    try {
      const result = await this.authService.login(loginDto);
      this.logger.log(`Login réussi pour: ${loginDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Erreur login pour ${loginDto.email}:`, error.message);
      throw error;
    }
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    this.logger.log(`Demande de renvoi de vérification pour: ${body.email}`);
    try {
      const result = await this.emailVerificationService.sendVerificationLink(body.email);
      this.logger.log(`Email de vérification renvoyé pour: ${body.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Erreur renvoi vérification pour ${body.email}:`, error.message);
      throw error;
    }
  }

  @Post('check-verification')
  async checkVerification(@Body() body: { email: string }) {
    this.logger.log(`Vérification du statut pour: ${body.email}`);
    try {
      const user = await this.userRepository.findOne({ where: { email: body.email } });
      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }
      
      return {
        verified: user.email_verified,
        approved: user.is_approved,
        message: user.email_verified 
          ? (user.is_approved ? 'Compte vérifié et approuvé' : 'Email vérifié, en attente d\'approbation')
          : 'Email non vérifié'
      };
    } catch (error) {
      this.logger.error(`Erreur vérification statut pour ${body.email}:`, error.message);
      throw error;
    }
  }

  @Post('forgot-password')  // <--- ENDPOINT POUR LA RÉINITIALISATION PAR LIEN
  async forgotPassword(@Body() dto: SendPasswordResetDto) {
    this.logger.log(`Demande de réinitialisation pour: ${dto.email}`);
    try {
      const result = await this.emailVerificationService.sendPasswordResetLink(dto.email);
      this.logger.log(`Réinitialisation traitée pour: ${dto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Erreur réinitialisation pour ${dto.email}:`, error.message || error);
      // Propager toutes les erreurs pour que NestJS les gère correctement
      // NotFoundException sera automatiquement transformée en réponse HTTP 404
      throw error;
    }
  }

  // Endpoints pour la vérification d'email par code
  @Post('send-verification-code')
  async sendVerificationCode(@Body() dto: SendVerificationCodeDto) {
    this.logger.log(`Demande de code de vérification pour: ${dto.email}`);
    try {
      const result = await this.emailVerificationService.sendVerificationCode(dto.email);
      this.logger.log(`Code de vérification envoyé avec succès pour: ${dto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Erreur envoi code pour ${dto.email}:`, error.message);
      throw error;
    }
  }

  @Post('verify-code')
  async verifyCode(@Body() dto: VerifyCodeDto) {
    this.logger.log(`Vérification de code pour: ${dto.email}, code: ${dto.code}`);
    try {
      const result = await this.emailVerificationService.verifyCode(dto.email, dto.code);
      this.logger.log(`Code vérifié avec succès pour: ${dto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Erreur vérification code pour ${dto.email}:`, error.message);
      throw error;
    }
  }

  // Endpoints pour la vérification d'email par lien
  @Post('send-verification-link')
  async sendVerificationLink(@Body() dto: SendVerificationCodeDto) {
    this.logger.log(`Demande de lien de vérification pour: ${dto.email}`);
    try {
      const result = await this.emailVerificationService.sendVerificationLink(dto.email);
      this.logger.log(`Lien de vérification envoyé avec succès pour: ${dto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Erreur envoi lien pour ${dto.email}:`, error.message);
      throw error;
    }
  }

  @Post('verify-token')
  async verifyToken(@Body() dto: VerifyTokenDto) {
    this.logger.log(`Vérification de token: ${dto.token.substring(0, 8)}...`);
    try {
      const result = await this.emailVerificationService.verifyToken(dto.token);
      this.logger.log(`Token vérifié avec succès`);
      return result;
    } catch (error) {
      this.logger.error(`Erreur vérification token:`, error.message);
      throw error;
    }
  }

  // Endpoints pour la réinitialisation de mot de passe par code
  @Post('send-password-reset-code')
  async sendPasswordResetCode(@Body() dto: SendPasswordResetDto) {
    this.logger.log(`Demande de code de réinitialisation pour: ${dto.email}`);
    try {
      const result = await this.emailVerificationService.sendPasswordResetCode(dto.email);
      this.logger.log(`Code de réinitialisation traité pour: ${dto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Erreur envoi code reset pour ${dto.email}:`, error.message);
      throw error;
    }
  }

  @Post('verify-password-reset-code')
  async verifyPasswordResetCode(@Body() dto: VerifyPasswordResetCodeDto) {
    this.logger.log(`Vérification code reset pour: ${dto.email}, code: ${dto.code}`);
    try {
      const result = await this.emailVerificationService.verifyPasswordResetCode(dto.email, dto.code);
      this.logger.log(`Code reset vérifié avec succès pour: ${dto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Erreur vérification code reset pour ${dto.email}:`, error.message);
      throw error;
    }
  }

  // Endpoints pour la réinitialisation de mot de passe par lien
  @Post('send-password-reset-link')
  async sendPasswordResetLink(@Body() dto: SendPasswordResetDto) {
    this.logger.log(`Demande de lien de réinitialisation pour: ${dto.email}`);
    try {
      const result = await this.emailVerificationService.sendPasswordResetLink(dto.email);
      this.logger.log(`Lien de réinitialisation traité pour: ${dto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Erreur envoi lien reset pour ${dto.email}:`, error.message);
      throw error;
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    this.logger.log(`Réinitialisation mot de passe avec token: ${dto.token.substring(0, 8)}...`);
    try {
      const result = await this.authService.resetPassword(dto.token, dto.newPassword);
      this.logger.log(`Mot de passe réinitialisé avec succès`);
      return result;
    } catch (error) {
      this.logger.error(`Erreur réinitialisation mot de passe:`, error.message);
      throw error;
    }
  }

  // Lien backend pour transformer le token en cookie puis rediriger instantanément
  @Get('reset-password-link')
  async resetPasswordLink(@Query('t') token: string, @Res() res: Response) {
    this.logger.log(`Redirect reset-password-link avec token: ${token?.substring(0, 8)}...`);
    if (!token) {
      return res.redirect(`${process.env.FRONTEND_URL}/forgot-password`);
    }

    // Déposer un cookie temporaire lisible côté client (sera consommé puis supprimé)
    res.cookie('reset_token', token, {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000,
      path: '/',
    });

    return res.redirect(`${process.env.FRONTEND_URL}/reset-password`);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    this.logger.log(`Changement mot de passe pour utilisateur: ${req.user.id}`);
    try {
      const result = await this.authService.changePassword(
        req.user.id, 
        dto.currentPassword, 
        dto.newPassword
      );
      this.logger.log(`Mot de passe modifié avec succès pour utilisateur: ${req.user.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Erreur changement mot de passe:`, error.message);
      throw error;
    }
  }

  @Post('change-email')
  async changeEmail(@Body() dto: ChangeEmailDto) {
    this.logger.log(`������ Debug - DTO reçu:`, JSON.stringify(dto));
    this.logger.log(`������ Debug - Type de dto:`, typeof dto);
    this.logger.log(`������ Debug - Propriétés dto:`, Object.keys(dto));
    this.logger.log(`Changement d'email pour utilisateur: ${dto.userId}`);
    try {
      const result = await this.authService.changeEmail(dto.userId, dto.newEmail);
      this.logger.log(`Email modifié avec succès pour utilisateur: ${dto.userId}`);
      return result;
    } catch (error) {
      this.logger.error(`Erreur changement d'email:`, error.message);
      throw error;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req) {
    this.logger.log(`Récupération des informations utilisateur: ${req.user.id}`);
    try {
      const user = await this.userRepository.findOne({ 
        where: { id: req.user.id },
        select: ['id', 'firstName', 'lastName', 'email', 'phone', 'role', 'is_active', 'email_verified', 'is_approved']
      });
      
      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      this.logger.log(`Informations utilisateur récupérées avec succès: ${user.email}`);
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        isApproved: user.is_approved
      };
    } catch (error) {
      this.logger.error(`Erreur récupération utilisateur:`, error.message);
      throw error;
    }
  }

  // ENDPOINTS DE DEBUG - À SUPPRIMER EN PRODUCTION
  @Get('debug/test-email-config')
  async testEmailConfig() {
    this.logger.log('Test de configuration email demandé');
    try {
      // Accéder au transporteur via le service
      const testResult = await this.emailVerificationService['transporter'].verify();
      this.logger.log('Configuration email testée avec succès');
      return { 
        success: true, 
        message: 'Configuration email valide',
        config: {
          user: process.env.EMAIL_USER,
          frontendUrl: process.env.FRONTEND_URL
        }
      };
    } catch (error) {
      this.logger.error('Erreur test configuration email:', error.message);
      return { 
        success: false, 
        error: error.message,
        config: {
          user: process.env.EMAIL_USER,
          frontendUrl: process.env.FRONTEND_URL,
          hasPassword: !!process.env.EMAIL_PASSWORD
        }
      };
    }
  }

  @Post('debug/send-test-email')
  async sendTestEmail(@Body() dto: { email: string }) {
    this.logger.log(`Envoi d'email de test vers: ${dto.email}`);
    try {
      const transporter = this.emailVerificationService['transporter'];
      
      const mailOptions = {
        from: `"Chrono Carto Test" <${process.env.EMAIL_USER}>`,
        to: dto.email,
        subject: 'Test de configuration email - Chrono Carto',
        html: `
          <h2>Test de configuration email</h2>
          <p>Si vous recevez cet email, la configuration fonctionne correctement.</p>
          <p><strong>Configuration actuelle :</strong></p>
          <ul>
            <li>Email expéditeur: ${process.env.EMAIL_USER}</li>
            <li>URL Frontend: ${process.env.FRONTEND_URL}</li>
            <li>Timestamp: ${new Date().toISOString()}</li>
          </ul>
        `,
      };

      await transporter.sendMail(mailOptions);
      this.logger.log(`Email de test envoyé avec succès vers: ${dto.email}`);
      
      return { 
        success: true, 
        message: 'Email de test envoyé avec succès',
        details: {
          to: dto.email,
          from: process.env.EMAIL_USER,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      this.logger.error(`Erreur envoi email de test vers ${dto.email}:`, error.message);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  @Get('verify-token')
  async verifyTokenGet(@Query('token') token: string, @Res() res: Response) {
    this.logger.log(`Vérification GET token: ${token?.substring(0, 8)}...`);
    if (!token) {
      this.logger.warn('Aucun token fourni dans la requête');
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_token`);
    }

    try {
      const result = await this.emailVerificationService.verifyToken(token);
      this.logger.log(`Token vérifié avec succès pour email: ${result.email}`);
      return res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
    } catch (error) {
      this.logger.error(`Erreur vérification token GET: ${error.message}`, error.stack);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=verification_failed&message=${encodeURIComponent(error.message)}`);
    }
  }

  @Get('debug/env-check')
  async checkEnvironment() {
    this.logger.log('Vérification des variables d\'environnement');
    
    const envCheck = {
      EMAIL_USER: !!process.env.EMAIL_USER,
      EMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD,
      FRONTEND_URL: !!process.env.FRONTEND_URL,
      DB_HOST: !!process.env.DB_HOST,
      values: {
        EMAIL_USER: process.env.EMAIL_USER,
        FRONTEND_URL: process.env.FRONTEND_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    };

    this.logger.log('Variables d\'environnement vérifiées:', envCheck);
    return envCheck;
  }
}
