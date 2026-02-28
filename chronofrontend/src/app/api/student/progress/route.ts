import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    
    if (!studentId) {
      // Retourner des données de test si aucun studentId fourni
      console.log('⚠️  Aucun studentId fourni, retour de données de test');
      const testData = {
        success: true,
        data: [
          {
            subject: 'math',
            period: 'recent',
            scores: [75, 80, 85, 78, 82],
            dates: [
              '2024-01-10T10:00:00Z',
              '2024-01-12T14:30:00Z',
              '2024-01-15T09:15:00Z',
              '2024-01-17T16:45:00Z',
              '2024-01-20T11:20:00Z'
            ],
            averageScore: 80,
            improvement: 7,
            trend: 'up',
            strengths: ['Performance excellente', 'Progression positive', 'Régularité dans les performances'],
            weaknesses: [],
            recommendations: ['Approfondir les connaissances', 'Pratiquer davantage'],
            totalQuizzes: 5,
            lastQuizDate: '2024-01-20T11:20:00Z',
            bestScore: 85,
            worstScore: 75
          },
          {
            subject: 'francais',
            period: 'recent',
            scores: [65, 70, 68, 72, 75],
            dates: [
              '2024-01-11T13:00:00Z',
              '2024-01-13T15:30:00Z',
              '2024-01-16T10:15:00Z',
              '2024-01-18T14:20:00Z',
              '2024-01-21T09:45:00Z'
            ],
            averageScore: 70,
            improvement: 10,
            trend: 'up',
            strengths: ['Performance correcte', 'Progression positive'],
            weaknesses: [],
            recommendations: ['Approfondir les connaissances', 'Pratiquer davantage'],
            totalQuizzes: 5,
            lastQuizDate: '2024-01-21T09:45:00Z',
            bestScore: 75,
            worstScore: 65
          }
        ],
        studentId: 1
      };
      
      return NextResponse.json(testData);
    }

    // Utiliser l'API backend au lieu de la connexion directe à la base de données
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL!;
    
    // Récupérer les tentatives de quiz depuis l'API backend
    const attemptsResponse = await fetch(`${backendUrl}/quizzes/attempts?student_id=${studentId}`);
    
    if (!attemptsResponse.ok) {
      throw new Error(`Erreur API backend: ${attemptsResponse.status}`);
    }
    
    const attempts = await attemptsResponse.json();
    
    // Récupérer les détails des quiz pour chaque tentative
    const quizResults = await Promise.all(
      attempts.map(async (attempt: any) => {
        try {
          const quizResponse = await fetch(`${backendUrl}/quizzes/${attempt.quiz_id}`);
          if (!quizResponse.ok) return null;
          
          const quiz = await quizResponse.json();
          
          return {
            attempt_id: attempt.id,
            quiz_id: attempt.quiz_id,
            quiz_title: quiz.title,
            subject: quiz.subject,
            score: attempt.score,
            total_points: attempt.total_points,
            percentage: attempt.percentage,
            completed_at: attempt.completed_at,
            time_spent: attempt.time_spent,
            difficulty: quiz.level
          };
        } catch (error) {
          console.error(`Erreur lors de la récupération du quiz ${attempt.quiz_id}:`, error);
          return null;
        }
      })
    );
    
    // Filtrer les résultats null
    const validResults = quizResults.filter(result => result !== null);
    
    // Organiser les résultats par matière
    const resultsBySubject: { [key: string]: any[] } = {};
    
    validResults.forEach(result => {
      const subject = result.subject;
      if (!resultsBySubject[subject]) {
        resultsBySubject[subject] = [];
      }
      resultsBySubject[subject].push(result);
    });
    
    // Prendre les 7 derniers résultats pour chaque matière
    const progressData = Object.keys(resultsBySubject).map(subject => {
      const subjectResults = resultsBySubject[subject].slice(0, 7).reverse(); // Inverser pour avoir l'ordre chronologique
      
      const scores = subjectResults.map(r => r.percentage);
      const dates = subjectResults.map(r => r.completed_at);
      
      // Calculer la tendance
      let trend = 'stable';
      let improvement = 0;
      
      if (scores.length >= 2) {
        const firstScore = scores[0];
        const lastScore = scores[scores.length - 1];
        improvement = lastScore - firstScore;
        
        if (improvement > 5) {
          trend = 'up';
        } else if (improvement < -5) {
          trend = 'down';
        }
      }
      
      // Calculer la moyenne
      const averageScore = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
      
      // Analyser les forces et faiblesses basées sur les scores
      const strengths: string[] = [];
      const weaknesses: string[] = [];
      
      if (averageScore >= 80) {
        strengths.push('Performance excellente');
      } else if (averageScore >= 60) {
        strengths.push('Performance correcte');
      }
      
      if (trend === 'up') {
        strengths.push('Progression positive');
      } else if (trend === 'down') {
        weaknesses.push('Progression négative');
      }
      
      if (scores.length > 0) {
        const minScore = Math.min(...scores);
        const maxScore = Math.max(...scores);
        
        if (maxScore - minScore > 20) {
          weaknesses.push('Inconsistance dans les résultats');
        } else {
          strengths.push('Régularité dans les performances');
        }
      }
      
      // Recommandations basées sur l'analyse
      const recommendations: string[] = [];
      
      if (averageScore < 60) {
        recommendations.push('Réviser les bases de la matière');
        recommendations.push('Demander de l\'aide supplémentaire');
      } else if (averageScore < 80) {
        recommendations.push('Approfondir les connaissances');
        recommendations.push('Pratiquer davantage');
      }
      
      if (trend === 'down') {
        recommendations.push('Identifier les difficultés récentes');
        recommendations.push('Revoir les derniers chapitres');
      }
      
      if (scores.length > 0 && Math.max(...scores) - Math.min(...scores) > 20) {
        recommendations.push('Travailler la régularité');
        recommendations.push('Établir une routine de révision');
      }
      
      return {
        subject,
        period: 'recent',
        scores,
        dates,
        averageScore,
        improvement: Math.round(improvement),
        trend,
        strengths,
        weaknesses,
        recommendations,
        totalQuizzes: subjectResults.length,
        lastQuizDate: dates.length > 0 ? dates[dates.length - 1] : null,
        bestScore: scores.length > 0 ? Math.max(...scores) : 0,
        worstScore: scores.length > 0 ? Math.min(...scores) : 0
      };
    });
    
    console.log(`✅ Progression récupérée pour l'étudiant ${studentId}:`, {
      totalSubjects: progressData.length,
      subjects: progressData.map(p => ({ subject: p.subject, quizzes: p.totalQuizzes, average: p.averageScore }))
    });
    
    return NextResponse.json({
      success: true,
      data: progressData,
      studentId: parseInt(studentId)
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la progression:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement de la progression' },
      { status: 500 }
    );
  }
}

