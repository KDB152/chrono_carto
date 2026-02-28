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

// Interface pour un rendez-vous
interface RendezVous {
  id?: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childName: string;
  childClass: string;
  timing: string; // Date et heure du rendez-vous
  parentReason: string; // Raison du parent
  adminReason?: string; // Raison de l'admin
  status: 'pending' | 'approved' | 'refused' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

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

// GET - R�cup�rer tous les rendez-vous avec les vraies informations des parents et enfants
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/rendez-vous appel�');
    
    // Essayer d'abord le backend
    try {
      const requestUrl = new URL(request.url);
      const authHeader = request.headers.get('authorization');
      const queryString = requestUrl.searchParams.toString();
      const backendUrl = `${process.env.NEXT_PUBLIC_API_URL!}/api/rendez-vous${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { 'Authorization': authHeader } : {})
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('? Donn�es re�ues du backend:', data);
        return NextResponse.json(data);
      }
    } catch (backendError) {
      console.log('??  Backend non accessible, tentative via base de donn�es locale');
    }
    
    // V�rifier s'il y a un filtre par parent
    const url = new URL(request.url);
    const parentId = url.searchParams.get('parentId');
    
    console.log('?? Filtre parentId:', parentId);
    
    const connection = await getConnection();
    
          let query = `
        SELECT 
          rv.id,
          rv.parent_id,
          rv.parent_name,
          rv.parent_email,
          rv.parent_phone,
          rv.child_name,
          rv.child_class,
          rv.timing,
          rv.appointment_time,
          rv.parent_reason,
          rv.admin_reason,
          rv.status,
          rv.created_at,
          rv.updated_at,
          -- Informations r�elles du parent depuis la base
          CONCAT(pu.first_name, ' ', pu.last_name) as real_parent_name,
          pu.email as real_parent_email,
          COALESCE(p.phone_number, pu.phone) as real_parent_phone,
          -- Informations r�elles de l'enfant depuis la base
          CONCAT(su.first_name, ' ', su.last_name) as real_child_name,
          s.class_level as real_child_class,
          -- Informations d�taill�es des enfants du parent
          GROUP_CONCAT(DISTINCT CONCAT(su2.first_name, ' ', su2.last_name) SEPARATOR ', ') as all_children_names,
          GROUP_CONCAT(DISTINCT s2.class_level SEPARATOR ', ') as all_children_classes
        FROM rendez_vous rv
        LEFT JOIN parents p ON rv.parent_id = p.id OR rv.parent_id = p.user_id
        LEFT JOIN users pu ON p.user_id = pu.id
        LEFT JOIN parent_student ps ON p.id = ps.parent_id
        LEFT JOIN students s ON ps.student_id = s.id
        LEFT JOIN users su ON s.user_id = su.id
        -- Jointure pour r�cup�rer TOUS les enfants du parent
        LEFT JOIN parent_student ps2 ON p.id = ps2.parent_id
        LEFT JOIN students s2 ON ps2.student_id = s2.id
        LEFT JOIN users su2 ON s2.user_id = su2.id
      `;
    
    const queryParams: any[] = [];
    
    // Ajouter le filtre par parent si sp�cifi�
    if (parentId) {
      query += ` WHERE p.id = ? OR p.user_id = ?`;
      queryParams.push(parentId, parentId);
    }
    
    // Ajouter GROUP BY pour les fonctions d'agr�gation
    query += ` GROUP BY rv.id, rv.parent_id, rv.parent_name, rv.parent_email, rv.parent_phone, rv.child_name, rv.child_class, rv.timing, rv.appointment_time, rv.parent_reason, rv.admin_reason, rv.status, rv.created_at, rv.updated_at, pu.first_name, pu.last_name, pu.email, p.phone_number, pu.phone, su.first_name, su.last_name, s.class_level`;
    
    query += ` ORDER BY rv.created_at DESC`;
    
    console.log('?? Requ�te SQL:', query);
    console.log('?? Param�tres:', queryParams);
    
    const [rows] = await connection.execute(query, queryParams);
    
    await connection.end();
    
    console.log('Donn�es r�cup�r�es de la base:', (rows as any).length, 'lignes');
    
    // Transformer les donn�es pour utiliser les vraies informations quand disponibles
    const transformedRows = (rows as any[]).map(row => ({
      id: row.id,
      parent_id: row.parent_id,
      parent_name: row.real_parent_name || row.parent_name,
      parent_email: row.real_parent_email || row.parent_email,
      parent_phone: row.real_parent_phone || row.parent_phone,
      child_name: row.real_child_name || row.child_name,
      child_class: row.real_child_class || row.child_class,
      timing: row.timing,
      appointment_time: row.appointment_time,
      parent_reason: row.parent_reason,
      admin_reason: row.admin_reason,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      // Informations suppl�mentaires des enfants
      all_children_names: row.all_children_names || '',
      all_children_classes: row.all_children_classes || ''
    }));
    
    console.log('Donn�es transform�es:', transformedRows);
    return NextResponse.json(transformedRows);
  } catch (error) {
    console.error('Erreur lors de la r�cup�ration des rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la r�cup�ration des rendez-vous' },
      { status: 500 }
    );
  }
}

// POST - Cr�er un nouveau rendez-vous
export async function POST(request: NextRequest) {
  try {
    const body: RendezVous = await request.json();
    const connection = await getConnection();
    
    // V�rifier et r�cup�rer les vraies informations du parent et de l'enfant
    let realParentInfo = null;
    let realChildInfo = null;
    
    try {
      // R�cup�rer les vraies informations du parent
      const [parentRows] = await connection.execute(`
        SELECT 
          p.id,
          CONCAT(pu.first_name, ' ', pu.last_name) as full_name,
          pu.email,
          COALESCE(p.phone_number, pu.phone) as phone
        FROM parents p
        JOIN users pu ON p.user_id = pu.id
        WHERE p.id = ? OR p.user_id = ?
      `, [body.parentId, body.parentId]);
      
      if ((parentRows as any[]).length > 0) {
        realParentInfo = (parentRows as any[])[0];
      }
      
      // R�cup�rer les vraies informations de l'enfant
      const [childRows] = await connection.execute(`
        SELECT 
          s.id,
          CONCAT(su.first_name, ' ', su.last_name) as full_name,
          s.class_level
        FROM students s
        JOIN users su ON s.user_id = su.id
        WHERE s.id = ?
      `, [(body as any).childId]);
      
      if ((childRows as any[]).length > 0) {
        realChildInfo = (childRows as any[])[0];
      }
    } catch (infoError) {
      console.log('?? Erreur lors de la r�cup�ration des informations r�elles, utilisation des donn�es fournies:', infoError);
    }
    
    // Utiliser les vraies informations si disponibles, sinon les donn�es fournies
    const finalParentName = realParentInfo?.full_name || body.parentName;
    const finalParentEmail = realParentInfo?.email || body.parentEmail;
    const finalParentPhone = realParentInfo?.phone || body.parentPhone;
    const finalChildName = realChildInfo?.full_name || body.childName;
    const finalChildClass = realChildInfo?.class_level || body.childClass;
    
    console.log('?? Cr�ation de rendez-vous avec:', {
      parentName: finalParentName,
      parentEmail: finalParentEmail,
      parentPhone: finalParentPhone,
      childName: finalChildName,
      childClass: finalChildClass
    });
    
    const [result] = await connection.execute(`
      INSERT INTO rendez_vous (
        parent_id,
        parent_name,
        parent_email,
        parent_phone,
        child_name,
        child_class,
        timing,
        parent_reason,
        admin_reason,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      body.parentId,
      finalParentName,
      finalParentEmail,
      finalParentPhone,
      finalChildName,
      finalChildClass,
      body.timing,
      body.parentReason,
      body.adminReason || null,
      body.status || 'pending'
    ]);
    
