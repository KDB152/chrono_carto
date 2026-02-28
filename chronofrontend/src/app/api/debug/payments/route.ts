import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  port: parseInt(process.env.DB_PORT || '3306')
};

async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Erreur de connexion MySQL:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const connection = await getConnection();
    
    // Voir la structure de la table paiement
    const [structure] = await connection.execute('DESCRIBE paiement');
    console.log('📋 Structure table paiement:', structure);
    
    // Voir le contenu de la table paiement
    const [payments] = await connection.execute('SELECT * FROM paiement LIMIT 5');
    console.log('💰 Contenu table paiement:', payments);
    
    // Voir le contenu de la table students
    const [students] = await connection.execute('SELECT id, paid_sessions, unpaid_sessions FROM students LIMIT 5');
    console.log('👨‍🎓 Contenu table students:', students);
    
    // Compter les enregistrements
    const [countPayments] = await connection.execute('SELECT COUNT(*) as total FROM paiement');
    const [countStudents] = await connection.execute('SELECT COUNT(*) as total FROM students');
    
    await connection.end();
    
    return NextResponse.json({
      message: 'Debug terminé',
      structure: structure,
      payments: payments,
      students: students,
      counts: {
        paiement: (countPayments as any)[0].total,
        students: (countStudents as any)[0].total
      }
    });
    
  } catch (error) {
    console.error('Erreur debug:', error);
    return NextResponse.json({ error: 'Erreur debug' }, { status: 500 });
  }
}

