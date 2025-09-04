import { Request, Response } from 'express';
import { getConnection } from '../config/db';

// Obtener todos los usuarios (solo para administradores)
export const checkCurrentUserStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.rol;

    console.log("🔍 USUARIOS - Verificando estado del usuario actual:", userId);

    const pool = await getConnection();
    
    // Obtener el estado del usuario actual
    const result = await pool.request()
      .input('userId', userId)
      .query(`
        SELECT id, username, role, isActive 
        FROM users 
        WHERE id = @userId
      `);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      console.log("📋 USUARIOS - Estado del usuario actual:", user.isActive ? "Activo" : "Inactivo");
      return res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.isActive
      });
    } else {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
  } catch (dbError) {
    console.log("⚠️ USUARIOS - Error de BD:", dbError.message);
    return res.status(500).json({ 
      error: "Error de conexión a la base de datos", 
      details: dbError.message 
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const id_usuario = (req as any).user?.id;
    if (!id_usuario) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }
    
    console.log("🔍 USUARIOS - Usuario solicitando lista de usuarios:", id_usuario);
    
    // Intentar conectar a la base de datos
    try {
      const pool = await getConnection();
      
      // Verificar si el usuario es administrador
      const userResult = await pool.request()
        .input('user_id', id_usuario)
        .query('SELECT role FROM users WHERE id = @user_id');
      
      const user = userResult.recordset[0];
      const isAdmin = user && user.role === 'admin';
      
      if (!isAdmin) {
        return res.status(403).json({ error: "Acceso denegado. Solo administradores pueden ver la lista de usuarios." });
      }
      
      // Obtener todos los usuarios
      console.log("👑 USUARIOS - Usuario es administrador, obteniendo todos los usuarios");
      const result = await pool.request().query(`
        SELECT 
          id,
          username,
          role,
          createdAt,
          isActive
        FROM users
        ORDER BY id ASC
      `);
      
      const usuarios = result.recordset;
      console.log("📋 USUARIOS - Usuarios encontrados en BD:", usuarios.length);
      return res.json(usuarios);
    } catch (dbError) {
      console.log("⚠️ USUARIOS - Error de BD:", dbError.message);
      return res.status(500).json({ error: "Error de conexión a la base de datos", details: dbError.message });
    }
  } catch (err: any) {
    console.log("🔴 USUARIOS - Error:", err.message || err);
    res.status(500).json({ error: "Error al obtener usuarios", details: err.message || err });
  }
};

// Actualizar usuario
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id_usuario = (req as any).user?.id;
    const { id } = req.params;
    const { username, role } = req.body;
    
    if (!id_usuario) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }
    
    console.log("🔍 USUARIOS - Usuario solicitando actualizar usuario:", id_usuario, "ID:", id);
    
    // Intentar conectar a la base de datos
    try {
      const pool = await getConnection();
      
      // Verificar si el usuario es administrador
      const userResult = await pool.request()
        .input('user_id', id_usuario)
        .query('SELECT role FROM users WHERE id = @user_id');
      
      const user = userResult.recordset[0];
      const isAdmin = user && user.role === 'admin';
      
      if (!isAdmin) {
        return res.status(403).json({ error: "Acceso denegado. Solo administradores pueden actualizar usuarios." });
      }
      
      // Actualizar el usuario
      console.log("👑 USUARIOS - Usuario es administrador, actualizando usuario");
      const result = await pool.request()
        .input('id', id)
        .input('username', username)
        .input('role', role)
        .query(`
          UPDATE users 
          SET username = @username, role = @role
          WHERE id = @id
        `);
      
      console.log("✅ USUARIOS - Usuario actualizado exitosamente");
      return res.json({ message: "Usuario actualizado exitosamente" });
    } catch (dbError) {
      console.log("⚠️ USUARIOS - Error de BD:", dbError.message);
      return res.status(500).json({ error: "Error de conexión a la base de datos", details: dbError.message });
    }
  } catch (err: any) {
    console.log("🔴 USUARIOS - Error:", err.message || err);
    res.status(500).json({ error: "Error al actualizar usuario", details: err.message || err });
  }
};

// Eliminar usuario
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.rol;

    console.log("🔍 USUARIOS - Usuario solicitando actualizar estado:", userId, "ID:", id);

    const pool = await getConnection();
    
    // Verificar si el usuario es administrador
    const isAdmin = userRole === 'admin';
    
    if (!isAdmin) {
      return res.status(403).json({ error: "Acceso denegado. Solo administradores pueden actualizar el estado de usuarios." });
    }
    
    // Actualizar el estado del usuario
    console.log("👑 USUARIOS - Usuario es administrador, actualizando estado");
    const result = await pool.request()
      .input('id', id)
      .input('isActive', isActive ? 1 : 0)
      .query(`
        UPDATE users 
        SET isActive = @isActive
        WHERE id = @id
      `);
    
    console.log("✅ USUARIOS - Estado de usuario actualizado exitosamente");
    return res.json({ message: "Estado de usuario actualizado exitosamente" });
  } catch (dbError) {
    console.log("⚠️ USUARIOS - Error de BD:", dbError.message);
    return res.status(500).json({ 
      error: "Error de conexión a la base de datos", 
      details: dbError.message 
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id_usuario = (req as any).user?.id;
    const { id } = req.params;
    
    if (!id_usuario) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }
    
    console.log("🔍 USUARIOS - Usuario solicitando eliminar usuario:", id_usuario, "ID:", id);
    
    // Intentar conectar a la base de datos
    try {
      const pool = await getConnection();
      
      // Verificar si el usuario es administrador
      const userResult = await pool.request()
        .input('user_id', id_usuario)
        .query('SELECT role FROM users WHERE id = @user_id');
      
      const user = userResult.recordset[0];
      const isAdmin = user && user.role === 'admin';
      
      if (!isAdmin) {
        return res.status(403).json({ error: "Acceso denegado. Solo administradores pueden eliminar usuarios." });
      }
      
      // Verificar que no se esté eliminando a sí mismo
      if (parseInt(id) === id_usuario) {
        return res.status(400).json({ error: "No puedes eliminar tu propia cuenta." });
      }
      
      // Eliminar el usuario
      console.log("👑 USUARIOS - Usuario es administrador, eliminando usuario");
      const result = await pool.request()
        .input('id', id)
        .query('DELETE FROM users WHERE id = @id');
      
      console.log("✅ USUARIOS - Usuario eliminado exitosamente");
      return res.json({ message: "Usuario eliminado exitosamente" });
    } catch (dbError) {
      console.log("⚠️ USUARIOS - Error de BD:", dbError.message);
      return res.status(500).json({ error: "Error de conexión a la base de datos", details: dbError.message });
    }
  } catch (err: any) {
    console.log("🔴 USUARIOS - Error:", err.message || err);
    res.status(500).json({ error: "Error al eliminar usuario", details: err.message || err });
  }
};
