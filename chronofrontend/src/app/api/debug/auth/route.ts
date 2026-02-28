import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || authHeader;
    
    console.log('?? Debug Auth - Headers reçus:', Object.fromEntries(request.headers.entries()));
    console.log('?? Debug Auth - Token extrait:', token ? 'Présent' : 'Manquant');
    
    return NextResponse.json({
      success: true,
      hasToken: !!token,
      tokenLength: token?.length || 0,
      headers: Object.fromEntries(request.headers.entries())
    });
  } catch (error) {
    console.error('? Erreur debug auth:', error);
    return NextResponse.json(
      { error: 'Erreur lors du debug auth' },
      { status: 500 }
    );
  }
}
