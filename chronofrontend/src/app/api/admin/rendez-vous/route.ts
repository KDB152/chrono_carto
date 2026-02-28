import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(request: NextRequest) {
  try {
    console.log('?? GET /api/admin/rendez-vous appel�');
    
    // R�cup�rer le token d'authentification
    let authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      const cookies = request.headers.get('cookie');
      if (cookies) {
        const tokenMatch = cookies.match(/token=([^;]+)/);
        if (tokenMatch) {
          authHeader = `Bearer ${tokenMatch[1]}`;
        }
      }
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    
    const backendUrl = `${API_BASE}/admin/rendez-vous${status ? `?status=${status}` : ''}`;
    console.log('?? Calling backend URL:', backendUrl);
    console.log('?? Auth header:', authHeader ? 'Present' : 'Missing');

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('? Rendez-vous received from backend:', data);
      return NextResponse.json(data);
    } else {
      console.error('?? Backend error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch rendez-vous from backend: ${response.statusText}` },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('? Error fetching rendez-vous:', error);
    return NextResponse.json(
      { error: 'Failed to load rendez-vous. Please try again.' },
      { status: 500 }
    );
  }
}
