// VerifyEmail.tsx - Version corrigée avec gestion d'erreurs améliorée
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './VerifyEmail.css';

interface VerifyEmailProps {
  mode?: 'code' | 'link';
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ mode = 'code' }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'success' | 'error'>('email');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Vérification automatique par token (lien)
  useEffect(() => {
    const token = searchParams.get('token');
    const modeParam = searchParams.get('mode');
    
    console.log('VerifyEmail - Paramètres URL:', { token, mode: modeParam });
    
    if (modeParam) {
      // Mettre à jour le mode basé sur l'URL
      mode = modeParam as 'code' | 'link';
    }
    
    if (token && mode === 'link') {
      console.log('Vérification automatique du token:', token);
      verifyToken(token);
    }
  }, [searchParams, mode]);

  // Configuration de l'API - IMPORTANT: Adaptez cette URL à votre backend
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.15:3001';

  const sendVerificationCode = async () => {
    if (!email) {
      setError('Veuillez saisir votre adresse email');
      return;
    }

    setLoading(true);
    setError('');
    setDebugInfo(null);
    
    try {
      console.log('Envoi du code de vérification à:', email);
      
      const response = await fetch(`${API_BASE_URL}/auth/send-verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('Réponse du serveur:', data);

      if (response.ok) {
        setMessage(data.message);
        setStep('code');
      } else {
        setError(data.message || `Erreur ${response.status}: ${response.statusText}`);
        setDebugInfo({ status: response.status, data });
      }
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      setError(`Erreur de connexion au serveur: ${err.message}`);
      setDebugInfo({ error: err.message, url: `${API_BASE_URL}/auth/send-verification-code` });
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationLink = async () => {
    if (!email) {
      setError('Veuillez saisir votre adresse email');
      return;
    }

    setLoading(true);
    setError('');
    setDebugInfo(null);
    
    try {
      console.log('Envoi du lien de vérification à:', email);
      
      const response = await fetch(`${API_BASE_URL}/auth/send-verification-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('Réponse du serveur:', data);

      if (response.ok) {
        setMessage(data.message);
        setStep('success');
      } else {
        setError(data.message || `Erreur ${response.status}: ${response.statusText}`);
        setDebugInfo({ status: response.status, data });
      }
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      setError(`Erreur de connexion au serveur: ${err.message}`);
      setDebugInfo({ error: err.message, url: `${API_BASE_URL}/auth/send-verification-link` });
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      setError('Veuillez saisir un code à 6 chiffres');
      return;
    }

    setLoading(true);
    setError('');
    setDebugInfo(null);
    
    try {
      console.log('Vérification du code:', code, 'pour email:', email);
      
      const response = await fetch(`${API_BASE_URL}/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      console.log('Réponse du serveur:', data);

      if (response.ok) {
        setMessage(data.message);
        setStep('success');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || `Erreur ${response.status}: ${response.statusText}`);
        setDebugInfo({ status: response.status, data });
      }
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      setError(`Erreur de connexion au serveur: ${err.message}`);
      setDebugInfo({ error: err.message, url: `${API_BASE_URL}/auth/verify-code` });
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async (token: string) => {
    setLoading(true);
    setError('');
    setDebugInfo(null);
    
    try {
      console.log('Vérification du token:', token);
      
      const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      console.log('Réponse du serveur:', data);

      if (response.ok) {
        setMessage(data.message);
        setStep('success');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || `Erreur ${response.status}: ${response.statusText}`);
        setStep('error');
        setDebugInfo({ status: response.status, data, token });
      }
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      setError(`Erreur de connexion au serveur: ${err.message}`);
      setStep('error');
      setDebugInfo({ error: err.message, url: `${API_BASE_URL}/auth/verify-token`, token });
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
    setDebugInfo(null);
  };

  if (step === 'success') {
    return (
      <div className="verify-email-container">
        <div className="verify-email-card">
          <div className="success-icon">✓</div>
          <h2>Email vérifié avec succès !</h2>
          <p className="success-message">{message}</p>
          <p>Vous allez être redirigé vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="verify-email-container">
        <div className="verify-email-card">
          <div className="logo">
            <h1>Chrono Carto</h1>
          </div>
          <h2>Erreur de vérification</h2>
          <div className="error-message">{error}</div>
          
          {debugInfo && (
            <div style={{ 
              background: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '8px', 
              marginTop: '15px',
              fontSize: '0.8rem',
              textAlign: 'left'
            }}>
              <strong>Informations de débogage :</strong>
              <pre style={{ margin: '10px 0', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="button-group" style={{ marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setError('');
                setDebugInfo(null);
              }}
              className="primary-button"
            >
              Réessayer
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="secondary-button"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        <div className="logo">
          <h1>Chrono Carto</h1>
        </div>

        {step === 'email' && (
          <>
            <h2>Vérification d'email</h2>
            <p className="subtitle">
              {mode === 'code' 
                ? 'Saisissez votre email pour recevoir un code de vérification'
                : 'Saisissez votre email pour recevoir un lien de vérification'
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
              
              {debugInfo && (
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  marginTop: '10px',
                  fontSize: '0.8rem',
                  textAlign: 'left'
                }}>
                  <strong>Debug:</strong>
                  <pre style={{ margin: '5px 0', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}

              <div className="button-group">
                {mode === 'code' ? (
                  <button
                    type="button"
                    onClick={sendVerificationCode}
                    disabled={loading}
                    className="primary-button"
                  >
                    {loading ? 'Envoi en cours...' : 'Envoyer le code'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={sendVerificationLink}
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
              
              {debugInfo && (
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  marginTop: '10px',
                  fontSize: '0.8rem',
                  textAlign: 'left'
                }}>
                  <strong>Debug:</strong>
                  <pre style={{ margin: '5px 0', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}

              <div className="button-group">
                <button
                  type="button"
                  onClick={verifyCode}
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

        <div className="mode-switch">
          <p>
            Préférez-vous recevoir un {mode === 'code' ? 'lien' : 'code'} ?{' '}
            <button
              type="button"
              onClick={() => {
                const newMode = mode === 'code' ? 'link' : 'code';
                navigate(`/verify-email?mode=${newMode}`);
              }}
              className="link-button"
            >
              Cliquez ici
            </button>
          </p>
        </div>

        {/* Informations de débogage en bas */}
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          background: '#f8f9fa', 
          borderRadius: '4px',
          fontSize: '0.8rem',
          color: '#666'
        }}>
          <strong>Configuration actuelle :</strong><br />
          API URL: {API_BASE_URL}<br />
          Mode: {mode}<br />
          Étape: {step}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;



