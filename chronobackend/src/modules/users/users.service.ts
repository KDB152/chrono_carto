// src/modules/users/users.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { StudentsService } from '../students/students.service';
import { ParentsService } from '../parents/parents.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly studentsService: StudentsService,
    private readonly parentsService: ParentsService,
  ) {}

  async createUser(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: UserRole;
    is_approved?: boolean;
    is_active?: boolean;
  }): Promise<User> {
    // Normaliser l'email pour éviter les doublons liés à la casse/espaces
    const normalizedEmail = data.email.trim().toLowerCase();

    // Vérifier l'unicité avant d'essayer de sauvegarder (message clair côté API)
    const existing = await this.usersRepository.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      throw new ConflictException(
        "Cette adresse email est deja utilisee par un autre compte. Veuillez en choisir une autre."
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.usersRepository.create({
      email: normalizedEmail,
      password_hash: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role ?? UserRole.STUDENT,
      is_active: data.is_active ?? true,
      is_approved: data.is_approved ?? false,
    });

    try {
      return await this.usersRepository.save(user);
    } catch (err: any) {
      // Filet de sécurité si la contrainte UNIQUE remonte depuis la DB
      // MySQL: code 'ER_DUP_ENTRY' (1062) | Postgres: code '23505'
      const code = err?.code ?? err?.errno;
      if (code === 'ER_DUP_ENTRY' || code === 1062 || code === '23505') {
        throw new ConflictException(
          "Cette adresse email est deja utilisee par un autre compte. Veuillez en choisir une autre."
        );
      }
      throw err;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.usersRepository.findOne({ 
      where: { id }
      // Temporairement d?sactiv? les relations pour ?viter les erreurs
      // relations: ['student', 'parent']
    });
    console.log('?? findById result for user', id, ':', user);
    return user;
  }

  async findByRole(role: string): Promise<User[]> {
    return this.usersRepository.find({ 
      where: { role: role as UserRole },
      select: ['id', 'firstName', 'lastName', 'email', 'role']
    });
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    console.log('?? UsersService.update called with id:', id, 'and data:', data);
    
    try {
      // Debug: Lister tous les utilisateurs pour voir les IDs disponibles
      const allUsers = await this.usersRepository.find({ select: ['id', 'firstName', 'lastName', 'email'] });
      console.log('?? All users in database:', allUsers);
      
      // V?rifier que l'ID est valide
      if (!id || isNaN(id)) {
        throw new Error(`ID utilisateur invalide: ${id}`);
      }
      
      // Essayer de trouver l'utilisateur par ID d'abord
      let existingUser = await this.usersRepository.findOne({ where: { id } });
      
      if (!existingUser) {
        console.error('?? User not found with id:', id);
        console.error('?? Available user IDs:', allUsers.map(u => u.id));
        console.error('?? Available users:', allUsers.map(u => ({ id: u.id, email: u.email, name: `${u.firstName} ${u.lastName}` })));
        
        // Retourner une erreur plus informative
        const availableUsers = allUsers.map(u => `ID: ${u.id} - ${u.email} (${u.firstName} ${u.lastName})`).join('\n');
        throw new Error(`Utilisateur avec l'ID ${id} non trouv?.\n\nUtilisateurs disponibles:\n${availableUsers}`);
      }
      console.log('?? Existing user found:', existingUser);
      
      // V?rifier l'unicit? de l'email si l'email est modifi?
      if (data.email && data.email !== existingUser.email) {
        console.log('?? Email is being changed, checking uniqueness...');
        const emailExists = await this.usersRepository.findOne({ 
          where: { email: data.email } 
        });
        if (emailExists && emailExists.id !== id) {
          throw new Error(`L'email "${data.email}" est d?j? utilis? par un autre utilisateur.`);
        }
        console.log('?? Email is unique, proceeding with update...');
      }
      
      // S?parer les donn?es User des donn?es Student/Parent
      const userData: any = {};
      const studentData: any = {};
      const parentData: any = {};
      
      // Mapper TOUS les champs User
      if (data.firstName !== undefined) userData.firstName = data.firstName;
      if (data.lastName !== undefined) userData.lastName = data.lastName;
      if (data.email !== undefined) userData.email = data.email;
      if (data.phone !== undefined || (data as any).phone_number !== undefined) {
        userData.phone = data.phone || (data as any).phone_number;
        console.log('?? Phone field mapped from data:', data.phone, 'or', (data as any).phone_number, '?', userData.phone);
      }
      if (data.is_active !== undefined) userData.is_active = data.is_active;
      if (data.is_approved !== undefined) userData.is_approved = data.is_approved;
      if ((data as any).email_verified !== undefined) userData.email_verified = (data as any).email_verified;
      if ((data as any).last_login !== undefined) userData.last_login = (data as any).last_login;
      
      // Note: Les champs parent/enfant ne sont pas stock?s dans l'entit? User
      // Ils seront g?r?s via les entit?s Student et Parent s?par?ment
      // Pour l'instant, on les ignore dans la mise ? jour de l'entit? User
      
      // Mapper les champs Student essentiels
      if ((data as any).classLevel !== undefined) studentData.class_level = (data as any).classLevel;
      if ((data as any).birthDate !== undefined) {
        studentData.birth_date = new Date((data as any).birthDate);
        console.log('?? Birth date mapped:', (data as any).birthDate);
      }
      // Ajouter le num?ro de t?l?phone pour les ?tudiants
      if (data.phone !== undefined || (data as any).phone_number !== undefined) {
        studentData.phone_number = data.phone || (data as any).phone_number;
        console.log('?? Student phone_number mapped:', studentData.phone_number);
      }
      
      // Mapper TOUS les champs Parent
      if ((data as any).phone_number !== undefined) parentData.phone_number = (data as any).phone_number;
      if ((data as any).address !== undefined) parentData.address = (data as any).address;
      if ((data as any).occupation !== undefined) parentData.occupation = (data as any).occupation;
      
      // Debug: v?rifier si les donn?es sont bien mapp?es
      console.log('?? Original data keys:', Object.keys(data));
      console.log('?? Mapped userData keys:', Object.keys(userData));
      console.log('?? Mapped studentData keys:', Object.keys(studentData));
      console.log('?? Mapped parentData keys:', Object.keys(parentData));
      
      console.log('?? User data to update:', userData);
      console.log('?? Student data to update:', studentData);
      console.log('?? Parent data to update:', parentData);
      
      // Mettre ? jour l'entit? User
      if (Object.keys(userData).length > 0) {
        console.log('?? Updating User entity with data:', userData);
        
        // R?cup?rer l'utilisateur existant
        const existingUser = await this.usersRepository.findOne({ where: { id } });
        if (!existingUser) {
          throw new Error('Utilisateur non trouv?');
        }
        
        console.log('?? User before update:', {
          id: existingUser.id,
          phone: existingUser.phone,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName
        });
        
        // Mettre ? jour les propri?t?s
        Object.assign(existingUser, userData);
        
        console.log('?? User after Object.assign:', {
          id: existingUser.id,
          phone: existingUser.phone,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName
        });
        
        // Sauvegarder l'entit? mise ? jour
        const updatedUser = await this.usersRepository.save(existingUser);
        console.log('?? User updated successfully:', {
          id: updatedUser.id,
          phone: updatedUser.phone,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName
        });
      } else {
        console.log('?? No User data to update');
      }
      
      // Mettre ? jour l'entit? Student si c'est un ?tudiant et qu'il y a des donn?es ? mettre ? jour
      if (Object.keys(studentData).length > 0) {
        console.log('?? Updating Student entity with data:', studentData);
        try {
          // R?cup?rer l'?tudiant par user_id
          const student = await this.studentsService.findByUserId(id);
          if (student) {
            await this.studentsService.update(student.id, studentData);
            console.log('?? Student updated successfully with data:', studentData);
          } else {
            console.log('?? No student found for user ID:', id);
          }
        } catch (error) {
          console.error('?? Error updating student:', error);
          // Ne pas faire ?chouer la mise ? jour de l'utilisateur si la mise ? jour de l'?tudiant ?choue
        }
      } else {
        console.log('?? No student data to update');
      }
      
      // Mettre ? jour l'entit? Parent si c'est un parent et qu'il y a des donn?es ? mettre ? jour
      if (Object.keys(parentData).length > 0) {
        console.log('?? Updating Parent entity with data:', parentData);
        try {
          // R?cup?rer le parent par user_id
          const parent = await this.parentsService.findByUserId(id);
          if (parent) {
            await this.parentsService.update(parent.id, parentData);
            console.log('?? Parent updated successfully');
          } else {
            console.log('?? No parent found for user ID:', id);
          }
        } catch (error) {
          console.error('?? Error updating parent:', error);
          // Ne pas faire ?chouer la mise ? jour de l'utilisateur si la mise ? jour du parent ?choue
        }
      }
      
      const updatedUser = await this.findById(id);
      console.log('?? Final updated user:', updatedUser);
      return updatedUser;
      
    } catch (error) {
      console.error('?? Error in UsersService.update:', error);
      console.error('?? Error stack:', error.stack);
      throw error;
    }
  }

  async remove(id: number): Promise<{ success: boolean }> {
    await this.usersRepository.delete(id);
    return { success: true };
  }
}