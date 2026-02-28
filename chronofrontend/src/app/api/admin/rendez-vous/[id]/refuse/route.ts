import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('?? PATCH /api/admin/rendez-vous/[id]/refuse appel� pour ID:', params.id);
    
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

    const body = await request.json();
    console.log('?? Request body:', body);

    const backendUrl = `${API_BASE}/admin/rendez-vous/${params.id}/refuse`;
    console.log('?? Calling backend URL:', backendUrl);
    console.log('?? Auth header:', authHeader ? 'Present' : 'Missing');

    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('? Rendez-vous refused successfully:', data);
      return NextResponse.json(data);
    } else {
      console.error('?? Backend error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to refuse rendez-vous: ${response.statusText}` },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('? Error refusing rendez-vous:', error);
    return NextResponse.json(
      { error: 'Failed to refuse rendez-vous. Please try again.' },
      { status: 500 }
    );
  }
}
