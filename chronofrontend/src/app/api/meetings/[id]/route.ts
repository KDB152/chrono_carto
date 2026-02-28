import { NextRequest, NextResponse } from 'next/server';

// Import conditionnel de Vercel Postgres
let sql: any;
try {
  const { sql: vercelSql } = require('@vercel/postgres');
  sql = vercelSql;
} catch (error) {
  console.warn('Vercel Postgres non disponible, utilisation des données simulées');
  sql = null;
}

// DELETE - Supprimer un rendez-vous par ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { reason, deletedBy, deletedAt } = body;
    
    // Si Vercel Postgres n'est pas disponible, simuler la suppression
    if (!sql) {
      console.log(`Simulation de suppression du rendez-vous ${params.id}`);
      console.log(`Raison: ${reason || 'Aucune raison spécifiée'}`);
      console.log(`Supprimé par: ${deletedBy || 'admin'}`);
      
      return NextResponse.json(
        { message: 'Rendez-vous supprimé avec succès (simulation)' },
        { status: 200 }
      );
    }
    
    // D'abord, récupérer les informations du rendez-vous pour les logs
    const meetingResult = await sql`
      SELECT * FROM meetings WHERE id = ${params.id}
    `;
    
    if (meetingResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }
    
    const meeting = meetingResult.rows[0];
    
    // Supprimer le rendez-vous
    await sql`
      DELETE FROM meetings WHERE id = ${params.id}
    `;
    
    // Optionnel : Enregistrer la suppression dans une table de logs
    try {
      await sql`
        INSERT INTO meeting_deletion_logs (
          meeting_id,
          parent_name,
          child_name,
          subject,
          reason,
          deleted_by,
          deleted_at
        ) VALUES (
          ${params.id},
          ${meeting.parent_name},
          ${meeting.child_name},
          ${meeting.subject},
          ${reason || 'Aucune raison spécifiée'},
          ${deletedBy || 'admin'},
          ${deletedAt || new Date().toISOString()}
        )
      `;
    } catch (logError) {
      console.warn('Erreur lors de l\'enregistrement du log de suppression:', logError);
      // Ne pas faire échouer la suppression si le log échoue
    }
    
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

// GET - Récupérer un rendez-vous spécifique par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Si Vercel Postgres n'est pas disponible, retourner un rendez-vous simulé
    if (!sql) {
      const mockMeeting = {
        id: parseInt(params.id),
        parent_id: 'parent1',
        parent_name: 'Marie Dupont',
        parent_email: 'marie.dupont@email.com',
        parent_phone: '06 12 34 56 78',
        child_name: 'Lucas Dupont',
        child_class: '4ème A',
        subject: 'Problèmes de comportement',
        description: 'Mon fils a des difficultés à se concentrer en classe et semble avoir des problèmes avec certains camarades.',
        preferred_date: '2025-12-25',
        preferred_time: '14:00:00',
        duration: 30,
        meeting_type: 'in_person',
        location: 'Bureau du directeur',
        urgency: 'medium',
        status: 'pending',
        admin_notes: null,
        admin_response: null,
        admin_response_date: null,
        admin_id: null,
        admin_name: null,
        created_at: '2025-12-20T10:30:00Z',
        updated_at: '2025-12-20T10:30:00Z'
      };
      return NextResponse.json(mockMeeting);
    }
    
    const result = await sql`
      SELECT * FROM meetings WHERE id = ${params.id}
    `;
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du rendez-vous' },
      { status: 500 }
    );
  }
}
