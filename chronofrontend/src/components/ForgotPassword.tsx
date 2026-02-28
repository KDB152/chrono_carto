// ForgotPassword.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

interface ForgotPasswordProps {
  mode?: 'code' | 'link';
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ mode = 'code' }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'password' | 'success'>('email');
  const [resetToken, setResetToken] = useState('');

  // Vérification automatique par token (lien)
  useEffect(() => {
    const token = searchParams.get('token');
    if (token && mode === 'link') {
      setResetToken(token);
      setStep('password');
    }
  }, [searchParams, mode]);

  const sendPasswordResetCode = async () => {
    if (!email) {
      setError('Veuillez saisir votre adresse email');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/auth/send-password-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setStep('code');
      } else {
        setError(data.message || 'Impossible d\'envoyer le code. Vérifiez votre adresse email.');
      }
    } catch (err) {
      setError('Impossible de se connecter. Vérifiez votre connexion internet.');
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordResetLink = async () => {
    if (!email) {
      setError('Veuillez saisir votre adresse email');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/auth/send-password-reset-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || data.success ? 'Un lien de réinitialisation a été envoyé à votre adresse email' : data.message);
        setStep('success');
      } else {
        setError(data.message || 'Impossible d\'envoyer le lien. Vérifiez votre adresse email.');
      }
    } catch (err) {
      setError('Impossible de se connecter. Vérifiez votre connexion internet.');
    } finally {
      setLoading(false);
    }
  };

  const verifyPasswordResetCode = async () => {
    if (!code || code.length !== 6) {
      setError('Veuillez saisir le code à 6 chiffres reçu par email');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/auth/verify-password-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setResetToken(data.resetToken);
        setStep('password');
      } else {
        setError(data.message || 'Le code saisi est incorrect. Vérifiez votre email.');
      }
    } catch (err) {
      setError('Impossible de se connecter. Vérifiez votre connexion internet.');
    } finally {
      setLoading(false);
    }
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
          token: resetToken, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setStep('success');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Impossible de réinitialiser le mot de passe. Veuillez réessayer.');
      }
    } catch (err) {
      setError('Impossible de se connecter. Vérifiez votre connexion internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (value: string) => {
    // Permettre seulement les chiffres et limiter à 6 caractères
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
  };

  const resendCode = () => {
    setStep('email');
    setCode('');
    setMessage('');
    setError('');
  };

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

  const passwordValidation = validatePassword(newPassword);

  if (step === 'success') {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="success-icon">✓</div>
          <h2>
            {mode === 'link' && !resetToken 
              ? 'Lien envoyé !' 
              : 'Mot de passe réinitialisé !'
            }
          </h2>
          <p className="success-message">{message}</p>
          {resetToken && (
            <p>Vous allez être redirigé vers la page de connexion...</p>
          )}
          {!resetToken && (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="primary-button"
            >
              Retour à la connexion
            </button>
          )}
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

        {step === 'email' && (
          <>
            <h2>Mot de passe oublié</h2>
            <p className="subtitle">
              {mode === 'code' 
                ? 'Saisissez votre email pour recevoir un code de réinitialisation'
                : 'Saisissez votre email pour recevoir un lien de réinitialisation'
              }
            </p>

            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label htmlFor="email">Adresse email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}
              {message && <div className="success-message">{message}</div>}

              <div className="button-group">
                {mode === 'code' ? (
                  <button
                    type="button"
                    onClick={sendPasswordResetCode}
                    disabled={loading}
                    className="primary-button"
                  >
                    {loading ? 'Envoi en cours...' : 'Envoyer le code'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={sendPasswordResetLink}
                    disabled={loading}
                    className="primary-button"
                  >
                    {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="secondary-button"
                >
                  Retour à la connexion
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'code' && (
          <>
            <h2>Saisissez le code de vérification</h2>
            <p className="subtitle">
              Un code à 6 chiffres a été envoyé à <strong>{email}</strong>
            </p>

            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label htmlFor="code">Code de vérification</label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="code-input"
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}
              {message && <div className="success-message">{message}</div>}

              <div className="button-group">
                <button
                  type="button"
                  onClick={verifyPasswordResetCode}
                  disabled={loading || code.length !== 6}
                  className="primary-button"
                >
                  {loading ? 'Vérification...' : 'Vérifier'}
                </button>

                <button
                  type="button"
                  onClick={resendCode}
                  className="secondary-button"
                >
                  Renvoyer le code
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'password' && (
          <>
            <h2>Nouveau mot de passe</h2>
            <p className="subtitle">
              Choisissez un nouveau mot de passe sécurisé
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
              </div>

              {error && <div className="error-message">{error}</div>}
              {message && <div className="success-message">{message}</div>}

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
                  Annuler
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'email' && (
          <div className="mode-switch">
            <p>
              Préférez-vous recevoir un {mode === 'code' ? 'lien' : 'code'} ?{' '}
              <button
                type="button"
                onClick={() => {
                  const newMode = mode === 'code' ? 'link' : 'code';
                  navigate(`/forgot-password?mode=${newMode}`);
                }}
                className="link-button"
              >
                Cliquez ici
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
