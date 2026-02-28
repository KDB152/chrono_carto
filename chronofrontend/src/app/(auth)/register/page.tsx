'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastProvider } from '@/components/ui/toast';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, Globe, MapPin, BookOpen, CheckCircle, AlertCircle, GraduationCap, Phone, Calendar, Baby, ArrowRight, Shield, Zap, Users, Star, Award } from 'lucide-react';

// Export viewport configuration
export const viewport = {
  themeColor: '#F59E0B',
  viewport: 'width=device-width, initial-scale=1',
};

import { AVAILABLE_CLASSES } from '@/constants/classes';

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
    acceptTerms: false,
    // Student-specific fields
    studentBirthDate: '',
    studentClass: '',
    // Parent-specific fields
    childFirstName: '',
    childLastName: '',
    childBirthDate: '',
    childClass: '',
    // Parent contact fields (for students)
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPhone: '',
    parentPassword: '',
    parentConfirmPassword: '',
    // Child password fields (for parents)
    childPassword: '',
    childConfirmPassword: '',
    // Child contact fields (for parents)
    childEmail: '',
    childPhone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showParentPassword, setShowParentPassword] = useState(false);
  const [showParentConfirmPassword, setShowParentConfirmPassword] = useState(false);
  const [showChildPassword, setShowChildPassword] = useState(false);
  const [showChildConfirmPassword, setShowChildConfirmPassword] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const quotes = [
    { text: "L'éducation est l'arme la plus puissante qu'on puisse utiliser pour changer le monde", author: "Nelson Mandela" },
    { text: "Celui qui ne connaît pas l'histoire est condamné à la répéter", author: "George Santayana" },
    { text: "La géographie, c'est ce qui reste quand on a tout oublié", author: "Paul Vidal de La Blache" }
  ];

  const benefits = [
    { icon: Globe, title: "Quiz Interactifs", description: "Testez vos connaissances" },
    { icon: Users, title: "Messagerie", description: "Échangez avec vos enseignants" },
    { icon: Calendar, title: "Gestion des Séances", description: "Organisez vos cours" },
    { icon: Shield, title: "Sécurité RGPD", description: "Données protégées" }
  ];

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

  useEffect(() => {
    setIsVisible(true);
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);

    return () => clearInterval(quoteInterval);
  }, [quotes.length]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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

    // Validation spécifique aux étudiants
    if (formData.userType === 'student') {
      if (!formData.studentBirthDate) {
        newErrors.studentBirthDate = 'La date de naissance est obligatoire';
      }
      if (!formData.studentClass) {
        newErrors.studentClass = 'La classe est obligatoire';
      } else if (!AVAILABLE_CLASSES.includes(formData.studentClass)) {
        newErrors.studentClass = 'Veuillez sélectionner une classe valide';
      }
      // Le téléphone parent est obligatoire pour les étudiants
      if (!formData.parentPhone || !formData.parentPhone.trim()) {
        newErrors.parentPhone = 'Le numéro de téléphone du parent est obligatoire';
      } else if (!/^[0-9+\-\s()]+$/.test(formData.parentPhone)) {
        newErrors.parentPhone = 'Veuillez entrer un numéro de téléphone valide pour le parent';
      }
      
      // Validation optionnelle des autres données parent
      if (formData.parentEmail && !validateEmail(formData.parentEmail)) {
        newErrors.parentEmail = 'Veuillez entrer une adresse email valide pour le parent';
      }
      if (formData.parentPassword && formData.parentPassword.length < 8) {
        newErrors.parentPassword = 'Le mot de passe du parent doit contenir au moins 8 caractères';
      }
      if (formData.parentPassword && formData.parentConfirmPassword && formData.parentPassword !== formData.parentConfirmPassword) {
        newErrors.parentConfirmPassword = 'Les mots de passe du parent ne correspondent pas';
      }
    }

    // Validation spécifique aux parents
    if (formData.userType === 'parent') {
      // Validation obligatoire des données enfant
      if (!formData.childFirstName || !formData.childFirstName.trim()) {
        newErrors.childFirstName = 'Le prénom de l\'enfant est obligatoire';
      }
      if (!formData.childLastName || !formData.childLastName.trim()) {
        newErrors.childLastName = 'Le nom de l\'enfant est obligatoire';
      }
      if (!formData.childPhone || !formData.childPhone.trim()) {
        newErrors.childPhone = 'Le numéro de téléphone de l\'enfant est obligatoire';
      } else if (!/^[0-9+\-\s()]+$/.test(formData.childPhone)) {
        newErrors.childPhone = 'Veuillez entrer un numéro de téléphone valide pour l\'enfant';
      }
      if (!formData.childClass || !formData.childClass.trim()) {
        newErrors.childClass = 'La classe de l\'enfant est obligatoire';
      } else if (!AVAILABLE_CLASSES.includes(formData.childClass)) {
        newErrors.childClass = 'Veuillez sélectionner une classe valide pour l\'enfant';
      }
      
      // Validation optionnelle des autres données enfant
      if (formData.childEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.childEmail)) {
        newErrors.childEmail = 'Veuillez entrer un email valide pour l\'enfant';
      }
      if (formData.childPassword && formData.childPassword.length < 8) {
        newErrors.childPassword = 'Le mot de passe de l\'enfant doit contenir au moins 8 caractères';
      }
      if (formData.childPassword && formData.childConfirmPassword && formData.childPassword !== formData.childConfirmPassword) {
        newErrors.childConfirmPassword = 'Les mots de passe de l\'enfant ne correspondent pas';
      }
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    setSuccessMessage('');

    try {
      // Prepare the data to send to the backend
      const requestData: any = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: formData.userType,
      };

      // Student-specific fields
      if (formData.userType === 'student') {
        if (formData.studentBirthDate) requestData.studentBirthDate = formData.studentBirthDate;
        if (formData.studentClass) requestData.studentClass = formData.studentClass;
        
        // Parent contact fields (only include if not empty)
        if (formData.parentFirstName?.trim()) requestData.parentFirstName = formData.parentFirstName;
        if (formData.parentLastName?.trim()) requestData.parentLastName = formData.parentLastName;
        if (formData.parentEmail?.trim()) requestData.parentEmail = formData.parentEmail;
        if (formData.parentPhone?.trim()) requestData.parentPhone = formData.parentPhone;
        // Utiliser le mot de passe principal pour le parent
        requestData.parentPassword = formData.password;
      }

      // Parent-specific fields
      if (formData.userType === 'parent') {
        if (formData.childFirstName?.trim()) requestData.childFirstName = formData.childFirstName;
        if (formData.childLastName?.trim()) requestData.childLastName = formData.childLastName;
        if (formData.childBirthDate?.trim()) requestData.childBirthDate = formData.childBirthDate;
        if (formData.childClass?.trim()) requestData.childClass = formData.childClass;
        // Utiliser le mot de passe principal pour l'enfant
        requestData.childPassword = formData.password;
        if (formData.childEmail?.trim()) requestData.childEmail = formData.childEmail;
        if (formData.childPhone?.trim()) requestData.childPhone = formData.childPhone;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Impossible de créer votre compte. Veuillez réessayer.");
      }

      // Rediriger vers la page de vérification d'email après inscription réussie
      localStorage.setItem('pendingVerificationEmail', formData.email);
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      setErrors({ ...errors, global: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Synchroniser automatiquement les mots de passe
      if (name === 'password') {
        // Si c'est le mot de passe principal, le copier vers parent et enfant
        if (formData.userType === 'student') {
          newData.parentPassword = value;
          newData.parentConfirmPassword = value;
        } else if (formData.userType === 'parent') {
          newData.childPassword = value;
          newData.childConfirmPassword = value;
        }
      }
      
      return newData;
    });
    
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
      <div className="min-h-screen-mobile relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 safe-top safe-bottom">
        {/* Fond animé et éléments historiques */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-yellow-300/20 rounded-full animate-pulse blur-xl"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-emerald-200/20 to-green-300/20 rounded-full animate-bounce blur-lg"></div>
          <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-gradient-to-br from-purple-200/20 to-violet-300/20 rounded-full animate-ping blur-lg"></div>

          <div className="absolute top-20 right-20 opacity-10">
            <Globe className="w-40 h-40 text-white animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div className="absolute bottom-20 left-20 opacity-10">
            <MapPin className="w-32 h-32 text-white animate-pulse" />
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
                  <img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-32 h-32 mr-6" />
                  <div>
                    <h1 className="text-3xl font-bold text-white">Chrono-Carto</h1>
                    <p className="text-white/60">Plateforme éducative nouvelle génération</p>
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  Rejoignez l'aventure
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"> d'apprentissage</span>
                </h2>
                <p className="text-xl text-white/80 mb-8 leading-relaxed">
                  Créez votre compte et accédez à des ressources pédagogiques innovantes, entièrement gratuites
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

              {/* Benefits */}
              <div className="space-y-4 mb-12">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400/30 to-orange-400/30 rounded-xl flex items-center justify-center mr-4">
                      <benefit.icon className="w-6 h-6 text-amber-300" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{benefit.title}</h3>
                      <p className="text-white/60 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-3 gap-6">
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
            <div className="w-full max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <img src="/images/chrono_carto_logo.png" alt="Chrono-Carto" className="w-32 h-32" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-3">Inscription</h2>
                <p className="text-blue-200 text-lg">Créez votre compte d'apprentissage</p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl space-y-6"
              >
                {/* Messages d'erreur et de succès */}
                {errors.global && (
                  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl mb-6">
                    <p className="text-sm text-red-300 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {errors.global}
                    </p>
                  </div>
                )}
                {successMessage && (
                  <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl mb-6">
                    <p className="text-sm text-green-300 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {successMessage}
                    </p>
                  </div>
                )}

                {/* Sélection du type d'utilisateur */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3">
                    Je suis :
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, userType: 'student' }))}
                      className={`p-4 rounded-xl border transition-all duration-200 flex items-center justify-center space-x-2 group ${
                        formData.userType === 'student'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg'
                          : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/15 hover:border-white/30'
                      }`}
                    >
                      <GraduationCap className={`w-5 h-5 ${formData.userType === 'student' ? 'text-amber-300' : 'group-hover:text-white'} transition-colors`} />
                      <span className="text-sm font-medium">Étudiant</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, userType: 'parent' }))}
                      className={`p-4 rounded-xl border transition-all duration-200 flex items-center justify-center space-x-2 group ${
                        formData.userType === 'parent'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg'
                          : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/15 hover:border-white/30'
                      }`}
                    >
                      <User className={`w-5 h-5 ${formData.userType === 'parent' ? 'text-amber-300' : 'group-hover:text-white'} transition-colors`} />
                      <span className="text-sm font-medium">Parent</span>
                    </button>
                  </div>
                </div>

                {/* Informations personnelles */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-amber-300" />
                    {formData.userType === 'student' ? 'Informations personnelles' : 'Informations personnelles'}
                  </h3>
                  
                  {/* Nom et prénom */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-3">Prénom</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                        </div>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm hover:bg-white/15 ${
                            errors.firstName ? 'border-red-400' : 'border-white/20'
                          }`}
                          placeholder="Votre prénom"
                          required
                        />
                      </div>
                      {errors.firstName && (
                        <p className="mt-2 text-sm text-red-400">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-3">Nom</label>
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

                  {/* Email et téléphone */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
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

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-3">Numéro de téléphone</label>
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
                  </div>

                                    {/* Champs spécifiques selon le type d'utilisateur */}
                  {formData.userType === 'student' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-3">Date de naissance</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                          </div>
                          <input
                            type="date"
                            name="studentBirthDate"
                            value={formData.studentBirthDate}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                              errors.studentBirthDate ? 'border-red-400' : 'border-white/20'
                            }`}
                            required
                          />
                        </div>
                        {errors.studentBirthDate && (
                          <p className="mt-2 text-sm text-red-400">{errors.studentBirthDate}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-3">Classe</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                            <BookOpen className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                          </div>
                          <select
                            name="studentClass"
                            value={formData.studentClass}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm appearance-none ${
                              errors.studentClass ? 'border-red-400' : 'border-white/20'
                            }`}
                            required
                          >
                            <option value="" className="bg-slate-800 text-white">Votre classe</option>
                            {AVAILABLE_CLASSES.map((classe) => (
                              <option 
                                key={classe} 
                                value={classe} 
                                className="bg-slate-800 text-white"
                              >
                                {classe}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        {errors.studentClass && (
                          <p className="mt-2 text-sm text-red-400">{errors.studentClass}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mot de passe pour les étudiants */}
                  {formData.userType === 'student' && (
                    <>
                      <div className="mb-4">
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
                        {errors.password && (
                          <p className="mt-2 text-sm text-red-400">{errors.password}</p>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-white/90 mb-3">Confirmer le mot de passe</label>
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
                    </>
                  )}

                  {/* Mot de passe pour les parents */}
                  {formData.userType === 'parent' && (
                    <>
                      <div className="mb-4">
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
                        {errors.password && (
                          <p className="mt-2 text-sm text-red-400">{errors.password}</p>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-white/90 mb-3">Confirmer le mot de passe</label>
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
                    </>
                  )}

                </div>

                {/* Informations des enfants (pour les parents) */}
                {formData.userType === 'parent' && (
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                      <Baby className="w-5 h-5 mr-2 text-amber-300" />
                      Informations de l'enfant
                      <span className="ml-2 text-sm font-normal text-red-400/80">(Obligatoire)</span>
                    </h3>
                    <p className="text-sm text-white/70 mb-4">
                    Si votre enfant a déjà créé son compte, contactez l’administrateur et ne créez pas de compte parent. Sinon, créez un compte pour vous-même et pour votre enfant.
                    </p>
                    <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-200">
                        <strong>💡 Information :</strong> Les informations de votre enfant (nom, prénom, téléphone et classe) sont <strong className="text-red-300">obligatoires</strong>. 
                        Un compte enfant sera créé automatiquement avec ces informations et le <strong className="text-amber-300">même mot de passe</strong> que le vôtre.
                      </p>
                    </div>
                    
                    {/* Les champs enfant sont déjà dans la section précédente, on les déplace ici */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-3">Prénom de l'enfant <span className="text-red-400/80 text-xs">(Obligatoire)</span></label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Baby className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                          </div>
                          <input
                            type="text"
                            name="childFirstName"
                            value={formData.childFirstName}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                              errors.childFirstName ? 'border-red-400' : 'border-white/20'
                            }`}
                            placeholder="Prénom de l'enfant (obligatoire)"
                            required
                          />
                        </div>
                        {errors.childFirstName && (
                          <p className="mt-2 text-sm text-red-400">{errors.childFirstName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-3">Nom de l'enfant <span className="text-red-400/80 text-xs">(Obligatoire)</span></label>
                        <div className="relative group">
                          <input
                            type="text"
                            name="childLastName"
                            value={formData.childLastName}
                            onChange={handleInputChange}
                            className={`w-full pl-4 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                              errors.childLastName ? 'border-red-400' : 'border-white/20'
                            }`}
                            placeholder="Nom de l'enfant (obligatoire)"
                            required
                          />
                        </div>
                        {errors.childLastName && (
                          <p className="mt-2 text-sm text-red-400">{errors.childLastName}</p>
                        )}
                      </div>
                    </div>

                    {/* Email et téléphone de l'enfant */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-3">Email de l'enfant <span className="text-amber-300/80 text-xs">(Optionnel)</span></label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                          </div>
                          <input
                            type="email"
                            name="childEmail"
                            value={formData.childEmail}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                              errors.childEmail ? 'border-red-400' : 'border-white/20'
                            }`}
                            placeholder="enfant@email.com (optionnel)"
                          />
                        </div>
                        {errors.childEmail && (
                          <p className="mt-2 text-sm text-red-400">{errors.childEmail}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-3">Téléphone de l'enfant <span className="text-red-400/80 text-xs">(Obligatoire)</span></label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                          </div>
                          <input
                            type="tel"
                            name="childPhone"
                            value={formData.childPhone}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                              errors.childPhone ? 'border-red-400' : 'border-white/20'
                            }`}
                            placeholder="Numéro de téléphone de l'enfant (obligatoire)"
                            required
                          />
                        </div>
                        {errors.childPhone && (
                          <p className="mt-2 text-sm text-red-400">{errors.childPhone}</p>
                        )}
                      </div>
                    </div>

                    {/* Date de naissance et classe de l'enfant */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-3">Date de naissance de l'enfant <span className="text-amber-300/80 text-xs">(Optionnel)</span></label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                          </div>
                          <input
                            type="date"
                            name="childBirthDate"
                            value={formData.childBirthDate}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                              errors.childBirthDate ? 'border-red-400' : 'border-white/20'
                            }`}
                          />
                        </div>
                        {errors.childBirthDate && (
                          <p className="mt-2 text-sm text-red-400">{errors.childBirthDate}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-3">Classe de l'enfant <span className="text-red-400/80 text-xs">(Obligatoire)</span></label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                            <BookOpen className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                          </div>
                          <select
                            name="childClass"
                            value={formData.childClass}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm appearance-none ${
                              errors.childClass ? 'border-red-400' : 'border-white/20'
                            }`}
                            required
                          >
                            <option value="" className="bg-slate-800 text-white">La classe de votre enfant (obligatoire)</option>
                            {AVAILABLE_CLASSES.map((classe) => (
                              <option 
                                key={classe} 
                                value={classe} 
                                className="bg-slate-800 text-white"
                              >
                                {classe}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        {errors.childClass && (
                          <p className="mt-2 text-sm text-red-400">{errors.childClass}</p>
                        )}
                      </div>
                    </div>

                    {/* Mot de passe de l'enfant */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-white/90 mb-3">Mot de passe de l'enfant <span className="text-amber-300/80 text-xs">(Optionnel)</span></label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                        </div>
                        <input
                          type={showChildPassword ? 'text' : 'password'}
                          name="childPassword"
                          value={formData.childPassword}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-12 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                            errors.childPassword ? 'border-red-400' : 'border-white/20'
                          }`}
                          placeholder="Mot de passe de l'enfant (optionnel)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowChildPassword(!showChildPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                          {showChildPassword ? (
                            <EyeOff className="h-5 w-5 text-white/50 hover:text-white transition-colors" />
                          ) : (
                            <Eye className="h-5 w-5 text-white/50 hover:text-white transition-colors" />
                          )}
                        </button>
                      </div>
                      {errors.childPassword && (
                        <p className="mt-2 text-sm text-red-400">{errors.childPassword}</p>
                      )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/90 mb-3">Confirmer le mot de passe de l'enfant <span className="text-amber-300/80 text-xs">(Optionnel)</span></label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                        </div>
                        <input
                          type={showChildConfirmPassword ? 'text' : 'password'}
                          name="childConfirmPassword"
                          value={formData.childConfirmPassword}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-12 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                            errors.childConfirmPassword ? 'border-red-400' : 'border-white/20'
                          }`}
                          placeholder="Confirmez le mot de passe de l'enfant (optionnel)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowChildConfirmPassword(!showChildConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                          {showChildConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-white/50 hover:text-white transition-colors" />
                          ) : (
                            <Eye className="h-5 w-5 text-white/50 hover:text-white transition-colors" />
                          )}
                        </button>
                      </div>
                      {errors.childConfirmPassword && (
                        <p className="mt-2 text-sm text-red-400">{errors.childConfirmPassword}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Informations des parents (pour les étudiants) */}
                {formData.userType === 'student' && (
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                      <User className="w-5 h-5 mr-2 text-amber-300" />
                      Informations des parents
                      <span className="ml-2 text-sm font-normal text-red-400/80">(Téléphone obligatoire)</span>
                    </h3>
                    <p className="text-sm text-white/70 mb-4">
                    Si votre  a déjà créé son compte, contactez l’administrateur et ne créez pas de compte étudiant. Sinon, créez un compte pour vous-même et pour votre parent.
                    </p>
                    <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-200">
                        <strong>💡 Information :</strong> Le numéro de téléphone de votre parent est obligatoire. 
                        Si vous ne renseignez pas les autres informations de vos parents, 
                        un compte parent temporaire sera créé automatiquement avec le <strong className="text-amber-300">même mot de passe</strong> que le vôtre.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-3">Prénom du parent <span className="text-amber-300/80 text-xs">(Optionnel)</span></label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                          </div>
                          <input
                            type="text"
                            name="parentFirstName"
                            value={formData.parentFirstName}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                              errors.parentFirstName ? 'border-red-400' : 'border-white/20'
                            }`}
                            placeholder="Prénom du parent (optionnel)"
                          />
                        </div>
                        {errors.parentFirstName && (
                          <p className="mt-2 text-sm text-red-400">{errors.parentFirstName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-3">Nom du parent <span className="text-amber-300/80 text-xs">(Optionnel)</span></label>
                        <div className="relative group">
                          <input
                            type="text"
                            name="parentLastName"
                            value={formData.parentLastName}
                            onChange={handleInputChange}
                            className={`w-full pl-4 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                              errors.parentLastName ? 'border-red-400' : 'border-white/20'
                            }`}
                            placeholder="Nom du parent (optionnel)"
                          />
                        </div>
                        {errors.parentLastName && (
                          <p className="mt-2 text-sm text-red-400">{errors.parentLastName}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-3">Email du parent <span className="text-amber-300/80 text-xs">(Optionnel)</span></label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                          </div>
                          <input
                            type="email"
                            name="parentEmail"
                            value={formData.parentEmail}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                              errors.parentEmail ? 'border-red-400' : 'border-white/20'
                            }`}
                            placeholder="parent@email.com (optionnel)"
                          />
                        </div>
                        {errors.parentEmail && (
                          <p className="mt-2 text-sm text-red-400">{errors.parentEmail}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-3">Téléphone du parent <span className="text-red-400 text-xs">*</span></label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                          </div>
                          <input
                            type="tel"
                            name="parentPhone"
                            value={formData.parentPhone}
                            onChange={handleInputChange}
                            className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                              errors.parentPhone ? 'border-red-400' : 'border-white/20'
                            }`}
                            placeholder="Téléphone du parent (obligatoire)"
                            required
                          />
                        </div>
                        {errors.parentPhone && (
                          <p className="mt-2 text-sm text-red-400">{errors.parentPhone}</p>
                        )}
                      </div>
                    </div>

                    {/* Mot de passe du parent */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-white/90 mb-3">Mot de passe du parent <span className="text-amber-300/80 text-xs">(Optionnel)</span></label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                        </div>
                        <input
                          type={showParentPassword ? 'text' : 'password'}
                          name="parentPassword"
                          value={formData.parentPassword}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-12 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                            errors.parentPassword ? 'border-red-400' : 'border-white/20'
                          }`}
                          placeholder="Mot de passe du parent (optionnel)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowParentPassword(!showParentPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                          {showParentPassword ? (
                            <EyeOff className="h-5 w-5 text-white/50 hover:text-white transition-colors" />
                          ) : (
                            <Eye className="h-5 w-5 text-white/50 hover:text-white transition-colors" />
                          )}
                        </button>
                      </div>
                      {errors.parentPassword && (
                        <p className="mt-2 text-sm text-red-400">{errors.parentPassword}</p>
                      )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/90 mb-3">Confirmer le mot de passe du parent <span className="text-amber-300/80 text-xs">(Optionnel)</span></label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-blue-300 group-focus-within:text-amber-300 transition-colors" />
                        </div>
                        <input
                          type={showParentConfirmPassword ? 'text' : 'password'}
                          name="parentConfirmPassword"
                          value={formData.parentConfirmPassword}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-12 py-4 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                            errors.parentConfirmPassword ? 'border-red-400' : 'border-white/20'
                          }`}
                          placeholder="Confirmez le mot de passe du parent (optionnel)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowParentConfirmPassword(!showParentConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                          {showParentConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-white/50 hover:text-white transition-colors" />
                          ) : (
                            <Eye className="h-5 w-5 text-white/50 hover:text-white transition-colors" />
                          )}
                        </button>
                      </div>
                      {errors.parentConfirmPassword && (
                        <p className="mt-2 text-sm text-red-400">{errors.parentConfirmPassword}</p>
                      )}
                    </div>
                  </div>
                )}


                {/* Conditions d'utilisation */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-amber-400 focus:ring-amber-300 border-white/30 rounded bg-white/10"
                    />
                    <span className="ml-2 text-sm text-white/80">
                          J'accepte les{' '}
                          <a href="conditions-utilisation" className="text-amber-300 hover:text-amber-400">
                            conditions d'utilisation
                          </a>{' '}
                          et la{' '}
                          <a href="politique-confidentialite" className="text-amber-300 hover:text-amber-400">
                            politique de confidentialité
                      </a>
                    </span>
                  </label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-sm text-red-400">{errors.acceptTerms}</p>
                )}

                {/* Bouton de soumission */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Inscription en cours...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <UserPlus className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                      S'inscrire
                    </div>
                  )}
                </button>

                {/* Lien de connexion */}
                <div className="text-center pt-4 border-t border-white/20">
                  <p className="text-white/80">
                    Déjà un compte ?{' '}
                    <a href="/login" className="font-medium text-amber-300 hover:text-amber-200 transition-colors">
                      Se connecter
                    </a>
                  </p>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-white/60">
                  🔒 Connexion sécurisée • Données protégées RGPD
                </p>
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
    </ToastProvider>
  );
};

export default RegisterPage;


