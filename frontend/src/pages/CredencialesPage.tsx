import { useEffect, useState } from "react";
import axios from "axios";
import { getToken, logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";

type Credencial = {
  id: number;
  servicio: string;
  usuario: string;
  contraseña_encriptada?: string;
  notas: string;
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

  useEffect(() => {
    fetchCredenciales();
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

  return (
    <div className="credenciales-container">
      {/* Header */}
      <div className="credenciales-header">
        <h1 className="credenciales-title">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Mis Credenciales
        </h1>
        <button onClick={handleLogout} className="logout-button">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar Sesión
        </button>
      </div>

      {/* Content */}
      <div className="credenciales-content">
        {/* Formulario para agregar credencial */}
        <div className="add-credential-card">
          <h2 className="add-credential-title">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar Nueva Credencial
          </h2>
          
          <form onSubmit={handleSubmit} className="credential-form">
            {error && <div className="error-message">{error}</div>}
            {mensaje && <div className="success-message">{mensaje}</div>}
            
            <div className="form-group">
              <label className="form-label">Servicio</label>
              <input
                type="text"
                placeholder="Ej: Gmail, Facebook, GitHub..."
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Usuario/Email</label>
              <input
                type="text"
                placeholder="usuario@ejemplo.com"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                placeholder="Tu contraseña"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notas (Opcional)</label>
              <input
                type="text"
                placeholder="Información adicional..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="form-input"
              />
            </div>

            <button type="submit" className="submit-button">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guardar Credencial
            </button>
          </form>
        </div>

        {/* Lista de credenciales */}
        <div className="credenciales-list">
          <h2 className="credenciales-list-title">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Credenciales Guardadas
          </h2>

          {credenciales.length === 0 ? (
            <div className="empty-state">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3>No hay credenciales guardadas</h3>
              <p>Agrega tu primera credencial usando el formulario de la izquierda</p>
            </div>
          ) : (
            credenciales.map((c) => (
              <div key={c.id} className="credential-card">
                <div className="credential-header">
                  <div className="credential-service">
                    {getServiceIcon(c.servicio)}
                    {c.servicio}
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
                  </div>
                </div>

                <div className="credential-details">
                  <div className="credential-field">
                    <span className="credential-label">Usuario</span>
                    <div className="credential-value">{c.usuario}</div>
                  </div>
                  
                  <div className="credential-field">
                    <span className="credential-label">Contraseña</span>
                    <div className="credential-value">
                      {showPasswords[c.id] ? c.contraseña_encriptada || "••••••••" : "••••••••"}
                    </div>
                  </div>
                  
                  {c.notas && (
                    <div className="credential-field">
                      <span className="credential-label">Notas</span>
                      <div className="credential-value">{c.notas}</div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}