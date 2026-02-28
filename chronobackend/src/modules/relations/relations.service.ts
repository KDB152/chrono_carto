// src/modules/relations/relations.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParentStudent } from './entities/parent-student.entity';

@Injectable()
export class RelationsService {
  constructor(
    @InjectRepository(ParentStudent)
    private parentStudentRepository: Repository<ParentStudent>,
  ) {}

  async createParentStudentRelation(parentId: number, studentId: number): Promise<ParentStudent> {
    // Vérifier si la relation existe déjà
    const existingRelation = await this.parentStudentRepository.findOne({
      where: { parent_id: parentId, student_id: studentId },
    });

    if (existingRelation) {
      return existingRelation;
    }

    // Créer une nouvelle relation
    const relation = this.parentStudentRepository.create({
      parent_id: parentId,
      student_id: studentId,
    });

    return this.parentStudentRepository.save(relation);
  }

  async getStudentsByParentId(parentId: number): Promise<ParentStudent[]> {
    return this.parentStudentRepository.find({
      where: { parent_id: parentId },
      relations: ['student', 'student.user'],
    });
  }

  async getParentsByStudentId(studentId: number): Promise<ParentStudent[]> {
    return this.parentStudentRepository.find({
      where: { student_id: studentId },
      relations: ['parent', 'parent.user'],
    });
  }

  async deleteParentStudentRelation(parentId: number, studentId: number): Promise<void> {
    await this.parentStudentRepository.delete({
      parent_id: parentId,
      student_id: studentId,
    });
  }
}
