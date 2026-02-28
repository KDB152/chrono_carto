'use client';

import React, { useEffect } from 'react';

const F12Detector: React.FC = () => {
  useEffect(() => {
    // Script simple pour afficher STOP dans la console sur TOUTES les pages
    const protectionScript = `
      (function() {
        // Afficher STOP immédiatement dans la console
        console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
        console.log('%cLes outils de développement sont interdits!', 'color: red; font-size: 20px;');
        console.log('%cCette page est protégée contre l\'inspection', 'color: orange; font-size: 16px;');
        
        // Afficher STOP toutes les 2 secondes pour être sûr
        setInterval(function() {
          console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
          console.log('%cOutils de développement interdits', 'color: red; font-size: 20px;');
        }, 2000);
        
        // Afficher STOP quand la console est ouverte
        let devtools = false;
        const threshold = 160;
        
        setInterval(function() {
          if (window.outerHeight - window.innerHeight > threshold || 
              window.outerWidth - window.innerWidth > threshold) {
            if (!devtools) {
              devtools = true;
              console.clear();
              console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
              console.log('%cLes outils de développement sont interdits!', 'color: red; font-size: 20px;');
              console.log('%cFermez les outils de développement maintenant!', 'color: orange; font-size: 16px;');
            }
          } else {
            devtools = false;
          }
        }, 500);
        
        // Afficher STOP au chargement de chaque page
        window.addEventListener('load', function() {
          console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
          console.log('%cPage chargée - Outils interdits', 'color: red; font-size: 20px;');
        });
        
        // Afficher STOP lors de la navigation
        window.addEventListener('popstate', function() {
          console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
          console.log('%cNavigation détectée - Outils interdits', 'color: red; font-size: 20px;');
        });
      })();
    `;
    
    // Injecter le script
    const script = document.createElement('script');
    script.textContent = protectionScript;
    document.head.appendChild(script);

    // Nettoyer le script
    return () => {
      const scripts = document.querySelectorAll('script');
      scripts.forEach(s => {
        if (s.textContent && s.textContent.includes('STOP!')) {
          s.remove();
        }
      });
    };
  }, []);

  return null; // Pas d'affichage visuel, seulement dans la console
};

export default F12Detector;
