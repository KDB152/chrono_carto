import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Configuration de la base de données MySQL
const dbConfig = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Fonction pour créer une connexion à la base de données
async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connexion MySQL établie avec succès');
    return connection;
  } catch (error) {
    console.error('Erreur de connexion MySQL:', error);
    throw error;
  }
}

// GET - Récupérer les données complètes d'un enfant
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('GET /api/child/[id]/data appelé pour l\'enfant:', params.id);
    
    const connection = await getConnection();
    
    // Récupérer les informations de base de l'enfant
    const [studentRows] = await connection.execute(`
      SELECT 
        s.id,
        s.class_level,
        s.birth_date,
        s.phone_number,
        s.address,
        s.progress_percentage,
        s.total_quiz_attempts,
        s.average_score,
        s.last_activity,
        u.first_name,
        u.last_name,
        u.email
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [params.id]);
    
    if ((studentRows as any[]).length === 0) {
      await connection.end();
      return NextResponse.json(
        { error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }
    
    const student = (studentRows as any[])[0];
    
    // Récupérer les résultats de quiz de l'enfant (avec gestion d'erreur si la table n'existe pas)
    let quizResults: any[] = [];
    try {
      const [quizResultsRows] = await connection.execute(`
        SELECT 
          qr.id,
          qr.quiz_id,
          qr.score,
          qr.max_score,
          qr.completed_at,
          qr.time_spent,
          qr.questions_correct,
          qr.questions_total,
          qr.xp_earned,
          qr.attempts,
          q.title as quiz_title,
          q.subject,
          q.difficulty
        FROM quiz_results qr
        JOIN quizzes q ON qr.quiz_id = q.id
        WHERE qr.student_id = ?
        ORDER BY qr.completed_at DESC
        LIMIT 20
      `, [params.id]);
      quizResults = quizResultsRows as any[];
    } catch (error) {
      console.log('Table quiz_results non trouvée, utilisation de données par défaut');
      quizResults = [];
    }
    
    // Récupérer les badges/achievements de l'enfant (avec gestion d'erreur si la table n'existe pas)
    let achievements: any[] = [];
    try {
      const [achievementsRows] = await connection.execute(`
        SELECT 
          sa.id,
          sa.achievement_id,
          sa.earned_at,
          a.name,
          a.description,
          a.icon,
          a.xp_reward
        FROM student_achievements sa
        JOIN achievements a ON sa.achievement_id = a.id
        WHERE sa.student_id = ?
        ORDER BY sa.earned_at DESC
      `, [params.id]);
      achievements = achievementsRows as any[];
    } catch (error) {
      console.log('Table student_achievements non trouvée, utilisation de données par défaut');
      achievements = [];
    }
    
    // Récupérer les statistiques de progression (avec gestion d'erreur si la table n'existe pas)
    let progressStats: any[] = [];
    try {
      const [progressStatsRows] = await connection.execute(`
        SELECT 
          sp.id,
          sp.subject,
          sp.level,
          sp.progress_percentage,
          sp.last_updated,
          sp.strengths,
          sp.weaknesses
        FROM student_progress sp
        WHERE sp.student_id = ?
        ORDER BY sp.last_updated DESC
      `, [params.id]);
      progressStats = progressStatsRows as any[];
    } catch (error) {
      console.log('Table student_progress non trouvée, utilisation de données par défaut');
      progressStats = [];
    }
    
    await connection.end();
    
    // Calculer les statistiques globales
    const totalQuizzes = (quizResults as any[]).length;
    const completedQuizzes = (quizResults as any[]).filter(q => q.score > 0).length;
    const averageScore = totalQuizzes > 0 
      ? Math.round((quizResults as any[]).reduce((sum, q) => sum + (q.score / q.max_score * 100), 0) / totalQuizzes)
      : 0;
    const totalXP = (quizResults as any[]).reduce((sum, q) => sum + (q.xp_earned || 0), 0);
    const badgesCount = (achievements as any[]).length;
    
    // Calculer le niveau basé sur l'XP
    const level = Math.floor(totalXP / 200) + 1;
    const xpProgress = totalXP % 200;
    
    // Calculer le streak (sessions consécutives)
    const recentActivity = (quizResults as any[]).slice(0, 7);
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < recentActivity.length; i++) {
      const activityDate = new Date(recentActivity[i].completed_at);
      const daysDiff = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === i) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    const childData = {
      id: student.id,
      firstName: student.first_name,
      lastName: student.last_name,
      fullName: `${student.first_name} ${student.last_name}`,
      email: student.email,
      classLevel: student.class_level,
      birthDate: student.birth_date,
      phone_number: student.phone_number,
      address: student.address,
      
      // Statistiques globales
      stats: {
        averageScore: averageScore,
        totalQuizzes: totalQuizzes,
        completedQuizzes: completedQuizzes,
        currentStreak: currentStreak,
        totalXP: totalXP,
        level: level,
        xpProgress: xpProgress,
        badges: badgesCount,
        progressPercentage: student.progress_percentage || 0,
        rank: 1 // À calculer par rapport à la classe
      },
      
      // Activité récente
      recentActivity: {
        lastQuiz: recentActivity.length > 0 ? recentActivity[0].quiz_title : null,
        lastScore: recentActivity.length > 0 ? Math.round(recentActivity[0].score / recentActivity[0].max_score * 100) : 0,
        lastActive: student.last_activity || null
      },
      
      // Résultats de quiz
      quizResults: (quizResults as any[]).map(qr => ({
        id: qr.id,
        quizTitle: qr.quiz_title,
        subject: qr.subject,
        score: qr.score,
        maxScore: qr.max_score,
        percentage: Math.round(qr.score / qr.max_score * 100),
        completedAt: qr.completed_at,
        timeSpent: qr.time_spent,
        difficulty: qr.difficulty,
        questionsTotal: qr.questions_total,
        questionsCorrect: qr.questions_correct,
        xpEarned: qr.xp_earned,
        attempts: qr.attempts
      })),
      
      // Progression par matière
      progress: (progressStats as any[]).map(ps => ({
        subject: ps.subject,
        level: ps.level,
        progressPercentage: ps.progress_percentage,
        lastUpdated: ps.last_updated,
        strengths: ps.strengths ? JSON.parse(ps.strengths) : [],
        weaknesses: ps.weaknesses ? JSON.parse(ps.weaknesses) : []
      })),
      
      // Badges et achievements
      achievements: (achievements as any[]).map(ach => ({
        id: ach.id,
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        xpReward: ach.xp_reward,
        earnedAt: ach.earned_at
      }))
    };
    
    console.log('Données enfant récupérées:', {
      childId: childData.id,
      childName: childData.fullName,
      totalQuizzes: childData.stats.totalQuizzes,
      averageScore: childData.stats.averageScore,
      level: childData.stats.level
    });
    
    return NextResponse.json(childData);
  } catch (error) {
    console.error('Erreur lors de la récupération des données enfant:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données enfant' },
      { status: 500 }
    );
  }
}
