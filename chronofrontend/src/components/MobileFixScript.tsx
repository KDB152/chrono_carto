'use client';

import { useEffect } from 'react';

/**
 * Script pour corriger l'affichage mobile
 * S'exécute côté client pour ajuster les classes CSS dynamiquement
 */
export default function MobileFixScript() {
  useEffect(() => {
    const fixMobileLayout = () => {
      if (typeof window === 'undefined') return;
      
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        // Enlever toutes les marges gauche causées par les sidebars
        const elementsWithMargin = document.querySelectorAll('[class*="ml-"]');
        elementsWithMargin.forEach((el) => {
          if (el instanceof HTMLElement) {
            // Forcer margin-left à 0 via style inline (priorité maximale)
            el.style.setProperty('margin-left', '0', 'important');
            el.style.setProperty('margin-inline-start', '0', 'important');
          }
        });

        // Cacher toutes les sidebars fixes
        const sidebars = document.querySelectorAll(
          '.fixed.inset-y-0.left-0, [class*="fixed"][class*="inset-y-0"][class*="left-0"]'
        );
        sidebars.forEach((sidebar) => {
          if (sidebar instanceof HTMLElement) {
            sidebar.style.setProperty('display', 'none', 'important');
            sidebar.style.setProperty('width', '0', 'important');
            sidebar.style.setProperty('visibility', 'hidden', 'important');
            sidebar.style.setProperty('opacity', '0', 'important');
            sidebar.style.setProperty('pointer-events', 'none', 'important');
          }
        });

        // Forcer le contenu principal à prendre toute la largeur
        const mainContent = document.querySelectorAll(
          '.flex.flex-col.min-h-screen, .flex.min-h-screen:not(.fixed), div[class*="flex"][class*="min-h-screen"]:not([class*="fixed"])'
        );
        mainContent.forEach((content) => {
          if (content instanceof HTMLElement) {
            content.style.setProperty('margin-left', '0', 'important');
            content.style.setProperty('width', '100%', 'important');
            content.style.setProperty('max-width', '100%', 'important');
          }
        });

        // Forcer le body et html à ne pas déborder
        document.body.style.setProperty('overflow-x', 'hidden', 'important');
        document.documentElement.style.setProperty('overflow-x', 'hidden', 'important');
      }
    };

    // Exécuter immédiatement
    fixMobileLayout();

    // Exécuter après un court délai
    const timeout1 = setTimeout(fixMobileLayout, 100);
    const timeout2 = setTimeout(fixMobileLayout, 500);
    const timeout3 = setTimeout(fixMobileLayout, 1000);

    // Exécuter lors du redimensionnement
    window.addEventListener('resize', fixMobileLayout);

    // Observer les changements du DOM
    const observer = new MutationObserver(() => {
      fixMobileLayout();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      window.removeEventListener('resize', fixMobileLayout);
      observer.disconnect();
    };
  }, []);

  return null;
}

