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

// GET - Récupérer un rendez-vous par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await getConnection();
    
    const [rows] = await connection.execute(`
      SELECT * FROM rendez_vous WHERE id = ?
    `, [params.id]);
    
    await connection.end();
    
    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json((rows as any[])[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du rendez-vous' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un rendez-vous par ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Début de la mise à jour du rendez-vous:', params.id);
    
    const body = await request.json();
    const { status, adminReason, updatedAt } = body;
    
    console.log('📝 Données reçues:', { status, adminReason, updatedAt });
    
    const connection = await getConnection();
    
    // Vérifier que le rendez-vous existe
    console.log('🔍 Vérification de l\'existence du rendez-vous...');
    const [existingRows] = await connection.execute(`
      SELECT * FROM rendez_vous WHERE id = ?
    `, [params.id]);
    
    if ((existingRows as any[]).length === 0) {
      await connection.end();
      console.log('❌ Rendez-vous non trouvé');
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }
    
    console.log('✅ Rendez-vous trouvé, mise à jour en cours...');
    
    // Préparer les valeurs pour la mise à jour
    const updateStatus = status;
    const updateAdminReason = adminReason || null;
    const updateTime = updatedAt || new Date().toISOString();
    
    console.log('📝 Valeurs de mise à jour:', {
      status: updateStatus,
      adminReason: updateAdminReason,
      updatedAt: updateTime
    });
    
    // Mettre à jour le rendez-vous (sans updated_at pour éviter les erreurs)
    const [updateResult] = await connection.execute(`
      UPDATE rendez_vous 
      SET status = ?, admin_reason = ?
      WHERE id = ?
    `, [
      updateStatus,
      updateAdminReason,
      params.id
    ]);
    
    console.log('✅ Résultat de la mise à jour:', updateResult);
    
    await connection.end();
    
    console.log(`✅ Rendez-vous ${params.id} mis à jour avec succès`);
    console.log(`   Nouveau statut: ${updateStatus}`);
    console.log(`   Raison admin: ${updateAdminReason || 'Aucune'}`);
    console.log(`   Date de mise à jour: ${updateTime}`);
    
    return NextResponse.json(
      { message: 'Rendez-vous mis à jour avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du rendez-vous:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du rendez-vous' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un rendez-vous par ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { reason, deletedBy, deletedAt } = body;
    
    const connection = await getConnection();
    
    // D'abord, récupérer les informations du rendez-vous avant suppression
    const [rendezVousRows] = await connection.execute(`
      SELECT * FROM rendez_vous WHERE id = ?
    `, [params.id]);
    
    if ((rendezVousRows as any[]).length === 0) {
      await connection.end();
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }
    
    const rendezVous = (rendezVousRows as any[])[0];
    
    // Insérer dans la table de logs de suppression
    await connection.execute(`
      INSERT INTO rendez_vous_deletion_logs (
        rendez_vous_id,
        parent_name,
        child_name,
        parent_reason,
        admin_reason,
        deleted_by,
        deleted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      params.id,
      rendezVous.parent_name,
      rendezVous.child_name,
      rendezVous.parent_reason,
      rendezVous.admin_reason,
      deletedBy || 'admin',
      deletedAt || new Date().toISOString()
    ]);
    
    // Supprimer le rendez-vous
    const [deleteResult] = await connection.execute(`
      DELETE FROM rendez_vous WHERE id = ?
    `, [params.id]);
    
    await connection.end();
    
    console.log(`Rendez-vous ${params.id} supprimé avec succès`);
    console.log(`Raison: ${reason || 'Aucune raison spécifiée'}`);
    console.log(`Supprimé par: ${deletedBy || 'admin'}`);
    
    return NextResponse.json(
      { message: 'Rendez-vous supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression du rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du rendez-vous' },
      { status: 500 }
    );
  }
}
