// src/modules/parents/parents.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent } from './entities/parent.entity';
import { CreateParentDto } from './dto/create-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';

@Injectable()
export class ParentsService {
  async findByUserId(userId: number): Promise<Parent | null> {
    return this.parentsRepository.findOne({ where: { user_id: userId } });
  }

  async findByUserIdWithUser(userId: number) {
    const parent = await this.parentsRepository.findOne({ 
      where: { user_id: userId },
      relations: ['user']
    });

    if (!parent) {
      return null;
    }

    // Transform data to match frontend expectations
    return {
      id: parent.id,
      firstName: parent.user?.firstName || '',
      lastName: parent.user?.lastName || '',
      email: parent.user?.email || '',
      phone: parent.phone_number || '',
      address: parent.address || '',
      occupation: parent.occupation || '',
      role: parent.user?.role || 'parent',
      isActive: parent.user?.is_active || false,
      isApproved: parent.user?.is_approved || false,
      createdAt: parent.user?.created_at ? new Date(parent.user.created_at).toISOString() : new Date().toISOString(),
    };
  }
  constructor(
    @InjectRepository(Parent)
    private parentsRepository: Repository<Parent>,
  ) {}

  async createParent(userId: number, phone?: string): Promise<Parent> {
    const parent = this.parentsRepository.create({
      user_id: userId,
      phone_number: phone,
    });
    return this.parentsRepository.save(parent);
  }

  async findAll({ page = 1, limit = 50 }: { page?: number; limit?: number }) {
    const [items, total] = await this.parentsRepository.findAndCount({
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    console.log(`Found ${items.length} parents with relations`);

    // Transform data to match frontend expectations
    const transformedItems = items.map(parent => {
      console.log(`Processing parent ${parent.id} with user:`, parent.user);
      return {
        id: parent.user?.id || parent.id, // Utiliser l'ID de l'utilisateur pour la coh√©rence
        parentId: parent.id, // Garder l'ID du parent pour r√©f√©rence
        firstName: parent.user?.firstName || '',
        lastName: parent.user?.lastName || '',
        email: parent.user?.email || '',
        phone_number: parent.phone_number || '',
        address: parent.address || '',
        occupation: parent.occupation || '',
        role: parent.user?.role || 'parent',
        isActive: parent.user?.is_active || false,
        isApproved: parent.user?.is_approved || false,
        createdAt: parent.user?.created_at ? new Date(parent.user.created_at).toISOString() : new Date().toISOString(),
        notes: '',
      };
    });

    console.log(`Transformed ${transformedItems.length} parents`);

    return { items: transformedItems, total, page, limit };
  }

  async findOne(id: number) {
    return this.parentsRepository.findOne({ where: { id } });
  }

  async create(dto: CreateParentDto) {
    // Check if parent already exists for this user
    const existingParent = await this.parentsRepository.findOne({
      where: { user_id: dto.user_id },
    });

    if (existingParent) {
      // Update existing parent with new data
      existingParent.phone_number = dto.phone_number ?? existingParent.phone_number;
      existingParent.address = dto.address ?? existingParent.address;
      existingParent.occupation = dto.occupation ?? existingParent.occupation;
      return this.parentsRepository.save(existingParent);
    }

    // Create new parent
    const entity = this.parentsRepository.create({
      user_id: dto.user_id,
      phone_number: dto.phone_number,
      address: dto.address,
      occupation: dto.occupation,
    });
    return this.parentsRepository.save(entity);
  }

  async update(id: number, dto: UpdateParentDto) {
    await this.parentsRepository.update(id, dto);
    return this.findOne(id);
  }

  async getChild(parentId: number) {
    // R√©cup√©rer l'enfant via la relation parent_student
    const childData = await this.parentsRepository.query(`
      SELECT 
        u.id,
        u.first_name as firstName,
        u.last_name as lastName,
        u.email,
        s.phone_number as phone,
        s.birth_date as dateOfBirth,
        s.class_level as classLevel
      FROM parent_student ps
      JOIN students s ON ps.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE ps.parent_id = ?
    `, [parentId]);

    if (childData.length > 0) {
      const child = childData[0];
      // Formater la date de naissance pour √©viter les probl√®mes de timezone
      if (child.dateOfBirth) {
        const date = new Date(child.dateOfBirth);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        child.dateOfBirth = `${year}-${month}-${day}T00:00:00.000Z`;
      }
      return child;
    }

    return null;
  }

  async getChildren(parentId: number) {
    console.log('Ì†ΩÌ¥ç Getting children for parent ID:', parentId);
    
    // R√©cup√©rer tous les enfants via la relation parent_student
    const childrenData = await this.parentsRepository.query(`
      SELECT 
        s.id as studentId,
        u.id as userId,
        u.first_name as firstName,
        u.last_name as lastName,
        u.email,
        s.phone_number as phone,
        s.birth_date as dateOfBirth,
        s.class_level as classLevel,
        s.progress_percentage,
        s.total_quiz_attempts,
        s.average_score
      FROM parent_student ps
      JOIN students s ON ps.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE ps.parent_id = ?
      ORDER BY u.first_name, u.last_name
    `, [parentId]);

    console.log('Ì†ΩÌ¥ç Found children:', childrenData.length);

    // Transformer les donn√©es pour le frontend
    const children = childrenData.map(child => {
      // Formater la date de naissance pour √©viter les probl√®mes de timezone
      let formattedDateOfBirth = null;
      if (child.dateOfBirth) {
        const date = new Date(child.dateOfBirth);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        formattedDateOfBirth = `${year}-${month}-${day}T00:00:00.000Z`;
      }

      return {
        id: child.studentId.toString(),
        userId: child.userId,
        firstName: child.firstName || '',
        lastName: child.lastName || '',
        email: child.email || '',
        phone: child.phone || '',
        dateOfBirth: formattedDateOfBirth,
        classLevel: child.classLevel || '',
        progressPercentage: child.progress_percentage || 0,
        totalQuizAttempts: child.total_quiz_attempts || 0,
        averageScore: child.average_score || 0,
        stats: {
          averageScore: child.average_score || 0,
          totalQuizzes: child.total_quiz_attempts || 0,
          completedQuizzes: child.total_quiz_attempts || 0,
          currentStreak: 0,
          totalXP: 0,
          badges: 0,
          rank: 1
        },
        recentActivity: {
          lastQuiz: child.total_quiz_attempts > 0 ? 'Quiz r√©cent' : 'Aucun quiz',
          lastScore: child.average_score || 0,
          lastActive: new Date().toISOString()
        }
      };
    });

    console.log('Ì†ΩÌ¥ç Transformed children:', children);
    return children;
  }

  async remove(id: number): Promise<{ success: boolean }> {
    await this.parentsRepository.delete(id);
    return { success: true };
  }
}