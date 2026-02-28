import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Configuration de la base de donn�es MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Fonction pour cr�er une connexion � la base de donn�es
async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connexion MySQL �tablie avec succ�s');
    return connection;
  } catch (error) {
    console.error('Erreur de connexion MySQL:', error);
    throw error;
  }
}

// GET - R�cup�rer les donn�es de pr�sence et paiements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classFilter = searchParams.get('class');
    const statusFilter = searchParams.get('status');
    const searchQuery = searchParams.get('search');

    console.log('?? R�cup�ration donn�es pr�sence/paiements:', { classFilter, statusFilter, searchQuery });

    const connection = await getConnection();
    
    // Requ�te pour r�cup�rer les donn�es de pr�sence et paiements
    let query = `
      SELECT 
        s.id as student_id,
        u.first_name,
        u.last_name,
        u.email,
        s.class_level,
        COALESCE(p.seances_payees, 0) as paid_sessions,
        COALESCE(p.seances_non_payees, 0) as unpaid_sessions,
        COALESCE(p.seances_total, 0) as total_sessions,
        COALESCE(p.montant_paye, 0) as paid_amount,
        COALESCE(p.montant_restant, 0) as remaining_amount,
        COALESCE(p.montant_total, 0) as total_amount,
        COALESCE(p.statut, 'en_attente') as payment_status,
        u.is_active,
        u.created_at
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN paiement p ON s.id = p.student_id
      WHERE u.role = 'student'
    `;
    
    const params: any[] = [];
    
    // Filtre par classe
    if (classFilter && classFilter !== 'Total' && classFilter !== 'Toutes') {
      query += ` AND s.class_level = ?`;
      params.push(classFilter);
    }
    
    // Filtre par statut de paiement
    if (statusFilter && statusFilter !== 'Tous') {
      query += ` AND COALESCE(p.statut, 'en_attente') = ?`;
      params.push(statusFilter);
    }
    
    // Filtre par recherche
    if (searchQuery) {
      query += ` AND (
        u.first_name LIKE ? OR 
        u.last_name LIKE ? OR 
        u.email LIKE ?
      )`;
      const searchTerm = `%${searchQuery}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ` ORDER BY s.id DESC`;
    
    const [rows] = await connection.execute(query, params);
    await connection.end();
    
    // Convertir les cha�nes en nombres
    const processedRows = (rows as any[]).map(row => ({
      ...row,
      paid_sessions: parseInt(row.paid_sessions) || 0,
      unpaid_sessions: parseInt(row.unpaid_sessions) || 0,
      total_sessions: parseInt(row.total_sessions) || 0,
      paid_amount: parseFloat(row.paid_amount) || 0,
      remaining_amount: parseFloat(row.remaining_amount) || 0,
      total_amount: parseFloat(row.total_amount) || 0
    }));
    
    console.log(`? Donn�es pr�sence/paiements r�cup�r�es: ${processedRows.length} �tudiants`);
    
    return NextResponse.json(processedRows);
  } catch (error) {
    console.error('? Erreur r�cup�ration donn�es pr�sence/paiements:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la r�cup�ration des donn�es' },
      { status: 500 }
    );
  }
}
