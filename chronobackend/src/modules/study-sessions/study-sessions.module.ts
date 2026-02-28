import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudySessionsService } from './study-sessions.service';
import { StudySessionsController } from './study-sessions.controller';
import { StudySession } from './study-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudySession])],
  controllers: [StudySessionsController],
  providers: [StudySessionsService],
  exports: [StudySessionsService],
})
export class StudySessionsModule {}
