import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL!;

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/students`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors du chargement des �tudiants:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des �tudiants' },
      { status: 500 }
    );
  }
}
