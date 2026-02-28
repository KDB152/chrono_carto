'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setMessage('Token de vérification manquant');
      setIsLoading(false);
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Email vérifié avec succès !');
        setIsSuccess(true);
        setEmail(data.email || '');
      } else {
        setMessage(data.message || 'Erreur lors de la vérification de l\'email');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Erreur de connexion. Veuillez réessayer.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen-mobile bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 safe-top safe-bottom">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-md w-full p-8 text-center">
        {isLoading ? (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-300 animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Vérification en cours...</h1>
              <p className="text-blue-200 text-sm">
                Veuillez patienter pendant que nous vérifions votre email.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
              isSuccess ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {isSuccess ? (
                <CheckCircle className="w-8 h-8 text-green-300" />
              ) : (
                <XCircle className="w-8 h-8 text-red-300" />
              )}
            </div>
            
            <div>
              <h1 className={`text-2xl font-bold mb-2 ${
                isSuccess ? 'text-white' : 'text-red-300'
              }`}>
                {isSuccess ? 'Email vérifié !' : 'Erreur de vérification'}
              </h1>
              <p className="text-blue-200 text-sm mb-4">
                {message}
              </p>
              {email && (
                <p className="text-white font-semibold text-sm">
                  {email}
                </p>
              )}
            </div>

            {isSuccess && (
              <div className="p-4 bg-green-500/20 rounded-xl border border-green-500/40">
                <p className="text-green-300 text-sm">
                  Votre email a été vérifié avec succès. Vous pouvez maintenant vous connecter.
                </p>
              </div>
            )}

            <button
              onClick={handleGoToLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Aller à la connexion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


