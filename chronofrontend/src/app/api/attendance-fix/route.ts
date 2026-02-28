import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('?? API Attendance Fix - Récupération des données de présence...');
    
    // Données de test pour vérifier que l'API fonctionne
    const testStudents = [
      {
        student_id: 1,
        first_name: 'Mehdi',
        last_name: 'El Abed',
        email: 'mehdielabed86@gmail.com',
        class_level: 'Terminale groupe 3',
        paid_sessions: 0,
        unpaid_sessions: 2,
        total_sessions: 2,
        paid_amount: 0,
        remaining_amount: 80,
        total_amount: 80,
        payment_status: 'en_attente',
        is_active: 1,
        created_at: '2024-01-01T00:00:00Z'
      }
    ];
    
    console.log(`? ${testStudents.length} étudiants retournés (données de test)`);
    
    return NextResponse.json(testStudents);
    
  } catch (error) {
    console.error('? Erreur API attendance-fix:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors du chargement des données de présence' },
      { status: 500 }
    );
  }
}
