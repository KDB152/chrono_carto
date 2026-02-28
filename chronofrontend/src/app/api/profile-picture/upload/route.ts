import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'API upload photo de profil - Utilisez POST pour uploader',
    methods: ['POST'],
    endpoint: '/api/profile-picture/upload'
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('profilePicture') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Simuler l'upload de la photo de profil
    const mockResponse = {
      success: true,
      message: 'Photo de profil uploadée avec succès',
      data: {
        id: Date.now(),
        fileName: file.name,
        fileType: file.type.split('/')[1].toUpperCase(),
        fileSize: file.size,
        url: `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}`
      }
    };

    console.log('✅ Photo de profil simulée uploadée:', mockResponse.data.fileName);
    
    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('❌ Erreur upload photo de profil:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload de la photo de profil' },
      { status: 500 }
    );
  }
}
