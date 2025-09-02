import { useState } from "react";
import axios from "axios";
import { setToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [usuario_o_correo, setUsuario_o_correo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("🚀 FRONTEND - handleSubmit ejecutado");
    e.preventDefault();
    setError("");
    
    const loginData = {
      usuario_o_correo,
      contraseña,
    };
    
    console.log("🔵 FRONTEND - Enviando datos de login:", loginData);
    console.log("🔵 FRONTEND - URL del endpoint:", "http://localhost:4000/api/auth/login");
    
    try {
      console.log("🟡 FRONTEND - Haciendo petición...");
      const res = await axios.post("http://localhost:4000/api/auth/login", loginData);
      console.log("🟢 FRONTEND - Respuesta del servidor:", res.data);
      console.log("🟢 FRONTEND - Token recibido:", res.data.token);
      
      console.log("🟡 FRONTEND - Guardando token...");
      setToken(res.data.token);
      
      console.log("🟡 FRONTEND - Navegando a /...");
      navigate("/");
      console.log("🟢 FRONTEND - Navegación completada");
    } catch (err: any) {
      console.log("🔴 FRONTEND - Error completo:", err);
      console.log("🔴 FRONTEND - Error response:", err.response);
      console.log("🔴 FRONTEND - Error message:", err.message);
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