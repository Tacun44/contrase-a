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
  categoria?: string;
  website?: string;
  notes?: string;
};

export default function PasswordManagerPage() {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPassword, setEditingPassword] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showPasswords, setShowPasswords] = useState<{[key: number]: boolean}>({});
  const [passwordsLoaded, setPasswordsLoaded] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<{[key: string]: boolean}>({});
  const [activeTab, setActiveTab] = useState('passwords');
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingNotes, setEditingNotes] = useState<{[key: number]: boolean}>({});
  const [tempNotes, setTempNotes] = useState<{[key: number]: string}>({});
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  
  // Estados para documentos/gastos
  const [documents, setDocuments] = useState<any[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEmailDownloadModal, setShowEmailDownloadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadForm, setUploadForm] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [emailForm, setEmailForm] = useState({
    email: '',
    password: '',
    provider: 'gmail'
  });

  // Estados para recordatorios
  const [reminders, setReminders] = useState<any[]>([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any>(null);
  const [reminderForm, setReminderForm] = useState({
    title: '',
    description: '',
    category: '',
    amount: '',
    frequency: 'monthly',
    customDays: '',
    nextDueDate: new Date().toISOString().split('T')[0]
  });

  const navigate = useNavigate();

  // Formulario para agregar nueva contraseña
  const [newPassword, setNewPassword] = useState({
    servicio: "",
    usuario: "",
    contraseña: "",
    website: "",
    notes: ""
  });

  useEffect(() => {
    // Verificar autenticación antes de cargar datos
    const token = getToken();
    console.log("🔐 Verificando autenticación...");
    console.log("🔐 Token en localStorage:", token ? "Presente" : "Ausente");
    
    if (!token) {
      console.log("🔴 No hay token, redirigiendo al login...");
      setError("No estás autenticado. Redirigiendo al login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }
    
    console.log("🟢 Token encontrado, cargando datos...");
    fetchPasswords();
    fetchUserInfo();
    fetchUsers();
    fetchDocuments();
    fetchExpenseCategories();
    fetchReminders();
    
    // Verificar estado de sesión cada 30 segundos
    const sessionCheckInterval = setInterval(() => {
      checkSessionStatus();
    }, 30000);
    
    return () => clearInterval(sessionCheckInterval);
  }, []);



  const fetchPasswords = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      console.log("Token encontrado:", token ? "Sí" : "No");
      console.log("Intentando obtener contraseñas...");

      const res = await axios.get("http://localhost:4000/api/credenciales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Respuesta del servidor:", res.data);
      setPasswords(res.data);
      
      // Inicializar todas las contraseñas como ocultas por defecto
      const initialVisibility: {[key: number]: boolean} = {};
      res.data.forEach((password: any) => {
        initialVisibility[password.id] = false; // Ocultar por defecto
      });
      setShowPasswords(initialVisibility);
      setPasswordsLoaded(true);
      setError(""); // Limpiar errores si todo va bien
    } catch (err: any) {
      console.error("Error fetching passwords:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      if (err.response?.status === 401) {
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 2000);
      } else if (err.code === 'ECONNREFUSED') {
        setError("No se puede conectar con el servidor. Verifica que el backend esté corriendo.");
      } else {
        setError(`Error al cargar contraseñas: ${err.response?.data?.error || err.message}`);
      }
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

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/users", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setUsers(res.data);
    } catch (err: any) {
      console.error('Error al obtener usuarios:', err);
      if (err.response?.status === 403) {
        setError("No tienes permisos para ver la lista de usuarios");
      } else {
        setError("No se pudieron cargar los usuarios");
      }
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔄 Actualizando usuario:", editingUser);
    setError("");
    setSuccess("");

    try {
      const response = await axios.put(`http://localhost:4000/api/users/${editingUser.id}`, {
        username: editingUser.username,
        role: editingUser.role
      }, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      console.log("✅ Usuario actualizado exitosamente:", response.data);
      setSuccess("Usuario actualizado exitosamente");
      setShowEditUserModal(false);
      setEditingUser(null);
      fetchUsers(); // Recargar la lista de usuarios
    } catch (err: any) {
      console.error("❌ Error al actualizar usuario:", err);
      setError(`Error al actualizar usuario: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar al usuario "${username}"?`)) {
      return;
    }

    console.log("🗑️ Eliminando usuario:", userId, username);
    setError("");
    setSuccess("");

    try {
      const response = await axios.delete(`http://localhost:4000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      console.log("✅ Usuario eliminado exitosamente:", response.data);
      setSuccess("Usuario eliminado exitosamente");
      fetchUsers(); // Recargar la lista de usuarios
    } catch (err: any) {
      console.error("❌ Error al eliminar usuario:", err);
      setError(`Error al eliminar usuario: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    const action = currentStatus ? "desactivar" : "activar";
    if (!window.confirm(`¿Estás seguro de que quieres ${action} este usuario?`)) {
      return;
    }

    console.log("🔄 Cambiando estado de usuario:", userId, "de", currentStatus, "a", !currentStatus);
    setError("");
    setSuccess("");

    try {
      const response = await axios.patch(`http://localhost:4000/api/users/${userId}/status`, {
        isActive: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      console.log("✅ Estado de usuario actualizado exitosamente:", response.data);
      setSuccess(`Usuario ${action}do exitosamente`);
      fetchUsers(); // Recargar la lista de usuarios
    } catch (err: any) {
      console.error("❌ Error al cambiar estado de usuario:", err);
      setError(`Error al ${action} usuario: ${err.response?.data?.error || err.message}`);
    }
  };

  const checkSessionStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/users/me`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const userStatus = response.data;
      console.log("🔍 Verificando estado de sesión:", userStatus.isActive ? "Activo" : "Inactivo");
      
      if (!userStatus.isActive) {
        console.log("🔴 Sesión inactiva detectada, cerrando sesión...");
        setError("Tu sesión ha sido desactivada. Cerrando sesión...");
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 2000);
      }
    } catch (err: any) {
      console.error("❌ Error verificando estado de sesión:", err);
      if (err.response?.status === 401) {
        console.log("🔴 Sesión expirada, cerrando sesión...");
        setError("Tu sesión ha expirado. Cerrando sesión...");
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 2000);
      }
    }
  };

  // Funciones para manejar documentos
  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/documents`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setDocuments(response.data);
      console.log("📄 Documentos cargados:", response.data.length);
    } catch (err: any) {
      console.error("❌ Error cargando documentos:", err);
      if (err.response?.status === 403) {
        setError("No tienes permisos para ver los documentos");
      }
    }
  };

  const fetchExpenseCategories = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/documents/categories`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setExpenseCategories(response.data);
      console.log("📂 Categorías cargadas:", response.data.length);
    } catch (err: any) {
      console.error("❌ Error cargando categorías:", err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("📁 Archivo seleccionado:", file.name);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Por favor selecciona un archivo");
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('category', uploadForm.category);
    formData.append('description', uploadForm.description);
    formData.append('amount', uploadForm.amount);
    formData.append('date', uploadForm.date);

    try {
      const response = await axios.post(`http://localhost:4000/api/documents/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      console.log("✅ Documento subido exitosamente:", response.data);
      setSuccess("Documento subido exitosamente");
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadForm({
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchDocuments();
    } catch (err: any) {
      console.error("❌ Error subiendo documento:", err);
      setError(`Error subiendo documento: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDownloadDocument = async (documentId: number, filename: string) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/documents/download/${documentId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log("✅ Documento descargado:", filename);
      setSuccess("Documento descargado exitosamente");
    } catch (err: any) {
      console.error("❌ Error descargando documento:", err);
      setError(`Error descargando documento: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDeleteDocument = async (documentId: number, filename: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el documento "${filename}"?`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:4000/api/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      console.log("✅ Documento eliminado exitosamente");
      setSuccess("Documento eliminado exitosamente");
      fetchDocuments();
    } catch (err: any) {
      console.error("❌ Error eliminando documento:", err);
      setError(`Error eliminando documento: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleEmailDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:4000/api/documents/email-download`, emailForm, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      console.log("✅ Descarga desde correo simulada:", response.data);
      setSuccess("Descarga desde correo completada (simulación)");
      setShowEmailDownloadModal(false);
      setEmailForm({ email: '', password: '', provider: 'gmail' });
      fetchDocuments();
    } catch (err: any) {
      console.error("❌ Error en descarga desde correo:", err);
      setError(`Error en descarga desde correo: ${err.response?.data?.error || err.message}`);
    }
  };

  // Función para filtrar documentos por categoría
  const getFilteredDocuments = () => {
    if (selectedCategory === 'all') {
      return documents;
    }
    return documents.filter(doc => doc.category === selectedCategory);
  };

  // Función para obtener el total de documentos por categoría
  const getDocumentsByCategory = (categoryName: string) => {
    return documents.filter(doc => doc.category === categoryName).length;
  };

  // Funciones para manejar recordatorios
  const fetchReminders = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/reminders`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setReminders(response.data);
      console.log("📅 Recordatorios cargados:", response.data.length);
    } catch (err: any) {
      console.error("❌ Error cargando recordatorios:", err);
      if (err.response?.status === 403) {
        setError("No tienes permisos para ver los recordatorios");
      }
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:4000/api/reminders`, reminderForm, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      console.log("✅ Recordatorio creado:", response.data);
      setSuccess("Recordatorio creado exitosamente");
      setShowReminderModal(false);
      setReminderForm({
        title: '',
        description: '',
        category: '',
        amount: '',
        frequency: 'monthly',
        customDays: '',
        nextDueDate: new Date().toISOString().split('T')[0]
      });
      fetchReminders();
    } catch (err: any) {
      console.error("❌ Error creando recordatorio:", err);
      setError(`Error creando recordatorio: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleEditReminder = (reminder: any) => {
    setEditingReminder(reminder);
    setReminderForm({
      title: reminder.title,
      description: reminder.description || '',
      category: reminder.category,
      amount: reminder.amount?.toString() || '',
      frequency: reminder.frequency,
      customDays: reminder.customDays?.toString() || '',
      nextDueDate: reminder.nextDueDate.split('T')[0]
    });
    setShowReminderModal(true);
  };

  const handleUpdateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:4000/api/reminders/${editingReminder.id}`, reminderForm, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      console.log("✅ Recordatorio actualizado:", response.data);
      setSuccess("Recordatorio actualizado exitosamente");
      setShowReminderModal(false);
      setEditingReminder(null);
      setReminderForm({
        title: '',
        description: '',
        category: '',
        amount: '',
        frequency: 'monthly',
        customDays: '',
        nextDueDate: new Date().toISOString().split('T')[0]
      });
      fetchReminders();
    } catch (err: any) {
      console.error("❌ Error actualizando recordatorio:", err);
      setError(`Error actualizando recordatorio: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDeleteReminder = async (reminderId: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este recordatorio?")) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:4000/api/reminders/${reminderId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      console.log("✅ Recordatorio eliminado:", response.data);
      setSuccess("Recordatorio eliminado exitosamente");
      fetchReminders();
    } catch (err: any) {
      console.error("❌ Error eliminando recordatorio:", err);
      setError(`Error eliminando recordatorio: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleMarkAsPaid = async (reminderId: number) => {
    try {
      const response = await axios.patch(`http://localhost:4000/api/reminders/${reminderId}/paid`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      console.log("✅ Recordatorio marcado como pagado:", response.data);
      setSuccess("Recordatorio marcado como pagado");
      fetchReminders();
    } catch (err: any) {
      console.error("❌ Error marcando recordatorio como pagado:", err);
      setError(`Error marcando recordatorio como pagado: ${err.response?.data?.error || err.message}`);
    }
  };

  // Función para obtener recordatorios próximos a vencer
  const getUpcomingReminders = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return reminders.filter(reminder => {
      const dueDate = new Date(reminder.nextDueDate);
      return dueDate <= nextWeek && reminder.isActive;
    });
  };

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Función para obtener días hasta vencimiento
  const getDaysUntilDue = (dateString: string) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
      setNewPassword({ servicio: "", usuario: "", contraseña: "", website: "", notes: "" });
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

  const handleEditPassword = (password: any) => {
    setEditingPassword(password);
    setShowEditForm(true);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:4000/api/credenciales/${editingPassword.id}`, {
        servicio: editingPassword.servicio,
        usuario: editingPassword.usuario,
        contraseña: editingPassword.contraseña,
        website: editingPassword.website || "",
        notes: editingPassword.notes || ""
      }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      setSuccess("Contraseña actualizada exitosamente");
      fetchPasswords();
      setShowEditForm(false);
      setEditingPassword(null);
      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al actualizar contraseña");
    }
  };

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleAllCategories = () => {
    const allCollapsed = Object.keys(groupedPasswords).every(category => collapsedCategories[category]);
    const newState: {[key: string]: boolean} = {};
    Object.keys(groupedPasswords).forEach(category => {
      newState[category] = !allCollapsed;
    });
    setCollapsedCategories(newState);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setError("");
    setSuccess("");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Funciones para editar notas
  const startEditingNotes = (passwordId: number, currentNotes: string) => {
    setEditingNotes(prev => ({ ...prev, [passwordId]: true }));
    setTempNotes(prev => ({ ...prev, [passwordId]: currentNotes || '' }));
  };

  const cancelEditingNotes = (passwordId: number) => {
    setEditingNotes(prev => ({ ...prev, [passwordId]: false }));
    setTempNotes(prev => ({ ...prev, [passwordId]: '' }));
  };

  const saveNotes = async (passwordId: number) => {
    try {
      const token = getToken();
      if (!token) {
        setError("No hay token de autenticación");
        return;
      }

      await axios.put(`http://localhost:3001/api/passwords/${passwordId}`, {
        notes: tempNotes[passwordId] || ''
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEditingNotes(prev => ({ ...prev, [passwordId]: false }));
      setTempNotes(prev => ({ ...prev, [passwordId]: '' }));
      setSuccess("Notas actualizadas exitosamente");
      fetchPasswords();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar las notas");
    }
  };



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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Gmail':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="category-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'Email':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="category-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'Redes Sociales':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="category-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'Desarrollo':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="category-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case 'Entretenimiento':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="category-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Compras':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="category-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
        );
      case 'Finanzas':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="category-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'Hosting':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="category-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        );
      case 'Gaming':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="category-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Otros':
      default:
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="category-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
    }
  };

  const getServiceCategory = (servicio: string, usuario: string = '') => {
    const service = servicio.toLowerCase();
    const user = usuario.toLowerCase();
    
    // Gmail específico - si el servicio es Gmail o el usuario termina en @gmail.com
    if (service.includes('gmail') || service.includes('google') || user.endsWith('@gmail.com')) {
      return 'Gmail';
    }
    
    // Email y productividad (otros proveedores)
    if (service.includes('outlook') || service.includes('microsoft') ||
        service.includes('yahoo') || service.includes('hotmail') ||
        user.endsWith('@outlook.com') || user.endsWith('@hotmail.com') ||
        user.endsWith('@yahoo.com') || user.endsWith('@live.com')) {
      return 'Email';
    }
    
    // Redes sociales
    if (service.includes('facebook') || service.includes('meta') ||
        service.includes('instagram') || service.includes('twitter') ||
        service.includes('x.com') || service.includes('linkedin') ||
        service.includes('tiktok') || service.includes('snapchat') ||
        service.includes('pinterest') || service.includes('reddit')) {
      return 'Redes Sociales';
    }
    
    // Desarrollo y programación
    if (service.includes('github') || service.includes('gitlab') ||
        service.includes('bitbucket') || service.includes('stackoverflow') ||
        service.includes('codepen') || service.includes('jsfiddle') ||
        service.includes('heroku') || service.includes('vercel') ||
        service.includes('netlify') || service.includes('aws') ||
        service.includes('azure') || service.includes('digitalocean')) {
      return 'Desarrollo';
    }
    
    // Streaming y entretenimiento
    if (service.includes('netflix') || service.includes('youtube') ||
        service.includes('spotify') || service.includes('twitch') ||
        service.includes('disney') || service.includes('hulu') ||
        service.includes('amazon prime') || service.includes('hbo')) {
      return 'Entretenimiento';
    }
    
    // Compras y e-commerce
    if (service.includes('amazon') || service.includes('ebay') ||
        service.includes('mercadolibre') || service.includes('aliexpress') ||
        service.includes('walmart') || service.includes('target')) {
      return 'Compras';
    }
    
    // Banca y finanzas
    if (service.includes('paypal') || service.includes('stripe') ||
        service.includes('visa') || service.includes('mastercard') ||
        service.includes('banco') || service.includes('bank') ||
        service.includes('bbva') || service.includes('santander')) {
      return 'Finanzas';
    }
    
    // Hosting y servidores
    if (service.includes('hostinger') || service.includes('godaddy') ||
        service.includes('namecheap') || service.includes('cloudflare') ||
        service.includes('vps') || service.includes('server') ||
        service.includes('hosting') || service.includes('domain')) {
      return 'Hosting';
    }
    
    // Gaming
    if (service.includes('steam') || service.includes('epic') ||
        service.includes('xbox') || service.includes('playstation') ||
        service.includes('nintendo') || service.includes('blizzard') ||
        service.includes('riot') || service.includes('ubisoft')) {
      return 'Gaming';
    }
    
    // Por defecto
    return 'Otros';
  };

  const filteredPasswords = passwords.filter(password =>
    password.servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.usuario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar contraseñas por categoría
  const groupedPasswords = filteredPasswords.reduce((groups, password) => {
    const category = password.categoria || getServiceCategory(password.servicio, password.usuario);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(password);
    return groups;
  }, {} as Record<string, typeof passwords>);

  if (!currentUser) {
    return (
      <div className="loading">
        <div style={{textAlign: 'center', padding: '2rem'}}>
          <h2>Verificando autenticación...</h2>
          <p>Si no eres redirigido automáticamente, <a href="/login" style={{color: '#3b82f6'}}>haz clic aquí para iniciar sesión</a></p>
          
          {/* Botón temporal para login directo */}
          <div style={{marginTop: '2rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', backgroundColor: '#f9fafb'}}>
            <h3>Login Rápido (Temporal)</h3>
            <p>Para probar la aplicación sin ir al login:</p>
            <button 
              onClick={async () => {
                try {
                  const response = await axios.post("http://localhost:4000/api/auth/login", {
                    usuario_o_correo: "emmanuel",
                    contraseña: "1033096191"
                  });
                  
                  if (response.data.token) {
                    localStorage.setItem("token", response.data.token);
                    setCurrentUser(response.data.user);
                    fetchPasswords();
                    setError("");
                  }
                } catch (err) {
                  setError("Error al hacer login automático");
                }
              }}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                marginTop: '1rem'
              }}
            >
              Login como Emmanuel (Admin)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="password-manager">
      {/* Header with integrated navigation */}
      <header className="manager-header">
        <div className="header-content">
          <div className="header-left">
            <button 
              className="sidebar-toggle-btn"
              onClick={toggleSidebar}
              title={sidebarOpen ? "Cerrar sidebar" : "Abrir sidebar"}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="logo">
              <div className="logo-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="logo-text-section">
                <span className="logo-text">Panel de Administración</span>
                <span className="user-info">{currentUser?.nombre || 'Usuario'} (Admin)</span>
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <button className="change-password-btn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Cambiar contraseña
            </button>
            <button onClick={handleLogout} className="logout-btn" title="Cerrar Sesión">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sidebar */}
      <aside className={`nav-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <nav className="nav-sidebar-content">
          <button 
            className={`nav-sidebar-item ${activeTab === 'passwords' ? 'active' : ''}`}
            onClick={() => handleTabChange('passwords')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Contraseñas</span>
          </button>
          <button 
            className={`nav-sidebar-item ${activeTab === 'databases' ? 'active' : ''}`}
            onClick={() => handleTabChange('databases')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <span>Bases de Datos</span>
          </button>
          <button 
            className={`nav-sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => handleTabChange('users')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Usuarios</span>
          </button>
          <button 
            className={`nav-sidebar-item ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => handleTabChange('expenses')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Gastos</span>
          </button>

          <button 
            className={`nav-sidebar-item ${activeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => handleTabChange('invoices')}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Cuenta de cobro</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`manager-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="manager-content">
          {/* Contraseñas Tab */}
          {activeTab === 'passwords' && (
            <>
                        {/* Search and Controls */}
          <div className="controls-section" style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem'}}>
            {/* Search Bar */}
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

            {/* Add Button and Counter */}
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="new-password-btn"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nueva Contraseña
                </button>

                {/* Small Counter */}
                <div className="stat-card" style={{margin: 0, padding: '0.5rem 0.75rem', minWidth: 'auto'}}>
                  <div className="stat-icon" style={{width: '1.25rem', height: '1.25rem'}}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <div className="stat-number" style={{fontSize: '1rem'}}>{passwords.length}</div>
                    <div className="stat-label" style={{fontSize: '0.75rem'}}>Guardadas</div>
                  </div>
                </div>
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
                              
                              <div className="form-group">
                                <label>Sitio Web (URL)</label>
                                <input
                                  type="url"
                                  value={newPassword.website}
                                  onChange={(e) => setNewPassword({...newPassword, website: e.target.value})}
                                  placeholder="https://ejemplo.com"
                                />
                              </div>
                              
                              <div className="form-group">
                                <label>Notas</label>
                                <textarea
                                  value={newPassword.notes}
                                  onChange={(e) => setNewPassword({...newPassword, notes: e.target.value})}
                                  placeholder="Información adicional, recordatorios, etc..."
                                  rows={4}
                                  className="notes-textarea"
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

                      {/* Edit Form Modal */}
                      {showEditForm && editingPassword && (
                        <div className="modal-overlay">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h3>Editar Contraseña</h3>
                              <button 
                                onClick={() => {
                                  setShowEditForm(false);
                                  setEditingPassword(null);
                                }}
                                className="close-btn"
                              >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            
                            <form onSubmit={handleUpdatePassword} className="add-form">
                              <div className="form-group">
                                <label>Servicio/Plataforma</label>
                                <input
                                  type="text"
                                  value={editingPassword.servicio}
                                  onChange={(e) => setEditingPassword({...editingPassword, servicio: e.target.value})}
                                  placeholder="Ej: Gmail, Facebook, GitHub..."
                                  required
                                />
                              </div>
                              
                              <div className="form-group">
                                <label>Usuario/Email</label>
                                <input
                                  type="text"
                                  value={editingPassword.usuario}
                                  onChange={(e) => setEditingPassword({...editingPassword, usuario: e.target.value})}
                                  placeholder="usuario@ejemplo.com"
                                  required
                                />
                              </div>
                              
                              <div className="form-group">
                                <label>Contraseña</label>
                                <input
                                  type="password"
                                  value={editingPassword.contraseña}
                                  onChange={(e) => setEditingPassword({...editingPassword, contraseña: e.target.value})}
                                  placeholder="Tu contraseña"
                                  required
                                />
                              </div>
                              
                              <div className="form-group">
                                <label>Sitio Web (URL)</label>
                                <input
                                  type="url"
                                  value={editingPassword.website || ""}
                                  onChange={(e) => setEditingPassword({...editingPassword, website: e.target.value})}
                                  placeholder="https://ejemplo.com"
                                />
                              </div>
                              
                              <div className="form-group">
                                <label>Notas</label>
                                <textarea
                                  value={editingPassword.notes || ""}
                                  onChange={(e) => setEditingPassword({...editingPassword, notes: e.target.value})}
                                  placeholder="Información adicional, recordatorios, etc..."
                                  rows={4}
                                  className="notes-textarea"
                                />
                              </div>
                              
                              <div className="form-actions">
                                <button type="button" onClick={() => {
                                  setShowEditForm(false);
                                  setEditingPassword(null);
                                }} className="cancel-btn">
                                  Cancelar
                                </button>
                                <button type="submit" className="save-btn">
                                  Actualizar Contraseña
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}

          {/* Passwords List */}
          <div className="passwords-section" style={{paddingLeft: 0}}>
            <div className="passwords-section-header" style={{paddingLeft: 0}}>
              <h2 style={{marginLeft: 0}}>Mis Contraseñas</h2>
              {Object.keys(groupedPasswords).length > 0 && (
                <button 
                  onClick={toggleAllCategories}
                  className="toggle-all-btn"
                  title={Object.keys(groupedPasswords).every(category => collapsedCategories[category]) ? "Expandir todas" : "Colapsar todas"}
                >
                  {Object.keys(groupedPasswords).every(category => collapsedCategories[category]) ? (
                    <>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Expandir Todas
                    </>
                  ) : (
                    <>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Colapsar Todas
                    </>
                  )}
                </button>
              )}
            </div>
            
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
              <div className="passwords-categories">
                {Object.entries(groupedPasswords).map(([category, categoryPasswords]) => (
                  <div key={category} className="category-section">
                                                    <div className="category-header" onClick={() => toggleCategory(category)}>
                                  <div className="category-header-left">
                                    {getCategoryIcon(category)}
                                    <h3 className="category-title">{category}</h3>
                                  </div>
                                  <div className="category-header-right">
                                    <span className="category-count">{categoryPasswords.length}</span>
                                    <button className="category-toggle">
                                      {collapsedCategories[category] ? (
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      ) : (
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      )}
                                    </button>
                                  </div>
                                </div>
                    {!collapsedCategories[category] && (
                      <div className="passwords-grid">
                        {categoryPasswords.map((password) => (
                        <div key={password.id} className="password-card">
                          {/* Header con título y acciones */}
                          <div className="password-card-header">
                            <div className="password-title-section">
                              <span className="password-icon">{getServiceIcon(password.servicio)}</span>
                              <h4 className="password-title">{password.servicio}</h4>
                            </div>
                            <div className="password-header-actions">
                              <button
                                onClick={() => handleEditPassword(password)}
                                className="action-btn edit-btn"
                                title="Editar"
                              >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeletePassword(password.id)}
                                className="action-btn delete-btn"
                                title="Eliminar"
                              >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              <button className="action-btn share-btn" title="Compartir">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Contenido de la tarjeta */}
                          <div className="password-card-content">
                            {/* Categoría */}
                            <div className="password-field">
                              <span className="field-label">Categoría:</span>
                              <span className="field-value">{password.categoria || getServiceCategory(password.servicio, password.usuario)}</span>
                            </div>

                            {/* URL asociada */}
                            <div className="password-field">
                              <span className="field-label">URL:</span>
                              <span className="field-value">{password.website || 'N/A'}</span>
                            </div>

                            {/* Usuario */}
                            <div className="password-field">
                              <span className="field-label">Usuario:</span>
                              <div className="field-with-copy">
                                <span className="field-value">{password.usuario}</span>
                                <button
                                  onClick={() => copyToClipboard(password.usuario)}
                                  className="copy-btn-small"
                                  title="Copiar usuario"
                                >
                                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Sitio Web */}
                            <div className="password-field">
                              <span className="field-label">Sitio Web:</span>
                              <div className="field-with-copy">
                                <span className="field-value">{password.website || 'N/A'}</span>
                                <button
                                  onClick={() => copyToClipboard(password.website || '')}
                                  className="copy-btn-small"
                                  title="Copiar sitio web"
                                >
                                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Contraseña */}
                            <div className="password-field">
                              <span className="field-label">Contraseña:</span>
                              <div className="field-with-actions">
                                <span className="field-value password-value">
                                  {showPasswords[password.id] === false ? "••••••••" : password.contraseña}
                                </span>
                                <div className="password-actions">
                                  <button
                                    onClick={() => togglePasswordVisibility(password.id)}
                                    className="action-btn-small view-btn"
                                    title={showPasswords[password.id] === false ? "Mostrar contraseña" : "Ocultar contraseña"}
                                  >
                                    {showPasswords[password.id] === false ? (
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
                                    onClick={() => copyToClipboard(password.contraseña)}
                                    className="action-btn-small copy-btn"
                                    title="Copiar contraseña"
                                  >
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Notas */}
                            <div className="password-field">
                              <span className="field-label">Notas:</span>
                              {editingNotes[password.id] ? (
                                <div className="notes-edit-container">
                                  <textarea
                                    value={tempNotes[password.id] || ''}
                                    onChange={(e) => setTempNotes(prev => ({ ...prev, [password.id]: e.target.value }))}
                                    placeholder="Agregar notas..."
                                    rows={3}
                                    className="notes-edit-textarea"
                                    autoFocus
                                  />
                                  <div className="notes-edit-actions">
                                    <button
                                      onClick={() => saveNotes(password.id)}
                                      className="notes-save-btn"
                                      title="Guardar notas"
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20,6 9,17 4,12"></polyline>
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => cancelEditingNotes(password.id)}
                                      className="notes-cancel-btn"
                                      title="Cancelar"
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div 
                                  className="notes-content editable"
                                  onClick={() => startEditingNotes(password.id, password.notes || '')}
                                  title="Haz clic para editar las notas"
                                >
                                  {password.notes || 'Sin notas'}
                                </div>
                              )}
                            </div>

                            {/* Fechas */}
                            <div className="password-dates">
                              <span className="date-info">
                                Creado: {new Date(password.fecha_creacion).toLocaleDateString()}
                              </span>
                              <span className="date-info">
                                Actualizado: {new Date(password.fecha_creacion).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
            </>
          )}

          {/* Bases de Datos Tab */}
          {activeTab === 'databases' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Gestión de Bases de Datos</h2>
                <p>Administra las conexiones y configuraciones de bases de datos</p>
              </div>
              
              <div className="database-cards">
                <div className="database-card">
                  <div className="database-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  </div>
                  <div className="database-info">
                    <h3>SQL Server</h3>
                    <p>Base de datos principal del sistema</p>
                    <div className="database-status">
                      <span className="status-indicator connected"></span>
                      <span>Conectado</span>
                    </div>
                  </div>
                  <div className="database-actions">
                    <button className="action-btn">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <button className="action-btn">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Usuarios Tab */}
          {activeTab === 'users' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Gestión de Usuarios</h2>
                <p>Administra los usuarios y permisos del sistema</p>
              </div>
              
              <div className="users-table">
                <div className="table-header">
                  <div className="table-row">
                    <div className="table-cell">Usuario</div>
                    <div className="table-cell">Rol</div>
                    <div className="table-cell">Estado</div>
                    <div className="table-cell">Acciones</div>
                  </div>
                </div>
                <div className="table-body">
                  {users.map((user) => (
                    <div key={user.id} className="table-row">
                      <div className="table-cell">
                        <div className="user-info">
                          <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                          <span>{user.username}</span>
                        </div>
                      </div>
                      <div className="table-cell">
                        <span className={`role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                          {user.role === 'admin' ? 'Admin' : 'Usuario'}
                        </span>
                      </div>
                      <div className="table-cell">
                        <div className={`status-circle ${user.isActive ? 'active' : 'inactive'}`}></div>
                      </div>
                      <div className="table-cell">
                        <div className="user-actions">
                          <button 
                            className="action-btn"
                            onClick={() => handleEditUser(user)}
                            title="Editar usuario"
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            className={`action-btn ${user.isActive ? 'deactivate' : 'activate'}`}
                            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                            title={user.isActive ? "Desactivar usuario" : "Activar usuario"}
                          >
                            {user.isActive ? (
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                          <button 
                            className="action-btn"
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            title="Eliminar usuario"
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Modal para editar usuario */}
          {showEditUserModal && editingUser && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Editar Usuario</h3>
                  <button 
                    className="close-btn"
                    onClick={() => {
                      setShowEditUserModal(false);
                      setEditingUser(null);
                    }}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleUpdateUser} className="add-form">
                  <div className="form-group">
                    <label>Nombre de usuario</label>
                    <input
                      type="text"
                      value={editingUser.username}
                      onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Rol</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                      required
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => {
                        setShowEditUserModal(false);
                        setEditingUser(null);
                      }}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="save-btn">
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Gastos Tab */}
          {activeTab === 'expenses' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Gestión de Gastos</h2>
                <p>Administra los gastos y comprobantes del sistema</p>
              </div>
              
              <div className="receipts-section">
                <div className="receipts-actions">
                  <button 
                    className="new-password-btn"
                    onClick={() => setShowUploadModal(true)}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Subir Documento
                  </button>
                  <button 
                    className="new-password-btn secondary"
                    onClick={() => setShowEmailDownloadModal(true)}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Descargar desde Correo
                  </button>
                </div>

                {/* Pestañas de categorías */}
                <div className="category-tabs">
                  <button 
                    className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    <span>Todos</span>
                    <span className="tab-count">{documents.length}</span>
                  </button>
                  {expenseCategories.map(category => (
                    <button 
                      key={category.id}
                      className={`category-tab ${selectedCategory === category.name ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category.name)}
                      style={{ '--category-color': category.color } as React.CSSProperties}
                    >
                      <span>{category.name}</span>
                      <span className="tab-count">{getDocumentsByCategory(category.name)}</span>
                    </button>
                  ))}
                </div>

                {/* Sección de Notificaciones de Recordatorios */}
                {getUpcomingReminders().length > 0 && (
                  <div className="notifications-section">
                    <div className="notifications-header">
                      <h3>🔔 Recordatorios de Pagos</h3>
                      <p>Pagos próximos a vencer en los próximos 7 días</p>
                    </div>
                    <div className="notifications-grid">
                      {getUpcomingReminders().map((reminder) => (
                        <div key={reminder.id} className="notification-card urgent">
                          <div className="notification-header">
                            <div className="notification-icon">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="notification-info">
                              <h4>{reminder.title}</h4>
                              <p>{reminder.description}</p>
                            </div>
                            <div className="notification-amount">
                              ${reminder.amount}
                            </div>
                          </div>
                          <div className="notification-details">
                            <div className="notification-category">
                              <span className="category-badge" style={{ backgroundColor: expenseCategories.find(cat => cat.name === reminder.category)?.color || '#3b82f6' }}>
                                {reminder.category}
                              </span>
                            </div>
                            <div className="notification-date">
                              <span className="date-label">Vence:</span>
                              <span className="date-value">{formatDate(reminder.nextDueDate)}</span>
                              <span className={`days-until ${getDaysUntilDue(reminder.nextDueDate) <= 0 ? 'overdue' : getDaysUntilDue(reminder.nextDueDate) <= 3 ? 'urgent' : 'normal'}`}>
                                {getDaysUntilDue(reminder.nextDueDate) <= 0 ? 'Vencido' : `${getDaysUntilDue(reminder.nextDueDate)} días`}
                              </span>
                            </div>
                          </div>
                          <div className="notification-actions">
                            <button 
                              className="action-btn mark-paid"
                              onClick={() => handleMarkAsPaid(reminder.id)}
                            >
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Marcar como Pagado
                            </button>
                            <button 
                              className="action-btn edit"
                              onClick={() => handleEditReminder(reminder)}
                            >
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón para gestionar todos los recordatorios */}
                <div className="reminders-management">
                  <button 
                    className="new-password-btn secondary"
                    onClick={() => setShowReminderModal(true)}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Gestionar Recordatorios
                  </button>
                </div>
                
                <div className="receipts-grid">
                  {getFilteredDocuments().length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3>
                        {selectedCategory === 'all' 
                          ? 'No hay documentos' 
                          : `No hay documentos en ${selectedCategory}`
                        }
                      </h3>
                      <p>
                        {selectedCategory === 'all' 
                          ? 'Sube tu primer documento o descárgalo desde tu correo'
                          : `No hay documentos en la categoría "${selectedCategory}". Sube un documento o cambia de categoría.`
                        }
                      </p>
                    </div>
                  ) : (
                    getFilteredDocuments().map((doc) => (
                      <div key={doc.id} className="receipt-card">
                        <div className="receipt-header">
                          <div className="receipt-icon">
                            {doc.mimeType?.includes('pdf') ? (
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                          <div className="receipt-info">
                            <h3>{doc.originalName}</h3>
                            <p>{doc.description || 'Sin descripción'}</p>
                            <div className="receipt-category" style={{ backgroundColor: doc.categoryColor + '20', color: doc.categoryColor }}>
                              <span>{doc.categoryName || doc.category}</span>
                            </div>
                          </div>
                          <div className="receipt-actions">
                            <button 
                              className="action-btn"
                              onClick={() => handleDownloadDocument(doc.id, doc.originalName)}
                              title="Descargar"
                            >
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            <button 
                              className="action-btn delete"
                              onClick={() => handleDeleteDocument(doc.id, doc.originalName)}
                              title="Eliminar"
                            >
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="receipt-details">
                          {doc.amount && (
                            <div className="receipt-amount">
                              <span className="amount-label">Monto:</span>
                              <span className="amount-value">${doc.amount.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="receipt-date">
                            <span className="date-label">Fecha:</span>
                            <span className="date-value">{new Date(doc.date).toLocaleDateString()}</span>
                          </div>
                          <div className="receipt-size">
                            <span className="size-label">Tamaño:</span>
                            <span className="size-value">{(doc.fileSize / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}



          {/* Cuenta de cobro Tab */}
          {activeTab === 'invoices' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Gestión de Cuentas de Cobro</h2>
                <p>Administra las cuentas de cobro y facturas del sistema</p>
              </div>
              
              <div className="receipts-section">
                <div className="receipts-actions">
                  <button className="new-password-btn">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nueva Cuenta de Cobro
                  </button>
                </div>

                <div className="receipts-grid">
                  <div className="receipt-card">
                    <div className="receipt-header">
                      <div className="receipt-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="receipt-info">
                        <h3>Factura #001</h3>
                        <p>Desarrollo de Aplicación Web</p>
                        <div className="receipt-status">
                          <span className="status-indicator active"></span>
                          <span>Pendiente</span>
                        </div>
                      </div>
                      <div className="receipt-actions">
                        <button className="action-btn">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="action-btn">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="receipt-details">
                      <div className="receipt-amount">
                        <span className="amount-label">Monto:</span>
                        <span className="amount-value">$1,500.00</span>
                      </div>
                      <div className="receipt-date">
                        <span className="date-label">Fecha:</span>
                        <span className="date-value">15/01/2024</span>
                      </div>
                    </div>
                  </div>

                  <div className="receipt-card">
                    <div className="receipt-header">
                      <div className="receipt-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="receipt-info">
                        <h3>Factura #002</h3>
                        <p>Consultoría en Sistemas</p>
                        <div className="receipt-status">
                          <span className="status-indicator active"></span>
                          <span>Cobrado</span>
                        </div>
                      </div>
                      <div className="receipt-actions">
                        <button className="action-btn">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="action-btn">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="receipt-details">
                      <div className="receipt-amount">
                        <span className="amount-label">Monto:</span>
                        <span className="amount-value">$800.00</span>
                      </div>
                      <div className="receipt-date">
                        <span className="date-label">Fecha:</span>
                        <span className="date-value">10/01/2024</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal para subir documento */}
          {showUploadModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Subir Documento</h3>
                  <button className="close-btn" onClick={() => setShowUploadModal(false)}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleUploadDocument} className="add-form">
                  <div className="form-group">
                    <label>Archivo</label>
                    <input 
                      type="file" 
                      onChange={handleFileSelect}
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                      required 
                    />
                    {selectedFile && (
                      <p className="file-info">Archivo seleccionado: {selectedFile.name}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <select 
                      value={uploadForm.category} 
                      onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})} 
                      required
                    >
                      <option value="">Seleccionar categoría</option>
                      {expenseCategories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea 
                      value={uploadForm.description} 
                      onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                      placeholder="Descripción del documento..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Monto (opcional)</label>
                    <input 
                      type="number" 
                      value={uploadForm.amount} 
                      onChange={(e) => setUploadForm({...uploadForm, amount: e.target.value})}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha</label>
                    <input 
                      type="date" 
                      value={uploadForm.date} 
                      onChange={(e) => setUploadForm({...uploadForm, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={() => setShowUploadModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="save-btn">
                      Subir Documento
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal para descargar desde correo */}
          {showEmailDownloadModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Descargar desde Correo</h3>
                  <button className="close-btn" onClick={() => setShowEmailDownloadModal(false)}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleEmailDownload} className="add-form">
                  <div className="form-group">
                    <label>Proveedor de Correo</label>
                    <select 
                      value={emailForm.provider} 
                      onChange={(e) => setEmailForm({...emailForm, provider: e.target.value})}
                    >
                      <option value="gmail">Gmail</option>
                      <option value="outlook">Outlook</option>
                      <option value="yahoo">Yahoo</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Correo Electrónico</label>
                    <input 
                      type="email" 
                      value={emailForm.email} 
                      onChange={(e) => setEmailForm({...emailForm, email: e.target.value})}
                      placeholder="tu@correo.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Contraseña</label>
                    <input 
                      type="password" 
                      value={emailForm.password} 
                      onChange={(e) => setEmailForm({...emailForm, password: e.target.value})}
                      placeholder="Contraseña de aplicación"
                      required
                    />
                  </div>
                  <div className="form-info">
                    <p><strong>Nota:</strong> Esta es una simulación. En producción se conectaría con la API del proveedor de correo para descargar automáticamente los documentos de facturas.</p>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={() => setShowEmailDownloadModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="save-btn">
                      Descargar Documentos
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal para crear/editar recordatorio */}
          {showReminderModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{editingReminder ? 'Editar Recordatorio' : 'Gestionar Recordatorios'}</h3>
                  <button className="close-btn" onClick={() => {
                    setShowReminderModal(false);
                    setEditingReminder(null);
                    setReminderForm({
                      title: '',
                      description: '',
                      category: '',
                      amount: '',
                      frequency: 'monthly',
                      customDays: '',
                      nextDueDate: new Date().toISOString().split('T')[0]
                    });
                  }}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {!editingReminder ? (
                  <div className="all-reminders-modal">
                    <div className="modal-actions" style={{ marginBottom: '1.5rem' }}>
                      <button 
                        type="button" 
                        className="btn-primary"
                        onClick={() => setEditingReminder({})}
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Nuevo Recordatorio
                      </button>
                    </div>
                    
                    {reminders.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3>No hay recordatorios</h3>
                        <p>Crea tu primer recordatorio para no olvidar ningún pago</p>
                      </div>
                    ) : (
                      <div className="reminders-list">
                        {reminders.map((reminder) => (
                          <div key={reminder.id} className={`reminder-item ${getDaysUntilDue(reminder.nextDueDate) <= 3 ? 'urgent' : ''}`}>
                            <div className="reminder-item-header">
                              <div className="reminder-item-icon">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="reminder-item-info">
                                <h4>{reminder.title}</h4>
                                <p>{reminder.description}</p>
                                <div className="reminder-item-details">
                                  <span className="category-badge" style={{ backgroundColor: expenseCategories.find(cat => cat.name === reminder.category)?.color || '#3b82f6' }}>
                                    {reminder.category}
                                  </span>
                                  <span className="frequency-badge">
                                    {reminder.frequency === 'monthly' ? 'Mensual' :
                                     reminder.frequency === 'weekly' ? 'Semanal' :
                                     reminder.frequency === 'quarterly' ? 'Trimestral' :
                                     reminder.frequency === 'yearly' ? 'Anual' :
                                     reminder.frequency === 'custom' ? `${reminder.customDays} días` : reminder.frequency}
                                  </span>
                                </div>
                              </div>
                              <div className="reminder-item-amount">
                                ${reminder.amount}
                              </div>
                            </div>
                            <div className="reminder-item-footer">
                              <div className="reminder-item-date">
                                <span>Próximo pago: {formatDate(reminder.nextDueDate)}</span>
                                <span className={`days-until ${getDaysUntilDue(reminder.nextDueDate) <= 0 ? 'overdue' : getDaysUntilDue(reminder.nextDueDate) <= 3 ? 'urgent' : 'normal'}`}>
                                  {getDaysUntilDue(reminder.nextDueDate) <= 0 ? 'Vencido' : `${getDaysUntilDue(reminder.nextDueDate)} días`}
                                </span>
                              </div>
                              <div className="reminder-item-actions">
                                <button 
                                  className="action-btn edit"
                                  onClick={() => handleEditReminder(reminder)}
                                >
                                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Editar
                                </button>
                                <button 
                                  className="action-btn mark-paid"
                                  onClick={() => handleMarkAsPaid(reminder.id)}
                                >
                                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Pagado
                                </button>
                                <button 
                                  className="action-btn delete"
                                  onClick={() => handleDeleteReminder(reminder.id)}
                                >
                                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={editingReminder.id ? handleUpdateReminder : handleCreateReminder}>
                  <div className="form-group">
                    <label htmlFor="reminder-title">Título *</label>
                    <input
                      type="text"
                      id="reminder-title"
                      value={reminderForm.title}
                      onChange={(e) => setReminderForm({...reminderForm, title: e.target.value})}
                      placeholder="Ej: Suscripción Netflix"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="reminder-description">Descripción</label>
                    <textarea
                      id="reminder-description"
                      value={reminderForm.description}
                      onChange={(e) => setReminderForm({...reminderForm, description: e.target.value})}
                      placeholder="Descripción del recordatorio"
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="reminder-category">Categoría *</label>
                      <select
                        id="reminder-category"
                        value={reminderForm.category}
                        onChange={(e) => setReminderForm({...reminderForm, category: e.target.value})}
                        required
                      >
                        <option value="">Seleccionar categoría</option>
                        {expenseCategories.map(category => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="reminder-amount">Monto</label>
                      <input
                        type="number"
                        id="reminder-amount"
                        value={reminderForm.amount}
                        onChange={(e) => setReminderForm({...reminderForm, amount: e.target.value})}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="reminder-frequency">Frecuencia *</label>
                      <select
                        id="reminder-frequency"
                        value={reminderForm.frequency}
                        onChange={(e) => setReminderForm({...reminderForm, frequency: e.target.value})}
                        required
                      >
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                        <option value="quarterly">Trimestral</option>
                        <option value="yearly">Anual</option>
                        <option value="custom">Personalizada</option>
                      </select>
                    </div>
                    
                    {reminderForm.frequency === 'custom' && (
                      <div className="form-group">
                        <label htmlFor="reminder-custom-days">Días</label>
                        <input
                          type="number"
                          id="reminder-custom-days"
                          value={reminderForm.customDays}
                          onChange={(e) => setReminderForm({...reminderForm, customDays: e.target.value})}
                          placeholder="30"
                          min="1"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="reminder-next-date">Próxima fecha de pago *</label>
                    <input
                      type="date"
                      id="reminder-next-date"
                      value={reminderForm.nextDueDate}
                      onChange={(e) => setReminderForm({...reminderForm, nextDueDate: e.target.value})}
                      required
                    />
                  </div>
                  
                    <div className="modal-actions">
                      <button type="button" className="btn-secondary" onClick={() => {
                        setEditingReminder(null);
                        setReminderForm({
                          title: '',
                          description: '',
                          category: '',
                          amount: '',
                          frequency: 'monthly',
                          customDays: '',
                          nextDueDate: new Date().toISOString().split('T')[0]
                        });
                      }}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn-primary">
                        {editingReminder.id ? 'Actualizar' : 'Crear'} Recordatorio
                      </button>
                    </div>
                  </form>
                )}
                
                <div className="modal-actions" style={{ marginTop: '1rem', justifyContent: 'center' }}>
                  <button type="button" className="btn-secondary" onClick={() => {
                    setShowReminderModal(false);
                    setEditingReminder(null);
                    setReminderForm({
                      title: '',
                      description: '',
                      category: '',
                      amount: '',
                      frequency: 'monthly',
                      customDays: '',
                      nextDueDate: new Date().toISOString().split('T')[0]
                    });
                  }}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
