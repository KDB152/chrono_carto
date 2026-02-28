import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    console.log('🔍 Debug - Test de la structure de la table users');
    
    // Connexion à la base de données
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'chrono_carto'
    });

    try {
      // Vérifier la structure de la table
      const [columns] = await connection.execute('DESCRIBE users');
      console.log('🔍 Debug - Structure de la table users:', columns);

      // Vérifier quelques utilisateurs
      const [users] = await connection.execute('SELECT id, email, email_verified FROM users LIMIT 5');
      console.log('🔍 Debug - Exemples d\'utilisateurs:', users);

      await connection.end();

      return NextResponse.json({
        success: true,
        message: 'Structure de la table users récupérée',
        columns: columns,
        sampleUsers: users
      });

    } catch (dbError) {
      await connection.end();
      throw dbError;
    }

  } catch (error: any) {
    console.error('❌ Debug - Erreur:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Erreur lors de la vérification de la structure'
    }, { status: 500 });
  }
}

