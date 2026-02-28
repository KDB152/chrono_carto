import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const subject = searchParams.get('subject');

    let url = `${BACKEND_URL}/study-sessions`;
    if (date || subject) {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (subject) params.append('subject', subject);
      url += `?${params.toString()}`;
    }

    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    const response = await fetch(url, {
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {})
      }
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors du chargement des séances:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des séances' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    const response = await fetch(`${BACKEND_URL}/study-sessions`, {
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
