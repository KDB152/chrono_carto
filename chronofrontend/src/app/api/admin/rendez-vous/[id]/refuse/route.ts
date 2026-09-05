import { NextRequest, NextResponse } from 'next/server';
import urlapi from '@/config/url'
const API_BASE = urlapi.apibase!;

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

    const backendUrl = `${API_BASE}${urlapi.backendurlsapi.rendezvous}/${params.id}${urlapi.backendurlsapi.refuse}`;
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
