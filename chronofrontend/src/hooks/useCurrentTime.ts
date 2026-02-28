import { useState, useEffect } from 'react';

export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Marquer comme monté côté client
    setMounted(true);
    
    // Initialiser l'heure
    setCurrentTime(new Date());
    
    // Timer pour mettre à jour l'heure
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return {
    currentTime,
    mounted,
    timeString: currentTime ? currentTime.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) : '--:--',
    dateString: currentTime ? currentTime.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }) : 'Chargement...',
    greeting: currentTime ? (() => {
      const hour = currentTime.getHours();
      if (hour < 12) return 'Bonjour';
      if (hour < 18) return 'Bon après-midi';
      return 'Bonsoir';
    })() : 'Bonjour'
  };
}
