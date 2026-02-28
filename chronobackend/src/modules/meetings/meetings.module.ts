import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';
import { Meeting } from './entities/meeting.entity';
import { Parent } from '../parents/entities/parent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Meeting, Parent])],
  controllers: [MeetingsController],
  providers: [MeetingsService],
  exports: [MeetingsService],
})
export class MeetingsModule {}
