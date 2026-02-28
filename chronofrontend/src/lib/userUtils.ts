export interface UserDetails {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  username?: string;
  avatar?: string;
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  class?: string;
  school?: string;
}

export const getUserDetails = (): UserDetails | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userDetails = localStorage.getItem('userDetails');
    if (!userDetails) return null;
    
    return JSON.parse(userDetails);
  } catch (error) {
    console.error('Erreur lors de la récupération des détails utilisateur:', error);
    return null;
  }
};

export const getCurrentUserName = (): string => {
  const user = getUserDetails();
  if (!user) return 'Utilisateur';
  
  return user.firstName || user.username || 'Utilisateur';
};

export const getCurrentUserFullName = (): string => {
  const user = getUserDetails();
  if (!user) return 'Utilisateur';
  
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (user.username) {
    return user.username;
  }
  
  return 'Utilisateur';
};

export const getCurrentUserInitials = (): string => {
  const user = getUserDetails();
  if (!user) return 'U';
  
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  } else if (firstName) {
    return firstName.charAt(0).toUpperCase();
  } else if (user.username) {
    return user.username.charAt(0).toUpperCase();
  }
  
  return 'U';
};

export const isUserLoggedIn = (): boolean => {
  return getUserDetails() !== null;
};

// Fonctions pour gérer les noms des enfants de manière dynamique
export const getChildName = (childId: string): string => {
  // En production, cela devrait venir de l'API
  // Pour l'instant, on utilise des noms génériques
  const childNames: Record<string, string> = {
    'child-1': 'Enfant 1',
    'child-2': 'Enfant 2',
    'child-3': 'Enfant 3',
  };
  
  return childNames[childId] || 'Enfant';
};

export const getChildFullName = (childId: string): string => {
  const childNames: Record<string, string> = {
    'child-1': 'Enfant 1',
    'child-2': 'Enfant 2',
    'child-3': 'Enfant 3',
  };
  
  return childNames[childId] || 'Enfant';
};

export const getTeacherName = (): string => {
  // En production, cela devrait venir de l'API
  return 'Professeur';
};

export const getSchoolName = (): string => {
  // En production, cela devrait venir de l'API
  return 'École';
};

export const getParentName = (): string => {
  const user = getUserDetails();
  if (!user) return 'Parent';
  
  return user.firstName || 'Parent';
};

// Fonction pour générer des noms d'utilisateurs génériques
export const getGenericUserName = (index: number): string => {
  const names = ['Utilisateur', 'Élève', 'Parent', 'Professeur', 'Administrateur'];
  return `${names[index % names.length]} ${Math.floor(index / names.length) + 1}`;
};

