/**
 * Protection globale de la console
 * S'exécute sur toutes les pages pour afficher STOP dans la console
 */

// Fonction pour afficher STOP dans la console
const displayStopMessage = () => {
  console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
  console.log('%cLes outils de développement sont interdits!', 'color: red; font-size: 20px;');
  console.log('%cCette page est protégée contre l\'inspection', 'color: orange; font-size: 16px;');
};

// Fonction pour détecter l'ouverture des DevTools
const detectDevTools = () => {
  let devtools = false;
  const threshold = 160;
  
  setInterval(() => {
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
      if (!devtools) {
        devtools = true;
        console.clear();
        displayStopMessage();
        console.log('%cFermez les outils de développement maintenant!', 'color: orange; font-size: 16px;');
      }
    } else {
      devtools = false;
    }
  }, 500);
};

// Fonction pour afficher STOP périodiquement
const periodicStopMessage = () => {
  setInterval(() => {
    console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
    console.log('%cOutils de développement interdits', 'color: red; font-size: 20px;');
  }, 3000);
};

// Fonction pour afficher STOP lors des événements
const addEventListeners = () => {
  // Au chargement de la page
  window.addEventListener('load', () => {
    displayStopMessage();
    console.log('%cPage chargée - Outils interdits', 'color: red; font-size: 20px;');
  });

  // Lors de la navigation
  window.addEventListener('popstate', () => {
    displayStopMessage();
    console.log('%cNavigation détectée - Outils interdits', 'color: red; font-size: 20px;');
  });

  // Lors du focus sur la page
  window.addEventListener('focus', () => {
    displayStopMessage();
    console.log('%cFocus sur la page - Outils interdits', 'color: red; font-size: 20px;');
  });

  // Lors du redimensionnement
  window.addEventListener('resize', () => {
    displayStopMessage();
    console.log('%cRedimensionnement détecté - Outils interdits', 'color: red; font-size: 20px;');
  });
};

// Fonction principale d'initialisation
export const initGlobalConsoleProtection = () => {
  // Afficher STOP immédiatement
  displayStopMessage();
  
  // Démarrer la détection des DevTools
  detectDevTools();
  
  // Démarrer les messages périodiques
  periodicStopMessage();
  
  // Ajouter les écouteurs d'événements
  addEventListeners();
  
  // Afficher STOP toutes les secondes pour être sûr
  setInterval(() => {
    console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
  }, 1000);
};

// Exécuter immédiatement si on est côté client
if (typeof window !== 'undefined') {
  initGlobalConsoleProtection();
}
