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

// GET - Diagnostic des relations parent-student
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/debug/parent-student - Diagnostic des relations');
    
    const connection = await getConnection();
    
    // 1. Vérifier la structure de la table parent_student
    console.log('📋 Vérification de la structure parent_student...');
    const [structureRows] = await connection.execute(`
      DESCRIBE parent_student
    `);
    
    // 2. Voir toutes les relations parent-student
    console.log('🔗 Voir toutes les relations parent-student...');
    const [relationRows] = await connection.execute(`
      SELECT 
        ps.*,
        p.id as parent_table_id,
        p.user_id as parent_user_id,
        s.id as student_table_id,
        s.user_id as student_user_id
      FROM parent_student ps
      LEFT JOIN parents p ON ps.parent_id = p.id
      LEFT JOIN students s ON ps.student_id = s.id
      ORDER BY ps.parent_id, ps.student_id
    `);
    
    // 3. Voir les parents avec leurs IDs
    console.log('👨‍👩‍👧‍👦 Voir tous les parents...');
    const [parentRows] = await connection.execute(`
      SELECT 
        p.id,
        p.user_id,
        p.first_name,
        p.last_name,
        p.phone_number,
        p.class_level,
        pu.id as user_table_id,
        pu.first_name as user_first_name,
        pu.last_name as user_last_name,
        pu.email,
        pu.phone
      FROM parents p
      LEFT JOIN users pu ON p.user_id = pu.id
      ORDER BY p.id
    `);
    
    // 4. Voir les étudiants avec leurs IDs
    console.log('🎓 Voir tous les étudiants...');
    const [studentRows] = await connection.execute(`
      SELECT 
        s.id,
        s.user_id,
        s.first_name,
        s.last_name,
        s.phone_number,
        s.class_level,
        su.id as user_table_id,
        su.first_name as user_first_name,
        su.last_name as user_last_name,
        su.email,
        su.phone
      FROM students s
      LEFT JOIN users su ON s.user_id = su.id
      ORDER BY s.id
    `);
    
    // 5. Test spécifique pour le parent ID 21
    console.log('🎯 Test spécifique pour le parent ID 21...');
    const [testRows] = await connection.execute(`
      SELECT 
        'parent_student' as source,
        ps.*
      FROM parent_student ps
      WHERE ps.parent_id = 21
      
      UNION ALL
      
      SELECT 
        'parents' as source,
        p.id as parent_id,
        p.user_id as student_id,
        p.first_name,
        p.last_name,
        p.phone_number,
        p.class_level
      FROM parents p
      WHERE p.id = 21
      
      UNION ALL
      
      SELECT 
        'users' as source,
        u.id as parent_id,
        u.id as student_id,
        u.first_name,
        u.last_name,
        u.phone as phone_number,
        u.role as class_level
      FROM users u
      WHERE u.id = 21
    `);
    
    await connection.end();
    
    const diagnosticData = {
      timestamp: new Date().toISOString(),
      structure: structureRows,
      relations: relationRows,
      parents: parentRows,
      students: studentRows,
      test_parent_21: testRows
    };
    
    console.log('✅ Diagnostic terminé avec succès');
    console.log('📊 Résultats:', {
      structureCount: (structureRows as any[]).length,
      relationsCount: (relationRows as any[]).length,
      parentsCount: (parentRows as any[]).length,
      studentsCount: (studentRows as any[]).length,
      testCount: (testRows as any[]).length
    });
    
    return NextResponse.json(diagnosticData);
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    return NextResponse.json(
      { error: 'Erreur lors du diagnostic', details: error },
      { status: 500 }
    );
  }
}

