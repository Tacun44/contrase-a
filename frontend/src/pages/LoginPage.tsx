import { useState, useEffect } from "react";
import axios from "axios";
import { setToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [usuario_o_correo, setUsuario_o_correo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const [recordarCredenciales, setRecordarCredenciales] = useState(false);
  const navigate = useNavigate();

  // Cargar credenciales guardadas al cargar la página
  useEffect(() => {
    const credencialesGuardadas = localStorage.getItem('credencialesRecordadas');
    if (credencialesGuardadas) {
      try {
        const { usuario, contraseña: pass, recordar } = JSON.parse(credencialesGuardadas);
        if (recordar) {
          setUsuario_o_correo(usuario);
          setContraseña(pass);
          setRecordarCredenciales(true);
          console.log("🔑 LOGIN - Credenciales cargadas desde localStorage");
        }
      } catch (error) {
        console.error("Error al cargar credenciales guardadas:", error);
        localStorage.removeItem('credencialesRecordadas');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const loginData = {
      usuario_o_correo,
      contraseña,
    };
    
    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", loginData);
      
      // Guardar token
      setToken(res.data.token);
      
      // Guardar credenciales si el usuario marcó "Recordar"
      if (recordarCredenciales) {
        const credencialesParaGuardar = {
          usuario: usuario_o_correo,
          contraseña: contraseña,
          recordar: true,
          fechaGuardado: new Date().toISOString()
        };
        localStorage.setItem('credencialesRecordadas', JSON.stringify(credencialesParaGuardar));
      } else {
        localStorage.removeItem('credencialesRecordadas');
      }
      
      // Navegar al gestor de contraseñas
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Error de autenticación");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header con logo */}
        <div className="login-header">
          <div className="login-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="login-title">Password Manager</h1>
          <p className="login-subtitle">Gestiona tus contraseñas de forma segura</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {/* Campo Usuario */}
          <div className="form-group">
            <label className="form-label">
              Usuario
            </label>
            <input
              type="text"
              value={usuario_o_correo}
              onChange={(e) => setUsuario_o_correo(e.target.value)}
              className="form-input"
              placeholder="Ingresa tu usuario"
              required
            />
          </div>

          {/* Campo Contraseña */}
          <div className="form-group">
            <label className="form-label">
              Contraseña
            </label>
            <input
              type="password"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              className="form-input"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          {/* Checkbox Recordar Credenciales */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={recordarCredenciales}
                onChange={(e) => setRecordarCredenciales(e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-text">Recordar mis credenciales</span>
            </label>
          </div>

          {/* Botón de login */}
          <button
            type="submit"
            className="login-button"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
} 