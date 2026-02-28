'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Récupérer l'email depuis les paramètres d'URL ou le localStorage
    const emailParam = searchParams.get('email');
    const statusParam = searchParams.get('status');
    const storedEmail = localStorage.getItem('pendingVerificationEmail');
    
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem('pendingVerificationEmail', emailParam);
      
      // Gérer le statut spécial
      if (statusParam === 'pending') {
        setMessage('Votre email a été vérifié mais votre compte est en attente d\'approbation par l\'administrateur.');
        setMessageType('info');
      }
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // Si aucun email n'est trouvé, rediriger vers la page de connexion
      router.push('/login');
    }
  }, [searchParams, router]);

  const handleResendVerification = async () => {
    if (!email) return;

    setIsResending(true);
    setMessage('');
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Email de vérification renvoyé avec succès ! Vérifiez votre boîte de réception.');
        setMessageType('success');
      } else {
        setMessage(data.message || 'Erreur lors du renvoi de l\'email de vérification.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Erreur de connexion. Veuillez réessayer.');
      setMessageType('error');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    localStorage.removeItem('pendingVerificationEmail');
    router.push('/login');
  };

  const handleCheckVerification = async () => {
    if (!email) return;

    setIsLoading(true);
    setMessage('');
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/auth/check-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.verified && data.approved) {
        setMessage('Votre email a été vérifié et votre compte approuvé ! Vous pouvez maintenant vous connecter.');
        setMessageType('success');
        setTimeout(() => {
          localStorage.removeItem('pendingVerificationEmail');
          router.push('/login');
        }, 2000);
      } else if (response.ok && data.verified && !data.approved) {
        setMessage('Votre email a été vérifié mais votre compte n\'est pas encore approuvé par l\'administrateur.');
        setMessageType('info');
      } else {
        setMessage('Votre email n\'est pas encore vérifié. Veuillez cliquer sur le lien dans votre email.');
        setMessageType('info');
      }
    } catch (error) {
      setMessage('Erreur de connexion. Veuillez réessayer.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen-mobile bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 safe-top safe-bottom">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-300" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Vérification d'email</h1>
          <p className="text-blue-200 text-sm">
            Nous avons envoyé un lien de vérification à
          </p>
          <p className="text-white font-semibold mt-1">{email}</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            messageType === 'success' 
              ? 'bg-green-500/20 border-green-500/40 text-green-300' 
              : messageType === 'error'
              ? 'bg-red-500/20 border-red-500/40 text-red-300'
              : 'bg-blue-500/20 border-blue-500/40 text-blue-300'
          }`}>
            <div className="flex items-center">
              {messageType === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
              {messageType === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
              {messageType === 'info' && <Mail className="w-5 h-5 mr-2" />}
              <span className="text-sm">{message}</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <h3 className="text-white font-semibold mb-2 flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Instructions
          </h3>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Vérifiez votre boîte de réception</li>
            <li>• Cliquez sur le lien de vérification</li>
            <li>• Attendez l'approbation de l'administrateur</li>
            <li>• Revenez ici pour vérifier votre statut</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleCheckVerification}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Vérification...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Vérifier mon statut
              </>
            )}
          </button>

          <button
            onClick={handleResendVerification}
            disabled={isResending}
            className="w-full bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center border border-white/20"
          >
            {isResending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Renvoyer l'email
              </>
            )}
          </button>

          <button
            onClick={handleBackToLogin}
            className="w-full bg-transparent hover:bg-white/10 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center border border-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la connexion
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-blue-300 text-xs">
            Si vous ne recevez pas l'email, vérifiez votre dossier spam ou contactez l'administrateur.
          </p>
        </div>
      </div>
    </div>
  );
}


