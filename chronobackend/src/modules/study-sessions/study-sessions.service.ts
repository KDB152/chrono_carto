import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudySession } from './study-session.entity';
import { CreateStudySessionDto } from './dto/create-study-session.dto';
import { UpdateStudySessionDto } from './dto/update-study-session.dto';

@Injectable()
export class StudySessionsService implements OnModuleInit {
  constructor(
    @InjectRepository(StudySession)
    private studySessionRepository: Repository<StudySession>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultWeeklySessions();
  }

  async seedDefaultWeeklySessions(): Promise<void> {
    try {
      const count = await this.studySessionRepository.count();
      if (count > 0) {
        const existing = await this.studySessionRepository.findOne({
          where: { date: '2026-09-07', target_class: 'Terminale groupe 1 (Lundi 18:30-20:30)' },
        });
        if (existing) {
          return;
        }
      }

      const startDate = new Date('2026-09-07');
      const endDate = new Date('2027-08-31');

      const defaultSchedules = [
        {
          target_class: 'Terminale groupe 1 (Lundi 18:30-20:30)',
          title: 'Histoire - Terminale groupe 1 (Lundi 18:30-20:30)',
          subject: 'Histoire',
          dayOfWeek: 1, // Lundi
          startTime: '18:30:00',
          endTime: '20:30:00',
        },
        {
          target_class: 'Terminale groupe 2 (Vendredi 16:30-18:30)',
          title: 'Histoire - Terminale groupe 2 (Vendredi 16:30-18:30)',
          subject: 'Histoire',
          dayOfWeek: 5, // Vendredi
          startTime: '16:30:00',
          endTime: '18:30:00',
        },
        {
          target_class: 'terminale groupe 3 (Vendredi 18:30-20:30)',
          title: 'Histoire - terminale groupe 3 (Vendredi 18:30-20:30)',
          subject: 'Histoire',
          dayOfWeek: 5, // Vendredi
          startTime: '18:30:00',
          endTime: '20:30:00',
        },
        {
          target_class: 'Terminale groupe 4 (Dimanche 8:00-10:00)',
          title: 'Histoire - Terminale groupe 4 (Dimanche 8:00-10:00)',
          subject: 'Histoire',
          dayOfWeek: 0, // Dimanche
          startTime: '08:00:00',
          endTime: '10:00:00',
        },
        {
          target_class: '1ere groupe 1 (Jeudi 18:30-20:30)',
          title: 'Histoire - 1ere groupe 1 (Jeudi 18:30-20:30)',
          subject: 'Histoire',
          dayOfWeek: 4, // Jeudi
          startTime: '18:30:00',
          endTime: '20:30:00',
        },
        {
          target_class: '1ere groupe 2 (Vendredi 14:00-16:00)',
          title: 'Histoire - 1ere groupe 2 (Vendredi 14:00-16:00)',
          subject: 'Histoire',
          dayOfWeek: 5, // Vendredi
          startTime: '14:00:00',
          endTime: '16:00:00',
        },
        {
          target_class: '1ere groupe 3 (Dimanche 10:00-12:00)',
          title: 'Histoire - 1ere groupe 3 (Dimanche 10:00-12:00)',
          subject: 'Histoire',
          dayOfWeek: 0, // Dimanche
          startTime: '10:00:00',
          endTime: '12:00:00',
        },
      ];

      const sessionsToInsert: Partial<StudySession>[] = [];

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const day = d.getDay();
        const dateStr = d.toISOString().split('T')[0];

        for (const sched of defaultSchedules) {
          if (sched.dayOfWeek === day) {
            sessionsToInsert.push({
              title: sched.title,
              description: `Seance hebdomadaire d'Histoire pour ${sched.target_class}`,
              date: dateStr,
              start_time: sched.startTime,
              end_time: sched.endTime,
              subject: sched.subject,
              target_class: sched.target_class,
              location: 'Salle de classe',
              max_students: 30,
              current_students: 0,
              created_by: 'admin',
            });
          }
        }
      }

      if (sessionsToInsert.length > 0) {
        await this.studySessionRepository.save(sessionsToInsert);
        console.log(`Default weekly study sessions seeded successfully (${sessionsToInsert.length} sessions created).`);
      }
    } catch (err) {
      console.error('Error seeding default weekly study sessions:', err);
    }
  }

  async create(createStudySessionDto: CreateStudySessionDto): Promise<StudySession> {
    const sessionDate = new Date(createStudySessionDto.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (sessionDate < today) {
      throw new BadRequestException('La date de la seance doit etre dans le futur');
    }

    if (createStudySessionDto.startTime >= createStudySessionDto.endTime) {
      throw new BadRequestException("L'heure de fin doit etre apres l'heure de debut");
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
    studySession.created_by = 'admin';

    return await this.studySessionRepository.save(studySession);
  }

async findAll(date?: string, subject?: string, targetClass?: string): Promise<StudySession[]> {
  await this.seedDefaultWeeklySessions();

  const queryBuilder = this.studySessionRepository.createQueryBuilder('studySession');

  if (date) {
    queryBuilder.andWhere('studySession.date = :date', { date });
  }

  if (subject) {
    queryBuilder.andWhere('studySession.subject LIKE :subject', { subject: `%${subject}%` });
  }

  if (targetClass) {
    const normalized = targetClass.replace(/(\d{1,2})h(\d{2})/g, '$1:$2');
    queryBuilder.andWhere('studySession.target_class = :targetClass', { targetClass: normalized });
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
      throw new NotFoundException("Seance d'etude non trouvee");
    }

    return studySession;
  }

  async update(id: number, updateStudySessionDto: UpdateStudySessionDto): Promise<StudySession> {
    const studySession = await this.findOne(id);

    if (updateStudySessionDto.date) {
      const sessionDate = new Date(updateStudySessionDto.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (sessionDate < today) {
        throw new BadRequestException('La date de la seance doit etre dans le futur');
      }
    }

    if (updateStudySessionDto.startTime && updateStudySessionDto.endTime) {
      if (updateStudySessionDto.startTime >= updateStudySessionDto.endTime) {
        throw new BadRequestException("L'heure de fin doit etre apres l'heure de debut");
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