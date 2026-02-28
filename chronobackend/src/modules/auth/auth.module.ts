// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailVerificationService } from './email-verification.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { StudentsModule } from '../students/students.module';
import { ParentsModule } from '../parents/parents.module';
import { RelationsModule } from '../relations/relations.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UsersModule, 
    StudentsModule, 
    ParentsModule,
    RelationsModule,
    PassportModule,
    JwtModule.register({
      secret: 'PHGv74WOiaVZxGXF8pwJn3XeSmza3byS',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, EmailVerificationService, JwtStrategy],
  controllers: [AuthController],
  exports: [EmailVerificationService, AuthService, JwtStrategy],
})
export class AuthModule {}