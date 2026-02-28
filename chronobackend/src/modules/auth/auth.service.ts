// src/modules/auth/auth.service.ts
import { Injectable, HttpException, HttpStatus, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { StudentsService } from '../students/students.service';
import { ParentsService } from '../parents/parents.service';
import { RelationsService } from '../relations/relations.service';
import { User, UserRole } from '../users/entities/user.entity';
import { EmailVerificationService } from './email-verification.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  findUserByEmail(email: string) {
    throw new Error('Method not implemented.');
  }
  emailService: any;
  constructor(
    private usersService: UsersService,
    private studentsService: StudentsService,
    private parentsService: ParentsService,
    private relationsService: RelationsService,
    private emailVerificationService: EmailVerificationService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string; userId: number }> {
    console.log('?? AuthService.register called with data:', registerDto);
    const { first_name, last_name, email, password, phone, userType } = registerDto;
    console.log('?? Extracted phone value:', phone);

    // Convertir le string userType en enum UserRole
    let role: UserRole;
    switch (userType) {
      case 'student':
        role = UserRole.STUDENT;
        break;
      case 'parent':
        role = UserRole.PARENT;
        break;
      case 'teacher':
        role = UserRole.TEACHER;
        break;
      case 'admin':
        role = UserRole.ADMIN;
        break;
      default:
        role = UserRole.STUDENT; // valeur par d?faut
    }

    try {
      console.log('?? Creating user with data:', {
        email,
        password: '[HIDDEN]',
        firstName: first_name,
        lastName: last_name,
        phone: phone,
        role
      });
      
      const user = await this.usersService.createUser({
        email,
        password,
        firstName: first_name,
        lastName: last_name,
        phone: phone,
        role, // ? maintenant c'est un UserRole
      });
      
      console.log('?? User created successfully:', { id: user.id, email: user.email, phone: user.phone });

      // New users must be approved by admin
      await this.usersService.update(user.id, { is_approved: false, is_active: false } as any);

      if (role === UserRole.STUDENT) {
        try {
          const student = await this.studentsService.create({
            user_id: user.id,
            phone_number: phone,
            birth_date: registerDto.studentBirthDate ? new Date(registerDto.studentBirthDate) : undefined,
            class_level: registerDto.studentClass,
            parent_id: null, // Sera mis ? jour apr?s la cr?ation du parent
          });

          // Cr?er automatiquement un compte parent virtuel si l'?tudiant n'a pas fourni les d?tails de ses parents
          let parentCreated = false;
          
          if (registerDto.parentFirstName && registerDto.parentLastName && registerDto.parentEmail) {
            // L'?tudiant a fourni les d?tails de ses parents
            try {
              // V?rifier si un parent avec cet email existe d?j?
              const existingParentUser = await this.usersService.findByEmail(registerDto.parentEmail);
              
              if (!existingParentUser) {
                // Cr?er un nouveau compte parent avec le mot de passe fourni ou celui de l'?tudiant
                const parentUser = await this.usersService.createUser({
                  email: registerDto.parentEmail,
                  password: registerDto.parentPassword || registerDto.password,
                  firstName: registerDto.parentFirstName,
                  lastName: registerDto.parentLastName,
                  phone: registerDto.parentPhone,
                  role: UserRole.PARENT,
                  is_approved: false,
                  is_active: true,
                });

                // Cr?er l'entit? parent
                const parent = await this.parentsService.create({
                  user_id: parentUser.id,
                  phone_number: registerDto.parentPhone,
                });

                // Mettre ? jour le parent_id de l'?tudiant
                await this.studentsService.update(student.id, { parent_id: parent.id });

                // Cr?er la relation parent-student
                await this.relationsService.createParentStudentRelation(parent.id, student.id);

                console.log(`Compte parent cr?? automatiquement pour l'?tudiant ${user.email}`);
                parentCreated = true;
              } else {
                // Si le parent existe d?j?, cr?er la relation
                const existingParent = await this.parentsService.findByUserId(existingParentUser.id);
                if (existingParent) {
                  // Mettre ? jour le parent_id de l'?tudiant
                  await this.studentsService.update(student.id, { parent_id: existingParent.id });
                  
                  await this.relationsService.createParentStudentRelation(existingParent.id, student.id);
                  console.log(`Relation cr??e entre l'?tudiant ${user.email} et le parent existant ${registerDto.parentEmail}`);
                  parentCreated = true;
                }
              }
            } catch (parentCreationError) {
              console.error('Erreur lors de la cr?ation automatique du compte parent:', parentCreationError);
              // Ne pas faire ?chouer l'inscription de l'?tudiant
            }
          }
          
          // Si aucun parent n'a ?t? cr??/link?, cr?er un compte parent virtuel temporaire
          if (!parentCreated) {
            try {
              // V?rifier que le t?l?phone parent est fourni
              if (!registerDto.parentPhone) {
                throw new Error('Le num?ro de t?l?phone du parent est obligatoire pour les ?tudiants');
              }

              const virtualParentEmail = `parent.virtuel.${user.email}`;
              // Utiliser le m?me mot de passe que l'?tudiant
              const virtualParentPassword = registerDto.password;
              
              // Cr?er un compte parent virtuel avec le t?l?phone fourni
              const virtualParentUser = await this.usersService.createUser({
                email: virtualParentEmail,
                password: virtualParentPassword,
                firstName: 'Parent',
                lastName: 'Temporaire',
                phone: registerDto.parentPhone, // Utiliser le t?l?phone parent fourni
                role: UserRole.PARENT,
                is_approved: false,
                is_active: true,
              });

              // Cr?er l'entit? parent virtuelle
              const virtualParent = await this.parentsService.create({
                user_id: virtualParentUser.id,
                phone_number: registerDto.parentPhone,
              });

              // Mettre ? jour le parent_id de l'?tudiant
              await this.studentsService.update(student.id, { parent_id: virtualParent.id });

              // Cr?er la relation parent-student
              await this.relationsService.createParentStudentRelation(virtualParent.id, student.id);

              console.log(`Compte parent virtuel cr?? automatiquement pour l'?tudiant ${user.email} avec l'email ${virtualParentEmail} et le t?l?phone ${registerDto.parentPhone}`);
            } catch (virtualParentCreationError) {
              console.error('Erreur lors de la cr?ation du compte parent virtuel:', virtualParentCreationError);
              throw virtualParentCreationError; // Faire ?chouer l'inscription si le t?l?phone parent n'est pas fourni
            }
          }
        } catch (studentError) {
          console.error('Erreur lors de la cr?ation de l\'?tudiant:', studentError);
          // Continue with registration even if student creation fails
        }
      } else if (role === UserRole.PARENT) {
        try {
          const parent = await this.parentsService.create({
            user_id: user.id,
            phone_number: phone,
          });

          // Cr?er automatiquement un compte ?tudiant virtuel si le parent n'a pas fourni les d?tails de son enfant
          let childCreated = false;
          
          // Vérifier si le parent a fourni les détails complets de son enfant
          // childEmail est optionnel, donc on ne le vérifie pas
          const hasChildData = registerDto.childFirstName && 
                              registerDto.childLastName && 
                              registerDto.childPhone;
          
          console.log('Données enfant reçues:', {
            childFirstName: registerDto.childFirstName,
            childLastName: registerDto.childLastName,
            childEmail: registerDto.childEmail,
            childPhone: registerDto.childPhone,
            hasChildData
          });
          
          if (hasChildData) {
            // Le parent a fourni les d?tails de son enfant
            try {
              // Cr?er un nouveau compte enfant avec l'email fourni par le parent ou générer un email virtuel
              // Utiliser le m?me mot de passe que le parent si childPassword n'est pas fourni
              const childPassword = registerDto.childPassword || registerDto.password;
              const childEmail = registerDto.childEmail || `enfant.virtuel.${user.email}`;
              
              const childUser = await this.usersService.createUser({
                email: childEmail,
                password: childPassword,
                firstName: registerDto.childFirstName,
                lastName: registerDto.childLastName,
                phone: registerDto.childPhone,
                role: UserRole.STUDENT,
                is_approved: false,
                is_active: true,
              });

              // Cr?er l'entit? student
              const student = await this.studentsService.create({
                user_id: childUser.id,
                phone_number: registerDto.childPhone || '',
                birth_date: registerDto.childBirthDate ? new Date(registerDto.childBirthDate) : undefined,
                class_level: registerDto.childClass,
                parent_id: parent.id,
              });

              // Cr?er la relation parent-student
              await this.relationsService.createParentStudentRelation(parent.id, student.id);

              console.log(`Compte enfant cr?? automatiquement pour le parent ${user.email} avec l'email ${childEmail}`);
              childCreated = true;
            } catch (childCreationError) {
              console.error('Erreur lors de la cr?ation automatique du compte enfant:', childCreationError);
              // Ne pas faire ?chouer l'inscription du parent
            }
          } else {
            console.log('Données enfant incomplètes, création d\'un compte étudiant virtuel');
          }
          
          // Si aucun enfant n'a ?t? cr??, cr?er un compte ?tudiant virtuel temporaire
          if (!childCreated) {
            try {
              const virtualChildEmail = `enfant.virtuel.${user.email}`;
              // Utiliser le m?me mot de passe que le parent
              const virtualChildPassword = registerDto.password;
              
              // Cr?er un compte ?tudiant virtuel
              const virtualChildUser = await this.usersService.createUser({
                email: virtualChildEmail,
                password: virtualChildPassword,
                firstName: '?tudiant',
                lastName: 'Temporaire',
                phone: phone, // Utiliser le m?me t?l?phone que le parent
                role: UserRole.STUDENT,
                is_approved: false,
                is_active: true,
              });

              // Cr?er l'entit? student virtuelle
              const virtualStudent = await this.studentsService.create({
                user_id: virtualChildUser.id,
                phone_number: phone,
                birth_date: undefined, // Date de naissance par d?faut
                class_level: undefined, // Niveau de classe par d?faut
                parent_id: parent.id,
              });

              // Cr?er la relation parent-student
              await this.relationsService.createParentStudentRelation(parent.id, virtualStudent.id);

              console.log(`Compte ?tudiant virtuel cr?? automatiquement pour le parent ${user.email} avec l'email ${virtualChildEmail}`);
            } catch (virtualChildCreationError) {
              console.error('Erreur lors de la cr?ation du compte ?tudiant virtuel:', virtualChildCreationError);
              // Ne pas faire ?chouer l'inscription du parent
            }
          }
        } catch (parentError) {
          console.error('Erreur lors de la cr?ation du parent:', parentError);
          // Continue with registration even if parent creation fails
        }
      }

      // Envoyer automatiquement le lien de v?rification d'email
      try {
        await this.emailVerificationService.sendVerificationLink(email);
      } catch (error) {
        console.error('Erreur lors de l\'envoi du lien de v?rification:', error);
        // Ne pas faire ?chouer l'inscription si l'email ne peut pas ?tre envoy?
      }

      return { 
        message: 'Inscription r?ussie. Un lien de v?rification a ?t? envoy? ? votre adresse email.', 
        userId: user.id 
      };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: { id: number; email: string; role: UserRole; firstName: string; lastName: string } }> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // V?rifier que l'email est v?rifi? (sauf pour les admins)
    if (user.role !== UserRole.ADMIN && !user.email_verified) {
      throw new UnauthorizedException('EMAIL_NOT_VERIFIED');
    }

    // V?rifier que le compte est approuv? (sauf pour les admins)
    if (user.role !== UserRole.ADMIN && !user.is_approved) {
      throw new UnauthorizedException('ACCOUNT_NOT_APPROVED');
    }
    // R?cup?rer les informations suppl?mentaires selon le r?le
    let additionalInfo = {};
    if (user.role === UserRole.STUDENT) {
      const student = await this.studentsService.findByUserId(user.id);
      if (student) {
        additionalInfo = { class_level: student.class_level };
      }
    }
    
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      ...additionalInfo
    };
    const accessToken = this.jwtService.sign(payload);

    let userDetails: any = {
      id: user.id,
      email: user.email,
      role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
    };

    if (user.role === UserRole.STUDENT) {
      const student = await this.studentsService.findByUserId(user.id);
      if (student !== undefined && student !== null) {
        userDetails = { ...userDetails, studentDetails: student };
      }
    } else if (user.role === UserRole.PARENT) {
      const parent = await this.parentsService.findByUserId(user.id);
      if (parent !== undefined && parent !== null) {
        userDetails = { ...userDetails, parentDetails: parent };
      }
    } else if (user.role === UserRole.ADMIN) {
      // No specific admin details to fetch from a separate service, 
      // but you could add them here if needed.
    }

    return {
      accessToken,
      user: userDetails,
    };
  }

  async verifyEmailToken(token: string): Promise<boolean> {
    try {
      const { email } = await this.emailVerificationService.verifyToken(token);
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new HttpException('Utilisateur non trouv?', HttpStatus.NOT_FOUND);
      }
      user.email_verified = true;
      await this.userRepository.save(user);
      return true;
    } catch (error) {
      console.error('Erreur v?rification email:', error);
      throw error;
    }
  }

  async forgotPassword(email: string) {
  // V?rifie si l'utilisateur existe
  const user = await this.userRepository.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundException("User not found");
  }

  // G?n?rer un token de reset
  const resetToken = uuidv4(); // n?cessite import { v4 as uuidv4 } from 'uuid';
  user.verification_token = resetToken;
  user.verification_token_expiry = new Date(Date.now() + 1000 * 60 * 60); // expire dans 1h
  await this.userRepository.save(user);

  // Envoi email
  await this.emailService.sendPasswordReset(user.email, resetToken);

  return { message: 'Password reset link sent successfully' };
}


  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ 
      where: { password_reset_token: token } 
    });

    if (!user) {
      throw new HttpException('Token de r?initialisation invalide', HttpStatus.BAD_REQUEST);
    }

    if (!user.password_reset_token_expiry || new Date() > user.password_reset_token_expiry) {
      throw new HttpException('Token de r?initialisation expir?', HttpStatus.BAD_REQUEST);
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Mettre ? jour le mot de passe et supprimer les tokens de r?initialisation
    user.password_hash = hashedPassword;
    user.password_reset_token = null;
    user.password_reset_token_expiry = null;
    user.password_reset_code = null;
    user.password_reset_code_expiry = null;
    await this.userRepository.save(user);

    return { message: 'Mot de passe r?initialis? avec succ?s' };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    // R?cup?rer l'utilisateur
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new HttpException('Utilisateur non trouv?', HttpStatus.NOT_FOUND);
    }

    // V?rifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new HttpException('Mot de passe actuel incorrect', HttpStatus.BAD_REQUEST);
    }

    // V?rifier que le nouveau mot de passe est diff?rent de l'actuel
    const isNewPasswordSame = await bcrypt.compare(newPassword, user.password_hash);
    if (isNewPasswordSame) {
      throw new HttpException('Le nouveau mot de passe doit ?tre diff?rent de l\'actuel', HttpStatus.BAD_REQUEST);
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Mettre ? jour le mot de passe
    user.password_hash = hashedPassword;
    await this.userRepository.save(user);

    return { message: 'Mot de passe modifi? avec succ?s' };
  }

  async changeEmail(userId: number, newEmail: string): Promise<{ message: string }> {
    console.log('?? Debug - changeEmail appel? avec:', { userId, newEmail, userIdType: typeof userId });
    
    // V?rifier que les param?tres ne sont pas undefined
    if (userId === undefined || userId === null) {
      throw new HttpException('ID utilisateur manquant', HttpStatus.BAD_REQUEST);
    }
    
    if (newEmail === undefined || newEmail === null || newEmail.trim() === '') {
      throw new HttpException('Email manquant', HttpStatus.BAD_REQUEST);
    }
    
    // Convertir userId en nombre si n?cessaire
    const numericUserId = parseInt(userId.toString());
    console.log('?? Debug - userId converti:', { original: userId, converted: numericUserId });
    
    // Rcuprer l'utilisateur
    const user = await this.userRepository.findOne({ where: { id: numericUserId } });
    console.log('?? Debug - Utilisateur trouv?:', user ? { id: user.id, email: user.email } : 'null');
    
    if (!user) {
      throw new HttpException('Utilisateur non trouv', HttpStatus.NOT_FOUND);
    }

    // Vrifier si l'email existe dj (avec normalisation)
    const normalizedEmail = newEmail.trim().toLowerCase();
    
    // Requ?te SQL brute pour d?boguer
    const rawQuery = await this.userRepository.query(
      'SELECT id, email FROM users WHERE email = ?',
      [normalizedEmail]
    );
    console.log('?? Debug - Requ?te SQL brute:', rawQuery);
    
    const existingUser = await this.userRepository.findOne({ 
      where: { email: normalizedEmail } 
    });
    console.log('?? Debug - Utilisateur existant avec cet email:', existingUser ? { id: existingUser.id, email: existingUser.email } : 'null');
    console.log('?? Debug - Email normalis?:', { original: newEmail, normalized: normalizedEmail });
    
    // Comparaison stricte avec conversion de type
    if (existingUser && parseInt(existingUser.id.toString()) !== numericUserId) {
      console.log('?? Debug - Email d?j? utilis? par un autre utilisateur:', { 
        existingUserId: existingUser.id, 
        currentUserId: numericUserId, 
        existingUserIdType: typeof existingUser.id,
        currentUserIdType: typeof numericUserId,
        comparison: parseInt(existingUser.id.toString()) !== numericUserId 
      });
      throw new HttpException('Cet email est dj utilis par un autre utilisateur', HttpStatus.BAD_REQUEST);
    }

    // Mettre jour l'email et marquer comme non vrifi
    user.email = normalizedEmail;
    user.email_verified = false;
    user.verification_token = null;
    user.email_verification_code = null;
    user.email_verification_code_expiry = null;
    
    await this.userRepository.save(user);
    console.log('?? Debug - Email mis ? jour avec succ?s pour utilisateur:', numericUserId);

    return { message: 'Email modifi avec succs. Veuillez vrifier votre nouvelle adresse email.' };
  }

  private generateTemporaryPassword(): string {
    // G?n?rer un mot de passe temporaire al?atoire
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
