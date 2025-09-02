import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, clearSavedCredentials, hasSavedCredentials } from '../utils/auth';

interface NavigationProps {
  currentUser: {
    id: number;
    nombre: string;
    correo: string;
    rol: string;
  };
}

export default function Navigation({ currentUser }: NavigationProps) {
  const navigate = useNavigate();
  const [showCredentialsMenu, setShowCredentialsMenu] = useState(false);

  console.log("🔵 NAVIGATION - Componente cargado con usuario:", currentUser);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleClearCredentials = () => {
    clearSavedCredentials();
    setShowCredentialsMenu(false);
    console.log("🗑️ NAVIGATION - Credenciales recordadas eliminadas");
  };

  return (
    <nav className="navigation">
      <div className="nav-header">
        <div className="nav-logo">
          <div className="logo-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="logo-text">Password Manager</span>
        </div>
        
        <div className="nav-user">
          <div className="user-info">
            <div className="user-avatar">
              {currentUser.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{currentUser.nombre}</span>
              <span className="user-role">{currentUser.rol}</span>
            </div>
          </div>
          
          {/* Menú de credenciales */}
          {hasSavedCredentials() && (
            <div className="credentials-menu">
              <button 
                onClick={() => setShowCredentialsMenu(!showCredentialsMenu)}
                className="credentials-btn"
                title="Gestionar credenciales recordadas"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </button>
              
              {showCredentialsMenu && (
                <div className="credentials-dropdown">
                  <div className="dropdown-item" onClick={handleClearCredentials}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar credenciales recordadas
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button onClick={handleLogout} className="logout-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
