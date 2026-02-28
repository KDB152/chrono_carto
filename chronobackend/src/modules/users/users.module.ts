// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { StudentsModule } from '../students/students.module';
import { ParentsModule } from '../parents/parents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    StudentsModule,
    ParentsModule
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}

export { User };