    await connection.end();
    
    return NextResponse.json({ 
      id: (result as any).insertId,
      message: 'Rendez-vous cr�� avec succ�s',
      details: {
        parentName: finalParentName,
        parentEmail: finalParentEmail,
        parentPhone: finalParentPhone,
        childName: finalChildName,
        childClass: finalChildClass
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la cr�ation du rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la cr�ation du rendez-vous' },
      { status: 500 }
    );
  }
}

// PUT - Mettre � jour un rendez-vous existant (pour approuver/refuser)
export async function PUT(request: NextRequest) {
  try {
    const body: RendezVous = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'ID du rendez-vous requis' },
        { status: 400 }
      );
    }
    
    const connection = await getConnection();
    
    const [result] = await connection.execute(`
      UPDATE rendez_vous SET
        parent_id = ?,
        parent_name = ?,
        parent_email = ?,
        parent_phone = ?,
        child_name = ?,
        child_class = ?,
        timing = ?,
        parent_reason = ?,
        admin_reason = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      body.parentId,
      body.parentName,
      body.parentEmail,
      body.parentPhone,
      body.childName,
      body.childClass,
      body.timing,
      body.parentReason,
      body.adminReason || null,
      body.status,
      body.id
    ]);
    
    await connection.end();
    
    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouv�' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Rendez-vous mis � jour avec succ�s',
      id: body.id
    });
  } catch (error) {
    console.error('Erreur lors de la mise � jour du rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise � jour du rendez-vous' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un rendez-vous
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du rendez-vous requis' },
        { status: 400 }
      );
    }
    
    const connection = await getConnection();
    
    // V�rifier si le rendez-vous existe avant de le supprimer
    const [existingRows] = await connection.execute(`
      SELECT id FROM rendez_vous WHERE id = ?
    `, [id]);
    
    if ((existingRows as any[]).length === 0) {
      await connection.end();
      return NextResponse.json(
        { error: 'Rendez-vous non trouv�' },
        { status: 404 }
      );
    }
    
    // Supprimer le rendez-vous
    const [result] = await connection.execute(`
      DELETE FROM rendez_vous WHERE id = ?
    `, [id]);
    
    await connection.end();
    
    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du rendez-vous' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Rendez-vous supprim� avec succ�s',
      id: id
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du rendez-vous' },
      { status: 500 }
    );
  }
}

