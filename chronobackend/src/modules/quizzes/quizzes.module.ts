import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { Question } from './entities/question.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { Student } from '../students/entities/student.entity';
import { QuizzesService } from './quizzes.service';
import { QuizAccessService } from './quiz-access.service';
import { QuizAccessGuard } from './guards/quiz-access.guard';
import { QuizzesController } from './quizzes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question, QuizAttempt, Student])],
  providers: [QuizzesService, QuizAccessService, QuizAccessGuard],
  controllers: [QuizzesController],
  exports: [QuizAccessService],
})
export class QuizzesModule {}
