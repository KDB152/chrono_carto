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

// Interface pour un rendez-vous
interface MeetingRequest {
  id?: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childName: string;
  childClass: string;
  subject: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
  duration: number;
  meetingType: 'in_person' | 'video_call' | 'phone_call';
  location?: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  adminNotes?: string;
  adminResponse?: string;
  adminResponseDate?: string;
  adminId?: string;
  adminName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// GET - Récupérer tous les rendez-vous
export async function GET() {
  try {
    // Si Vercel Postgres n'est pas disponible, retourner des données simulées
    if (!sql) {
      const mockMeetings = [
        {
          id: 1,
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
        },
        {
          id: 2,
          parent_id: 'parent2',
          parent_name: 'Jean Martin',
          parent_email: 'jean.martin@email.com',
          parent_phone: '06 98 76 54 32',
          child_name: 'Emma Martin',
          child_class: '6ème B',
          subject: 'Suivi scolaire',
          description: 'Je souhaite faire le point sur les progrès de ma fille et discuter de ses résultats récents.',
          preferred_date: '2025-12-26',
          preferred_time: '16:00:00',
          duration: 45,
          meeting_type: 'video_call',
          location: null,
          urgency: 'low',
          status: 'pending',
          admin_notes: null,
          admin_response: null,
          admin_response_date: null,
          admin_id: null,
          admin_name: null,
          created_at: '2025-12-20T11:00:00Z',
          updated_at: '2025-12-20T11:00:00Z'
        }
      ];
      return NextResponse.json(mockMeetings);
    }

    const result = await sql`
      SELECT * FROM meetings 
      ORDER BY created_at DESC
    `;
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des rendez-vous' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau rendez-vous
export async function POST(request: NextRequest) {
  try {
    const body: MeetingRequest = await request.json();
    
    // Si Vercel Postgres n'est pas disponible, simuler la création
    if (!sql) {
      const newMeeting = {
        id: Date.now(), // ID temporaire
        parent_id: body.parentId,
        parent_name: body.parentName,
        parent_email: body.parentEmail,
        parent_phone: body.parentPhone,
        child_name: body.childName,
        child_class: body.childClass,
        subject: body.subject,
        description: body.description,
        preferred_date: body.preferredDate,
        preferred_time: body.preferredTime,
        duration: body.duration,
        meeting_type: body.meetingType,
        location: body.location || null,
        urgency: body.urgency,
        status: body.status || 'pending',
        admin_notes: body.adminNotes || null,
        admin_response: body.adminResponse || null,
        admin_response_date: body.adminResponseDate || null,
        admin_id: body.adminId || null,
        admin_name: body.adminName || null,
        created_at: body.createdAt || new Date().toISOString(),
        updated_at: body.updatedAt || new Date().toISOString()
      };
      return NextResponse.json(newMeeting, { status: 201 });
    }
    
    const result = await sql`
      INSERT INTO meetings (
        parent_id,
        parent_name,
        parent_email,
        parent_phone,
        child_name,
        child_class,
        subject,
        description,
        preferred_date,
        preferred_time,
        duration,
        meeting_type,
        location,
        urgency,
        status,
        admin_notes,
        admin_response,
        admin_response_date,
        admin_id,
        admin_name,
        created_at,
        updated_at
      ) VALUES (
        ${body.parentId},
        ${body.parentName},
        ${body.parentEmail},
        ${body.parentPhone},
        ${body.childName},
        ${body.childClass},
        ${body.subject},
        ${body.description},
        ${body.preferredDate},
        ${body.preferredTime},
        ${body.duration},
        ${body.meetingType},
        ${body.location || null},
        ${body.urgency},
        ${body.status || 'pending'},
        ${body.adminNotes || null},
        ${body.adminResponse || null},
        ${body.adminResponseDate || null},
        ${body.adminId || null},
        ${body.adminName || null},
        ${body.createdAt || new Date().toISOString()},
        ${body.updatedAt || new Date().toISOString()}
      ) RETURNING *
    `;
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du rendez-vous' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un rendez-vous existant
export async function PUT(request: NextRequest) {
  try {
    const body: MeetingRequest = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'ID du rendez-vous requis' },
        { status: 400 }
      );
    }
    
    // Si Vercel Postgres n'est pas disponible, simuler la mise à jour
    if (!sql) {
      const updatedMeeting = {
        id: body.id,
        parent_id: body.parentId,
        parent_name: body.parentName,
        parent_email: body.parentEmail,
        parent_phone: body.parentPhone,
        child_name: body.childName,
        child_class: body.childClass,
        subject: body.subject,
        description: body.description,
        preferred_date: body.preferredDate,
        preferred_time: body.preferredTime,
        duration: body.duration,
        meeting_type: body.meetingType,
        location: body.location || null,
        urgency: body.urgency,
        status: body.status,
        admin_notes: body.adminNotes || null,
        admin_response: body.adminResponse || null,
        admin_response_date: body.adminResponseDate || null,
        admin_id: body.adminId || null,
        admin_name: body.adminName || null,
        created_at: body.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return NextResponse.json(updatedMeeting);
    }
    
    const result = await sql`
      UPDATE meetings SET
        parent_id = ${body.parentId},
        parent_name = ${body.parentName},
        parent_email = ${body.parentEmail},
        parent_phone = ${body.parentPhone},
        child_name = ${body.childName},
        child_class = ${body.childClass},
        subject = ${body.subject},
        description = ${body.description},
        preferred_date = ${body.preferredDate},
        preferred_time = ${body.preferredTime},
        duration = ${body.duration},
        meeting_type = ${body.meetingType},
        location = ${body.location || null},
        urgency = ${body.urgency},
        status = ${body.status},
        admin_notes = ${body.adminNotes || null},
        admin_response = ${body.adminResponse || null},
        admin_response_date = ${body.adminResponseDate || null},
        admin_id = ${body.adminId || null},
        admin_name = ${body.adminName || null},
        updated_at = ${new Date().toISOString()}
      WHERE id = ${body.id}
      RETURNING *
    `;
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du rendez-vous' },
      { status: 500 }
    );
  }
}

