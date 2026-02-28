// Utilitaires d'authentification
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  // Chercher d'abord 'accessToken' (utilisé par la page de connexion)
  // puis 'token' (utilisé par d'autres composants)
  return localStorage.getItem('accessToken') || localStorage.getItem('token');
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  // Sauvegarder dans les deux clés pour assurer la compatibilité
  localStorage.setItem('accessToken', token);
  localStorage.setItem('token', token);
};

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  // Supprimer les deux clés pour assurer la compatibilité
  localStorage.removeItem('accessToken');
  localStorage.removeItem('token');
};

export const isTokenValid = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    // Décoder le token JWT pour vérifier l'expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch {
    return false;
  }
};

export const redirectToLogin = (): void => {
  if (typeof window === 'undefined') return;
  window.location.href = '/login';
};

export const checkAuthAndRedirect = (): boolean => {
  if (!isTokenValid()) {
    // Ne pas rediriger automatiquement, juste retourner false
    return false;
  }
  return true;
};

export const checkAuthAndRedirectWithMessage = (): boolean => {
  if (!isTokenValid()) {
    // Afficher un message d'erreur au lieu de rediriger
    if (typeof window !== 'undefined') {
      alert('Session expirée. Veuillez vous reconnecter.');
      removeAuthToken();
      redirectToLogin();
    }
    return false;
  }
  return true;
};

