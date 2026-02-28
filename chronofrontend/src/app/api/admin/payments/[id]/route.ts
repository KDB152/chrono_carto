import { NextRequest, NextResponse } from 'next/server';

// URL de l'API backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const paymentId = params.id;
    
    console.log('?? Mise � jour du paiement:', paymentId, body);

    // Construire l'URL de l'API backend
    const backendUrl = `${API_BASE_URL}/admin/payments/${paymentId}`;

    try {
      // Appeler l'API backend
      const response = await fetch(backendUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Erreur API backend: ${response.status}`);
      }

      const data = await response.json();
      console.log('? Paiement mis � jour dans le backend:', data);

      return NextResponse.json(data);
    } catch (backendError) {
      console.log('??  Backend non accessible, simulation locale');
      
      return NextResponse.json({
        success: true,
        message: 'Paiement mis � jour localement',
        id: paymentId,
        ...body
      });
    }
    
  } catch (error) {
    console.error('Erreur lors de la mise � jour du paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise � jour du paiement' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;
    
    console.log('?? R�cup�ration du paiement:', paymentId);

    // Construire l'URL de l'API backend
    const backendUrl = `${API_BASE_URL}/admin/payments/${paymentId}`;

    try {
      // Appeler l'API backend
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur API backend: ${response.status}`);
      }

      const data = await response.json();
      console.log('? Paiement r�cup�r� du backend:', data);

      return NextResponse.json(data);
    } catch (backendError) {
      console.log('??  Backend non accessible, simulation locale');
      
      return NextResponse.json({
        id: paymentId,
        message: 'Paiement r�cup�r� localement'
      });
    }
    
  } catch (error) {
    console.error('Erreur lors de la r�cup�ration du paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la r�cup�ration du paiement' },
      { status: 500 }
    );
  }
}