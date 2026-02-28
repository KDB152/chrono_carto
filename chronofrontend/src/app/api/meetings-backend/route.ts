import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');

    // Simuler les données de meetings
    const mockMeetings = [
      {
        id: 1,
        parent_id: 1,
        parent_name: 'Marie Dupont',
        parent_email: 'marie.dupont@email.com',
        parent_phone: '06 12 34 56 78',
        child_name: 'Lucas Dupont',
        child_class: '4ème A',
        meeting_date: '2024-01-25T14:00:00Z',
        duration: 60,
        type: 'parent_teacher',
        subject: 'Progrès en mathématiques',
        notes: 'Discussion sur les difficultés en algèbre et propositions d\'amélioration',
        status: 'completed',
        created_at: '2024-01-20T10:00:00Z',
        updated_at: '2024-01-25T15:00:00Z'
      },
      {
        id: 2,
        parent_id: 1,
        parent_name: 'Marie Dupont',
        parent_email: 'marie.dupont@email.com',
        parent_phone: '06 12 34 56 78',
        child_name: 'Emma Dupont',
        child_class: '6ème B',
        meeting_date: '2024-01-28T16:30:00Z',
        duration: 45,
        type: 'academic_review',
        subject: 'Bilan trimestriel',
        notes: 'Évaluation des performances et recommandations',
        status: 'scheduled',
        created_at: '2024-01-22T14:30:00Z',
        updated_at: '2024-01-22T14:30:00Z'
      },
      {
        id: 3,
        parent_id: 2,
        parent_name: 'Pierre Martin',
        parent_email: 'pierre.martin@email.com',
        parent_phone: '06 98 76 54 32',
        child_name: 'Alex Martin',
        child_class: '5ème C',
        meeting_date: '2024-01-30T10:00:00Z',
        duration: 30,
        type: 'orientation',
        subject: 'Orientation future',
        notes: 'Discussion sur les choix d\'orientation',
        status: 'pending',
        created_at: '2024-01-23T09:15:00Z',
        updated_at: '2024-01-23T09:15:00Z'
      }
    ];

    // Filtrer par parentId si fourni
    let filteredMeetings = mockMeetings;
    if (parentId) {
      filteredMeetings = mockMeetings.filter(meeting => meeting.parent_id === parseInt(parentId));
    }

    const response = {
      meetings: filteredMeetings,
      total: filteredMeetings.length,
      summary: {
        completed: filteredMeetings.filter(m => m.status === 'completed').length,
        scheduled: filteredMeetings.filter(m => m.status === 'scheduled').length,
        pending: filteredMeetings.filter(m => m.status === 'pending').length
      }
    };

    console.log('✅ Données de meetings simulées retournées:', response.total, 'meetings');
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Erreur API meetings backend:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des meetings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simuler la création d'un meeting
    const newMeeting = {
      id: Date.now(),
      parent_id: body.parent_id || 1,
      parent_name: body.parent_name || 'Parent Test',
      parent_email: body.parent_email || 'parent@test.com',
      parent_phone: body.parent_phone || '06 00 00 00 00',
      child_name: body.child_name || 'Enfant Test',
      child_class: body.child_class || 'Classe Test',
      meeting_date: body.meeting_date || new Date().toISOString(),
      duration: body.duration || 60,
      type: body.type || 'general',
      subject: body.subject || 'Meeting de test',
      notes: body.notes || 'Notes de test',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('✅ Meeting créé (simulation):', newMeeting.id);
    
    return NextResponse.json({
      success: true,
      message: 'Meeting créé avec succès',
      data: newMeeting
    });
  } catch (error) {
    console.error('❌ Erreur création meeting:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du meeting' },
      { status: 500 }
    );
  }
}
