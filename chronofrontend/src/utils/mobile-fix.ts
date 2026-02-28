/**
 * Utilitaire pour corriger l'affichage mobile
 * Détecte la taille d'écran et ajuste les classes CSS dynamiquement
 */

export const initMobileFix = () => {
  if (typeof window === 'undefined') return;

  const fixMobileLayout = () => {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Enlever toutes les marges gauche causées par les sidebars
      const elementsWithMargin = document.querySelectorAll('[class*="ml-"]');
      elementsWithMargin.forEach((el) => {
        if (el instanceof HTMLElement) {
          // Enlever les classes ml-* qui causent des problèmes
          const classes = el.className.split(' ');
          const newClasses = classes.filter(
            (cls) => !cls.startsWith('ml-') || cls === 'ml-0'
          );
          el.className = newClasses.join(' ');
          // Forcer margin-left à 0
          el.style.marginLeft = '0';
        }
      });

      // Cacher toutes les sidebars fixes
      const sidebars = document.querySelectorAll(
        '.fixed.inset-y-0.left-0, [class*="fixed"][class*="inset-y-0"][class*="left-0"]'
      );
      sidebars.forEach((sidebar) => {
        if (sidebar instanceof HTMLElement) {
          sidebar.style.display = 'none';
          sidebar.style.width = '0';
          sidebar.style.minWidth = '0';
          sidebar.style.maxWidth = '0';
          sidebar.style.visibility = 'hidden';
          sidebar.style.opacity = '0';
          sidebar.style.pointerEvents = 'none';
        }
      });

      // Forcer le contenu principal à prendre toute la largeur
      const mainContent = document.querySelectorAll(
        '.flex.flex-col.min-h-screen, .flex.min-h-screen:not(.fixed)'
      );
      mainContent.forEach((content) => {
        if (content instanceof HTMLElement) {
          content.style.marginLeft = '0';
          content.style.width = '100%';
          content.style.maxWidth = '100%';
          content.style.paddingLeft = '1rem';
          content.style.paddingRight = '1rem';
        }
      });
    }
  };

  // Exécuter au chargement
  fixMobileLayout();

  // Exécuter lors du redimensionnement
  window.addEventListener('resize', fixMobileLayout);

  // Exécuter après un court délai pour s'assurer que le DOM est chargé
  setTimeout(fixMobileLayout, 100);
  setTimeout(fixMobileLayout, 500);
  setTimeout(fixMobileLayout, 1000);

  // Observer les changements du DOM pour corriger les éléments ajoutés dynamiquement
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
    window.removeEventListener('resize', fixMobileLayout);
    observer.disconnect();
  };
};

