'use client';

import { useState, useEffect } from 'react';

interface TimeDisplayProps {
  className?: string;
}

export default function TimeDisplay({ className = '' }: TimeDisplayProps) {
  const [time, setTime] = useState<string>('--:--');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Attendre que le composant soit monté côté client
    setMounted(true);
    
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      setTime(timeString);
    };

    // Mettre à jour immédiatement
    updateTime();
    
    // Puis mettre à jour toutes les secondes
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return <span className={className}>{time}</span>;
}
