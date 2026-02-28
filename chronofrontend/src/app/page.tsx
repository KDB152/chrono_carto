'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Users, Award, ArrowRight, Play, CheckCircle, Globe, Clock, MapPin, Star, Menu, X, ChevronDown, TrendingUp, Target, Zap, Shield, BookMarked, Calendar, BarChart3, MessageCircle, Video, FileText, Headphones, Smartphone, Monitor } from 'lucide-react';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    
    checkMobile();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkMobile);
    setIsVisible(true);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);


  const quotes = [
    { text: "L'histoire est le témoin du passé, la lumière de la vérité", author: "Cicéron" },
    { text: "La géographie, c'est ce qui reste quand on a tout oublié", author: "Paul Vidal de La Blache" },
    { text: "Celui qui ne connaît pas l'histoire est condamné à la répéter", author: "George Santayana" },
    { text: "L'éducation est l'arme la plus puissante qu'on puisse utiliser pour changer le monde", author: "Nelson Mandela" }
  ];

  const features = [
    {
      icon: Globe,
      title: "Quiz Interactifs",
      description: "Testez vos connaissances avec des quiz variés en histoire, géographie et EMC",
      benefits: ["Questions à choix multiples", "Corrections détaillées", "Suivi des progrès"]
    },
    {
      icon: MessageCircle,
      title: "Messagerie Éducative",
      description: "Communiquez avec vos enseignants et collègues pour poser vos questions",
      benefits: ["Échanges avec les professeurs", "Forum d'entraide", "Notifications en temps réel"]
    },
    {
      icon: Calendar,
      title: "Gestion des Séances",
      description: "Organisez vos cours particuliers et suivez votre planning d'apprentissage",
      benefits: ["Planification des séances", "Suivi des paiements", "Historique des cours"]
    }
  ];

  const stats = [
    { number: "100%", label: "Gratuit", icon: Users },
    { number: "3", label: "Matières couvertes", icon: TrendingUp },
    { number: "8", label: "Accès illimité", icon: BookMarked },
    { number: "24/7", label: "Disponible", icon: Clock }
  ];

  const subjects = [
    {
      title: "Histoire",
      description: "De l'Antiquité à nos jours",
      topics: ["Révolution française", "Guerres mondiales", "Décolonisation"],
      icon: BookOpen,
      color: "from-amber-400 to-orange-500"
    },
    {
      title: "Géographie",
      description: "Comprendre le monde contemporain",
      topics: ["Géopolitique", "Développement durable", "Mondialisation"],
      icon: MapPin,
      color: "from-emerald-400 to-green-500"
    },
    {
      title: "EMC",
      description: "Éducation morale et civique",
      topics: ["Démocratie", "Citoyenneté", "Valeurs républicaines"],
      icon: Shield,
      color: "from-blue-400 to-indigo-500"
    }
  ];

  const resources = [
    { icon: Video, title: "Contenus pédagogiques", count: "En cours" },
    { icon: FileText, title: "Quiz et exercices", count: "Disponibles" },
    { icon: BarChart3, title: "Suivi des progrès", count: "Inclus" },
    { icon: MessageCircle, title: "Support communautaire", count: "Actif" }
  ];

  useEffect(() => {

    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);

    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(featureInterval);
    };
  }, [quotes.length, features.length]);

  return (
    <div className="min-h-screen-mobile relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white safe-top safe-bottom">
      {/* Animations de fond améliorées */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Cartes anciennes en arrière-plan */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-yellow-300/20 rounded-full animate-pulse blur-xl"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-emerald-200/20 to-green-300/20 rounded-full animate-bounce blur-lg"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-gradient-to-br from-purple-200/20 to-violet-300/20 rounded-full animate-ping blur-lg"></div>
        <div className="absolute top-3/4 right-1/3 w-16 h-16 bg-gradient-to-br from-blue-200/20 to-cyan-300/20 rounded-full animate-pulse blur-md"></div>
        
        {/* Éléments décoratifs historiques */}
        <div className="absolute top-20 right-20 opacity-10">
          <Globe className="w-40 h-40 text-white animate-spin" style={{ animationDuration: '20s' }} />
        </div>
        <div className="absolute bottom-20 left-20 opacity-10">
          <MapPin className="w-32 h-32 text-white animate-pulse" />
        </div>
        <div className="absolute top-1/2 left-10 opacity-10">
          <BookOpen className="w-24 h-24 text-white animate-bounce" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Lignes de temps animées */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
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

      {/* Header avec effet parallaxe */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-slate-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image src="/images/chrono_carto_logo.png" alt="Chrono-Carto" width={64} height={64} className="mr-6" priority />
              <h1 className="text-2xl font-bold text-white">
                Chrono-Carto
              </h1>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-white/80 hover:text-white font-medium transition-colors duration-200">
                Fonctionnalités
              </a>
              <a href="#subjects" className="text-white/80 hover:text-white font-medium transition-colors duration-200">
                Matières
              </a>
              <Link href="/login" className="text-white/80 hover:text-white font-medium transition-colors duration-200">
                Connexion
              </Link>
              <Link href="/register" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                S'inscrire
              </Link>
            </div>

            {/* Menu mobile */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>

        {/* Menu mobile dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-white/20 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <a href="#features" className="block text-white/80 hover:text-amber-300 font-medium">
                Fonctionnalités
              </a>
              <a href="#subjects" className="block text-white/80 hover:text-amber-300 font-medium">
                Matières
              </a>
              <Link href="/login" className="block w-full text-left text-white/80 hover:text-white font-medium">
                Connexion
              </Link>
              <Link href="/register" className="block w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-lg font-medium">
                S'inscrire
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section avec animations améliorées */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-8 pb-8">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`animate-fade-in-up ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="mb-6">
              <span className="inline-block bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 px-4 py-2 rounded-full text-sm font-medium border border-amber-500/30">
                 Plateforme éducative gratuite
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Apprenez l'
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Histoire
              </span>
              <br />
              Découvrez la
              <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                Géographie
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-4xl mx-auto leading-relaxed">
              Une plateforme éducative simple et efficace pour l'histoire-géographie et l'EMC. 
              <span className="text-amber-300 font-semibold"> Entièrement gratuit et accessible à tous.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Link href="/register" className="group bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2">
                <span>Commencer gratuitement</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="group border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Se connecter</span>
              </Link>
            </div>
            
            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-8 h-8 text-amber-300" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-amber-300 mb-1">{stat.number}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section améliorée */}
      <section className="py-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 text-center hover:bg-white/15 transition-all duration-300">
            <div className="text-white/90 text-xl md:text-2xl italic mb-4 transition-all duration-500">
              "{quotes[currentQuote].text}"
            </div>
            <div className="text-amber-300 font-medium text-lg">
              — {quotes[currentQuote].author}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section améliorée avec animation */}
      <section id="features" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Des outils d'apprentissage
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"> pratiques</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Des fonctionnalités simples et efficaces pour vous accompagner dans votre apprentissage de l'histoire-géographie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${
                  activeFeature === index ? 'ring-2 ring-amber-400/50' : ''
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400/30 to-orange-400/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-10 h-10 text-amber-300" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  {feature.title}
                </h3>
                <p className="text-white/80 mb-6 text-center">
                  {feature.description}
                </p>
                <div className="space-y-3">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-emerald-300 mr-3 flex-shrink-0" />
                      <span className="text-sm text-white/80">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Matières Section */}
      <section id="subjects" className="py-20 relative z-10 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Nos <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">matières</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Une approche complète et interactive pour maîtriser l'histoire-géographie et l'EMC
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subjects.map((subject, index) => (
              <div key={index} className="group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className={`w-20 h-20 bg-gradient-to-br ${subject.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <subject.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 text-center">
                  {subject.title}
                </h3>
                <p className="text-white/60 mb-6 text-center">
                  {subject.description}
                </p>
                <div className="space-y-2">
                  {subject.topics.map((topic, topicIndex) => (
                    <div key={topicIndex} className="flex items-center">
                      <div className="w-2 h-2 bg-amber-300 rounded-full mr-3"></div>
                      <span className="text-sm text-white/80">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ressources Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Des <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">ressources</span> riches
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Accédez à une bibliothèque complète de contenus pédagogiques de qualité
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {resources.map((resource, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400/30 to-violet-400/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <resource.icon className="w-8 h-8 text-purple-300" />
                </div>
                <div className="text-2xl font-bold text-purple-300 mb-2">{resource.count}</div>
                <div className="text-white/80 text-sm">{resource.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section améliorée */}
      <section className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl p-12 border border-amber-500/30">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Prêt à commencer votre apprentissage ?
            </h2>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Créez votre compte gratuitement et accédez à tous nos outils d'apprentissage en histoire-géographie
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <Link href="/register" className="group bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
                <span>Commencer gratuitement</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300">
                Se connecter
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white/60 text-sm">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400 mr-2" />
                <span>100% gratuit</span>
              </div>
              <div className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400 mr-2" />
                <span>Sans abonnement</span>
              </div>
              <div className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400 mr-2" />
                <span>Accès illimité</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer moderne amélioré */}
      <footer className="bg-slate-950 text-white py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <Image src="/images/chrono_carto_logo.png" alt="Chrono-Carto" width={128} height={128} className="mr-6" />
                <span className="text-2xl font-bold text-white">Chrono-Carto</span>
              </div>
              <p className="text-white/60 mb-6 max-w-md">
                Une plateforme éducative simple et gratuite pour l'apprentissage de l'histoire-géographie et de l'EMC. Des outils pratiques pour étudiants et enseignants.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-amber-500 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <div className="w-5 h-5 bg-white rounded-full"></div>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-amber-500 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <div className="w-5 h-5 bg-white rounded-full"></div>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-amber-500 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <div className="w-5 h-5 bg-white rounded-full"></div>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6 text-lg text-white">Matières</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/60 hover:text-amber-300 transition-colors flex items-center">
                  <MapPin className="w-4 h-4 mr-2" /> Histoire
                </a></li>
                <li><a href="#" className="text-white/60 hover:text-amber-300 transition-colors flex items-center">
                  <Globe className="w-4 h-4 mr-2" /> Géographie
                </a></li>
                <li><a href="#" className="text-white/60 hover:text-amber-300 transition-colors flex items-center">
                  <Shield className="w-4 h-4 mr-2" /> EMC
                </a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6 text-lg text-white">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-white/60 hover:text-amber-300 transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="text-white/60 hover:text-amber-300 transition-colors">Contact</a></li>
                <li><a href="#" className="text-white/60 hover:text-amber-300 transition-colors">Communauté</a></li>
                <li><a href="#" className="text-white/60 hover:text-amber-300 transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              © 2025 Chrono-Carto. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-white/60 hover:text-amber-300 text-sm transition-colors">Confidentialité</a>
              <a href="#" className="text-white/60 hover:text-amber-300 text-sm transition-colors">CGU</a>
              <a href="#" className="text-white/60 hover:text-amber-300 text-sm transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

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

export default HomePage;

