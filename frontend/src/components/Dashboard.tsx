import React from 'react';

interface DashboardProps {
  user: {
    id: number;
    nombre: string;
    correo: string;
    rol: string;
  };
  totalPasswords: number;
  recentPasswords: any[];
}

export default function Dashboard({ user, totalPasswords, recentPasswords }: DashboardProps) {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Bienvenido, {user.nombre}</h1>
        <p className="dashboard-subtitle">Gestiona tus contraseñas de forma segura</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{totalPasswords}</h3>
            <p className="stat-label">Contraseñas Guardadas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">100%</h3>
            <p className="stat-label">Seguridad</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-number">24/7</h3>
            <p className="stat-label">Disponible</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-passwords">
          <h2 className="section-title">Contraseñas Recientes</h2>
          {recentPasswords.length > 0 ? (
            <div className="password-list">
              {recentPasswords.slice(0, 5).map((password) => (
                <div key={password.id} className="password-item">
                  <div className="password-service">
                    <span className="service-name">{password.servicio}</span>
                    <span className="service-user">{password.usuario}</span>
                  </div>
                  <div className="password-date">
                    {new Date(password.fecha_creacion).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3>No hay contraseñas guardadas</h3>
              <p>Agrega tu primera contraseña para comenzar</p>
            </div>
          )}
        </div>

        <div className="quick-actions">
          <h2 className="section-title">Acciones Rápidas</h2>
          <div className="action-buttons">
            <button className="action-btn primary">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar Contraseña
            </button>
            <button className="action-btn secondary">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Exportar Datos
            </button>
            <button className="action-btn secondary">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Verificar Seguridad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
