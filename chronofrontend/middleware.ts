import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	const url = request.nextUrl;

	// Intercepter /reset-password quand un token est présent dans l'URL
	if (url.pathname === '/reset-password') {
		const token = url.searchParams.get('t') || url.searchParams.get('token');

		if (token) {
			// Définir un cookie temporaire lisible par le client pour transférer le token
			const response = NextResponse.redirect(new URL('/reset-password', request.url));
			response.cookies.set('reset_token', token, {
				path: '/',
				maxAge: 60 * 5, // 5 minutes
				httpOnly: false, // doit être lisible côté client pour remplir le formulaire
				secure: true,
				sameSite: 'lax',
			});
			return response;
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/reset-password'],
};

