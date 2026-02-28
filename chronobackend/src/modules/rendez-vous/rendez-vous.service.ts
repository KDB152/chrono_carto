import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RendezVous } from './entities/rendez-vous.entity';

@Injectable()
export class RendezVousService {
  constructor(
    @InjectRepository(RendezVous)
    private rendezVousRepository: Repository<RendezVous>,
  ) {}

  async getRendezVousByParentId(parentId: string, status?: string) {
    const where: any = { parent_id: parentId };
    if (status) {
      where.status = status;
    }
    return this.rendezVousRepository.find({
      where,
      order: { timing: 'DESC' }
    });
  }

  async getAllRendezVous(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return this.rendezVousRepository.find({
      where,
      order: { timing: 'DESC' }
    });
  }

  async getRendezVousById(id: number) {
    return this.rendezVousRepository.findOne({
      where: { id }
    });
  }

  async updateRendezVous(id: number, updateData: { status: string; adminReason?: string; updatedAt?: string }) {
    const rendezVous = await this.rendezVousRepository.findOne({
      where: { id }
    });

    if (!rendezVous) {
      throw new Error('Le rendez-vous demandé n\'existe pas');
    }

    // Mettre à jour les champs
    rendezVous.status = updateData.status;
    if (updateData.adminReason !== undefined) {
      rendezVous.admin_reason = updateData.adminReason;
    }
    if (updateData.updatedAt) {
      rendezVous.updated_at = new Date(updateData.updatedAt);
    }

    return this.rendezVousRepository.save(rendezVous);
  }

  async deleteRendezVous(id: number) {
    const rendezVous = await this.rendezVousRepository.findOne({
      where: { id }
    });

    if (!rendezVous) {
      throw new Error('Le rendez-vous demandé n\'existe pas');
    }

    await this.rendezVousRepository.delete(id);
    return { message: 'Rendez-vous supprimé avec succès' };
  }

  async createRendezVous(createData: {
    parentId: string;
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    childName: string;
    childClass: string;
    timing: string;
    appointmentTime?: string;
    parentReason: string;
    childId?: number;
  }) {
    console.log('������ Creating rendez-vous in service with data:', createData);

    const rendezVous = this.rendezVousRepository.create({
      parent_id: createData.parentId,
      parent_name: createData.parentName,
      parent_email: createData.parentEmail,
      parent_phone: createData.parentPhone,
      child_name: createData.childName,
      child_class: createData.childClass,
      timing: new Date(createData.timing),
      appointment_time: createData.appointmentTime ? new Date(createData.appointmentTime) : null,
      parent_reason: createData.parentReason,
      status: 'pending',
      child_id: createData.childId?.toString() || null
    });

    const savedRendezVous = await this.rendezVousRepository.save(rendezVous);
    console.log('������ Rendez-vous created successfully:', savedRendezVous);
    
    return savedRendezVous;
  }
}
