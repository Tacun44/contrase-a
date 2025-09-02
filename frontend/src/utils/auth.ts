export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
}

// Funciones para gestionar credenciales recordadas
export const saveCredentials = (usuario: string, contraseña: string) => {
  const credenciales = {
    usuario,
    contraseña,
    recordar: true,
    fechaGuardado: new Date().toISOString()
  };
  localStorage.setItem('credencialesRecordadas', JSON.stringify(credenciales));
};

export const getSavedCredentials = () => {
  const credencialesGuardadas = localStorage.getItem('credencialesRecordadas');
  if (credencialesGuardadas) {
    try {
      return JSON.parse(credencialesGuardadas);
    } catch (error) {
      console.error('Error al parsear credenciales guardadas:', error);
      localStorage.removeItem('credencialesRecordadas');
      return null;
    }
  }
  return null;
};

export const clearSavedCredentials = () => {
  localStorage.removeItem('credencialesRecordadas');
};

export const hasSavedCredentials = () => {
  return localStorage.getItem('credencialesRecordadas') !== null;
}; 