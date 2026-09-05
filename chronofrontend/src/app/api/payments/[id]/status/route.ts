import { NextRequest, NextResponse } from 'next/server';
import urlapi from '@/config/url'


export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const paymentId = params.id;
    
    // R�cup�rer le token JWT
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token manquant' }, { status: 401 });
    }

    const url = `${urlapi.backendurlsapi.payment}/${paymentId}${urlapi.backendurlsapi.paymentstatus}`;
    console.log('?? Calling backend:', url, body);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('? Backend error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log('? Backend response:', data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('? API route error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur', error: error.message },
      { status: 500 }
    );
  }
}
