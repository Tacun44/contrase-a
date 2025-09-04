import { useEffect, useState } from "react";
import axios from "axios";
import { getToken, logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import BitwardenLayout from "../components/BitwardenLayout";
import BitwardenDashboard from "../components/BitwardenDashboard";

type Credencial = {
  id: number;
  servicio: string;
  usuario: string;
  contraseña_encriptada?: string;
  notas: string;
  fecha_creacion: string;
};

export default function CredencialesPage() {
  const [servicio, setServicio] = useState("");
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [notas, setNotas] = useState("");
  const [credenciales, setCredenciales] = useState<Credencial[]>([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [showPasswords, setShowPasswords] = useState<{[key: number]: boolean}>({});
  const [activeSection, setActiveSection] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  const fetchCredenciales = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/credenciales", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setCredenciales(res.data);
    } catch (err: any) {
      setError("No se pudieron cargar las credenciales");
    }
  };

  const fetchUserInfo = async () => {
    try {
      // Decodificar el token JWT para obtener la información del usuario
      const token = getToken();
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({
          id: payload.id,
          nombre: payload.nombre || 'Usuario',
          correo: payload.correo || '',
          rol: payload.rol || 'user'
        });
      }
    } catch (err) {
      console.error('Error al obtener información del usuario:', err);
    }
  };

  useEffect(() => {
    fetchCredenciales();
    fetchUserInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    try {
      await axios.post(
        "http://localhost:4000/api/credenciales",
        { servicio, usuario, contraseña, notas },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setMensaje("Credencial guardada correctamente");
      setServicio("");
      setUsuario("");
      setContraseña("");
      setNotas("");
      fetchCredenciales();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al guardar credencial");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const togglePasswordVisibility = (id: number) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMensaje("Copiado al portapapeles");
      setTimeout(() => setMensaje(""), 2000);
    } catch (err) {
      setError("No se pudo copiar al portapapeles");
    }
  };

  const getServiceIcon = (servicio: string) => {
    const service = servicio.toLowerCase();
    if (service.includes('gmail') || service.includes('google')) {
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      );
    } else if (service.includes('facebook')) {
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    } else if (service.includes('github')) {
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      );
    } else {
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
  return (
          <BitwardenDashboard 
            user={currentUser} 
            totalPasswords={credenciales.length}
            recentPasswords={credenciales}
          />
        );
      case 'passwords':
        return renderPasswordsSection();
      case 'tools':
        return renderToolsSection();
      case 'security':
        return renderSecuritySection();
      case 'settings':
        return renderSettingsSection();
      default:
        return (
          <BitwardenDashboard 
            user={currentUser} 
            totalPasswords={credenciales.length}
            recentPasswords={credenciales}
          />
        );
    }
  };

  const renderPasswordsSection = () => {
    return (
      <div className="passwords-section">
        <div className="section-header">
          <h1 className="section-title">Mis Contraseñas</h1>
          <button 
            onClick={() => setActiveSection('dashboard')}
            className="add-password-btn"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar Nueva
          </button>
        </div>
        {renderPasswordsList()}
      </div>
    );
  };

  const renderToolsSection = () => {
    return (
      <div className="tools-section">
        <h1 className="section-title">Herramientas</h1>
        <div className="tools-grid">
          <div className="tool-card">
            <h3>Generador de Contraseñas</h3>
            <p>Crea contraseñas seguras al instante</p>
          </div>
          <div className="tool-card">
            <h3>Probador de Fuerza</h3>
            <p>Verifica la seguridad de tus contraseñas</p>
          </div>
          <div className="tool-card">
            <h3>Análisis de Seguridad</h3>
            <p>Identifica contraseñas débiles o reutilizadas</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSecuritySection = () => {
    return (
      <div className="security-section">
        <h1 className="section-title">Seguridad</h1>
        <div className="security-cards">
          <div className="security-card">
            <h3>Estado de Seguridad</h3>
            <p>Tu cuenta está protegida con encriptación de extremo a extremo.</p>
          </div>
          <div className="security-card">
            <h3>Último Acceso</h3>
            <p>Hace unos minutos</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsSection = () => {
    return (
      <div className="settings-section">
        <h1 className="section-title">Configuración</h1>
        <div className="settings-cards">
          <div className="setting-card">
            <h3>Perfil</h3>
            <p>Gestiona tu información personal</p>
          </div>
          <div className="setting-card">
            <h3>Notificaciones</h3>
            <p>Configura las alertas de seguridad</p>
          </div>
        </div>
      </div>
    );
  };

  const renderPasswordsList = () => {
    return (
      <div className="passwords-list">
        {credenciales.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3>No hay credenciales guardadas</h3>
            <p>Agrega tu primera credencial para comenzar a gestionar tus contraseñas de forma segura</p>
        <button
              className="add-first-credential-btn"
              onClick={() => setActiveSection('dashboard')}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar Primera Credencial
            </button>
          </div>
        ) : (
          <div className="credentials-container">
            <div className="credentials-header">
              <div className="credentials-stats">
                <span className="stats-number">{credenciales.length}</span>
                <span className="stats-label">credenciales guardadas</span>
              </div>
              <div className="credentials-actions">
                <button className="filter-btn">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtrar
                </button>
                <button className="search-btn">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Buscar
        </button>
              </div>
            </div>

            <div className="credentials-grid">
        {credenciales.map((c) => (
                <div key={c.id} className="credential-card">
                  <div className="credential-header">
                    <div className="credential-service">
                      <div className="service-icon">
                        {getServiceIcon(c.servicio)}
                      </div>
                      <div className="service-info">
                        <h4 className="service-name">{c.servicio}</h4>
                        <span className="service-user">{c.usuario}</span>
                      </div>
                    </div>
                    <div className="credential-actions">
                      <button
                        onClick={() => copyToClipboard(c.usuario)}
                        className="action-button copy-button"
                        title="Copiar usuario"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => togglePasswordVisibility(c.id)}
                        className="action-button view-button"
                        title={showPasswords[c.id] ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPasswords[c.id] ? (
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                      <button className="action-button edit-button" title="Editar">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="credential-details">
                    <div className="credential-field">
                      <span className="credential-label">Contraseña</span>
                      <div className="credential-value password-field">
                        {showPasswords[c.id] ? c.contraseña_encriptada || "••••••••" : "••••••••"}
                      </div>
                    </div>
                    
                    {c.notas && (
                      <div className="credential-field">
                        <span className="credential-label">Notas</span>
                        <div className="credential-value notes-field">{c.notas}</div>
                      </div>
                    )}
                    
                    <div className="credential-meta">
                      <span className="credential-date">
                        Creado: {new Date(c.fecha_creacion).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!currentUser) {
    return <div>Cargando...</div>;
  }

  console.log("🟢 CREDENCIALES PAGE - Renderizando nueva estructura con usuario:", currentUser);
  
  // Elemento temporal para forzar actualización del caché
  const cacheBuster = "🚀 NUEVA VERSIÓN BITWARDEN - " + new Date().getTime();



  return (
    <div>
      {/* Elemento temporal para forzar actualización del caché */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: '#175ddc',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        fontWeight: 'bold'
      }}>
        {cacheBuster}
      </div>
      
      <BitwardenLayout 
        currentUser={currentUser}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      >
        {renderContent()}
      </BitwardenLayout>
    </div>
  );
}