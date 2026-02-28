import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { Student } from '../students/entities/student.entity';
import { Payment } from '../admin/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Payment])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}