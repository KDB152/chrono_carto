import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { newEmail, userId } = await request.json();

    console.log('🔍 Debug - Données reçues:', { newEmail, userId });

    if (!newEmail || !userId) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Pour le test, on retourne un succès sans base de données
    console.log('✅ Debug - Email valide, simulation de succès');

    return NextResponse.json(
      { 
        message: 'Email modifié avec succès (TEST - sans base de données)',
        email: newEmail,
        userId: userId
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Debug - Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

