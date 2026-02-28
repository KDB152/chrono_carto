// App.tsx - Configuration complète avec routes
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import VerifyEmail from './components/VerifyEmail';
import ResetPassword from './components/ResetPassword';
import './App.css';
import StudentDashboard from './app/dashboard/student/page';

// Composant 404
const NotFound: React.FC = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    textAlign: 'center',
    padding: '20px'
  }}>
    <h1 style={{ fontSize: '4rem', margin: '0', color: '#667eea' }}>404</h1>
    <h2 style={{ margin: '10px 0', color: '#333' }}>Page non trouvée</h2>
    <p style={{ color: '#666', marginBottom: '30px' }}>
      La page que vous recherchez n'existe pas.
    </p>
    <a 
      href="/login" 
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '12px 24px',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: 'bold'
      }}
    >
      Retour à la connexion
    </a>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route par défaut - redirection vers login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Routes d'authentification */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Routes de vérification d'email */}
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/student-interface" element={<StudentDashboard />} />

          {/* Route 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

