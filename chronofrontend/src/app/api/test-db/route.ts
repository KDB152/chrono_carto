import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    // Test de connexion à la base de données
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'chrono_carto'
    });

    // Test simple de requête
    const [result] = await connection.execute('SELECT 1 as test');
    
    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Connexion à la base de données réussie',
      result: result
    });

  } catch (error: any) {
    console.error('Erreur de connexion à la base de données:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Vérifiez que MySQL est démarré et accessible'
    }, { status: 500 });
  }
}

