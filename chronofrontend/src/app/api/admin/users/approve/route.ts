import { NextRequest, NextResponse } from 'next/server';

// URL de l'API backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://www.chronocarto.tn/api';

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const body = await request.json();
    const { approve } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    console.log(`Ì†ΩÌ¥Ñ Appel API backend pour approbation utilisateur ${userId}:`, approve);
    console.log(`Ì†ºÌºê URL backend: ${API_BASE_URL}/admin/users/${userId}/approve`);

    // R√©cup√©rer le token d'authentification depuis les headers
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || authHeader;

    console.log('Ì†ΩÌ¥ë Token d\'authentification:', token ? 'Pr√©sent' : 'Manquant');
    console.log('Ì†ΩÌ¥ë Headers re√ßus:', Object.fromEntries(request.headers.entries()));

    // Appeler l'API backend
    const backendUrl = `${API_BASE_URL}/admin/users/${userId}/approve`;
    console.log(`Ì†ºÌºê Appel vers: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ approve }),
    });

    console.log(`Ì†ΩÌ≥° R√©ponse backend: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur API backend: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    console.log('‚úÖ Utilisateur approuv√© via backend:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('‚ùå Erreur approbation utilisateur:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de l\'approbation de l\'utilisateur' },
      { status: 500 }
    );
  }
}
