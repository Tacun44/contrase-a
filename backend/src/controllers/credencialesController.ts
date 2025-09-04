import { Request, Response } from "express";
import { getConnection } from "../config/db";
import { encrypt, decrypt } from "../utils/crypto";

// Función para asignar categoría automáticamente
const getServiceCategory = (servicio: string, usuario: string = ''): string => {
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

// Credenciales temporales como respaldo
let credencialesTemporales = [
  // Credenciales de Emmanuel (ID: 1)
  {
    id: 1,
    id_usuario: 1,
    servicio: "Gmail",
    usuario: "emmanuel@gmail.com",
    contraseña: "mi_contraseña_gmail",
    fecha_creacion: new Date().toISOString()
  },
  {
    id: 2,
    id_usuario: 1,
    servicio: "Facebook",
    usuario: "emmanuel_fb",
    contraseña: "mi_contraseña_facebook",
    fecha_creacion: new Date().toISOString()
  },
  {
    id: 3,
    id_usuario: 1,
    servicio: "GitHub",
    usuario: "emmanuel_dev",
    contraseña: "mi_contraseña_github",
    fecha_creacion: new Date().toISOString()
  },
  // Credenciales de Victor (ID: 2)
  {
    id: 4,
    id_usuario: 2,
    servicio: "LinkedIn",
    usuario: "victor.ding@empresa.com",
    contraseña: "victor_linkedin_2024",
    fecha_creacion: new Date().toISOString()
  },
  {
    id: 5,
    id_usuario: 2,
    servicio: "Slack",
    usuario: "victor.ding",
    contraseña: "victor_slack_work",
    fecha_creacion: new Date().toISOString()
  },
  {
    id: 6,
    id_usuario: 2,
    servicio: "GitHub",
    usuario: "victor.ding.dev",
    contraseña: "victor_github_2024",
    fecha_creacion: new Date().toISOString()
  }
];

// Crear credencial
export const crearCredencial = async (req: Request, res: Response) => {
  const { servicio, usuario, contraseña } = req.body;
  if (!servicio || !usuario || !contraseña) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }
  
  try {
    const id_usuario = (req as any).user?.id;
    if (!id_usuario) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }
    
    console.log("💾 CREDENCIALES - Usuario creando credencial:", id_usuario);
    
    // Intentar conectar a la base de datos
    try {
      const pool = await getConnection();
      
      // Asignar categoría automáticamente
      const categoria = getServiceCategory(servicio, usuario);
      
      // Insertar en la tabla passwords (adaptado a tu estructura real)
      const result = await pool.request()
        .input('title', servicio)
        .input('username', usuario)
        .input('password', contraseña)
        .input('website', '')
        .input('notes', '')
        .input('category', categoria)
        .query(`
          INSERT INTO passwords (title, username, password, website, notes, category, createdAt, updatedAt)
          OUTPUT INSERTED.id, INSERTED.title, INSERTED.username, INSERTED.website, INSERTED.notes, INSERTED.category
          VALUES (@title, @username, @password, @website, @notes, @category, GETDATE(), GETDATE())
        `);
      
      const nuevaCredencial = result.recordset[0];
      
      // Relacionar la credencial con el usuario en user_passwords
      await pool.request()
        .input('user_id', id_usuario)
        .input('password_id', nuevaCredencial.id)
        .query(`
          INSERT INTO user_passwords (userId, passwordId, assignedAt)
          VALUES (@user_id, @password_id, GETDATE())
        `);
      
      console.log("✅ CREDENCIALES - Credencial creada en BD:", nuevaCredencial.title);
      return res.json({ message: "Credencial guardada exitosamente", credencial: nuevaCredencial });
    } catch (dbError) {
      console.log("⚠️ CREDENCIALES - Error de BD, usando datos temporales:", dbError.message);
    }

    // Fallback a datos temporales
    const nuevaCredencial = {
      id: credencialesTemporales.length + 1,
      id_usuario: id_usuario,
      servicio,
      usuario,
      contraseña,
      fecha_creacion: new Date().toISOString()
    };
    
    credencialesTemporales.push(nuevaCredencial);
    console.log("✅ CREDENCIALES - Credencial creada temporal:", nuevaCredencial.servicio);
    res.json({ message: "Credencial guardada", credencial: nuevaCredencial });
  } catch (err: any) {
    console.log("🔴 CREDENCIALES - Error al crear:", err.message || err);
    res.status(500).json({ error: "Error al guardar credencial", details: err.message || err });
  }
};

