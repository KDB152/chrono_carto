'use client';

import { useEffect, useState } from 'react';

/**
 * Composant wrapper pour améliorer le responsive sur tous les appareils
 */
export default function ResponsiveWrapper({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);

      // Détecter iOS
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      setIsIOS(isIOSDevice);

      // Détecter Safari
      const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      setIsSafari(isSafariBrowser);

      // Ajouter des classes au body pour le styling
      document.body.classList.toggle('is-mobile', width < 768);
      document.body.classList.toggle('is-tablet', width >= 768 && width < 1024);
      document.body.classList.toggle('is-desktop', width >= 1024);
      document.body.classList.toggle('is-ios', isIOSDevice);
      document.body.classList.toggle('is-safari', isSafariBrowser);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    // Fix pour le viewport sur iOS
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const setViewportHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };
      setViewportHeight();
      window.addEventListener('resize', setViewportHeight);
      window.addEventListener('orientationchange', setViewportHeight);

      return () => {
        window.removeEventListener('resize', checkDevice);
        window.removeEventListener('orientationchange', checkDevice);
        window.removeEventListener('resize', setViewportHeight);
        window.removeEventListener('orientationchange', setViewportHeight);
      };
    }

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return <>{children}</>;
}

