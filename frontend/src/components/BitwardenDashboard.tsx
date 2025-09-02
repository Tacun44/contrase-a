import React from 'react';

interface BitwardenDashboardProps {
  user: {
    id: number;
    nombre: string;
    correo: string;
    rol: string;
  };
  totalPasswords: number;
  recentPasswords: any[];
}

export default function BitwardenDashboard({ user, totalPasswords, recentPasswords }: BitwardenDashboardProps) {
  const features = [
    {
      title: "Contraseñas ilimitadas",
      description: "Almacena y gestiona todas tus contraseñas de forma segura",
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      title: "Encriptación de extremo a extremo",
      description: "Tus datos están protegidos con cifrado de conocimiento cero",
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Acceso multiplataforma",
      description: "Disponible en todos tus dispositivos y navegadores",
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  const tools = [
    {
      title: "Generador de Contraseñas",
      description: "Crea contraseñas seguras al instante",
      icon: "🔐"
    },
    {
      title: "Probador de Fuerza",
      description: "Verifica la seguridad de tus contraseñas",
      icon: "💪"
    },
    {
      title: "Análisis de Seguridad",
      description: "Identifica contraseñas débiles o reutilizadas",
      icon: "🔍"
    }
  ];

  return (
    <div className="bitwarden-dashboard">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <h1 className="hero-title">
          Todo lo que necesitas en un administrador de contraseñas
        </h1>
        <p className="hero-subtitle">
          Protege tu vida digital con el gestor de contraseñas en el que confían millones de personas.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">Por qué millones de personas confían en nuestro gestor</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tools Section */}
      <div className="tools-section">
        <h2 className="section-title">Herramientas principales</h2>
        <div className="tools-grid">
          {tools.map((tool, index) => (
            <div key={index} className="tool-card">
              <div className="tool-icon">{tool.icon}</div>
              <h3 className="tool-title">{tool.title}</h3>
              <p className="tool-description">{tool.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Passwords */}
      <div className="recent-section">
        <h2 className="section-title">Contraseñas recientes</h2>
        {recentPasswords.length > 0 ? (
          <div className="recent-list">
            {recentPasswords.slice(0, 5).map((password) => (
              <div key={password.id} className="recent-item">
                <div className="recent-service">
                  <span className="service-name">{password.servicio}</span>
                  <span className="service-user">{password.usuario}</span>
                </div>
                <div className="recent-date">
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
    </div>
  );
}
