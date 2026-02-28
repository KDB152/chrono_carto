// Messages d'erreur centralisés et traduits en français
// Tous les messages sont conçus pour être compréhensibles par un utilisateur normal

export const ERROR_MESSAGES = {
  // Messages d'authentification
  AUTH: {
    SESSION_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',
    INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
    ACCOUNT_NOT_FOUND: 'Compte utilisateur introuvable',
    UNAUTHORIZED: 'Vous devez être connecté pour effectuer cette action',
    FORBIDDEN: 'Vous n\'avez pas les droits pour effectuer cette action',
    CONNECTION_ERROR: 'Impossible de se connecter. Vérifiez votre connexion internet.',
    SERVER_ERROR: 'Une erreur est survenue. Veuillez réessayer.',
  },

  // Messages de validation de formulaire
  VALIDATION: {
    REQUIRED: {
      FIRST_NAME: 'Le prénom est obligatoire',
      LAST_NAME: 'Le nom est obligatoire',
      EMAIL: 'L\'adresse email est obligatoire',
      PASSWORD: 'Le mot de passe est obligatoire',
      CONFIRM_PASSWORD: 'Veuillez confirmer votre mot de passe',
      PHONE: 'Le numéro de téléphone est obligatoire',
      BIRTH_DATE: 'La date de naissance est obligatoire',
      CLASS: 'La classe est obligatoire',
      ROLE: 'Veuillez choisir un type de compte',
      PARENT_PHONE: 'Le numéro de téléphone du parent est obligatoire',
    },
    INVALID: {
      EMAIL: 'L\'adresse email n\'est pas valide',
      PHONE: 'Le numéro de téléphone n\'est pas valide',
      PASSWORD_LENGTH: 'Le mot de passe doit contenir au moins 8 caractères',
      PASSWORD_STRENGTH: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
      PASSWORD_MISMATCH: 'Les mots de passe ne correspondent pas',
      NAME_FORMAT: 'Le nom ne peut contenir que des lettres (2 à 50 caractères)',
      CLASS_SELECTION: 'Veuillez sélectionner une classe valide',
      ROLE_SELECTION: 'Type de compte non valide',
    },
    TERMS: 'Vous devez accepter les conditions d\'utilisation',
  },

  // Messages d'inscription et de compte
  ACCOUNT: {
    REGISTRATION_FAILED: 'Impossible de créer votre compte. Veuillez réessayer.',
    REGISTRATION_SUCCESS: 'Votre compte a été créé avec succès. Vérifiez votre email pour l\'activer.',
    EMAIL_VERIFICATION_REQUIRED: 'Veuillez vérifier votre adresse email pour activer votre compte',
    ACCOUNT_ALREADY_EXISTS: 'Un compte existe déjà avec cette adresse email',
    PASSWORD_RESET_FAILED: 'Impossible de réinitialiser le mot de passe. Veuillez réessayer.',
    PASSWORD_RESET_SUCCESS: 'Mot de passe réinitialisé avec succès',
    PASSWORD_CHANGE_FAILED: 'Impossible de changer le mot de passe. Veuillez réessayer.',
    PASSWORD_CHANGE_SUCCESS: 'Mot de passe modifié avec succès',
  },

  // Messages de réinitialisation de mot de passe
  PASSWORD_RESET: {
    EMAIL_REQUIRED: 'Veuillez saisir votre adresse email',
    CODE_REQUIRED: 'Veuillez saisir le code à 6 chiffres reçu par email',
    CODE_INVALID: 'Le code saisi est incorrect. Vérifiez votre email.',
    LINK_INVALID: 'Le lien de réinitialisation est invalide',
    LINK_EXPIRED: 'Ce lien de réinitialisation n\'est plus valide',
    SEND_CODE_FAILED: 'Impossible d\'envoyer le code. Vérifiez votre adresse email.',
    SEND_LINK_FAILED: 'Impossible d\'envoyer le lien. Vérifiez votre adresse email.',
    RESET_FAILED: 'Impossible de réinitialiser le mot de passe. Veuillez réessayer.',
    RESET_SUCCESS: 'Mot de passe réinitialisé avec succès',
  },

  // Messages de profil et données utilisateur
  PROFILE: {
    LOAD_FAILED: 'Impossible de charger vos informations. Veuillez réessayer.',
    SAVE_FAILED: 'Impossible de sauvegarder vos informations. Veuillez réessayer.',
    UPDATE_SUCCESS: 'Vos informations ont été mises à jour avec succès',
    STUDENT_LOAD_FAILED: 'Impossible de charger les informations de l\'élève. Veuillez réessayer.',
    STUDENT_SAVE_FAILED: 'Impossible de sauvegarder les informations de l\'élève. Veuillez réessayer.',
    PARENT_LOAD_FAILED: 'Impossible de charger les informations du parent. Veuillez réessayer.',
    PARENT_SAVE_FAILED: 'Impossible de sauvegarder les informations du parent. Veuillez réessayer.',
  },

  // Messages de rendez-vous
  RENDEZ_VOUS: {
    NOT_FOUND: 'Le rendez-vous demandé n\'existe pas',
    LOAD_FAILED: 'Impossible de charger les rendez-vous. Veuillez réessayer.',
    UPDATE_FAILED: 'Impossible de modifier le rendez-vous. Veuillez réessayer.',
    DELETE_FAILED: 'Impossible de supprimer le rendez-vous. Veuillez réessayer.',
    CREATE_FAILED: 'Impossible de créer le rendez-vous. Veuillez réessayer.',
    ADMIN_ONLY_MODIFY: 'Seuls les administrateurs peuvent modifier les rendez-vous',
    ADMIN_ONLY_DELETE: 'Seuls les administrateurs peuvent supprimer les rendez-vous',
  },

  // Messages d'enfants et parents
  CHILDREN: {
    PARENT_ID_REQUIRED: 'L\'identifiant du parent est obligatoire',
    NOT_FOUND: 'Aucun parent trouvé ou aucun enfant associé à ce compte',
    LOAD_FAILED: 'Impossible de charger les informations des enfants. Veuillez réessayer.',
  },

  // Messages génériques
  GENERIC: {
    LOADING: 'Chargement en cours...',
    SAVING: 'Sauvegarde en cours...',
    SUCCESS: 'Opération réussie',
    RETRY: 'Réessayer',
    CANCEL: 'Annuler',
    CLOSE: 'Fermer',
    CONFIRM: 'Confirmer',
    DELETE: 'Supprimer',
    EDIT: 'Modifier',
    SAVE: 'Sauvegarder',
    BACK: 'Retour',
    NEXT: 'Suivant',
    PREVIOUS: 'Précédent',
  },

  // Messages de système
  SYSTEM: {
    MAINTENANCE: 'Le système est en maintenance. Veuillez réessayer plus tard.',
    UNAVAILABLE: 'Service temporairement indisponible',
    TIMEOUT: 'La requête a pris trop de temps. Veuillez réessayer.',
    NETWORK_ERROR: 'Problème de connexion réseau. Vérifiez votre connexion internet.',
  },
} as const;

// Fonction utilitaire pour obtenir un message d'erreur avec fallback
export const getErrorMessage = (key: string, fallback?: string): string => {
  const keys = key.split('.');
  let message: any = ERROR_MESSAGES;
  
  for (const k of keys) {
    if (message && typeof message === 'object' && k in message) {
      message = message[k];
    } else {
      return fallback || 'Une erreur est survenue';
    }
  }
  
  return typeof message === 'string' ? message : (fallback || 'Une erreur est survenue');
};

// Fonction pour formater les messages d'erreur avec des paramètres
export const formatErrorMessage = (message: string, ...params: string[]): string => {
  return message.replace(/\{(\d+)\}/g, (match, index) => {
    return params[parseInt(index)] || match;
  });
};

