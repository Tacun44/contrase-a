import { Request, Response, NextFunction } from 'express';
import { getConnection } from '../config/db';

export const checkActiveSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return next();
    }

    const pool = await getConnection();
    
    // Verificar si el usuario actual está activo
    const result = await pool.request()
      .input('userId', userId)
      .query(`
        SELECT isActive 
        FROM users 
        WHERE id = @userId
      `);

    if (result.recordset.length > 0) {
      const isActive = result.recordset[0].isActive;
      
      if (!isActive) {
        console.log("🔴 SESSION - Usuario inactivo detectado:", userId);
        return res.status(401).json({ 
          error: "Sesión inactiva", 
          message: "Tu sesión ha sido desactivada. Por favor, inicia sesión nuevamente." 
        });
      }
    }
    
    next();
  } catch (error) {
    console.log("⚠️ SESSION - Error verificando sesión activa:", error.message);
    // En caso de error, permitir continuar para no bloquear la aplicación
    next();
  }
};
