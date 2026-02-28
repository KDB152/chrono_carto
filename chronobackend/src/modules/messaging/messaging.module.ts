import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { SimplifiedMessagingService } from './simplified-messaging.service';
import { GroupService } from './group.service';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { Groupe } from './entities/groupe.entity';
import { User } from '../users/entities/user.entity';
import { Student } from '../students/entities/student.entity';
import { Parent } from '../parents/entities/parent.entity';
import { ParentStudent } from '../relations/entities/parent-student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation, 
      Message, 
      Groupe, 
      User, 
      Student, 
      Parent, 
      ParentStudent
    ]),
  ],
  controllers: [MessagingController],
  providers: [MessagingService, SimplifiedMessagingService, GroupService],
  exports: [MessagingService, SimplifiedMessagingService, GroupService],
})
export class MessagingModule {}
