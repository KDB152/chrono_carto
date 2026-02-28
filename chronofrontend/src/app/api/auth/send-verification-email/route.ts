import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json();
    
    console.log('🔍 Debug - Envoi email de vérification pour:', { email, userId });

    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email et userId requis' },
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
      // Générer un token de vérification
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

      // Sauvegarder le token en base (utiliser les colonnes existantes)
      await connection.execute(
        'UPDATE users SET verification_token = ?, email_verification_code = ?, email_verification_code_expiry = ? WHERE id = ?',
        [verificationToken, verificationToken, expiresAt, userId]
      );

      // Simuler l'envoi d'email (pour le développement)
      console.log('📧 Debug - Email de vérification simulé:');
      console.log('📧 À:', email);
      console.log('📧 Token:', verificationToken);
      console.log('📧 Lien de vérification:', `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL!}/verify-email?token=${verificationToken}`);

      await connection.end();

      return NextResponse.json({
        success: true,
        message: 'Email de vérification envoyé (simulé en développement)',
        token: verificationToken, // Pour le développement seulement
        verificationLink: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL!}/verify-email?token=${verificationToken}`
      });

    } catch (dbError) {
      await connection.end();
      throw dbError;
    }

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    );
  }
}

