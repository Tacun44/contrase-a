import { useEffect, useState } from "react";
import axios from "axios";
import { getToken, logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";

type Password = {
  id: number;
  servicio: string;
  usuario: string;
  contraseña: string;
  fecha_creacion: string;
};

export default function PasswordManagerPage() {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showPasswords, setShowPasswords] = useState<{[key: number]: boolean}>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Formulario para agregar nueva contraseña
  const [newPassword, setNewPassword] = useState({
    servicio: "",
    usuario: "",
    contraseña: ""
  });

  useEffect(() => {
    fetchPasswords();
    fetchUserInfo();
  }, []);

  const fetchPasswords = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/credenciales", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setPasswords(res.data);
    } catch (err: any) {
      setError("No se pudieron cargar las contraseñas");
    }
  };

  const fetchUserInfo = async () => {
    try {
      const token = getToken();
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({
          id: payload.id,
          nombre: payload.nombre_completo || payload.nombre || 'Usuario',
          correo: payload.correo || '',
          rol: payload.rol || 'user'
        });
      }
    } catch (err) {
      console.error('Error al obtener información del usuario:', err);
    }
  };

  const handleAddPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("http://localhost:4000/api/credenciales", newPassword, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      setSuccess("Contraseña agregada exitosamente");
      setNewPassword({ servicio: "", usuario: "", contraseña: "" });
      setShowAddForm(false);
      fetchPasswords();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al agregar contraseña");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const togglePasswordVisibility = (id: number) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess("Copiado al portapapeles!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("No se pudo copiar al portapapeles");
    }
  };

  const handleDeletePassword = async (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta contraseña?")) {
      try {
        await axios.delete(`http://localhost:4000/api/credenciales/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setSuccess("Contraseña eliminada exitosamente");
        fetchPasswords();
        setTimeout(() => setSuccess(""), 2000);
      } catch (err: any) {
        setError(err.response?.data?.error || "Error al eliminar contraseña");
      }
    }
  };

  const filteredPasswords = passwords.filter(password =>
    password.servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.usuario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getServiceIcon = (servicio: string) => {
    const service = servicio.toLowerCase();
    if (service.includes('gmail') || service.includes('google')) {
      return "🔵";
    } else if (service.includes('facebook')) {
      return "🔵";
    } else if (service.includes('github')) {
      return "⚫";
    } else if (service.includes('instagram')) {
      return "🟣";
    } else if (service.includes('twitter') || service.includes('x.com')) {
      return "🔵";
    } else if (service.includes('linkedin')) {
      return "🔵";
    } else {
      return "🔐";
    }
  };

  if (!currentUser) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="password-manager">
      {/* Header */}
      <header className="manager-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="logo-text">Password Manager</span>
            </div>
          </div>
          
                         <div className="header-right">
                 <div className="user-info">
                   <span className="user-name">{currentUser.nombre}</span>
                 </div>
                 <button onClick={handleLogout} className="logout-btn" title="Cerrar Sesión">
                   <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                   </svg>
                 </button>
               </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="manager-main">
        <div className="manager-content">
                    {/* Add Button, Search and Stats - All in one row */}
          <div className="controls-section" style={{display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <button 
                onClick={() => setShowAddForm(true)}
                className="add-btn"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar
              </button>
              
              <div className="search-container" style={{maxWidth: '400px'}}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="search-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar contraseñas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="stat-card" style={{margin: 0, flex: '0 0 auto'}}>
              <div className="stat-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{passwords.length}</div>
                <div className="stat-label">Contraseñas Guardadas</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="message error-message">
              {error}
            </div>
          )}
          {success && (
            <div className="message success-message">
              {success}
            </div>
          )}

          {/* Add Form Modal */}
          {showAddForm && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Agregar Nueva Contraseña</h3>
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="close-btn"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleAddPassword} className="add-form">
                  <div className="form-group">
                    <label>Servicio/Plataforma</label>
                    <input
                      type="text"
                      value={newPassword.servicio}
                      onChange={(e) => setNewPassword({...newPassword, servicio: e.target.value})}
                      placeholder="Ej: Gmail, Facebook, GitHub..."
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Usuario/Email</label>
                    <input
                      type="text"
                      value={newPassword.usuario}
                      onChange={(e) => setNewPassword({...newPassword, usuario: e.target.value})}
                      placeholder="usuario@ejemplo.com"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Contraseña</label>
                    <input
                      type="password"
                      value={newPassword.contraseña}
                      onChange={(e) => setNewPassword({...newPassword, contraseña: e.target.value})}
                      placeholder="Tu contraseña"
                      required
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">
                      Cancelar
                    </button>
                    <button type="submit" className="save-btn">
                      Guardar Contraseña
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Passwords List */}
          <div className="passwords-section">
            <h2>Mis Contraseñas</h2>
            
            {filteredPasswords.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3>No hay contraseñas guardadas</h3>
                <p>Agrega tu primera contraseña para comenzar</p>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="add-first-btn"
                >
                  Agregar Primera Contraseña
                </button>
              </div>
            ) : (
              <div className="passwords-grid">
                {filteredPasswords.map((password) => (
                  <div key={password.id} className="password-card">
                    <div className="password-header">
                      <div className="service-info">
                        <span className="service-icon">{getServiceIcon(password.servicio)}</span>
                        <div>
                          <h4 className="service-name">{password.servicio}</h4>
                          <p className="service-user">{password.usuario}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="password-details">
                      <div className="password-field">
                        <label>Contraseña</label>
                        <div className="password-value">
                          {showPasswords[password.id] ? password.contraseña : "••••••••"}
                        </div>
                      </div>
                      
                      <div className="password-meta">
                        <span className="created-date">
                          Creado: {new Date(password.fecha_creacion).toLocaleDateString()}
                        </span>
                        <div className="password-actions-bottom">
                          <button
                            onClick={() => copyToClipboard(password.contraseña)}
                            className="action-btn copy-btn"
                            title="Copiar contraseña"
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => togglePasswordVisibility(password.id)}
                            className="action-btn view-btn"
                            title={showPasswords[password.id] ? "Ocultar contraseña" : "Mostrar contraseña"}
                          >
                            {showPasswords[password.id] ? (
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
                          <button
                            onClick={() => handleDeletePassword(password.id)}
                            className="action-btn delete-btn"
                            title="Eliminar contraseña"
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
