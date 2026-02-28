import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { StudentsService } from '../students/students.service';
import { ParentsService } from '../parents/parents.service';
import { PaymentsService } from './payments.service';
import { RendezVousService } from '../rendez-vous/rendez-vous.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly studentsService: StudentsService,
    private readonly parentsService: ParentsService,
    private readonly paymentsService: PaymentsService,
    private readonly rendezVousService: RendezVousService,
  ) {}

  async listStudents({ page = 1, limit = 50 }: { page?: number; limit?: number }) {
    // First, ensure all student users have profiles
    await this.createMissingProfiles();
    
    return this.studentsService.findAll({ page, limit });
  }

  async listParents({ page = 1, limit = 50 }: { page?: number; limit?: number }) {
    // First, ensure all parent users have profiles
    await this.createMissingProfiles();
    
    return this.parentsService.findAll({ page, limit });
  }

  async createMissingProfiles() {
    console.log('Creating missing profiles for existing users...');
    
    // Get all users
    const allUsers = await this.usersService.findAll();
    console.log(`Found ${allUsers.length} total users`);
    
    for (const user of allUsers) {
      try {
        if (user.role === UserRole.STUDENT) {
          // Check if student profile exists
          const existingStudent = await this.studentsService.findByUserId(user.id);
          if (!existingStudent) {
            console.log(`Creating student profile for user ${user.id} (${user.email})`);
            await this.studentsService.create({
              user_id: user.id,
              class_level: undefined, // Pas de classe par défaut - l'utilisateur devra la sélectionner
              phone_number: user.phone || '',
            });
          }
        } else if (user.role === UserRole.PARENT) {
          // Check if parent profile exists
          const existingParent = await this.parentsService.findByUserId(user.id);
          if (!existingParent) {
            console.log(`Creating parent profile for user ${user.id} (${user.email})`);
            await this.parentsService.create({
              user_id: user.id,
              phone_number: user.phone || '',
              address: 'Non spécifié',
              occupation: 'Non spécifié',
            });
          }
        }
      } catch (error) {
        console.log(`Error creating profile for user ${user.id}:`, error.message);
      }
    }
    
    console.log('Missing profiles creation completed!');
  }

  async createStudentWithUser(payload: any) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(payload.email);
    if (existingUser) {
      throw new Error(`Un utilisateur avec l'email ${payload.email} existe déjà`);
    }

    // expected payload from UI: firstName, lastName, email, phone, class, level, averageScore, completedCourses, totalCourses
    const user = await this.usersService.createUser({
      email: payload.email,
      password: payload.password || 'changeme',
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: UserRole.STUDENT,
      is_approved: true, // Auto-approve users created by admin
    });

    const student = await this.studentsService.create({
      user_id: user.id,
      class_level: payload.class || payload.level,
      phone_number: payload.phone,
      address: payload.address,
      parent_id: payload.parent_id,
    });

    // Optional stats mapping
    await this.studentsService.update(student.id, {
      average_score: payload.averageScore ?? undefined,
      total_quiz_attempts: payload.completedCourses ?? undefined,
      progress_percentage: payload.totalCourses ? Math.min(100, Math.round((payload.completedCourses || 0) / payload.totalCourses * 100)) : undefined,
    });

    return { user, student };
  }

  async updateStudentWithUser(studentId: number, payload: any) {
    const student = await this.studentsService.findOne(studentId);
    if (!student) return null;
    if (payload.firstName || payload.lastName || payload.email || payload.phone !== undefined) {
      await this.usersService.update(student.user_id, {
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        phone: payload.phone,
      } as any);
    }
    return this.studentsService.update(studentId, {
      class_level: payload.class || payload.level,
      phone_number: payload.phone,
      address: payload.address,
      average_score: payload.averageScore,
      total_quiz_attempts: payload.completedCourses,
      progress_percentage: payload.totalCourses ? Math.min(100, Math.round((payload.completedCourses || 0) / payload.totalCourses * 100)) : undefined,
      parent_id: payload.parent_id,
    });
  }

  async deleteStudent(userId: number) {
    console.log('?? Admin attempting to delete student with user_id:', userId);
    
    // Trouver l'étudiant par user_id (pas par student.id)
    const student = await this.studentsService.findByUserId(userId);
    console.log('?? Student found by user_id:', student);
    
    if (!student) {
      console.log('?? Student with user_id', userId, 'not found');
      throw new Error('Étudiant non trouvé');
    }
    
    console.log('?? Student found, proceeding with deletion. Student ID:', student.id, 'User ID:', student.user_id);
    
    // Delete the student first (using student.id, not user_id)
    await this.studentsService.remove(student.id);
    console.log('?? Student', student.id, 'deleted from students table');
    
    // Then delete the associated user
    await this.usersService.remove(userId);
    console.log('?? User', userId, 'deleted from users table');
    
    return { success: true };
  }

  async createParentWithUser(payload: any) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(payload.email);
    if (existingUser) {
      throw new Error(`Un utilisateur avec l'email ${payload.email} existe déjà`);
    }

    // expected: firstName, lastName, email, phone, studentIds?
    const user = await this.usersService.createUser({
      email: payload.email,
      password: payload.password || 'changeme',
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: UserRole.PARENT,
      is_approved: true, // Auto-approve users created by admin
    });

    const parent = await this.parentsService.create({
      user_id: user.id,
      phone_number: payload.phone,
      address: payload.address,
      occupation: payload.occupation,
    });

    // Link to students if provided
    if (payload.studentIds && Array.isArray(payload.studentIds)) {
      for (const sid of payload.studentIds) {
        const studentId = parseInt(sid);
        if (!isNaN(studentId)) {
          await this.studentsService.update(studentId, { parent_id: parent.id });
        }
      }
    }

    return { user, parent };
  }

  async updateParentWithUser(parentId: number, payload: any) {
    const parent = await this.parentsService.findOne(parentId);
    if (!parent) return null;
    if (payload.firstName || payload.lastName || payload.email || payload.phone !== undefined) {
      await this.usersService.update(parent.user_id, {
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        phone: payload.phone,
      } as any);
    }
    const updated = await this.parentsService.update(parentId, {
      phone_number: payload.phone,
      address: payload.address,
      occupation: payload.occupation,
    });
    if (payload.studentIds && Array.isArray(payload.studentIds)) {
      for (const sid of payload.studentIds) {
        const studentId = parseInt(sid);
        if (!isNaN(studentId)) {
          await this.studentsService.update(studentId, { parent_id: parent.id });
        }
      }
    }
    return updated;
  }

  async deleteParent(userId: number) {
    console.log('?? Admin attempting to delete parent with user_id:', userId);
    
    // Trouver le parent par user_id (pas par parent.id)
    const parent = await this.parentsService.findByUserId(userId);
    console.log('?? Parent found by user_id:', parent);
    
    if (!parent) {
      console.log('?? Parent with user_id', userId, 'not found');
      throw new Error('Parent non trouvé');
    }
    
    console.log('?? Parent found, proceeding with deletion. Parent ID:', parent.id, 'User ID:', parent.user_id);
    
    // Delete the parent first (using parent.id, not user_id)
    await this.parentsService.remove(parent.id);
    console.log('?? Parent', parent.id, 'deleted from parents table');
    
    // Then delete the associated user
    await this.usersService.remove(userId);
    console.log('?? User', userId, 'deleted from users table');
    
    return { success: true };
  }

  async setUserApproval(userId: number, approve: boolean) {
    // The ID passed is the user ID, so we can directly update the user
    try {
      // First, check if the user exists
      const existingUser = await this.usersService.findById(userId);
      if (!existingUser) {
        console.error(`? User ${userId} not found`);
        throw new Error(`Utilisateur avec l'ID ${userId} non trouvé`);
      }

      console.log(`?? Updating user ${userId} (${existingUser.email}) approval status to: ${approve}`);
      
      const updatedUser = await this.usersService.update(userId, { 
        is_approved: approve, 
        is_active: approve 
      } as any);
      
      console.log(`? User ${userId} approval status updated to: ${approve}`);
      return {
        success: true,
        message: `Utilisateur ${existingUser.email} ${approve ? 'approuvé' : 'désapprouvé'} avec succès`,
        user: updatedUser
      };
    } catch (error) {
      console.error(`? Error updating user ${userId} approval:`, error);
      throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
    }
  }

  async deleteUser(userId: number) {
    console.log(`??????? Admin attempting to delete user ${userId}`);
    
    try {
      // Find the user first to check what type of profile they have
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }
      
      console.log(`?????? Found user ${userId} with role: ${user.role}`);
      
      // Delete associated profiles first based on user role
      if (user.role === UserRole.STUDENT) {
        const student = await this.studentsService.findByUserId(userId);
        if (student) {
          console.log(`??????? Deleting student profile ${student.id}`);
          await this.studentsService.remove(student.id);
        }
      } else if (user.role === UserRole.PARENT) {
        const parent = await this.parentsService.findByUserId(userId);
        if (parent) {
          console.log(`??????? Deleting parent profile ${parent.id}`);
          await this.parentsService.remove(parent.id);
        }
      }
      
      // Finally delete the user
      console.log(`??????? Deleting user ${userId}`);
      await this.usersService.remove(userId);
      
      console.log(`? User ${userId} successfully deleted`);
      return { success: true, message: `Utilisateur ${user.email} supprimé avec succès` };
      
    } catch (error) {
      console.error(`? Error deleting user ${userId}:`, error);
      throw new Error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
    }
  }

  async cleanTestUsers() {
    console.log('Cleaning test users from database...');
    
    const testEmails = [
      'lucas.dubois@student.fr',
      'emma.martin@student.fr', 
      'thomas.bernard@student.fr',
      'sophie.leroy@student.fr',
      'marie.dubois@parent.fr',
      'jean.martin@parent.fr',
      'pierre.bernard@parent.fr'
    ];

    let deletedCount = 0;

    for (const email of testEmails) {
      try {
        const user = await this.usersService.findByEmail(email);
        if (user) {
          console.log(`Deleting test user: ${email}`);
          
          // Delete associated student/parent profile first
          if (user.role === UserRole.STUDENT) {
            const student = await this.studentsService.findByUserId(user.id);
            if (student) {
              await this.studentsService.remove(student.id);
            }
          } else if (user.role === UserRole.PARENT) {
            const parent = await this.parentsService.findByUserId(user.id);
            if (parent) {
              await this.parentsService.remove(parent.id);
            }
          }
          
          // Delete the user
          await this.usersService.remove(user.id);
          deletedCount++;
        }
      } catch (error) {
        console.log(`Error deleting test user ${email}:`, error.message);
      }
    }

    console.log(`Cleaned ${deletedCount} test users from database.`);
    return { deletedCount };
  }

  async getPayments({ classLevel, status }: { classLevel?: string; status?: string }) {
    const payments = await this.paymentsService.findAll({ classLevel, status });
    return {
      payments,
      total: payments.length
    };
  }

  async updatePayment(paymentId: number, updateData: any) {
    console.log(`Updating payment ${paymentId} with:`, updateData);
    
    // Mettre à jour le paiement dans la base de données
    const updatedPayment = await this.paymentsService.update(paymentId, updateData);
    
    return {
      success: true,
      message: 'Paiement mis à jour avec succès',
      data: updatedPayment
    };
  }

  // Rendez-vous management
  async getRendezVous(status?: string) {
    console.log('?? Admin getting rendez-vous with status:', status);
    return this.rendezVousService.getAllRendezVous(status);
  }

  async acceptRendezVous(id: number, adminReason?: string) {
    console.log('?? Admin accepting rendez-vous:', id, 'with reason:', adminReason);
    return this.rendezVousService.updateRendezVous(id, {
      status: 'accepted',
      adminReason: adminReason || 'Rendez-vous accepté par l\'administration',
      updatedAt: new Date().toISOString()
    });
  }

  async refuseRendezVous(id: number, adminReason?: string) {
    console.log('?? Admin refusing rendez-vous:', id, 'with reason:', adminReason);
    return this.rendezVousService.updateRendezVous(id, {
      status: 'refused',
      adminReason: adminReason || 'Rendez-vous refusé par l\'administration',
      updatedAt: new Date().toISOString()
    });
  }
}

