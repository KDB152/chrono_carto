'use client';

import React, { useState, useEffect } from 'react';
import { ToastProvider } from '@/components/ui/toast';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, Globe, MapPin, BookOpen, CheckCircle, AlertCircle, GraduationCap, Phone } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  // Citations éducatives qui changent
  const quotes = [
    { text: "L'histoire est le témoin du passé, la lumière de la vérité", author: "Cicéron" },
    { text: "La géographie, c'est ce qui reste quand on a tout oublié", author: "Paul Vidal de La Blache" },
    { text: "Celui qui ne connaît pas l'histoire est condamné à la répéter", author: "George Santayana" },
    { text: "L'éducation est l'arme la plus puissante qu'on puisse utiliser pour changer le monde", author: "Nelson Mandela" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Calculer la force du mot de passe
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est obligatoire';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est obligatoire';
    }

    if (!formData.email) {
      newErrors.email = 'L\'adresse email est obligatoire';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'L\'adresse email n\'est pas valide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';
    }

    return newErrors;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const newErrors = validateForm();
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setErrors({});
  setIsLoading(true);
  setSuccessMessage('');  // Reset message succès

  try {
    const response = await fetch('process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Impossible de créer votre compte. Veuillez réessayer.');
    }

    setSuccessMessage(data.message || 'Inscription réussie !');  // Affiche message du backend ou par défaut
    setFormData({  // Vide les champs
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      userType: 'student',
      acceptTerms: false
    });

    // Optionnel : Redirigez vers login après 2s (si vous utilisez Next.js, importez useRouter)
    // setTimeout(() => { router.push('/login'); }, 2000);

  } catch (error) {
    setErrors({ ...errors, global: error.message });  // Erreur globale
  } finally {
    setIsLoading(false);
  }
};

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return { text: 'Très faible', color: 'text-red-400' };
      case 2: return { text: 'Faible', color: 'text-orange-400' };
      case 3: return { text: 'Moyen', color: 'text-yellow-400' };
      case 4: return { text: 'Fort', color: 'text-green-400' };
      case 5: return { text: 'Très fort', color: 'text-emerald-400' };
      default: return { text: '', color: '' };
    }
  };

  const getPasswordStrengthWidth = () => {
    return `${(passwordStrength / 5) * 100}%`;
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-400';
    if (passwordStrength <= 2) return 'bg-orange-400';
    if (passwordStrength <= 3) return 'bg-yellow-400';
    if (passwordStrength <= 4) return 'bg-green-400';
    return 'bg-emerald-400';
  };

  return (
    <ToastProvider>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Animations de fond - Éléments historiques flottants */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Cartes anciennes en arrière-plan */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-yellow-300/20 rounded-full animate-pulse blur-xl"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-emerald-200/20 to-green-300/20 rounded-full animate-bounce blur-lg"></div>
          <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-gradient-to-br from-purple-200/20 to-violet-300/20 rounded-full animate-ping blur-lg"></div>
          
          {/* Éléments décoratifs historiques */}
          <div className="absolute top-20 right-20 opacity-10">
            <Globe className="w-40 h-40 text-white animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div className="absolute bottom-20 left-20 opacity-10">
            <MapPin className="w-32 h-32 text-white animate-pulse" />
          </div>
          
          {/* Lignes de temps animées */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="relative z-10 flex min-h-screen">
          {/* Panneau gauche - Information et design */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 relative">
            <div className="max-w-md">
              {/* Logo et titre */}
              <div className="flex items-center mb-8">
                <img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-32 h-32 mr-6" />
                <div className="ml-4">
                  <h1 className="text-3xl font-bold text-white">Chrono-Carto</h1>
                  <p className="text-blue-200">Plateforme Éducative Gratuite</p>
                </div>
              </div>

              {/* Citation qui change */}
              <div className="mb-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="text-white/90 text-lg italic mb-3 transition-all duration-500">
                  "{quotes[currentQuote].text}"
                </div>
                <div className="text-amber-300 font-medium">
                  — {quotes[currentQuote].author}
                </div>
              </div>

              {/* Statistiques attractives */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                  <div className="text-2xl font-bold text-amber-300">3,000+</div>
                  <div className="text-white/80 text-sm">Élèves actifs</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                  <div className="text-2xl font-bold text-emerald-300">96%</div>
                  <div className="text-white/80 text-sm">Taux de réussite</div>
                </div>
              </div>

              {/* Badges de matières */}
              <div className="flex space-x-3 mt-6">
                <span className="px-3 py-1 bg-gradient-to-r from-red-400 to-pink-400 text-white text-xs rounded-full font-medium">
                  Histoire
                </span>
                <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-blue-400 text-white text-xs rounded-full font-medium">
                  Géographie
                </span>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-400 to-indigo-400 text-white text-xs rounded-full font-medium">
                  EMC
                </span>
              </div>

              {/* Avantages de l'inscription */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center text-white/80 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                  Accès gratuit à tous les cours sans abonnement ni paiement
                </div>
                <div className="flex items-center text-white/80 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                  Suivi personnalisé de vos progrès
                </div>
                <div className="flex items-center text-white/80 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                  Exercices interactifs et évaluations
                </div>
                <div className="flex items-center text-white/80 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                  Communauté d'apprentissage active
                </div>
              </div>
            </div>
          </div>

          {/* Panneau droit - Formulaire */}
          <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
            <div className="w-full max-w-md">
              {/* En-tête du formulaire */}
              <div className="text-center mb-8">
                <div className="lg:hidden flex justify-center mb-6">
                  <img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-32 h-32" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-2">Rejoignez-nous gratuitement</h2>
                <p className="text-blue-200 text-lg">
                  Créez votre compte Chrono-Carto
                </p>
              </div>

              {/* Formulaire */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
              {errors.global && (
  <p className="mb-4 text-sm text-red-400 flex items-center justify-center">
    <AlertCircle className="w-4 h-4 mr-2" />
    {errors.global}
  </p>
)}
{successMessage && (
  <p className="mb-4 text-sm text-green-400 flex items-center justify-center">
    <CheckCircle className="w-4 h-4 mr-2" />
    {successMessage}
  </p>
)}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Sélection du type d'utilisateur */}
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-3">
                      Je suis :
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, userType: 'student' }))}
                        className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-center space-x-2 ${
                          formData.userType === 'student'
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/15'
                        }`}
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span className="text-sm font-medium">Élève</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, userType: 'parent' }))}
                        className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-center space-x-2 ${
                          formData.userType === 'parent'
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/15'
                        }`}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Parent</span>
                      </button>
                    </div>
                  </div>

                  {/* Nom et prénom */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-3">
                        Prénom
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                        </div>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                            errors.firstName ? 'border-red-400' : 'border-white/20'
                          }`}
                          placeholder="Votre Prénom"
                          required
                        />
                      </div>
                      {errors.firstName && (
                        <p className="mt-2 text-sm text-red-400">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-3">
                        Nom
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`w-full pl-4 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                            errors.lastName ? 'border-red-400' : 'border-white/20'
                          }`}
                          placeholder="Votre nom"
                          required
                        />
                      </div>
                      {errors.lastName && (
                        <p className="mt-2 text-sm text-red-400">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-3">
                      Adresse email
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                          errors.email ? 'border-red-400' : 'border-white/20'
                        }`}
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-3">
                      Numéro de téléphone
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                          errors.phone ? 'border-red-400' : 'border-white/20'
                        }`}
                        placeholder="Votre numéro de téléphone"
                        required
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-400">{errors.phone}</p>
                    )}
                  </div>

                  {/* Mot de passe */}
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-3">
                      Mot de passe
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-12 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                          errors.password ? 'border-red-400' : 'border-white/20'
                        }`}
                        placeholder="Votre mot de passe"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-white/50 hover:text-white transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-white/50 hover:text-white transition-colors" />
                        )}
                      </button>
                    </div>
                    
                    {/* Indicateur de force du mot de passe */}
                    {formData.password && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-white/70">Force du mot de passe</span>
                          <span className={`text-xs font-medium ${getPasswordStrengthText().color}`}>
                            {getPasswordStrengthText().text}
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: getPasswordStrengthWidth() }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-400">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirmation mot de passe */}
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-3">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-12 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                          errors.confirmPassword ? 'border-red-400' : 'border-white/20'
                        }`}
                        placeholder="Confirmez votre mot de passe"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-white/50 hover:text-white transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-white/50 hover:text-white transition-colors" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Conditions d'utilisation */}
                  <div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="acceptTerms"
                          name="acceptTerms"
                          type="checkbox"
                          checked={formData.acceptTerms}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-amber-400 focus:ring-amber-400 border-white/20 rounded bg-white/10"
                          required
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="acceptTerms" className="text-white/80">
                          J'accepte les{' '}
                          <a href="#" className="text-amber-300 hover:text-amber-400">
                            conditions d'utilisation
                          </a>{' '}
                          et la{' '}
                          <a href="#" className="text-amber-300 hover:text-amber-400">
                            politique de confidentialité
                          </a>
                        </label>
                      </div>
                    </div>
                    {errors.acceptTerms && (
                      <p className="mt-2 text-sm text-red-400">{errors.acceptTerms}</p>
                    )}
                  </div>

                  {/* Bouton de soumission */}
                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 px-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl hover:from-amber-300 hover:to-orange-400 transition-all duration-200 flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Inscription en cours...
                        </div>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5 mr-2" />
                          S'inscrire gratuitement
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Lien vers la connexion */}
              <div className="mt-6 text-center">
                <p className="text-white/80 text-sm">
                  Déjà un compte ?{' '}
                  <a href="/login" className="text-amber-300 hover:text-amber-400 font-medium">
                    Se connecter
                  </a>
                </p>
              </div>

              {/* Note de sécurité */}
              <div className="mt-6 text-center">
                <p className="text-xs text-white/60">
                  🔒 Connexion sécurisée • Données protégées RGPD • 100% gratuit, sans abonnement
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Particules flottantes */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    </ToastProvider>
  );
};

export default RegisterPage;


