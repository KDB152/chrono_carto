// src/app/api/auth/verify-email/route.ts (VERSION CORRIGÉE)
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    console.log('🔍 Debug - Vérification d\'email avec token:', token);

    if (!token) {
      return NextResponse.json(
        { error: 'Token de vérification requis' },
        { status: 400 }
      );
    }

    // Connexion à la base de données
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'chrono_carto'
    });

    try {
      // Vérifier le token (utiliser les colonnes existantes)
      const [users] = await connection.execute(
        'SELECT id, email FROM users WHERE verification_token = ? AND email_verification_code_expiry > NOW()',
        [token]
      );

      if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json(
          { error: 'Token invalide ou expiré' },
          { status: 400 }
        );
      }

      const userData = users[0] as any;
      console.log('✅ Debug - Token valide pour utilisateur:', userData.id);

      // Marquer l'email comme vérifié et nettoyer les tokens
      await connection.execute(
        'UPDATE users SET email_verified = 1, verification_token = NULL, email_verification_code = NULL, email_verification_code_expiry = NULL WHERE id = ?',
        [userData.id]
      );

      await connection.end();

      return NextResponse.json({
        success: true,
        message: 'Email vérifié avec succès ! Votre compte est maintenant actif.',
        userId: userData.id,
        email: userData.email
      });

    } catch (dbError) {
      await connection.end();
      throw dbError;
    }

  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}

