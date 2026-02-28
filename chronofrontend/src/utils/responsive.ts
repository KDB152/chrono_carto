// Utilitaires responsive pour tous les dashboards

export const getResponsiveClasses = (screenWidth: number) => {
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024 && screenWidth < 1440;
  const isLargeDesktop = screenWidth >= 1440;

  return {
    // Sidebar
    sidebar: isMobile ? 'w-full' : isTablet ? 'w-64' : 'w-80',
    sidebarCollapsed: isMobile ? 'w-0' : 'w-20',
    
    // Content
    content: isMobile ? 'ml-0 pt-16' : isTablet ? 'ml-64' : 'ml-80',
    
    // Grid
    grid: isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : isDesktop ? 'grid-cols-3' : 'grid-cols-4',
    
    // Cards
    card: isMobile ? 'p-4 text-sm' : isTablet ? 'p-6 text-base' : 'p-8 text-lg',
    
    // Spacing
    spacing: isMobile ? 'space-y-4 p-4' : isTablet ? 'space-y-6 p-6' : 'space-y-8 p-8',
    
    // Text
    text: isMobile ? 'text-sm' : isTablet ? 'text-base' : isDesktop ? 'text-lg' : 'text-xl',
    
    // Buttons
    button: isMobile ? 'px-3 py-2 text-sm' : isTablet ? 'px-4 py-2 text-base' : 'px-6 py-3 text-lg',
    
    // Forms
    form: isMobile ? 'space-y-4' : isTablet ? 'space-y-6' : 'space-y-8',
    
    // Navigation
    nav: isMobile ? 'flex-col space-y-2' : 'flex-row space-x-4 space-y-0',
    
    // Breakpoints
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop
  };
};

export const applyResponsiveClasses = (element: HTMLElement, screenWidth: number) => {
  const classes = getResponsiveClasses(screenWidth);
  
  // Appliquer les classes responsive
  element.classList.add('responsive-auto');
  
  // Classes spécifiques selon la taille d'écran
  if (classes.isMobile) {
    element.classList.add('responsive-mobile');
  } else if (classes.isTablet) {
    element.classList.add('responsive-tablet');
  } else if (classes.isDesktop) {
    element.classList.add('responsive-desktop');
  } else {
    element.classList.add('responsive-large');
  }
};

// Hook pour détecter la taille d'écran
export const useScreenSize = () => {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};
