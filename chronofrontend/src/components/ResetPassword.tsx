// ResetPassword.tsx - Composant pour la réinitialisation directe par lien
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './ForgotPassword.css'; // Réutilise les mêmes styles

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
      setTokenValid(true);
    } else {
      setError('Token de réinitialisation manquant');
      setTimeout(() => navigate('/forgot-password'), 3000);
    }
  }, [searchParams, navigate]);

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumbers
    };
  };

  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setError('Le mot de passe ne respecte pas les critères de sécurité');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Erreur lors de la réinitialisation');
        if (response.status === 400) {
          // Token expiré ou invalide
          setTimeout(() => {
            navigate('/forgot-password');
          }, 3000);
        }
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(newPassword);

  if (!tokenValid) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="logo">
            <h1>Chrono Carto</h1>
          </div>
          <h2>Lien invalide</h2>
          <p className="error-message">
            Le lien de réinitialisation est invalide ou manquant.
            Vous allez être redirigé vers la page de récupération de mot de passe.
          </p>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="success-icon">✓</div>
          <h2>Mot de passe réinitialisé !</h2>
          <p className="success-message">{message}</p>
          <p>Vous allez être redirigé vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="logo">
          <h1>Chrono Carto</h1>
        </div>

        <h2>Nouveau mot de passe</h2>
        <p className="subtitle">
          Choisissez un nouveau mot de passe sécurisé pour votre compte
        </p>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="newPassword">Nouveau mot de passe</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Saisissez votre nouveau mot de passe"
              required
            />
            
            {newPassword && (
              <div className="password-requirements">
                <div className={`requirement ${passwordValidation.hasMinLength ? 'valid' : 'invalid'}`}>
                  {passwordValidation.hasMinLength ? '✓' : '✗'} Au moins 8 caractères
                </div>
                <div className={`requirement ${passwordValidation.hasUpperCase ? 'valid' : 'invalid'}`}>
                  {passwordValidation.hasUpperCase ? '✓' : '✗'} Une majuscule
                </div>
                <div className={`requirement ${passwordValidation.hasLowerCase ? 'valid' : 'invalid'}`}>
                  {passwordValidation.hasLowerCase ? '✓' : '✗'} Une minuscule
                </div>
                <div className={`requirement ${passwordValidation.hasNumbers ? 'valid' : 'invalid'}`}>
                  {passwordValidation.hasNumbers ? '✓' : '✗'} Un chiffre
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmez votre nouveau mot de passe"
              required
            />
            
            {confirmPassword && newPassword !== confirmPassword && (
              <div className="error-message" style={{ marginTop: '8px', fontSize: '0.8rem' }}>
                Les mots de passe ne correspondent pas
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button
              type="button"
              onClick={resetPassword}
              disabled={loading || !passwordValidation.isValid || newPassword !== confirmPassword}
              className="primary-button"
            >
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="secondary-button"
            >
              Retour à la connexion
            </button>
          </div>
        </form>

        <div className="mode-switch">
          <p>
            Problème avec ce lien ?{' '}
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="link-button"
            >
              Demander un nouveau lien
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
