import React from 'react';

// Fonction pour détecter les URLs dans le texte
const urlRegex = /(https?:\/\/[^\s]+)/g;

// Fonction pour détecter les emails dans le texte
const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

// Fonction pour détecter les numéros de téléphone dans le texte
const phoneRegex = /(\+?[0-9\s\-\(\)]{10,})/g;

interface LinkDetectionOptions {
  className?: string;
  target?: '_blank' | '_self';
  rel?: string;
}

/**
 * Convertit le texte en éléments React avec des liens cliquables
 * @param text - Le texte à traiter
 * @param options - Options pour les liens
 * @returns Éléments React avec des liens cliquables
 */
export const renderTextWithLinks = (
  text: string, 
  options: LinkDetectionOptions = {}
): React.ReactNode => {
  const { className = '', target = '_blank', rel = 'noopener noreferrer' } = options;
  
  if (!text) return text;

  // Diviser le texte en parties (URLs, emails, téléphones, texte normal)
  const parts: Array<{ type: 'text' | 'url' | 'email' | 'phone'; content: string; index: number }> = [];
  let lastIndex = 0;

  // Trouver toutes les URLs
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
        index: lastIndex
      });
    }
    parts.push({
      type: 'url',
      content: match[0],
      index: match.index
    });
    lastIndex = match.index + match[0].length;
  }

  // Ajouter le texte restant
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
      index: lastIndex
    });
  }

  // Si aucune URL trouvée, chercher les emails
  if (parts.length === 1 && parts[0].type === 'text') {
    const emailParts: Array<{ type: 'text' | 'email'; content: string; index: number }> = [];
    lastIndex = 0;
    
    while ((match = emailRegex.exec(parts[0].content)) !== null) {
      if (match.index > lastIndex) {
        emailParts.push({
          type: 'text',
          content: parts[0].content.slice(lastIndex, match.index),
          index: lastIndex
        });
      }
      emailParts.push({
        type: 'email',
        content: match[0],
        index: match.index
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < parts[0].content.length) {
      emailParts.push({
        type: 'text',
        content: parts[0].content.slice(lastIndex),
        index: lastIndex
      });
    }

    // Si des emails trouvés, remplacer les parts
    if (emailParts.length > 1) {
      parts.length = 0;
      emailParts.forEach(part => {
        parts.push({
          type: part.type,
          content: part.content,
          index: part.index
        });
      });
    }
  }

  // Si toujours pas de liens, chercher les téléphones
  if (parts.length === 1 && parts[0].type === 'text') {
    const phoneParts: Array<{ type: 'text' | 'phone'; content: string; index: number }> = [];
    lastIndex = 0;
    
    while ((match = phoneRegex.exec(parts[0].content)) !== null) {
      if (match.index > lastIndex) {
        phoneParts.push({
          type: 'text',
          content: parts[0].content.slice(lastIndex, match.index),
          index: lastIndex
        });
      }
      phoneParts.push({
        type: 'phone',
        content: match[0],
        index: match.index
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < parts[0].content.length) {
      phoneParts.push({
        type: 'text',
        content: parts[0].content.slice(lastIndex),
        index: lastIndex
      });
    }

    // Si des téléphones trouvés, remplacer les parts
    if (phoneParts.length > 1) {
      parts.length = 0;
      phoneParts.forEach(part => {
        parts.push({
          type: part.type,
          content: part.content,
          index: part.index
        });
      });
    }
  }

  // Rendre les éléments
  return parts.map((part, index) => {
    switch (part.type) {
      case 'url':
        return (
          <a
            key={index}
            href={part.content}
            target={target}
            rel={rel}
            className={`text-blue-400 hover:text-blue-300 underline transition-colors ${className}`}
            onClick={(e) => {
              // Vérifier si c'est un lien externe
              try {
                const url = new URL(part.content);
                if (url.protocol === 'http:' || url.protocol === 'https:') {
                  // Lien externe - ouvrir dans un nouvel onglet
                  e.preventDefault();
                  window.open(part.content, target);
                }
              } catch {
                // URL invalide, laisser le comportement par défaut
              }
            }}
          >
            {part.content}
          </a>
        );
      
      case 'email':
        return (
          <a
            key={index}
            href={`mailto:${part.content}`}
            className={`text-green-400 hover:text-green-300 underline transition-colors ${className}`}
          >
            {part.content}
          </a>
        );
      
      case 'phone':
        return (
          <a
            key={index}
            href={`tel:${part.content.replace(/\s/g, '')}`}
            className={`text-purple-400 hover:text-purple-300 underline transition-colors ${className}`}
          >
            {part.content}
          </a>
        );
      
      default:
        return <span key={index}>{part.content}</span>;
    }
  });
};

/**
 * Composant React pour afficher du texte avec des liens cliquables
 */
export const TextWithLinks: React.FC<{
  text: string;
  className?: string;
  linkClassName?: string;
  target?: '_blank' | '_self';
  rel?: string;
}> = ({ text, className = '', linkClassName = '', target = '_blank', rel = 'noopener noreferrer' }) => {
  return (
    <span className={className}>
      {renderTextWithLinks(text, { className: linkClassName, target, rel })}
    </span>
  );
};

/**
 * Fonction utilitaire pour vérifier si un texte contient des liens
 */
export const hasLinks = (text: string): boolean => {
  return urlRegex.test(text) || emailRegex.test(text) || phoneRegex.test(text);
};

/**
 * Fonction utilitaire pour extraire tous les liens d'un texte
 */
export const extractLinks = (text: string): Array<{ type: 'url' | 'email' | 'phone'; content: string }> => {
  const links: Array<{ type: 'url' | 'email' | 'phone'; content: string }> = [];
  
  // URLs
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    links.push({ type: 'url', content: match[0] });
  }
  
  // Emails
  while ((match = emailRegex.exec(text)) !== null) {
    links.push({ type: 'email', content: match[0] });
  }
  
  // Téléphones
  while ((match = phoneRegex.exec(text)) !== null) {
    links.push({ type: 'phone', content: match[0] });
  }
  
  return links;
};

