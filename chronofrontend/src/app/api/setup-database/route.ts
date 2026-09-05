import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST() {
  try {
    console.log('🔧 Debug - Configuration de la base de données...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'chrono_carto'
    });

    try {
      // Créer la table email_verification_tokens
      console.log('🔧 Debug - Création de la table email_verification_tokens...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS email_verification_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          token VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_token (token),
          INDEX idx_expires_at (expires_at)
        )
      `);

      // Ajouter la colonne email_verified si elle n'existe pas
      console.log('🔧 Debug - Vérification de la colonne email_verified...');
      try {
        await connection.execute('ALTER TABLE users ADD COLUMN email_verified TINYINT(1) DEFAULT 0');
        console.log('✅ Debug - Colonne email_verified ajoutée');
      } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('ℹ️ Debug - Colonne email_verified existe déjà');
        } else {
          throw error;
        }
      }

      // Créer les index
      console.log('🔧 Debug - Création des index...');
      try {
        await connection.execute('CREATE INDEX idx_users_email ON users(email)');
        console.log('✅ Debug - Index sur email créé');
      } catch (error: any) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log('ℹ️ Debug - Index sur email existe déjà');
        } else {
          throw error;
        }
      }

      try {
        await connection.execute('CREATE INDEX idx_users_email_verified ON users(email_verified)');
        console.log('✅ Debug - Index sur email_verified créé');
      } catch (error: any) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log('ℹ️ Debug - Index sur email_verified existe déjà');
        } else {
          throw error;
        }
      }

      await connection.end();
      console.log('✅ Debug - Configuration terminée avec succès');

      return NextResponse.json({
        success: true,
        message: 'Base de données configurée avec succès',
        tables: ['email_verification_tokens'],
        columns: ['email_verified'],
        indexes: ['idx_users_email', 'idx_users_email_verified']
      });

    } catch (dbError) {
      await connection.end();
      throw dbError;
    }

  } catch (error: any) {
    console.error('❌ Debug - Erreur lors de la configuration:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Erreur lors de la configuration de la base de données'
    }, { status: 500 });
  }
}

