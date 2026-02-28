import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Groupe } from './entities/groupe.entity';
import { User } from '../users/entities/user.entity';
import { Student, ClassLevel } from '../students/entities/student.entity';
import { Parent } from '../parents/entities/parent.entity';
import { ParentStudent } from '../relations/entities/parent-student.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Groupe)
    private groupeRepository: Repository<Groupe>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
    @InjectRepository(ParentStudent)
    private parentStudentRepository: Repository<ParentStudent>,
  ) {}

  // Créer ou récupérer un groupe pour une classe
  async createOrGetClassGroup(classLevel: string): Promise<Groupe> {
    let groupe = await this.groupeRepository.findOne({
      where: { class_level: classLevel }
    });

    if (!groupe) {
      groupe = this.groupeRepository.create({
        title: `Groupe ${classLevel}`,
        class_level: classLevel
      });
      groupe = await this.groupeRepository.save(groupe);
    }

    return groupe;
  }

  // Récupérer tous les groupes d'un utilisateur selon son rôle
  async getUserGroups(userId: number, userRole: string): Promise<Groupe[]> {
    if (userRole === 'admin') {
      // L'admin voit tous les groupes
      return this.groupeRepository.find({
        order: { class_level: 'ASC' }
      });
    } else if (userRole === 'student') {
      // L'étudiant voit seulement son groupe de classe
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['student']
      });

      if (user?.student?.class_level) {
        const groupe = await this.groupeRepository.findOne({
          where: { class_level: user.student.class_level }
        });
        return groupe ? [groupe] : [];
      }
    }

    return [];
  }

  // Récupérer les participants d'un groupe (méthode simplifiée)
  async getGroupParticipants(groupeId: number): Promise<any[]> {
    // Cette méthode est maintenant gérée par le service simplifié
    return [];
  }

  // Vérifier si un utilisateur peut envoyer des messages à un autre
  async canSendMessage(senderId: number, recipientId: number, senderRole: string): Promise<boolean> {
    // Un utilisateur ne peut pas s'envoyer un message à lui-même
    if (senderId === recipientId) {
      return false;
    }

    const sender = await this.userRepository.findOne({
      where: { id: senderId },
      relations: ['student', 'parent']
    });

    const recipient = await this.userRepository.findOne({
      where: { id: recipientId },
      relations: ['student', 'parent']
    });

    if (!sender || !recipient) {
      return false;
    }

    // L'admin peut envoyer des messages seulement aux parents (pas aux étudiants)
    if (senderRole === 'admin') {
      return recipient.role === 'parent';
    }

    // Un parent peut envoyer des messages à ses enfants et à l'admin
    if (senderRole === 'parent') {
      if (recipient.role === 'admin') {
        return true;
      }

      // Vérifier si c'est son enfant
      if (recipient.role === 'student') {
        const relation = await this.parentStudentRepository.findOne({
          where: { 
            parent: { user_id: senderId },
            student: { user_id: recipientId }
          }
        });
        return !!relation;
      }
    }

    // Un étudiant peut envoyer des messages seulement à ses parents (pas à l'admin)
    if (senderRole === 'student') {
      // Vérifier si c'est son parent
      if (recipient.role === 'parent') {
        const relation = await this.parentStudentRepository.findOne({
          where: { 
            parent: { user_id: recipientId },
            student: { user_id: senderId }
          }
        });
        return !!relation;
      }
    }

    return false;
  }

  // Récupérer les utilisateurs disponibles pour une conversation
  async getAvailableRecipients(currentUserId: number, userRole: string): Promise<User[]> {
    if (userRole === 'admin') {
      // L'admin peut voir seulement les parents réels (pas les parents temporaires)
      const allParents = await this.userRepository.find({
        where: { role: UserRole.PARENT },
        select: ['id', 'firstName', 'lastName', 'email', 'role']
      });
      
      // Filtrer les parents temporaires
      return allParents.filter(parent => 
        !parent.email.startsWith('parent.virtuel.') && 
        !(parent.firstName === 'Parent' && parent.lastName === 'Temporaire')
      );
    } else if (userRole === 'parent') {
      // Un parent peut voir l'admin et ses enfants
      const user = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: ['parent']
      });

      if (!user?.parent) {
        return [];
      }

      // Récupérer l'admin
      const admin = await this.userRepository.findOne({
        where: { role: UserRole.ADMIN },
        select: ['id', 'firstName', 'lastName', 'email', 'role']
      });

      // Récupérer les enfants via une requête SQL directe
      const relations = await this.parentStudentRepository.query(`
        SELECT 
          su.id,
          su.first_name as firstName,
          su.last_name as lastName,
          su.email,
          su.role
        FROM parent_student ps
        JOIN parents p ON ps.parent_id = p.id
        JOIN students s ON ps.student_id = s.id
        JOIN users su ON s.user_id = su.id
        WHERE p.user_id = ?
      `, [currentUserId]);

      const children = relations;
      
      return admin ? [admin, ...children] : children;
    } else if (userRole === 'student') {
      // Un étudiant peut voir seulement ses parents (pas l'admin)
      const user = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: ['student']
      });

      if (!user?.student) {
        return [];
      }

      // Récupérer les parents via une requête SQL directe (exclure les parents temporaires)
      const relations = await this.parentStudentRepository.query(`
        SELECT 
          pu.id,
          pu.first_name as firstName,
          pu.last_name as lastName,
          pu.email,
          pu.role
        FROM parent_student ps
        JOIN parents p ON ps.parent_id = p.id
        JOIN students s ON ps.student_id = s.id
        JOIN users pu ON p.user_id = pu.id
        WHERE s.user_id = ? 
        AND pu.email NOT LIKE 'parent.virtuel.%'
        AND NOT (pu.first_name = 'Parent' AND pu.last_name = 'Temporaire')
      `, [currentUserId]);

      return relations;
    }

    return [];
  }
}