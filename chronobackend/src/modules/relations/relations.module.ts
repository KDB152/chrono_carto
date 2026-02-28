// src/modules/relations/relations.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelationsService } from './relations.service';
import { ParentStudent } from './entities/parent-student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ParentStudent])],
  providers: [RelationsService],
  exports: [RelationsService],
})
export class RelationsModule {}
