'use client';

import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, CheckCircle, Globe, MapPin, BookOpen, Send, Clock, Shield, Zap, Users, ArrowRight } from 'lucide-react';

const ForgotPasswordPage = () => {
  // Temporary notice while forgot password is unavailable
  const TEMP_FORGOT_DISABLED = false;
  const TEMP_MESSAGE = "Fonctionnalité bientôt disponible. Merci de contacter l'administrateur pour réinitialiser votre mot de passe.";
  const [formData, setFormData] = useState({ email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);

  const quotes = [
    { text: "L'éducation est l'arme la plus puissante qu'on puisse utiliser pour changer le monde", author: "Nelson Mandela" },
    { text: "Celui qui ne connaît pas l'histoire est condamné à la répéter", author: "George Santayana" },
    { text: "La géographie, c'est ce qui reste quand on a tout oublié", author: "Paul Vidal de La Blache" }
  ];

  const features = [
    { icon: Shield, title: "Sécurité renforcée", description: "Protection de vos données" },
    { icon: Mail, title: "Récupération simple", description: "Email de réinitialisation" },
    { icon: Clock, title: "Processus rapide", description: "Quelques minutes suffisent" }
  ];

  useEffect(() => {
    setIsVisible(true);
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);

    return () => clearInterval(quoteInterval);
  }, [quotes.length]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrors({});
  
  if (TEMP_FORGOT_DISABLED) {
    setErrors({ email: TEMP_MESSAGE });
    return;
  }

  if (!formData.email) {
    setErrors({ email: "L'adresse email est requise" });
    return;
  }
  if (!validateEmail(formData.email)) {
    setErrors({ email: "Veuillez entrer une adresse email valide" });
    return;
  }

  setIsLoading(true);
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.email }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Gérer les erreurs spécifiques
      if (response.status === 404 || 
          data.message?.toLowerCase().includes("aucun compte") ||
          data.message?.toLowerCase().includes("adresse e-mail") ||
          data.message?.toLowerCase().includes("compte lié") ||
          data.message?.toLowerCase().includes("n'est associée")) {
        // Afficher l'erreur spécifique pour l'email non trouvé
        setErrors({ 
          email: data.message || "Cette adresse e-mail n'est associée à aucun compte. Veuillez vérifier votre saisie ou créer un compte." 
        });
      } else if (data.message?.toLowerCase().includes("invalid email") ||
                 data.message?.toLowerCase().includes("email invalide")) {
        setErrors({ 
          email: "Format d'adresse email invalide." 
        });
      } else {
        setErrors({ 
          email: data.message || 'Erreur lors de la demande de réinitialisation' 
        });
      }
      return;
    }

    // Seulement afficher le succès si la réponse est OK
    if (response.ok && data.success !== false) {
      setIsSuccess(true);
    }
  } catch (error) {
    console.error('Erreur réseau:', error);
    setErrors({ 
      email: 'Impossible de se connecter au serveur. Veuillez réessayer.' 
    });
  } finally {
    setIsLoading(false);
  }
};


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="min-h-screen-mobile relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 safe-top safe-bottom">
      {/* ✅ Animations de fond améliorées */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Cercles lumineux */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-yellow-300/20 rounded-full animate-pulse blur-xl"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-emerald-200/20 to-green-300/20 rounded-full animate-bounce blur-lg"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-gradient-to-br from-purple-200/20 to-violet-300/20 rounded-full animate-ping blur-lg"></div>
        <div className="absolute top-3/4 right-1/3 w-16 h-16 bg-gradient-to-br from-blue-200/20 to-cyan-300/20 rounded-full animate-pulse blur-md"></div>
        
        {/* Icônes décoratives */}
        <div className="absolute top-20 right-20 opacity-10">
          <Globe className="w-40 h-40 text-white animate-spin" style={{ animationDuration: '20s' }} />
        </div>
        <div className="absolute bottom-20 left-20 opacity-10">
          <MapPin className="w-32 h-32 text-white animate-pulse" />
        </div>
        <div className="absolute top-1/2 left-10 opacity-10">
          <img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-24 h-24 animate-bounce" style={{ animationDelay: '1s' }} />
        </div>

        {/* Lignes de temps */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex min-h-screen">
        {/* Panneau gauche - contenu informatif */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 py-12">
          <div className={`animate-fade-in-up ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-32 h-32 mr-6" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Chrono-Carto</h1>
                  <p className="text-white/60">Plateforme éducative nouvelle génération</p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Récupérez votre
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"> accès</span>
              </h2>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Pas de panique ! Nous vous aidons à récupérer votre mot de passe en toute sécurité
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
          </div>
        </div>

        {/* Panneau droit - formulaire */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-32 h-32" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-3">Mot de passe oublié</h2>
              <p className="text-blue-200 text-lg">Nous vous enverrons un lien de réinitialisation</p>
            </div>

            {TEMP_FORGOT_DISABLED ? (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-amber-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Fonctionnalité bientôt disponible</h3>
                <p className="text-white/80 mb-6 leading-relaxed">
                  Merci de contacter l’administrateur pour réinitialiser votre mot de passe.
                </p>
                <a 
                  href="/login" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span>Retour à la connexion</span>
                </a>
              </div>
            ) : isSuccess ? (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Email envoyé !</h3>
                <p className="text-white/80 mb-6 leading-relaxed">
                  Nous avons envoyé un lien de réinitialisation à <span className="text-amber-300 font-semibold">{formData.email}</span>
                </p>
                <div className="bg-white/5 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center text-white/60 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Vérifiez votre boîte de réception dans les 5 minutes</span>
                  </div>
                </div>
                <a 
                  href="/login" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span>Retour à la connexion</span>
                </a>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl space-y-6"
              >
                {TEMP_FORGOT_DISABLED && (
                  <div className="mb-4 p-4 rounded-xl border border-amber-400/40 bg-amber-500/15 text-amber-200">
                    <p className="text-sm">{TEMP_MESSAGE}</p>
                  </div>
                )}
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
                      className={`w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm hover:bg-white/15 ${
                        errors.email ? 'border-red-400' : ''
                      }`}
                      placeholder="votre@email.com"
                      required
                      disabled={TEMP_FORGOT_DISABLED}
                    />
                  </div>
                  {errors.email && (
                    <div className="mt-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                      <p className="text-sm text-red-300">{errors.email}</p>
                    </div>
                  )}
                </div>

                {/* Bouton d'envoi */}
                <button
                  type="submit"
                  disabled={isLoading || TEMP_FORGOT_DISABLED}
                  className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                      Envoyer le lien
                    </div>
                  )}
                </button>

                {/* Lien de retour */}
                <div className="text-center pt-6 border-t border-white/20">
                  <a 
                    href="/login" 
                    className="inline-flex items-center text-white/80 hover:text-white transition-colors group"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span>Retour à la connexion</span>
                  </a>
                </div>
              </form>
            )}

            <div className="mt-8 text-center">
              <div className="flex items-center justify-center space-x-4 text-xs text-white/60">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  <span>Connexion sécurisée</span>
                </div>
                <div className="w-px h-4 bg-white/30"></div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>Données protégées RGPD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Particules flottantes améliorées */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

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
          animation: fade-in-up 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;