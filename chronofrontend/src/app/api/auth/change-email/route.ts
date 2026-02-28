import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
  try {
    const { newEmail, userId } = await request.json();
    
    console.log('🔍 Debug - Changement d\'email - Données reçues:', { newEmail, userId });

    if (!newEmail || !userId) {
      console.log('❌ Debug - Données manquantes');
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

    // Connexion à la base de données
    console.log('🔍 Debug - Tentative de connexion à MySQL...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'chrono_carto'
    });
    console.log('✅ Debug - Connexion MySQL réussie');

    try {
      // Vérifier si l'email existe déjà
      console.log('🔍 Debug - Vérification de l\'unicité de l\'email...');
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [newEmail, userId]
      );
      console.log('🔍 Debug - Résultat de la vérification:', existingUsers);

      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        console.log('❌ Debug - Email déjà utilisé');
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé par un autre utilisateur' },
          { status: 400 }
      );
      }

      // Mettre à jour l'email et marquer comme non vérifié
      console.log('🔍 Debug - Mise à jour de l\'email en base...');
      const [updateResult] = await connection.execute(
        'UPDATE users SET email = ?, email_verified = 0, verification_token = NULL, email_verification_code = NULL, email_verification_code_expiry = NULL WHERE id = ?',
        [newEmail, userId]
      );
      console.log('✅ Debug - Résultat de la mise à jour:', updateResult);

      await connection.end();
      console.log('✅ Debug - Connexion MySQL fermée');

      // Envoyer l'email de vérification
      try {
        console.log('📧 Debug - Envoi de l\'email de vérification...');
        const emailResponse = await fetch(`${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL!}/api/auth/send-verification-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: newEmail, userId }),
        });

        if (emailResponse.ok) {
          const emailResult = await emailResponse.json();
          console.log('✅ Debug - Email de vérification envoyé:', emailResult);
        } else {
          console.log('⚠️ Debug - Erreur lors de l\'envoi de l\'email');
        }
      } catch (emailError) {
        console.log('⚠️ Debug - Erreur lors de l\'envoi de l\'email:', emailError);
      }

      return NextResponse.json(
        { 
          message: 'Email modifié avec succès. Veuillez vérifier votre nouvelle adresse email.',
          email: newEmail
        },
        { status: 200 }
      );

    } catch (dbError) {
      await connection.end();
      throw dbError;
    }

  } catch (error) {
    console.error('Erreur lors du changement d\'email:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

