'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Clock, Mail, CheckCircle, ArrowLeft, RefreshCw, UserCheck } from 'lucide-react';

export default function PendingApprovalPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [isChecking, setIsChecking] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    // Récupérer l'email depuis les paramètres d'URL ou le localStorage
    const emailParam = searchParams.get('email');
    const storedEmail = localStorage.getItem('pendingApprovalEmail');
    
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem('pendingApprovalEmail', emailParam);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // Si aucun email n'est trouvé, rediriger vers la page de connexion
      router.push('/login');
    }

    // Vérifier le statut de l'email au chargement de la page
    if (emailParam || storedEmail) {
      checkEmailStatus(emailParam || storedEmail || '');
    }
  }, [searchParams, router]);

  const checkEmailStatus = async (emailToCheck: string) => {
    if (!emailToCheck) return;

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/auth/check-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToCheck })
      });

      if (response.ok) {
        const data = await response.json();
        setEmailVerified(data.verified);
        
        if (data.verified && data.approved) {
          setMessage('Votre compte a été approuvé ! Vous pouvez maintenant vous connecter.');
          setMessageType('success');
          setTimeout(() => {
            localStorage.removeItem('pendingApprovalEmail');
            router.push('/login');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
    }
  };

  const handleCheckApproval = async () => {
    if (!email) return;

    setIsChecking(true);
    setMessage('');
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/auth/check-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setEmailVerified(data.verified);
        
        if (data.verified && data.approved) {
          setMessage('Votre compte a été approuvé ! Vous pouvez maintenant vous connecter.');
          setMessageType('success');
          setTimeout(() => {
            localStorage.removeItem('pendingApprovalEmail');
            router.push('/login');
          }, 2000);
        } else if (data.verified && !data.approved) {
          setMessage('Votre email a été vérifié mais votre compte n\'est pas encore approuvé par l\'administrateur.');
          setMessageType('info');
        } else {
          setMessage('Votre email n\'est pas encore vérifié. Veuillez vérifier votre email d\'abord.');
          setMessageType('error');
        }
      } else {
        setMessage(data.message || 'Erreur lors de la vérification du statut');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Erreur de connexion. Veuillez réessayer.');
      setMessageType('error');
    } finally {
      setIsChecking(false);
    }
  };

  const handleBackToLogin = () => {
    localStorage.removeItem('pendingApprovalEmail');
    router.push('/login');
  };

  const handleResendVerification = async () => {
    if (!email) return;

    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen-mobile bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 safe-top safe-bottom">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-yellow-300" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">En attente d'approbation</h1>
          <p className="text-blue-200 text-sm">
            Votre compte est en cours de validation
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
              {messageType === 'error' && <Mail className="w-5 h-5 mr-2" />}
              {messageType === 'info' && <Clock className="w-5 h-5 mr-2" />}
              <span className="text-sm">{message}</span>
            </div>
          </div>
        )}

        {/* Status Info */}
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <h3 className="text-white font-semibold mb-2 flex items-center">
            <UserCheck className="w-4 h-4 mr-2" />
            Statut de votre compte
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-200">Email vérifié</span>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-300">✓ Vérifié</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-200">Approbation admin</span>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-yellow-300">⏳ En attente</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <h3 className="text-white font-semibold mb-2 flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Prochaines étapes
          </h3>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Un administrateur va examiner votre compte</li>
            <li>• Vérifiez régulièrement votre statut</li>
            <li>• Contactez l'administrateur si nécessaire</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleCheckApproval}
            disabled={isChecking}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Vérification...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Vérifier mon statut
              </>
            )}
          </button>

          {/* Afficher le bouton "Renvoyer l'email" seulement si l'email n'est pas vérifié */}
          {!emailVerified && (
            <button
              onClick={handleResendVerification}
              disabled={isLoading}
              className="w-full bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center border border-white/20"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Renvoyer l'email de vérification
                </>
              )}
            </button>
          )}

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
            Le processus d'approbation peut prendre quelques heures à quelques jours.
          </p>
        </div>
      </div>
    </div>
  );
}


