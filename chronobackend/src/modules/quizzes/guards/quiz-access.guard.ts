import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { QuizAccessService } from '../quiz-access.service';

@Injectable()
export class QuizAccessGuard implements CanActivate {
  constructor(private readonly quizAccessService: QuizAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { quiz_id, student_id } = request.body;

    if (!quiz_id || !student_id) {
      throw new ForbiddenException('Quiz ID et Student ID requis');
    }

    // Vérifier si l'étudiant peut tenter ce quiz
    const canTake = await this.quizAccessService.canStudentTakeQuiz(quiz_id, student_id);
    
    if (!canTake) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à tenter ce quiz. Contactez votre administrateur.');
    }

    return true;
  }
}
