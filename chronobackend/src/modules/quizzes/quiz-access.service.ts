import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { Student } from '../students/entities/student.entity';

@Injectable()
export class QuizAccessService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepo: Repository<Quiz>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  /**
   * Vérifie si un étudiant peut tenter un quiz spécifique
   */
  async canStudentTakeQuiz(quizId: number, studentId: number): Promise<boolean> {
    try {
      console.log(`🔍 Vérification d'accès: Quiz ${quizId}, Étudiant ${studentId}`);
      
      // Récupérer le quiz
      const quiz = await this.quizRepo.findOne({ where: { id: quizId } });
      if (!quiz) {
        console.log(`❌ Quiz ${quizId} non trouvé`);
        return false;
      }
      
      console.log(`📋 Quiz trouvé:`, {
        id: quiz.id,
        title: quiz.title,
        target_groups: quiz.target_groups,
        target_groups_type: typeof quiz.target_groups
      });

      // Récupérer l'étudiant
      const student = await this.studentRepo.findOne({ where: { id: studentId } });
      if (!student) {
        console.log(`❌ Étudiant ${studentId} non trouvé`);
        return false;
      }
      
      console.log(`👤 Étudiant trouvé:`, {
        id: student.id,
        class_level: student.class_level,
        class_level_type: typeof student.class_level
      });

      // Si aucun groupe cible n'est spécifié, tous les étudiants peuvent tenter le quiz
      if (!quiz.target_groups || quiz.target_groups.length === 0) {
        console.log(`✅ Pas de restriction, accès autorisé`);
        return true;
      }

      // Vérifier si l'étudiant appartient à un des groupes cibles
      // target_groups peut être un tableau ou une chaîne, il faut gérer les deux cas
      if (Array.isArray(quiz.target_groups)) {
        const hasAccess = quiz.target_groups.includes(student.class_level);
        console.log(`🔍 Vérification tableau: ${quiz.target_groups.includes(student.class_level)}`);
        console.log(`  target_groups: [${quiz.target_groups.join(', ')}]`);
        console.log(`  student.class_level: ${student.class_level}`);
        console.log(`  Résultat: ${hasAccess}`);
        return hasAccess;
      } else if (typeof quiz.target_groups === 'string') {
        // Si c'est une chaîne, la traiter comme un tableau avec un seul élément
        const hasAccess = quiz.target_groups === student.class_level;
        console.log(`🔍 Vérification chaîne: ${quiz.target_groups === student.class_level}`);
        console.log(`  target_groups: "${quiz.target_groups}"`);
        console.log(`  student.class_level: "${student.class_level}"`);
        console.log(`  Résultat: ${hasAccess}`);
        return hasAccess;
      }
      
      console.log(`❌ Format target_groups non reconnu`);
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification d\'accès au quiz:', error);
      return false;
    }
  }

  /**
   * Récupère tous les quizzes accessibles à un étudiant
   */
  async getAccessibleQuizzes(studentId: number): Promise<Quiz[]> {
    try {
      // Récupérer l'étudiant
      const student = await this.studentRepo.findOne({ where: { id: studentId } });
      if (!student) {
        return [];
      }

      // Récupérer tous les quizzes publiés
      const allQuizzes = await this.quizRepo.find({ 
        where: { status: 'Publié' },
        order: { created_at: 'DESC' }
      });

      // Filtrer les quizzes accessibles
      return allQuizzes.filter(quiz => {
        // Si aucun groupe cible, le quiz est accessible
        if (!quiz.target_groups || quiz.target_groups.length === 0) {
          return true;
        }
                 // Sinon, vérifier si l'étudiant appartient à un des groupes cibles
        if (Array.isArray(quiz.target_groups)) {
          return quiz.target_groups.includes(student.class_level);
        } else if (typeof quiz.target_groups === 'string') {
          return quiz.target_groups === student.class_level;
        }
        return false;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des quizzes accessibles:', error);
      return [];
    }
  }

  /**
   * Vérifie si un quiz est accessible à un groupe spécifique
   */
  async isQuizAccessibleToGroup(quizId: number, groupName: string): Promise<boolean> {
    try {
      const quiz = await this.quizRepo.findOne({ where: { id: quizId } });
      if (!quiz) {
        return false;
      }

      // Si aucun groupe cible, le quiz est accessible à tous
      if (!quiz.target_groups || quiz.target_groups.length === 0) {
        return true;
      }

      // Vérifier si le groupe est dans la liste des groupes cibles
      if (Array.isArray(quiz.target_groups)) {
        return quiz.target_groups.includes(groupName);
      } else if (typeof quiz.target_groups === 'string') {
        return quiz.target_groups === groupName;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification d\'accès du groupe:', error);
      return false;
    }
  }

  /**
   * Récupère les statistiques d'accès pour un quiz
   */
  async getQuizAccessStats(quizId: number): Promise<{
    totalStudents: number;
    accessibleStudents: number;
    accessibleGroups: string[];
  }> {
    try {
      const quiz = await this.quizRepo.findOne({ where: { id: quizId } });
      if (!quiz) {
        return { totalStudents: 0, accessibleStudents: 0, accessibleGroups: [] };
      }

      // Compter tous les étudiants
      const totalStudents = await this.studentRepo.count();

      if (!quiz.target_groups || quiz.target_groups.length === 0) {
        // Quiz accessible à tous
        return {
          totalStudents,
          accessibleStudents: totalStudents,
          accessibleGroups: ['Tous les groupes']
        };
      }

             // Compter les étudiants des groupes cibles
       const accessibleStudents = await this.studentRepo.count({
         where: { class_level: In(quiz.target_groups) }
       });

      return {
        totalStudents,
        accessibleStudents,
        accessibleGroups: quiz.target_groups
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques d\'accès:', error);
      return { totalStudents: 0, accessibleStudents: 0, accessibleGroups: [] };
    }
  }
}
