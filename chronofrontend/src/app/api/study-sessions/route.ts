import { NextRequest, NextResponse } from 'next/server';
import urlapi from '@/config/url';

function generateDefaultSessions() {
  const startDate = new Date('2026-09-07');
  const endDate = new Date('2027-08-31');

  const defaultSchedules = [
    {
      target_class: 'Terminale groupe 1 (Lundi 18:30-20:30)',
      title: 'Histoire - Terminale groupe 1 (Lundi 18:30-20:30)',
      subject: 'Histoire',
      dayOfWeek: 1, // Lundi
      start_time: '18:30:00',
      end_time: '20:30:00',
    },
    {
      target_class: 'Terminale groupe 2 (Vendredi 16:30-18:30)',
      title: 'Histoire - Terminale groupe 2 (Vendredi 16:30-18:30)',
      subject: 'Histoire',
      dayOfWeek: 5, // Vendredi
      start_time: '16:30:00',
      end_time: '18:30:00',
    },
    {
      target_class: 'terminale groupe 3 (Vendredi 18:30-20:30)',
      title: 'Histoire - terminale groupe 3 (Vendredi 18:30-20:30)',
      subject: 'Histoire',
      dayOfWeek: 5, // Vendredi
      start_time: '18:30:00',
      end_time: '20:30:00',
    },
    {
      target_class: 'Terminale groupe 4 (Dimanche 8:00-10:00)',
      title: 'Histoire - Terminale groupe 4 (Dimanche 8:00-10:00)',
      subject: 'Histoire',
      dayOfWeek: 0, // Dimanche
      start_time: '08:00:00',
      end_time: '10:00:00',
    },
    {
      target_class: '1ere groupe 1 (Jeudi 18:30-20:30)',
      title: 'Histoire - 1ere groupe 1 (Jeudi 18:30-20:30)',
      subject: 'Histoire',
      dayOfWeek: 4, // Jeudi
      start_time: '18:30:00',
      end_time: '20:30:00',
    },
    {
      target_class: '1ere groupe 2 (Vendredi 14:00-16:00)',
      title: 'Histoire - 1ere groupe 2 (Vendredi 14:00-16:00)',
      subject: 'Histoire',
      dayOfWeek: 5, // Vendredi
      start_time: '14:00:00',
      end_time: '16:00:00',
    },
    {
      target_class: '1ere groupe 3 (Dimanche 10:00-12:00)',
      title: 'Histoire - 1ere groupe 3 (Dimanche 10:00-12:00)',
      subject: 'Histoire',
      dayOfWeek: 0, // Dimanche
      start_time: '10:00:00',
      end_time: '12:00:00',
    },
  ];

  const sessions = [];
  let id = 1;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    const dateStr = d.toISOString().split('T')[0];

    for (const sched of defaultSchedules) {
      if (sched.dayOfWeek === day) {
        sessions.push({
          id: id++,
          title: sched.title,
          description: `Séance hebdomadaire d'Histoire pour ${sched.target_class}`,
          date: dateStr,
          start_time: sched.start_time,
          end_time: sched.end_time,
          subject: sched.subject,
          target_class: sched.target_class,
          location: 'Salle de classe',
          max_students: 30,
          current_students: 0,
          created_by: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
  }

  return sessions;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const subject = searchParams.get('subject');

    let url = `${urlapi.backendurlsapi.studysessions}`;
    if (date || subject) {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (subject) params.append('subject', subject);
      url += `?${params.toString()}`;
    }

    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    try {
      const response = await fetch(url, {
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {})
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return NextResponse.json(data);
        }
      }
    } catch (e) {
      console.warn('Backend fetch failed, falling back to default sessions:', e);
    }

    let defaultSessions = generateDefaultSessions();
    if (date) {
      defaultSessions = defaultSessions.filter(s => s.date === date);
    }
    if (subject) {
      defaultSessions = defaultSessions.filter(s => s.subject.toLowerCase().includes(subject.toLowerCase()));
    }

    return NextResponse.json(defaultSessions);
  } catch (error) {
    console.error('Erreur lors du chargement des séances:', error);
    return NextResponse.json(generateDefaultSessions());
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    const response = await fetch(`${urlapi.backendurlsapi.studysessions}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {})
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la création de la séance:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la séance' },
      { status: 500 }
    );
  }
}
