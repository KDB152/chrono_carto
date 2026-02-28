import { NextRequest, NextResponse } from 'next/server';

// URL de l'API backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://www.chronocarto.tn';

// PUT - Mettre à jour un utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    console.log(`?? Mise à jour utilisateur ${userId} via backend:`, body);

    // Récupérer le token d'authentification
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || authHeader;

    console.log('?? Token d\'authentification:', token ? 'Présent' : 'Manquant');

    // Appeler l'API backend
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur API backend: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    console.log('? Utilisateur mis à jour via backend:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('? Erreur mise à jour utilisateur:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    console.log(`?? Suppression utilisateur ${userId} via backend`);

    // Appeler l'API backend
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur API backend: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    console.log('? Utilisateur supprimé via backend:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('? Erreur suppression utilisateur:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    );
  }
}