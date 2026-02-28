import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Configuration de la base de donn�es MySQL
const dbConfig = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Fonction pour cr�er une connexion � la base de donn�es
async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Erreur de connexion � la base de donn�es:', error);
    throw error;
  }
}

// GET - Debug des rendez-vous
export async function GET(request: NextRequest) {
  try {
    const connection = await getConnection();
    
    // R�cup�rer tous les rendez-vous avec leurs statuts
    const [rows] = await connection.execute(`
      SELECT 
        id,
        parent_id,
        parent_name,
        child_name,
        timing,
        appointment_time,
        status,
        created_at
      FROM rendez_vous 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    await connection.end();
    
    console.log('?? Tous les rendez-vous (debug):', rows);
    
    return NextResponse.json({
      total: (rows as any[]).length,
      rendezVous: rows,
      statuts: [...new Set((rows as any[]).map(r => r.status))]
    });
    
  } catch (error) {
    console.error('Erreur lors du debug des rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur lors du debug des rendez-vous' },
      { status: 500 }
    );
  }
}
