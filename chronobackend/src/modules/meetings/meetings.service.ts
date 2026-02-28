import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from './entities/meeting.entity';
import { Parent } from '../parents/entities/parent.entity';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private meetingsRepository: Repository<Meeting>,
    @InjectRepository(Parent)
    private parentsRepository: Repository<Parent>,
  ) {}

  async getMeetingsByParentId(parentId: number, status?: string) {
    const where: any = { parent_id: parentId };
    if (status) {
      where.status = status;
    }
    return this.meetingsRepository.find({
      where,
      order: { meeting_date: 'DESC' }
    });
  }

  async getMeetingsByAdminId(adminId: number, status?: string) {
    const where: any = { admin_id: adminId };
    if (status) {
      where.status = status;
    }
    return this.meetingsRepository.find({
      where,
      order: { meeting_date: 'DESC' }
    });
  }

  async getAllMeetings(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return this.meetingsRepository.find({
      where,
      order: { meeting_date: 'DESC' }
    });
  }

  async getParentByUserId(userId: number) {
    return this.parentsRepository.findOne({
      where: { user_id: userId }
    });
  }
}
