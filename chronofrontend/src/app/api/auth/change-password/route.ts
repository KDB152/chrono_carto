import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword, userId } = await request.json();

    if (!currentPassword || !newPassword || !userId) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
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
      // Vérifier le mot de passe actuel
      const [users] = await connection.execute(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      );

      if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }

      const user = users[0] as any;
      
      // Vérifier le mot de passe actuel (hashé)
      const bcrypt = require('bcryptjs');
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Mot de passe actuel incorrect' },
          { status: 400 }
        );
      }

      // Hasher le nouveau mot de passe
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Mettre à jour le mot de passe dans la base de données
      await connection.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedNewPassword, userId]
      );

      await connection.end();

      return NextResponse.json(
        { message: 'Mot de passe modifié avec succès' },
        { status: 200 }
      );

    } catch (dbError) {
      await connection.end();
      throw dbError;
    }

  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

