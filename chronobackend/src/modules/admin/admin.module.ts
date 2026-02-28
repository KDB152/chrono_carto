import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { PaymentsController } from './payments.controller';
import { UsersModule } from '../users/users.module';
import { StudentsModule } from '../students/students.module';
import { ParentsModule } from '../parents/parents.module';
import { RendezVousModule } from '../rendez-vous/rendez-vous.module';
import { AdminService } from './admin.service';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    UsersModule, 
    StudentsModule, 
    ParentsModule,
    RendezVousModule
  ],
  controllers: [AdminController, PaymentsController],
  providers: [AdminService, PaymentsService],
  exports: [PaymentsService],
})
export class AdminModule {}

