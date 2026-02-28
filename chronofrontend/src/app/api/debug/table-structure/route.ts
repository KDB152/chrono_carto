import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Configuration de la base de données MySQL
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

// Fonction pour créer une connexion à la base de données
async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connexion MySQL établie avec succès');
    return connection;
  } catch (error) {
    console.error('Erreur de connexion MySQL:', error);
    throw error;
  }
}

// GET - Vérifier la structure des tables
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/debug/table-structure - Vérification de la structure');
    
    const connection = await getConnection();
    
    // 1. Structure de la table parents
    console.log('📋 Structure de la table parents...');
    const [parentsStructure] = await connection.execute(`DESCRIBE parents`);
    
    // 2. Structure de la table students
    console.log('📋 Structure de la table students...');
    const [studentsStructure] = await connection.execute(`DESCRIBE students`);
    
    // 3. Structure de la table users
    console.log('📋 Structure de la table users...');
    const [usersStructure] = await connection.execute(`DESCRIBE users`);
    
    // 4. Voir quelques exemples de données
    console.log('👀 Exemples de données...');
    const [parentsSample] = await connection.execute(`SELECT * FROM parents LIMIT 3`);
    const [studentsSample] = await connection.execute(`SELECT * FROM students LIMIT 3`);
    const [usersSample] = await connection.execute(`SELECT * FROM users LIMIT 3`);
    
    await connection.end();
    
    const structureData = {
      timestamp: new Date().toISOString(),
      structures: {
        parents: parentsStructure,
        students: studentsStructure,
        users: usersStructure
      },
      samples: {
        parents: parentsSample,
        students: studentsSample,
        users: usersSample
      }
    };
    
    console.log('✅ Structure des tables vérifiée avec succès');
    
    return NextResponse.json(structureData);
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la structure:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de la structure', details: error },
      { status: 500 }
    );
  }
}

