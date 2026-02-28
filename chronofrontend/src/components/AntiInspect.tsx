'use client';

import { useEffect } from 'react';

// ==========================================
// PROTECTION GLOBALE DE LA CONSOLE 
// S'exécute immédiatement avant même que React ne monte l'application
// ==========================================
if (typeof window !== 'undefined') {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;
    const originalClear = console.clear;
    const originalDebug = console.debug;

    const showConsoleWarning = () => {
        try {
            // Nettoyer la console de tous les logs précédents
            originalClear();

            // Style massif rouge "Stop !" en utilisant l'originalLog
            originalLog(
                '%cStop !',
                'color: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;'
            );

            // Trait de séparation
            originalLog('%c____________________________________________________________', 'color: #888');

            // Message complet Facebook-like
            originalLog(
                "%cIl s'agit d'une fonctionnalité de navigateur conçue pour les développeurs. Si quelqu'un vous a invité(e) à copier-coller quelque chose ici pour activer une fonctionnalité ou soit-disant pirater le compte d'un tiers, sachez que c'est une escroquerie permettant à cette personne d'accéder à votre compte.",
                'font-size: 16px; font-family: sans-serif;'
            );
        } catch (e) { }
    };

    // On remplace les méthodes par des fonctions vides pour tout le site
    console.log = function () { };
    console.warn = function () { };
    console.error = function () { };
    console.info = function () { };
    console.debug = function () { };
    console.clear = function () { };

    if (window.console) {
        window.console.log = function () { };
        window.console.warn = function () { };
        window.console.error = function () { };
        window.console.info = function () { };
        window.console.debug = function () { };
    }

    // Affichage asynchrone pour être sûr que c'est affiché en dernier
    setTimeout(showConsoleWarning, 100);
    setTimeout(showConsoleWarning, 2000);
}

export default function AntiInspect() {
    useEffect(() => {
        // 1. Désactiver le clic droit
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // 2. Bloquer les raccourcis clavier DevTools communs
        const handleKeyDown = (e: KeyboardEvent) => {
            // F12
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }

            // Ctrl+Shift+I (Outils de dev)
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                return false;
            }

            // Ctrl+Shift+J (Console)
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
                return false;
            }

            // Ctrl+U / Cmd+Option+U (Code source)
            if (
                (e.ctrlKey && e.key === 'U') ||
                (e.ctrlKey && e.key === 'u') ||
                (e.metaKey && e.altKey && e.key === 'U')
            ) {
                e.preventDefault();
                return false;
            }
        };

        // Attacher les écouteurs d'événements
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return null;
}
