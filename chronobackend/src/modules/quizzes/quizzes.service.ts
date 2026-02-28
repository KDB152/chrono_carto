import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { Question } from './entities/question.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { QuizAccessService } from './quiz-access.service';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz) private readonly quizRepo: Repository<Quiz>,
    @InjectRepository(Question) private readonly questionRepo: Repository<Question>,
    @InjectRepository(QuizAttempt) private readonly attemptRepo: Repository<QuizAttempt>,
    private readonly quizAccessService: QuizAccessService,
  ) {}

  async findAll({ page = 1, limit = 50, subject, level, status }: { page?: number; limit?: number; subject?: string; level?: string; status?: string; }) {
    const qb = this.quizRepo.createQueryBuilder('q');
    if (subject) qb.andWhere('q.subject = :subject', { subject });
    if (level) qb.andWhere('q.level = :level', { level });
    if (status) qb.andWhere('q.status = :status', { status });
    qb.orderBy('q.id', 'DESC').skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findOne(id: number) {
    return this.quizRepo.findOne({ where: { id } });
  }

  async findOneWithQuestions(id: number) {
    const quiz = await this.quizRepo.findOne({ where: { id } });
    if (!quiz) return null;
    
    const questions = await this.questionRepo.find({ 
      where: { quiz_id: id },
      order: { id: 'ASC' }
    });
    
    return { ...quiz, questions };
  }

  async create(dto: CreateQuizDto) {
    const entity = this.quizRepo.create({
      title: dto.title,
      description: dto.description,
      subject: dto.subject,
      duration: dto.duration ?? 10,
      status: dto.status ?? 'Brouillon',
      is_time_limited: dto.is_time_limited ?? false,
      allow_retake: dto.allow_retake ?? false,
      show_results: dto.show_results ?? true,
      target_groups: dto.target_groups,
    });
    return this.quizRepo.save(entity);
  }

  async update(id: number, dto: UpdateQuizDto) {
    await this.quizRepo.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: number) {
    // Validation de l'ID
    if (!id || isNaN(id)) {
      throw new Error('ID de quiz invalide');
    }
    
    // Delete all questions first
    await this.questionRepo.delete({ quiz_id: id });
    // Delete all attempts
    await this.attemptRepo.delete({ quiz_id: id });
    // Delete the quiz
    await this.quizRepo.delete(id);
    return { success: true };
  }

  // Question management methods
  async findQuestions(quizId: number) {
    try {
      // Utiliser la table quiz_questions au lieu de questions
      const questions = await this.quizRepo.manager.query(
        'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY id ASC',
        [quizId]
      );
      
      // Vérifier que questions est un tableau
      if (!Array.isArray(questions)) {
        console.error('Erreur: questions n\'est pas un tableau:', typeof questions);
        return [];
      }
      
      // Mapper les colonnes pour correspondre à ce que le frontend attend
      return questions.map(q => ({
        id: q.id,
        question: q.question,             // Garder 'question' pour le frontend
        type: q.type,                     // Garder 'type' pour le frontend
        points: q.points,
        correct_answer: q.correct_answer,
        options: q.options ? q.options.split(',') : [],
        explanation: q.explanation
      }));
    } catch (error) {
      console.error('Erreur dans findQuestions:', error);
      return [];
    }
  }

  async findQuestion(questionId: number) {
    return this.questionRepo.findOne({ where: { id: questionId } });
  }

  async canStudentTakeQuiz(quizId: number, studentClassLevel: string): Promise<boolean> {
    const quiz = await this.findOne(quizId);
    if (!quiz) return false;
    
    // Si aucun groupe cible n'est spécifié, tous les étudiants peuvent tenter le quiz
    if (!quiz.target_groups || quiz.target_groups.length === 0) return true;
    
    // Vérifier si l'étudiant appartient à un des groupes cibles
    return quiz.target_groups.includes(studentClassLevel);
  }

  async createQuestion(dto: CreateQuestionDto) {
    const entity = this.questionRepo.create({
      quiz_id: dto.quiz_id,
      question: dto.question,
      type: dto.type,
      options: dto.options,
      correct_answer: dto.correct_answer,
      explanation: dto.explanation,
    });
    
    const savedQuestion = await this.questionRepo.save(entity);
    
    return savedQuestion;
  }

  async updateQuestion(questionId: number, dto: UpdateQuestionDto) {
    await this.questionRepo.update(questionId, dto as any);
    const updatedQuestion = await this.findQuestion(questionId);
    
    
    return updatedQuestion;
  }

  async removeQuestion(questionId: number) {
    const question = await this.findQuestion(questionId);
    if (!question) return { success: false, message: 'Question not found' };
    
    await this.questionRepo.delete(questionId);
    
    
    return { success: true };
  }


  async listAttempts(quizId?: number) {
    if (quizId) return this.attemptRepo.find({ where: { quiz_id: quizId }, order: { id: 'DESC' } });
    return this.attemptRepo.find({ order: { id: 'DESC' } });
  }

  async listStudentAttempts(quizId?: number, studentId?: number) {
    const where: any = {};
    if (quizId) where.quiz_id = quizId;
    if (studentId) where.student_id = studentId;
    
    return this.attemptRepo.find({ 
      where, 
      order: { id: 'DESC' } 
    });
  }

  async submitAttempt(dto: SubmitQuizDto, studentId?: number) {
    // Vérification OBLIGATOIRE de l'accès au quiz
    if (!studentId) {
      throw new Error('ID de l\'étudiant requis pour vérifier l\'accès au quiz.');
    }

    // Vérifier si l'étudiant peut tenter ce quiz
    const canTake = await this.quizAccessService.canStudentTakeQuiz(dto.quiz_id, studentId);
    if (!canTake) {
      throw new Error('Vous n\'êtes pas autorisé à tenter ce quiz. Contactez votre administrateur.');
    }

    // Utiliser mysql2 directement pour éviter les problèmes de TypeORM
    const mysql = require('mysql2/promise');
    
    // Créer une connexion directe
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST!,
      user: process.env.DB_USERNAME!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!
    });
    
    let saved;
    
    try {
      const insertQuery = `
        INSERT INTO quiz_attempts 
        (quiz_id, student_id, student_name, total_points, percentage, time_spent, answers)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const insertValues = [
        dto.quiz_id,
        dto.student_id,
        dto.student_name,
        dto.total_points,
        dto.percentage,
        dto.time_spent ?? 0,
        dto.answers ? JSON.stringify(dto.answers) : null
      ];
      
      // Exécuter l'insertion avec mysql2
      const [result] = await connection.execute(insertQuery, insertValues);
      
      // Récupérer l'entité créée
      saved = await this.attemptRepo.findOne({ 
        where: { id: result.insertId } 
      });
    } finally {
      await connection.end();
    }
    
    // update aggregate on quiz
    await this.quizRepo.createQueryBuilder()
      .update()
      .set({ attempts: () => 'attempts + 1' })
      .where('id = :id', { id: dto.quiz_id })
      .execute();
      
    return saved;
  }

  async getAttemptAnswers(attemptId: number) {
    const attempt = await this.attemptRepo.findOne({ 
      where: { id: attemptId },
      select: ['answers']
    });
    
    if (!attempt) {
      throw new Error('Tentative non trouvée');
    }
    
    // Retourner les réponses de l'étudiant
    return attempt.answers || {};
  }

  async getRecentAttempts() {
    // Retourner les 10 dernières tentatives de quiz
    return this.attemptRepo.find({
      order: { completed_at: 'DESC' },
      take: 10
    });
  }

  async getStudentQuizResults(studentId: number) {
    console.log('������ Getting quiz results for student ID:', studentId);
    
    // Vérifier que studentId est valide
    if (!studentId || isNaN(studentId) || studentId <= 0) {
      console.log('❌ Student ID invalide:', studentId);
      return {
        studentId: studentId || 0,
        totalAttempts: 0,
        totalQuizzes: 0,
        averageScore: 0,
        recentAttempts: [],
        allAttempts: [],
        stats: {
          passed: 0,
          failed: 0,
          bestScore: 0,
          worstScore: 0
        }
      };
    }
    
    try {
      // Utiliser une seule requête SQL avec JOIN pour éviter les problèmes de null
      const results = await this.attemptRepo.query(`
        SELECT 
          qa.id,
          qa.quiz_id,
          qa.percentage,
          qa.total_points,
          qa.time_spent,
          qa.completed_at,
          q.title as quiz_title,
          q.subject as quiz_subject
        FROM quiz_attempts qa
        LEFT JOIN quizzes q ON qa.quiz_id = q.id
        WHERE qa.student_id = ? 
        AND qa.quiz_id IS NOT NULL 
        AND qa.quiz_id > 0
        ORDER BY qa.id DESC
      `, [studentId]);

      console.log('������ Found attempts with quiz details:', results.length);

      // Transformer les résultats
      const quizDetails = results.map(row => ({
        id: row.id,
        quizId: row.quiz_id,
        quizTitle: row.quiz_title || 'Quiz inconnu',
        quizSubject: row.quiz_subject || 'Matière inconnue',
        score: row.percentage || 0,
        totalPoints: row.total_points || 0,
        timeSpent: row.time_spent || 0,
        completedAt: row.completed_at || new Date(),
        status: (row.percentage || 0) >= 50 ? 'Réussi' : 'Échoué'
      }));

    // Calculer les statistiques
    const totalAttempts = results.length;
    const totalQuizzes = new Set(results.map(r => r.quiz_id)).size;
    const averageScore = totalAttempts > 0 
      ? Math.round(results.reduce((sum, row) => sum + (row.percentage || 0), 0) / totalAttempts)
      : 0;

    const finalResults = {
      studentId,
      totalAttempts,
      totalQuizzes,
      averageScore,
      recentAttempts: quizDetails.slice(0, 10), // 10 dernières tentatives
      allAttempts: quizDetails,
      stats: {
        passed: quizDetails.filter(q => q.score >= 50).length,
        failed: quizDetails.filter(q => q.score < 50).length,
        bestScore: Math.max(...quizDetails.map(q => q.score), 0),
        worstScore: Math.min(...quizDetails.map(q => q.score), 100)
      }
    };

    console.log('������ Quiz results:', finalResults);
    return finalResults;
    
    } catch (error) {
      console.error('❌ Erreur dans getStudentQuizResults:', error);
      // Retourner des données vides en cas d'erreur
      return {
        studentId,
        totalAttempts: 0,
        totalQuizzes: 0,
        averageScore: 0,
        recentAttempts: [],
        allAttempts: [],
        stats: {
          passed: 0,
          failed: 0,
          bestScore: 0,
          worstScore: 0
        }
      };
    }
  }
}
