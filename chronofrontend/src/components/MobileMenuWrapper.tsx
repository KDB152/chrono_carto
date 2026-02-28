'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

interface MobileMenuWrapperProps {
  children: React.ReactNode;
  sidebarContent: React.ReactNode;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  sidebarCollapsed?: boolean;
  className?: string;
}

/**
 * Composant wrapper pour gérer le menu mobile sur tous les dashboards
 */
export default function MobileMenuWrapper({
  children,
  sidebarContent,
  sidebarOpen,
  onSidebarToggle,
  sidebarCollapsed = false,
  className = ''
}: MobileMenuWrapperProps) {
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

  const handleMobileToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleCloseMobile = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className={className}>
      {/* Overlay mobile */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleCloseMobile}
        />
      )}

      {/* Bouton hamburger mobile */}
      <button
        onClick={handleMobileToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-900/90 backdrop-blur-md rounded-lg text-white hover:bg-blue-800 transition-all shadow-lg"
        aria-label="Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar avec gestion mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${
        isMobile 
          ? (mobileMenuOpen ? 'translate-x-0' : '-translate-x-full') 
          : (sidebarCollapsed ? 'w-20' : 'w-80')
      } ${isMobile ? 'w-80 max-w-[85vw]' : ''}`}>
        <div className="h-full relative">
          {/* Bouton fermer sur mobile */}
          {isMobile && mobileMenuOpen && (
            <button
              onClick={handleCloseMobile}
              className="absolute top-4 right-4 p-2 bg-blue-800/50 text-white rounded-lg hover:bg-blue-700/50 transition-all z-10"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {sidebarContent}
        </div>
      </div>

      {/* Contenu principal */}
      <div className={`transition-all duration-300 ${
        isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-20' : 'ml-80')
      }`}>
        {children}
      </div>
    </div>
  );
}

