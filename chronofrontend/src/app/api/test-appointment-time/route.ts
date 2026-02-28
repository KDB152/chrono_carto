import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

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

async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Erreur de connexion � la base de donn�es:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const connection = await getConnection();
    
    // R�cup�rer tous les rendez-vous avec leurs heures
    const [rows] = await connection.execute(`
      SELECT 
        id,
        parent_name,
        child_name,
        timing,
        appointment_time,
        status,
        created_at
      FROM rendez_vous 
      WHERE status = 'accepted'
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    await connection.end();
    
    console.log('?? Donn�es brutes de la base de donn�es:');
    console.log(JSON.stringify(rows, null, 2));
    
    return NextResponse.json({
      message: 'Test des donn�es appointment_time',
      data: rows,
      count: rows.length
    });
    
  } catch (error) {
    console.error('Erreur lors du test appointment_time:', error);
    return NextResponse.json(
      { error: 'Erreur lors du test appointment_time' },
      { status: 500 }
    );
  }
}
