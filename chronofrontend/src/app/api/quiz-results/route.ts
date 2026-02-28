import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    console.log('?? API /api/quiz-results called with studentId:', studentId);

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'StudentId manquant' },
        { status: 400 }
      );
    }

    // Appeler le backend pour recuperer les resultats des quiz
    // Appeler le backend directement (contourner nginx)
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL!;
    
    const response = await fetch(`${backendUrl}/api/quizzes/parent-results?studentId=${studentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('? Backend error:', response.status);
      return NextResponse.json(
        { success: false, message: 'Erreur backend', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('? Backend response:', data);

    // Transformer les donnees pour correspondre au format attendu par le frontend
    const transformedData = {
      success: true,
      quizResults: data.allAttempts || [],
      totalAttempts: data.totalAttempts || 0,
      averageScore: data.averageScore || 0,
      stats: data.stats || {}
    };

    console.log('? Transformed data:', transformedData);
    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('? API route error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
