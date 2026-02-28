'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  BookOpen,
  Euro,
  FileText,
  RefreshCw
} from 'lucide-react';
import { AnimatedPage, AnimatedCard, AnimatedButton, AnimatedStats } from '../../components/ui/animations';

interface ChildData {
  id: number;
  name: string;
  class_level: string;
  paid_sessions: number;
  unpaid_sessions: number;
  total_sessions: number;
  next_session: string;
  payment_status: 'paid' | 'partial' | 'unpaid';
}

interface ParentData {
  id: number;
  name: string;
  email: string;
  children: ChildData[];
  total_paid: number;
  total_unpaid: number;
  last_payment: string;
}

const ParentDashboard: React.FC = () => {
  const [parentData, setParentData] = useState<ParentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fonction de déconnexion
  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      // Supprimer les données utilisateur du localStorage
      localStorage.removeItem('userDetails');
      localStorage.removeItem('token');
      
      // Rediriger vers la page de connexion
      window.location.href = '/login';
    }
  };

  // Données simulées pour l'exemple
  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setParentData({
        id: 1,
        name: "Parent El Abed",
        email: "parent@example.com",
        children: [
          {
            id: 1,
            name: "Mayssa El Abed",
            class_level: "Terminale groupe 3",
            paid_sessions: 5,
            unpaid_sessions: 3,
            total_sessions: 8,
            next_session: "2025-01-15",
            payment_status: 'partial'
          },
          {
            id: 2,
            name: "Ahmed El Abed",
            class_level: "1ere groupe 2",
            paid_sessions: 3,
            unpaid_sessions: 1,
            total_sessions: 4,
            next_session: "2025-01-16",
            payment_status: 'paid'
          }
        ],
        total_paid: 8,
        total_unpaid: 4,
        last_payment: "2025-01-10"
      });
      setSelectedChild(1);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-600 text-base">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!parentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-base">Erreur de chargement des données</p>
        </div>
      </div>
    );
  }

  const currentChild = parentData.children.find(child => child.id === selectedChild) || parentData.children[0];

  return (
    <AnimatedPage className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Overlay mobile */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Bouton hamburger mobile */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-green-600/90 backdrop-blur-md rounded-lg text-white hover:bg-green-700 transition-all shadow-lg"
        aria-label="Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${
        isMobile 
          ? (mobileMenuOpen ? 'translate-x-0' : '-translate-x-full') 
          : (sidebarCollapsed ? 'w-20' : 'w-80')
      } ${isMobile ? 'w-80 max-w-[85vw]' : ''}`}>
        <div className="h-full bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-xl">
          {/* Header du sidebar */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              {(!isMobile && !sidebarCollapsed) || (isMobile && mobileMenuOpen) ? (
                <div>
                  <h1 className="text-base font-bold text-gray-900">Chrono-Carto</h1>
                  <p className="text-green-600 text-sm">Parent</p>
                </div>
              ) : null}
              <AnimatedButton
                onClick={() => {
                  if (isMobile) {
                    setMobileMenuOpen(false);
                  } else {
                    setSidebarCollapsed(!sidebarCollapsed);
                  }
                }}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                {isMobile ? <X className="w-5 h-5" /> : (sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />)}
              </AnimatedButton>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            <AnimatedButton className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-green-600 text-white shadow-lg">
              <Users className="w-5 h-5" />
              {((!isMobile && !sidebarCollapsed) || (isMobile && mobileMenuOpen)) && <span>Tableau de bord</span>}
            </AnimatedButton>
            
            <AnimatedButton className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all">
              <Calendar className="w-5 h-5" />
              {((!isMobile && !sidebarCollapsed) || (isMobile && mobileMenuOpen)) && <span>Planning des enfants</span>}
            </AnimatedButton>
            
            <AnimatedButton className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all">
              <CreditCard className="w-5 h-5" />
              {((!isMobile && !sidebarCollapsed) || (isMobile && mobileMenuOpen)) && <span>Gestion des paiements</span>}
            </AnimatedButton>
            
            <AnimatedButton className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all">
              <FileText className="w-5 h-5" />
              {((!isMobile && !sidebarCollapsed) || (isMobile && mobileMenuOpen)) && <span>Documents</span>}
            </AnimatedButton>
          </nav>

          {/* Profil utilisateur avec menu de déconnexion */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                {((!isMobile && !sidebarCollapsed) || (isMobile && mobileMenuOpen)) && (
                  <div className="flex-1 text-left">
                    <div className="text-gray-900 font-semibold text-sm">{parentData.name}</div>
                    <div className="text-green-600 text-xs">Parent</div>
                  </div>
                )}
              </button>

              {/* Menu utilisateur avec déconnexion */}
              {showUserMenu && ((!isMobile && !sidebarCollapsed) || (isMobile && mobileMenuOpen)) && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200 shadow-xl">
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-semibold">Déconnexion</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className={`transition-all duration-300 ${isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-20' : 'ml-80')}`}>
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
          <div className="flex items-center justify-between px-3 py-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Tableau de bord Parent</h2>
              <p className="text-gray-600">Bienvenue, {parentData.name}</p>
            </div>
            <div className="flex items-center space-x-3">
              <AnimatedButton 
                onClick={() => window.location.reload()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                title="Actualiser"
              >
                <RefreshCw className="w-5 h-5" />
              </AnimatedButton>
              <AnimatedButton className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                <Settings className="w-5 h-5" />
              </AnimatedButton>
                             <AnimatedButton 
                 onClick={handleLogout}
                 className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-all flex items-center space-x-2"
                 title="Se déconnecter"
               >
                 <LogOut className="w-5 h-5" />
                 <span className="text-sm font-medium">Déconnexion</span>
               </AnimatedButton>
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main className="p-6 space-y-4">
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatedStats delay={0} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Enfants</p>
                  <p className="text-base font-bold text-gray-900">{parentData.children.length}</p>
                </div>
                <Users className="w-10 h-10 text-green-600" />
              </div>
            </AnimatedStats>

            <AnimatedStats delay={1} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Séances Payées</p>
                  <p className="text-base font-bold text-green-600">{parentData.total_paid}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </AnimatedStats>

            <AnimatedStats delay={2} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Séances Non Payées</p>
                  <p className="text-base font-bold text-orange-600">{parentData.total_unpaid}</p>
                </div>
                <Clock className="w-10 h-10 text-orange-600" />
              </div>
            </AnimatedStats>

            <AnimatedStats delay={3} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Dernier Paiement</p>
                  <p className="text-base font-semibold text-gray-900">
                    {new Date(parentData.last_payment).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <CreditCard className="w-10 h-10 text-purple-600" />
              </div>
            </AnimatedStats>
          </div>

          {/* Sélection de l'enfant */}
          <AnimatedCard className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Sélectionner un enfant</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parentData.children.map((child) => (
                <AnimatedButton
                  key={child.id}
                  onClick={() => setSelectedChild(child.id)}
                  className={`p-4 rounded-xl transition-all border-2 ${
                    selectedChild === child.id
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white hover:border-green-300 text-gray-700'
                  }`}
                >
                  <div className="text-center">
                    <User className="w-5 h-5 mx-auto mb-2" />
                    <div className="font-semibold">{child.name}</div>
                    <div className="text-sm opacity-75">{child.class_level}</div>
                  </div>
                </AnimatedButton>
              ))}
            </div>
          </AnimatedCard>

          {/* Informations de l'enfant sélectionné */}
          {currentChild && (
            <AnimatedCard className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Informations de {currentChild.name}
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Statistiques de l'enfant */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Total Séances</span>
                    <span className="text-base font-bold text-gray-900">{currentChild.total_sessions}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                    <span className="text-gray-600">Séances Payées</span>
                    <span className="text-base font-bold text-green-600">{currentChild.paid_sessions}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                    <span className="text-gray-600">Séances Non Payées</span>
                    <span className="text-base font-bold text-orange-600">{currentChild.unpaid_sessions}</span>
                  </div>
                </div>

                {/* Prochaine séance et statut */}
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <h4 className="font-semibold text-blue-900 mb-2">Prochaine séance</h4>
                    <div className="text-base font-bold text-blue-600">
                      {new Date(currentChild.next_session).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <h4 className="font-semibold text-purple-900 mb-2">Statut Paiement</h4>
                    <div className={`text-base font-semibold capitalize ${
                      currentChild.payment_status === 'paid' ? 'text-green-600' :
                      currentChild.payment_status === 'partial' ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {currentChild.payment_status === 'paid' ? 'Payé' :
                       currentChild.payment_status === 'partial' ? 'Partiel' : 'Non payé'}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Actions rapides */}
          <AnimatedCard className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Actions rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AnimatedButton className="p-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center space-x-3">
                <CreditCard className="w-5 h-5" />
                <span>Effectuer un paiement</span>
              </AnimatedButton>
              
              <AnimatedButton className="p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-3">
                <Calendar className="w-5 h-5" />
                <span>Voir le planning</span>
              </AnimatedButton>
              
              <AnimatedButton className="p-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center space-x-3">
                <FileText className="w-5 h-5" />
                <span>Télécharger factures</span>
              </AnimatedButton>
            </div>
          </AnimatedCard>
        </main>
      </div>
    </AnimatedPage>
  );
};

export default ParentDashboard;

