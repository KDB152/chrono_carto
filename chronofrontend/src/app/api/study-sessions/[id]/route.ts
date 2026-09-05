import { NextRequest, NextResponse } from 'next/server';
import urlapi from '@/config/url'


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    const response = await fetch(`${urlapi.backendurlsapi.studysessions}/${params.id}`, {
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
    console.error('Erreur lors du chargement de la séance:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement de la séance' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    const response = await fetch(`${urlapi.backendurlsapi.studysessions}/${params.id}`, {
      method: 'PATCH',
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
    console.error('Erreur lors de la mise à jour de la séance:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la séance' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    const response = await fetch(`${urlapi.backendurlsapi.studysessions}/${params.id}`, {
      method: 'DELETE',
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {})
      }
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la séance:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la séance' },
      { status: 500 }
    );
  }
}
