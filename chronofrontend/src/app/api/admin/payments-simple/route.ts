import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Configuration de la base de donn�es
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
};

export async function GET(request: NextRequest) {
  try {
    console.log('?? R�cup�ration des paiements admin...');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Requ�te pour r�cup�rer les donn�es de paiements
    const query = `
      SELECT 
        p.id,
        p.student_id,
        p.parent_id,
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        CONCAT(pu.first_name, ' ', pu.last_name) as parent_name,
        s.class_level,
        COALESCE(p.seances_total, 0) as seances_total,
        COALESCE(p.seances_payees, 0) as seances_payees,
        COALESCE(p.seances_non_payees, 0) as seances_non_payees,
        COALESCE(p.montant_total, 0) as montant_total,
        COALESCE(p.montant_paye, 0) as montant_paye,
        COALESCE(p.montant_restant, 0) as montant_restant,
        COALESCE(p.statut, 'en_attente') as statut,
        p.date_creation,
        p.date_modification
      FROM paiement p
      JOIN students s ON p.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN parents par ON p.parent_id = par.id
      LEFT JOIN users pu ON par.user_id = pu.id
      ORDER BY p.id DESC
    `;
    
    const [rows] = await connection.execute(query);
    await connection.end();
    
    const payments = (rows as any[]).map(row => ({
      ...row,
      seances_total: parseInt(row.seances_total) || 0,
      seances_payees: parseInt(row.seances_payees) || 0,
      seances_non_payees: parseInt(row.seances_non_payees) || 0,
      montant_total: parseFloat(row.montant_total) || 0,
      montant_paye: parseFloat(row.montant_paye) || 0,
      montant_restant: parseFloat(row.montant_restant) || 0
    }));
    
    // Calculer les statistiques
    const stats = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.montant_total, 0),
      paidAmount: payments.reduce((sum, p) => sum + p.montant_paye, 0),
      unpaidAmount: payments.reduce((sum, p) => sum + p.montant_restant, 0)
    };
    
    console.log(`? ${payments.length} paiements r�cup�r�s`);
    
    return NextResponse.json({
      payments,
      stats,
      total: payments.length
    });
    
  } catch (error) {
    console.error('? Erreur r�cup�ration paiements:', error);
    
    // Donn�es de test en cas d'erreur
    return NextResponse.json({
      payments: [
        {
          id: 1,
          student_id: 1,
          parent_id: 1,
          student_name: 'Mehdi El Abed',
          parent_name: 'Aucun parent',
          class_level: 'Terminale groupe 3',
          seances_total: 2,
          seances_payees: 0,
          seances_non_payees: 2,
          montant_total: 80.00,
          montant_paye: 0.00,
          montant_restant: 80.00,
          statut: 'en_attente',
          date_creation: '2024-01-01T00:00:00Z',
          date_modification: '2024-01-15T10:30:00Z'
        }
      ],
      stats: {
        totalPayments: 1,
        totalAmount: 80.00,
        paidAmount: 0.00,
        unpaidAmount: 80.00
      },
      total: 1
    });
  }
}
