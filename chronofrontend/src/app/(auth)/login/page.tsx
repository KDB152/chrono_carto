'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, LogIn, Globe, MapPin, Clock, BookOpen, Eye, EyeOff, ArrowRight, Shield, Zap, Users, CheckCircle } from 'lucide-react';

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const quotes = [
    { text: "L'éducation est l'arme la plus puissante qu'on puisse utiliser pour changer le monde", author: "Nelson Mandela" },
    { text: "Celui qui ne connaît pas l'histoire est condamné à la répéter", author: "George Santayana" },
    { text: "La géographie, c'est ce qui reste quand on a tout oublié", author: "Paul Vidal de La Blache" }
  ];

  const features = [
    { icon: Globe, title: "Quiz Interactifs", description: "Testez vos connaissances" },
    { icon: Users, title: "Messagerie", description: "Échangez avec vos enseignants" },
    { icon: Shield, title: "Sécurité RGPD", description: "Données protégées" }
  ];

  useEffect(() => {
    setIsVisible(true);
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);

    // Gérer les paramètres d'URL pour les messages de vérification
    const verified = searchParams.get('verified');
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (verified === 'true') {
      setSuccessMessage('Votre email a été vérifié avec succès ! Vous pouvez maintenant vous connecter.');
    } else if (error === 'verification_failed') {
      setErrorMessage(decodeURIComponent(message || 'Erreur lors de la vérification de l\'email'));
    } else if (error === 'no_token') {
      setErrorMessage('Token de vérification manquant');
    }

    // Nettoyer les paramètres d'URL sensibles après traitement
    const url = new URL(window.location.href);
    const sensitiveParams = ['email', 'password', 'token'];
    let hasSensitiveParams = false;
    
    sensitiveParams.forEach(param => {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
        hasSensitiveParams = true;
      }
    });
    
    // Rediriger vers une URL propre si des paramètres sensibles étaient présents
    if (hasSensitiveParams) {
      window.history.replaceState({}, '', url.pathname + url.search);
    }

    return () => clearInterval(quoteInterval);
  }, [quotes.length, searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrorMessage(null); // Clear error message on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null); // Clear previous error message

    // Nettoyer l'URL avant la soumission pour éviter les fuites de données
    const currentUrl = new URL(window.location.href);
    const sensitiveParams = ['email', 'password', 'token'];
    let hasSensitiveParams = false;
    
    sensitiveParams.forEach(param => {
      if (currentUrl.searchParams.has(param)) {
        currentUrl.searchParams.delete(param);
        hasSensitiveParams = true;
      }
    });
    
    if (hasSensitiveParams) {
      window.history.replaceState({}, '', currentUrl.pathname + currentUrl.search);
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        
        // Vérifier si l'utilisateur n'a pas vérifié son email
        if (errorData.message === 'EMAIL_NOT_VERIFIED') {
          // Rediriger vers la page de vérification d'email
          localStorage.setItem('pendingVerificationEmail', formData.email);
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
          return;
        }
        
        // Vérifier si l'utilisateur n'est pas approuvé (mais email vérifié)
        if (errorData.message === 'ACCOUNT_NOT_APPROVED') {
          // Rediriger vers la page d'attente d'approbation
          localStorage.setItem('pendingApprovalEmail', formData.email);
          router.push(`/pending-approval?email=${encodeURIComponent(formData.email)}`);
          return;
        }
        
        setErrorMessage(errorData.message || 'Email ou mot de passe sont incorrects');
        setIsLoading(false);
        return;
      }

      const data = await res.json();

      // Stockage du JWT et de l'utilisateur pour le dashboard
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('token', data.accessToken); // Compatibilité
      localStorage.setItem('userDetails', JSON.stringify(data.user));

      // Redirection selon rôle
      switch (data.user.role) {
        case 'admin':
          router.push('/dashboard/admin');
          break;
        case 'student':
          router.push('/dashboard/student');
          break;
        case 'parent':
          router.push('/dashboard/parent');
          break;
        default:
          setErrorMessage('Rôle utilisateur inconnu. Contactez l\'administrateur.');
          console.log('Rôle inconnu :', data.user.role);
      }
    } catch (err) {
      console.error('Erreur fetch :', err);
      setErrorMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen-mobile relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 safe-top safe-bottom">
      {/* Fond animé et éléments historiques améliorés */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-yellow-300/20 rounded-full animate-pulse blur-xl"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-emerald-200/20 to-green-300/20 rounded-full animate-bounce blur-lg"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-gradient-to-br from-purple-200/20 to-violet-300/20 rounded-full animate-ping blur-lg"></div>
        <div className="absolute top-3/4 right-1/3 w-16 h-16 bg-gradient-to-br from-blue-200/20 to-cyan-300/20 rounded-full animate-pulse blur-md"></div>

        <div className="absolute top-20 right-20 opacity-10">
          <Globe className="w-40 h-40 text-white animate-spin" style={{ animationDuration: '20s' }} />
        </div>
        <div className="absolute bottom-20 left-20 opacity-10">
          <MapPin className="w-32 h-32 text-white animate-pulse" />
        </div>
        <div className="absolute top-1/2 left-10 opacity-10">
          <Image src="/images/chrono_carto_logo.png" alt="Chrono-Carto" width={96} height={96} className="animate-bounce" style={{ animationDelay: '1s' }} />
        </div>

        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex min-h-screen">
        {/* Panneau gauche - contenu informatif */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-6 lg:px-12 py-6 lg:py-12">
          <div className={`animate-fade-in-up ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <Image src="/images/chrono_carto_logo.png" alt="Chrono-Carto Logo" width={160} height={160} className="mr-6" priority />
                <div>
                  <h1 className="text-3xl font-bold text-white">Chrono-Carto</h1>
                  <p className="text-white/60">Plateforme éducative nouvelle génération</p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Revenez à votre
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"> apprentissage</span>
              </h2>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Accédez à vos cours, quiz et ressources pédagogiques personnalisées
              </p>
            </div>

            {/* Quote Section */}
            <div className="mb-12">
              <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="text-white/90 text-lg italic mb-3 transition-all duration-500">
                  "{quotes[currentQuote].text}"
                </div>
                <div className="text-amber-300 font-medium">
                  — {quotes[currentQuote].author}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400/30 to-orange-400/30 rounded-xl flex items-center justify-center mr-4">
                    <feature.icon className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{feature.title}</h3>
                    <p className="text-white/60 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Statistiques */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-300 mb-1">100%</div>
                <div className="text-white/60 text-sm">Gratuit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-300 mb-1">3</div>
                <div className="text-white/60 text-sm">Matières</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-300 mb-1">24/7</div>
                <div className="text-white/60 text-sm">Disponible</div>
              </div>
            </div>
          </div>
        </div>

        {/* Panneau droit - formulaire */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-12 lg:px-8">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <Image src="/images/chrono_carto_logo.png" alt="Chrono-Carto Logo" width={160} height={160} priority />
              </div>
              <h2 className="text-4xl font-bold text-white mb-3">Connexion</h2>
              <p className="text-blue-200 text-lg">Accédez à votre espace d'apprentissage</p>
              {errorMessage && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                  <p className="text-red-300 text-sm">{errorMessage}</p>
                </div>
              )}
              {successMessage && (
                <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-300 mr-2" />
                    <p className="text-green-300 text-sm">{successMessage}</p>
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl space-y-6"
            >
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">Adresse email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm hover:bg-white/15"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">Mot de passe</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm hover:bg-white/15"
                    placeholder="Votre mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-white/10 rounded-r-xl transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-white/50 hover:text-white transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-white/50 hover:text-white transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between">
                <label className="flex items-center group cursor-pointer">
                </label>
                <a href="/forgot-password" className="text-sm text-amber-300 hover:text-amber-200 font-medium transition-colors hover:underline">
                  Mot de passe oublié ?
                </a>
              </div>

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Connexion en cours...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                    Se connecter
                  </div>
                )}
              </button>

              {/* Lien d'inscription */}
              <div className="text-center pt-6 border-t border-white/20">
                <p className="text-white/80 mb-4">
                  Vous n'avez pas de compte ?
                </p>
                <a 
                  href="/register" 
                  className="group inline-flex items-center px-6 py-3 text-sm font-medium text-amber-300 bg-white/5 border border-amber-300/30 rounded-xl hover:bg-amber-300/10 hover:border-amber-300/50 transition-all duration-200 backdrop-blur-sm"
                >
                  Créer un compte
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-white/40 text-xs">
                En vous connectant, vous acceptez nos{' '}
                <a href="/terms" className="text-amber-300/60 hover:text-amber-300 transition-colors">
                  conditions d'utilisation
                </a>{' '}
                et notre{' '}
                <a href="/privacy" className="text-amber-300/60 hover:text-amber-300 transition-colors">
                  politique de confidentialité
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Styles personnalisés pour les animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;


