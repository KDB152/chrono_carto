'use client';

import Script from 'next/script';

const GlobalConsoleScript = () => {
  return (
    <Script
      id="global-console-protection"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            // Afficher STOP immédiatement
            console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
            console.log('%cLes outils de développement sont interdits!', 'color: red; font-size: 20px;');
            console.log('%cCette page est protégée contre l\\'inspection', 'color: orange; font-size: 16px;');
            
            // Afficher STOP toutes les secondes
            setInterval(function() {
              console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
              console.log('%cOutils de développement interdits', 'color: red; font-size: 20px;');
            }, 1000);
            
            // Détecter l'ouverture des DevTools
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
            
            // Afficher STOP lors du focus
            window.addEventListener('focus', function() {
              console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
              console.log('%cFocus sur la page - Outils interdits', 'color: red; font-size: 20px;');
            });
            
            // Afficher STOP lors du redimensionnement
            window.addEventListener('resize', function() {
              console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
              console.log('%cRedimensionnement détecté - Outils interdits', 'color: red; font-size: 20px;');
            });
          })();
        `,
      }}
    />
  );
};

export default GlobalConsoleScript;
