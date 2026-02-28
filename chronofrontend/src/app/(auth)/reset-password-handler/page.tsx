'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Page intermédiaire qui capture le token et redirige vers la page principale
export default function ResetPasswordHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = searchParams.get('t');
    
    if (token) {
      // Stocker le token en sessionStorage (sécurisé car non persistant)
      sessionStorage.setItem('reset_token', token);
      
      // Rediriger vers la page de réinitialisation sans le token dans l'URL
      router.replace('/reset-password');
    } else {
      setError(true);
    }
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen-mobile flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 safe-top safe-bottom">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl max-w-md text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Lien invalide</h3>
          <p className="text-white/80 mb-6">
            Ce lien de réinitialisation est invalide.
          </p>
          <a 
            href="/forgot-password" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Demander un nouveau lien
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="text-white text-xl">Redirection en cours...</div>
    </div>
  );
}