import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL!;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const childId = params.id;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    // R�cup�rer les s�ances d'�tude pour l'enfant
    let studySessionsUrl = `${BACKEND_URL}/study-sessions`;
    const studySessionsParams = new URLSearchParams();
    
    if (date) {
      studySessionsParams.append('date', date);
    }
    
    if (studySessionsParams.toString()) {
      studySessionsUrl += `?${studySessionsParams.toString()}`;
    }
    
    const studySessionsResponse = await fetch(studySessionsUrl);
    const studySessionsData = await studySessionsResponse.json();
    
    if (!studySessionsResponse.ok) {
      console.error('Erreur lors du chargement des s�ances d\'�tude:', studySessionsData);
    }
    
    // R�cup�rer les informations de l'enfant pour filtrer par classe
    const childResponse = await fetch(`${BACKEND_URL}/students/${childId}`);
    const childData = await childResponse.json();
    
    if (!childResponse.ok) {
      return NextResponse.json(
        { error: 'Enfant non trouv�' },
        { status: 404 }
      );
    }
    
    // Filtrer les s�ances d'�tude pour la classe de l'enfant
    const filteredSessions = Array.isArray(studySessionsData) 
      ? studySessionsData.filter((session: any) => {
          // Si la s�ance n'a pas de classe cible, la montrer � tous
          if (!session.target_class) return true;
          // Sinon, ne la montrer que si elle correspond � la classe de l'enfant
          return session.target_class === childData.class_level;
        })
      : [];
    
    // Pour l'instant, on retourne seulement les s�ances d'�tude
    // Plus tard, on pourra ajouter d'autres types d'�v�nements (examens, sorties, etc.)
    const calendarData = {
      child: {
        id: childData.id,
        firstName: childData.user?.first_name || childData.first_name,
        lastName: childData.user?.last_name || childData.last_name,
        class: childData.class_level,
        level: childData.level
      },
      studySessions: filteredSessions,
      events: [], // � impl�menter plus tard
      date: date,
      month: month,
      year: year
    };
    
    return NextResponse.json(calendarData);
    
  } catch (error) {
    console.error('Erreur lors du chargement du calendrier de l\'enfant:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement du calendrier' },
      { status: 500 }
    );
  }
}
