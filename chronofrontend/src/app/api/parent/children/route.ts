import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Configuration de la base de données MySQL
const dbConfig = {
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
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

// GET - Récupérer les enfants d'un parent avec toutes les informations
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/parent/children appelé');
    
    // Récupérer l'ID du parent depuis les paramètres de requête
    const url = new URL(request.url);
    const parentId = url.searchParams.get('parentId');
    
    if (!parentId) {
      // Retourner des données de test si aucun parentId fourni
      console.log('⚠️  Aucun parentId fourni, retour de données de test');
      const testData = {
        id: 1,
        full_name: 'Marie Dupont',
        email: 'marie.dupont@email.com',
        phone: '06 12 34 56 78',
        class_level: 'Non défini',
        children: [
          {
            id: 1,
            full_name: 'Lucas Dupont',
            email: 'lucas.dupont@email.com',
            phone: '06 11 22 33 44',
            class_level: '4ème A',
            payment: {
              total_sessions: 20,
              paid_sessions: 15,
              unpaid_sessions: 5,
              total_amount: 800.00,
              paid_amount: 600.00,
              remaining_amount: 200.00,
              status: 'en_attente'
            }
          },
          {
            id: 2,
            full_name: 'Emma Dupont',
            email: 'emma.dupont@email.com',
            phone: '06 55 66 77 88',
            class_level: '6ème B',
            payment: {
              total_sessions: 18,
              paid_sessions: 18,
              unpaid_sessions: 0,
              total_amount: 720.00,
              paid_amount: 720.00,
              remaining_amount: 0.00,
              status: 'paye'
            }
          }
        ]
      };
      
      return NextResponse.json(testData);
    }
    
    console.log(`🔍 Récupération des enfants pour le parent ID: ${parentId}`);
    
    const connection = await getConnection();
    
    // Récupérer les informations du parent et de ses enfants
    // LOGIQUE CORRECTE : parent_id → parents → parent_student → students
    let [rows] = await connection.execute(`
      SELECT 
        p.id as parent_id,
        p.user_id as parent_user_id,
        CONCAT(pu.first_name, ' ', pu.last_name) as parent_full_name,
        pu.email as parent_email,
        p.phone_number as parent_phone,
        'Non défini' as parent_class_level,
        -- Informations des enfants via parent_student
        s.id as student_id,
        s.user_id as student_user_id,
        CONCAT(su.first_name, ' ', su.last_name) as student_full_name,
        su.email as student_email,
        s.phone_number as student_phone,
        s.class_level as student_class_level,
        -- Informations de paiement
        COALESCE(pay.seances_total, 0) as total_sessions,
        COALESCE(pay.seances_payees, 0) as paid_sessions,
        COALESCE(pay.seances_non_payees, 0) as unpaid_sessions,
        COALESCE(pay.montant_total, 0.00) as total_amount,
        COALESCE(pay.montant_paye, 0.00) as paid_amount,
        COALESCE(pay.montant_restant, 0.00) as remaining_amount,
        pay.statut as payment_status
      FROM parents p
      JOIN users pu ON p.user_id = pu.id
      -- Jointure directe avec parent_student
      LEFT JOIN parent_student ps ON p.id = ps.parent_id
      -- Jointure avec students pour récupérer les informations des enfants
      LEFT JOIN students s ON ps.student_id = s.id
      -- Jointure avec users pour récupérer les noms des étudiants
      LEFT JOIN users su ON s.user_id = su.id
      -- Jointure avec paiement pour les informations de paiement
      LEFT JOIN paiement pay ON s.id = pay.student_id
      WHERE p.user_id = ?
      ORDER BY su.first_name, su.last_name
    `, [parentId]);
    
    console.log(`🔍 Requête exécutée pour parentId: ${parentId}`);
    console.log(`📊 Nombre de lignes trouvées: ${(rows as any[]).length}`);
    
    // Si aucune relation trouvée, essayer une approche alternative
    if ((rows as any[]).length === 0) {
      console.log('⚠️ Aucune relation trouvée, essai avec approche alternative...');
      
             // Essayer de trouver les enfants via la table users directement
       const [alternativeRows] = await connection.execute(`
         SELECT 
           u.id as parent_id,
           CONCAT(u.first_name, ' ', u.last_name) as parent_full_name,
           u.email as parent_email,
           u.phone as parent_phone,
           'Non défini' as parent_class_level,
           -- Chercher les enfants dans la table students
           s.id as student_id,
           CONCAT(su.first_name, ' ', su.last_name) as student_full_name,
           su.email as student_email,
           s.phone_number as student_phone,
           s.class_level as student_class_level,
           -- Informations de paiement
           COALESCE(pay.seances_total, 0) as total_sessions,
           COALESCE(pay.seances_payees, 0) as paid_sessions,
           COALESCE(pay.seances_non_payees, 0) as unpaid_sessions,
           COALESCE(pay.montant_total, 0.00) as total_amount,
           COALESCE(pay.seances_payees, 0.00) as paid_amount,
           COALESCE(pay.montant_restant, 0.00) as remaining_amount,
           pay.statut as payment_status
         FROM users u
         LEFT JOIN students s ON s.user_id = u.id
         LEFT JOIN users su ON s.user_id = su.id
         LEFT JOIN paiement pay ON s.id = pay.student_id
         WHERE u.id = ? AND u.role = 'parent'
       `, [parentId]);
      
      console.log(`🔄 Approche alternative: ${(alternativeRows as any[]).length} lignes trouvées`);
      
      if ((alternativeRows as any[]).length > 0) {
        // Utiliser les résultats alternatifs
        rows = alternativeRows;
      }
    }
    
    await connection.end();
    
    // Filtrer les enfants qui ont des valeurs NULL
    const validChildren = (rows as any[]).filter(row => row.student_id !== null);
    
    if ((rows as any[]).length === 0 || validChildren.length === 0) {
      return NextResponse.json(
        { error: 'Aucun parent trouvé ou aucun enfant associé à ce compte' },
        { status: 404 }
      );
    }
    
    // Organiser les données par parent et enfants
    const parentData = {
      id: (rows as any[])[0].parent_id,
      full_name: (rows as any[])[0].parent_full_name,
      email: (rows as any[])[0].parent_email,
      phone: (rows as any[])[0].parent_phone,
      class_level: (rows as any[])[0].parent_class_level,
      children: validChildren.map(row => ({
        id: row.student_id,
        full_name: row.student_full_name,
        email: row.student_email,
        phone: row.student_phone,
        class_level: row.student_class_level,
        payment: {
          total_sessions: row.total_sessions,
          paid_sessions: row.paid_sessions,
          unpaid_sessions: row.unpaid_sessions,
          total_amount: row.total_amount,
          paid_amount: row.paid_amount,
          remaining_amount: row.remaining_amount,
          status: row.payment_status
        }
      }))
    };
    
    console.log('✅ Données du parent récupérées:', {
      parentId: parentData.id,
      parentName: parentData.full_name,
      childrenCount: parentData.children.length,
      children: parentData.children.map(c => `${c.full_name} (${c.class_level})`)
    });
    
    return NextResponse.json(parentData);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des enfants:', error);
    return NextResponse.json(
      { error: 'Impossible de charger les informations des enfants. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}

