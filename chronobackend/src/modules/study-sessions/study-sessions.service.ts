import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudySession } from './study-session.entity';
import { CreateStudySessionDto } from './dto/create-study-session.dto';
import { UpdateStudySessionDto } from './dto/update-study-session.dto';

@Injectable()
export class StudySessionsService {
  constructor(
    @InjectRepository(StudySession)
    private studySessionRepository: Repository<StudySession>,
  ) {}

  async create(createStudySessionDto: CreateStudySessionDto): Promise<StudySession> {
    // Validation de la date (doit être dans le futur)
    const sessionDate = new Date(createStudySessionDto.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (sessionDate < today) {
      throw new BadRequestException('La date de la séance doit être dans le futur');
    }

    // Debug: Log des données reçues
    console.log('Données reçues:', createStudySessionDto);
    
    // Validation des heures
    if (createStudySessionDto.startTime >= createStudySessionDto.endTime) {
      throw new BadRequestException('L\'heure de fin doit être après l\'heure de début');
    }

    const studySession = new StudySession();
    studySession.title = createStudySessionDto.title;
    studySession.description = createStudySessionDto.description;
    studySession.date = createStudySessionDto.date;
    studySession.start_time = createStudySessionDto.startTime;
    studySession.end_time = createStudySessionDto.endTime;
    studySession.subject = createStudySessionDto.subject;
    studySession.target_class = createStudySessionDto.targetClass || null;
    studySession.location = createStudySessionDto.location || 'Salle de classe';
    studySession.max_students = createStudySessionDto.maxStudents || 30;
    studySession.current_students = 0;
    studySession.created_by = 'admin'; // En production, récupérer depuis le token JWT

    return await this.studySessionRepository.save(studySession);
  }

  async findAll(date?: string, subject?: string): Promise<StudySession[]> {
    const queryBuilder = this.studySessionRepository.createQueryBuilder('studySession');

    if (date) {
      queryBuilder.andWhere('studySession.date = :date', { date });
    }

    if (subject) {
      queryBuilder.andWhere('studySession.subject LIKE :subject', { subject: `%${subject}%` });
    }

    return await queryBuilder
      .orderBy('studySession.date', 'ASC')
      .addOrderBy('studySession.start_time', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<StudySession> {
    const studySession = await this.studySessionRepository.findOne({
      where: { id },
    });

    if (!studySession) {
      throw new NotFoundException('Séance d\'étude non trouvée');
    }

    return studySession;
  }

  async update(id: number, updateStudySessionDto: UpdateStudySessionDto): Promise<StudySession> {
    const studySession = await this.findOne(id);

    // Validation de la date si fournie
    if (updateStudySessionDto.date) {
      const sessionDate = new Date(updateStudySessionDto.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (sessionDate < today) {
        throw new BadRequestException('La date de la séance doit être dans le futur');
      }
    }

    // Validation des heures si fournies
    if (updateStudySessionDto.startTime && updateStudySessionDto.endTime) {
      if (updateStudySessionDto.startTime >= updateStudySessionDto.endTime) {
        throw new BadRequestException('L\'heure de fin doit être après l\'heure de début');
      }
    }

    Object.assign(studySession, {
      ...updateStudySessionDto,
      start_time: updateStudySessionDto.startTime || studySession.start_time,
      end_time: updateStudySessionDto.endTime || studySession.end_time,
      location: updateStudySessionDto.location || studySession.location,
      max_students: updateStudySessionDto.maxStudents || studySession.max_students,
    });

    return await this.studySessionRepository.save(studySession);
  }

  async remove(id: number): Promise<void> {
    const studySession = await this.findOne(id);
    await this.studySessionRepository.remove(studySession);
  }
}
