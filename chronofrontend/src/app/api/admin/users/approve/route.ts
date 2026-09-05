import { NextRequest, NextResponse } from 'next/server';
import urlapi from '@/config/url'
// URL de l'API backend


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

    console.log(`������ Appel API backend pour approbation utilisateur ${userId}:`, approve);
    console.log(`������ URL backend: ${urlapi.backendurlsapi.adminusers}/${userId}${urlapi.backendurlsapi.aprove}`);

    // Récupérer le token d'authentification depuis les headers
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || authHeader;

    console.log('������ Token d\'authentification:', token ? 'Présent' : 'Manquant');
    console.log('������ Headers reçus:', Object.fromEntries(request.headers.entries()));

    // Appeler l'API backend
    const backendUrl = `${urlapi.backendurlsapi.adminusers}/${userId}${urlapi.backendurlsapi.aprove}`;
    console.log(` Appel vers: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ approve }),
    });

    console.log(`������ Réponse backend: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur API backend: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    console.log('✅ Utilisateur approuvé via backend:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Erreur approbation utilisateur:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de l\'approbation de l\'utilisateur' },
      { status: 500 }
    );
  }
}
