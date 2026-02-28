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

// GET - Diagnostic complet des données parent
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/debug/parent-data - Diagnostic complet');
    
    const connection = await getConnection();
    
    // 1. Vérifier la structure des tables
    console.log('📋 Vérification de la structure des tables...');
    const [parentsStructure] = await connection.execute(`DESCRIBE parents`);
    const [studentsStructure] = await connection.execute(`DESCRIBE students`);
    const [parentStudentStructure] = await connection.execute(`DESCRIBE parent_student`);
    const [usersStructure] = await connection.execute(`DESCRIBE users`);
    
    // 2. Voir toutes les données des tables
    console.log('👨‍👩‍👧‍👦 Voir tous les parents...');
    const [allParents] = await connection.execute(`
      SELECT 
        p.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email,
        u.phone as user_phone
      FROM parents p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.id
    `);
    
    console.log('🎓 Voir tous les étudiants...');
    const [allStudents] = await connection.execute(`
      SELECT 
        s.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email,
        u.phone as user_phone
      FROM students s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.id
    `);
    
    console.log('🔗 Voir toutes les relations parent_student...');
    const [allRelations] = await connection.execute(`
      SELECT 
        ps.*,
        p.id as parent_table_id,
        p.user_id as parent_user_id,
        p.first_name as parent_first_name,
        p.last_name as parent_last_name,
        s.id as student_table_id,
        s.user_id as student_user_id,
        s.first_name as student_first_name,
        s.last_name as student_last_name
      FROM parent_student ps
      LEFT JOIN parents p ON ps.parent_id = p.id
      LEFT JOIN students s ON ps.student_id = s.id
      ORDER BY ps.parent_id, ps.student_id
    `);
    
    console.log('👤 Voir tous les utilisateurs...');
    const [allUsers] = await connection.execute(`
      SELECT id, first_name, last_name, email, phone, role, is_approved
      FROM users
      ORDER BY id
    `);
    
    // 3. Test spécifique pour le parent ID 21
    console.log('🎯 Test spécifique pour le parent ID 21...');
    const [parent21Test] = await connection.execute(`
      SELECT 
        'parents' as source,
        p.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name
      FROM parents p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = 21 OR p.user_id = 21
      
      UNION ALL
      
      SELECT 
        'users' as source,
        u.id as id,
        u.id as user_id,
        u.first_name as first_name,
        u.last_name as last_name,
        u.email as email,
        u.phone as phone_number,
        u.role as class_level
      FROM users u
      WHERE u.id = 21
    `);
    
    // 4. Vérifier les relations pour le parent ID 21
    console.log('🔍 Vérifier les relations pour le parent ID 21...');
    const [relations21Test] = await connection.execute(`
      SELECT 
        ps.*,
        p.id as parent_table_id,
        p.user_id as parent_user_id,
        s.id as student_table_id,
        s.user_id as student_user_id
      FROM parent_student ps
      LEFT JOIN parents p ON ps.parent_id = p.id
      LEFT JOIN students s ON ps.student_id = s.id
      WHERE ps.parent_id = 21 OR p.user_id = 21
    `);
    
    await connection.end();
    
    const diagnosticData = {
      timestamp: new Date().toISOString(),
      structures: {
        parents: parentsStructure,
        students: studentsStructure,
        parent_student: parentStudentStructure,
        users: usersStructure
      },
      data: {
        parents: allParents,
        students: allStudents,
        relations: allRelations,
        users: allUsers
      },
      tests: {
        parent_21: parent21Test,
        relations_21: relations21Test
      },
      summary: {
        parentsCount: (allParents as any[]).length,
        studentsCount: (allStudents as any[]).length,
        relationsCount: (allRelations as any[]).length,
        usersCount: (allUsers as any[]).length,
        parent21Exists: (parent21Test as any[]).length > 0,
        relations21Exist: (relations21Test as any[]).length > 0
      }
    };
    
    console.log('✅ Diagnostic terminé avec succès');
    console.log('📊 Résumé:', diagnosticData.summary);
    
    return NextResponse.json(diagnosticData);
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    return NextResponse.json(
      { error: 'Erreur lors du diagnostic', details: error },
      { status: 500 }
    );
  }
}