// Listar credenciales permitidas
export const listarCredenciales = async (req: Request, res: Response) => {
  try {
    const id_usuario = (req as any).user?.id;
    if (!id_usuario) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }
    
    console.log("🔍 CREDENCIALES - Usuario solicitando credenciales:", id_usuario);
    
    // Intentar conectar a la base de datos
    try {
      const pool = await getConnection();
      
      // Verificar si el usuario es administrador
      const userResult = await pool.request()
        .input('user_id', id_usuario)
        .query('SELECT role FROM users WHERE id = @user_id');
      
      const user = userResult.recordset[0];
      const isAdmin = user && user.role === 'admin';
      
      let result;
      
      if (isAdmin) {
        // Los administradores ven TODAS las credenciales
        console.log("👑 CREDENCIALES - Usuario es administrador, mostrando todas las credenciales");
        result = await pool.request().query(`
          SELECT 
            p.id, 
            p.title as servicio, 
            p.username as usuario, 
            p.password as contraseña, 
            p.website, 
            p.notes,
            p.category,
            p.createdAt as fecha_creacion
          FROM passwords p
          ORDER BY p.id DESC
        `);
      } else {
        // Los usuarios regulares ven solo sus credenciales asignadas
        console.log("👤 CREDENCIALES - Usuario regular, mostrando solo credenciales asignadas");
        result = await pool.request()
          .input('user_id', id_usuario)
          .query(`
            SELECT 
              p.id, 
              p.title as servicio, 
              p.username as usuario, 
              p.password as contraseña, 
              p.website, 
              p.notes,
              p.category,
              p.createdAt as fecha_creacion
            FROM passwords p
            INNER JOIN user_passwords up ON p.id = up.passwordId
            WHERE up.userId = @user_id
            ORDER BY p.id DESC
          `);
      }
      
      const credenciales = result.recordset;
      console.log("📋 CREDENCIALES - Credenciales encontradas en BD:", credenciales.length);
      return res.json(credenciales);
    } catch (dbError) {
      console.log("⚠️ CREDENCIALES - Error de BD, usando datos temporales:", dbError.message);
    }

    // Fallback a datos temporales
    const credencialesUsuario = credencialesTemporales.filter(c => c.id_usuario === id_usuario);
    console.log("📋 CREDENCIALES - Credenciales encontradas temporales:", credencialesUsuario.length);
    res.json(credencialesUsuario);
  } catch (err: any) {
    console.log("🔴 CREDENCIALES - Error:", err.message || err);
    res.status(500).json({ error: "Error al obtener credenciales", details: err.message || err });
  }
};

// Actualizar credencial
export const actualizarCredencial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { servicio, usuario, contraseña } = req.body;
    const id_usuario = (req as any).user?.id;
    
    if (!id_usuario) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }
    
    if (!servicio || !usuario || !contraseña) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }
    
    console.log("✏️ CREDENCIALES - Usuario actualizando credencial:", id_usuario, "ID:", id);
    
    // Intentar conectar a la base de datos
    try {
      const pool = await getConnection();
      
      // Verificar que la credencial pertenece al usuario
      const userResult = await pool.request()
        .input('user_id', id_usuario)
        .input('password_id', id)
        .query(`
          SELECT p.id FROM passwords p
          INNER JOIN user_passwords up ON p.id = up.passwordId
          WHERE up.userId = @user_id AND p.id = @password_id
        `);
      
      if (userResult.recordset.length === 0) {
        return res.status(404).json({ error: "Credencial no encontrada o no tienes permisos para editarla" });
      }
      
      // Asignar categoría automáticamente
      const categoria = getServiceCategory(servicio, usuario);
      
      // Actualizar la credencial
      await pool.request()
        .input('password_id', id)
        .input('title', servicio)
        .input('username', usuario)
        .input('password', contraseña)
        .input('category', categoria)
        .query(`
          UPDATE passwords 
          SET title = @title, username = @username, password = @password, category = @category, updatedAt = GETDATE()
          WHERE id = @password_id
        `);
      
      console.log("✅ CREDENCIALES - Credencial actualizada en BD");
      return res.json({ message: "Credencial actualizada exitosamente" });
    } catch (dbError) {
      console.log("⚠️ CREDENCIALES - Error de BD, usando datos temporales:", dbError.message);
    }

    // Fallback a datos temporales
    const credencialIndex = credencialesTemporales.findIndex(c => c.id === parseInt(id) && c.id_usuario === id_usuario);
    if (credencialIndex === -1) {
      return res.status(404).json({ error: "Credencial no encontrada" });
    }
    
    credencialesTemporales[credencialIndex] = {
      ...credencialesTemporales[credencialIndex],
      servicio,
      usuario,
      contraseña
    };
    
    console.log("✅ CREDENCIALES - Credencial actualizada temporal");
    res.json({ message: "Credencial actualizada exitosamente" });
  } catch (err: any) {
    console.log("🔴 CREDENCIALES - Error al actualizar:", err.message || err);
    res.status(500).json({ error: "Error al actualizar credencial", details: err.message || err });
  }
};

// Eliminar credencial
export const eliminarCredencial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const id_usuario = (req as any).user?.id;
    
    if (!id_usuario) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }
    
    console.log("🗑️ CREDENCIALES - Usuario eliminando credencial:", id_usuario, "ID:", id);
    
    // Intentar conectar a la base de datos
    try {
      const pool = await getConnection();
      
      // Eliminar la relación en user_passwords primero
      await pool.request()
        .input('id_credencial', parseInt(id))
        .input('user_id', id_usuario)
        .query(`
          DELETE FROM user_passwords 
          WHERE passwordId = @id_credencial AND userId = @user_id
        `);
      
      // Luego eliminar la credencial de passwords
      const result = await pool.request()
        .input('id_credencial', parseInt(id))
        .query(`
          DELETE FROM passwords 
          WHERE id = @id_credencial
        `);
      
      if (result.rowsAffected[0] > 0) {
        console.log("✅ CREDENCIALES - Credencial eliminada de BD exitosamente");
        return res.json({ message: "Credencial eliminada exitosamente" });
      }
    } catch (dbError) {
      console.log("⚠️ CREDENCIALES - Error de BD, usando datos temporales:", dbError.message);
    }

    // Fallback a datos temporales
    const credencialIndex = credencialesTemporales.findIndex(c => c.id === parseInt(id) && c.id_usuario === id_usuario);
    
    if (credencialIndex === -1) {
      return res.status(404).json({ error: "Credencial no encontrada" });
    }
    
    // Eliminar la credencial
    const credencialEliminada = credencialesTemporales.splice(credencialIndex, 1)[0];
    console.log("✅ CREDENCIALES - Credencial eliminada temporal:", credencialEliminada.servicio);
    
    res.json({ message: "Credencial eliminada exitosamente" });
  } catch (err: any) {
    console.log("🔴 CREDENCIALES - Error al eliminar:", err.message || err);
    res.status(500).json({ error: "Error al eliminar credencial", details: err.message || err });
  }
}; 