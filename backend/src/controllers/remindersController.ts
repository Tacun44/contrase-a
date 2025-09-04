import { Request, Response } from 'express';
import { getConnection } from '../config/db';
import sql from 'mssql';

// Obtener todos los recordatorios del usuario
export const getAllReminders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT 
          id, title, description, category, amount, frequency, 
          customDays, nextDueDate, isActive, createdAt, updatedAt
        FROM reminders 
        WHERE userId = @userId 
        ORDER BY nextDueDate ASC
      `);
    
    console.log(`📅 Recordatorios obtenidos para usuario ${userId}:`, result.recordset.length);
    res.json(result.recordset);
  } catch (err: any) {
    console.error("❌ Error obteniendo recordatorios:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Crear un nuevo recordatorio
export const createReminder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { title, description, category, amount, frequency, customDays, nextDueDate } = req.body;
    
    if (!title || !category || !frequency || !nextDueDate) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }
    
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || '')
      .input('category', sql.NVarChar, category)
      .input('amount', sql.Decimal(10, 2), amount || 0)
      .input('frequency', sql.NVarChar, frequency)
      .input('customDays', sql.Int, customDays || null)
      .input('nextDueDate', sql.Date, nextDueDate)
      .query(`
        INSERT INTO reminders (userId, title, description, category, amount, frequency, customDays, nextDueDate)
        VALUES (@userId, @title, @description, @category, @amount, @frequency, @customDays, @nextDueDate)
        SELECT SCOPE_IDENTITY() as id
      `);
    
    const newReminderId = result.recordset[0].id;
    console.log(`✅ Recordatorio creado con ID: ${newReminderId}`);
    
    res.status(201).json({ 
      id: newReminderId, 
      message: "Recordatorio creado exitosamente" 
    });
  } catch (err: any) {
    console.error("❌ Error creando recordatorio:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Actualizar un recordatorio
export const updateReminder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const reminderId = req.params.id;
    const { title, description, category, amount, frequency, customDays, nextDueDate, isActive } = req.body;
    
    const pool = await getConnection();
    
    // Verificar que el recordatorio pertenece al usuario
    const checkResult = await pool.request()
      .input('id', sql.Int, reminderId)
      .input('userId', sql.Int, userId)
      .query('SELECT id FROM reminders WHERE id = @id AND userId = @userId');
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: "Recordatorio no encontrado" });
    }
    
    await pool.request()
      .input('id', sql.Int, reminderId)
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || '')
      .input('category', sql.NVarChar, category)
      .input('amount', sql.Decimal(10, 2), amount || 0)
      .input('frequency', sql.NVarChar, frequency)
      .input('customDays', sql.Int, customDays || null)
      .input('nextDueDate', sql.Date, nextDueDate)
      .input('isActive', sql.Bit, isActive !== undefined ? isActive : true)
      .query(`
        UPDATE reminders 
        SET title = @title, description = @description, category = @category, 
            amount = @amount, frequency = @frequency, customDays = @customDays, 
            nextDueDate = @nextDueDate, isActive = @isActive, updatedAt = GETDATE()
        WHERE id = @id
      `);
    
    console.log(`✅ Recordatorio ${reminderId} actualizado`);
    res.json({ message: "Recordatorio actualizado exitosamente" });
  } catch (err: any) {
    console.error("❌ Error actualizando recordatorio:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar un recordatorio
export const deleteReminder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const reminderId = req.params.id;
    
    const pool = await getConnection();
    
    // Verificar que el recordatorio pertenece al usuario
    const checkResult = await pool.request()
      .input('id', sql.Int, reminderId)
      .input('userId', sql.Int, userId)
      .query('SELECT id FROM reminders WHERE id = @id AND userId = @userId');
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: "Recordatorio no encontrado" });
    }
    
    await pool.request()
      .input('id', sql.Int, reminderId)
      .query('DELETE FROM reminders WHERE id = @id');
    
    console.log(`✅ Recordatorio ${reminderId} eliminado`);
    res.json({ message: "Recordatorio eliminado exitosamente" });
  } catch (err: any) {
    console.error("❌ Error eliminando recordatorio:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Marcar recordatorio como pagado (actualizar próxima fecha)
export const markAsPaid = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const reminderId = req.params.id;
    
    const pool = await getConnection();
    
    // Obtener el recordatorio
    const reminderResult = await pool.request()
      .input('id', sql.Int, reminderId)
      .input('userId', sql.Int, userId)
      .query(`
        SELECT frequency, customDays, nextDueDate 
        FROM reminders 
        WHERE id = @id AND userId = @userId
      `);
    
    if (reminderResult.recordset.length === 0) {
      return res.status(404).json({ error: "Recordatorio no encontrado" });
    }
    
    const reminder = reminderResult.recordset[0];
    const currentDate = new Date(reminder.nextDueDate);
    let nextDate = new Date(currentDate);
    
    // Calcular la próxima fecha según la frecuencia
    switch (reminder.frequency) {
      case 'weekly':
        nextDate.setDate(currentDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(currentDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(currentDate.getFullYear() + 1);
        break;
      case 'custom':
        if (reminder.customDays) {
          nextDate.setDate(currentDate.getDate() + reminder.customDays);
        }
        break;
    }
    
    // Actualizar la próxima fecha
    await pool.request()
      .input('id', sql.Int, reminderId)
      .input('nextDueDate', sql.Date, nextDate.toISOString().split('T')[0])
      .query(`
        UPDATE reminders 
        SET nextDueDate = @nextDueDate, updatedAt = GETDATE()
        WHERE id = @id
      `);
    
    console.log(`✅ Recordatorio ${reminderId} marcado como pagado. Próxima fecha: ${nextDate.toISOString().split('T')[0]}`);
    res.json({ 
      message: "Recordatorio marcado como pagado", 
      nextDueDate: nextDate.toISOString().split('T')[0] 
    });
  } catch (err: any) {
    console.error("❌ Error marcando recordatorio como pagado:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener recordatorios próximos a vencer
export const getUpcomingReminders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const days = parseInt(req.query.days as string) || 7; // Por defecto 7 días
    
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('days', sql.Int, days)
      .query(`
        SELECT 
          id, title, description, category, amount, frequency, 
          nextDueDate, isActive
        FROM reminders 
        WHERE userId = @userId 
          AND isActive = 1
          AND nextDueDate <= DATEADD(day, @days, GETDATE())
        ORDER BY nextDueDate ASC
      `);
    
    console.log(`📅 Recordatorios próximos (${days} días) para usuario ${userId}:`, result.recordset.length);
    res.json(result.recordset);
  } catch (err: any) {
    console.error("❌ Error obteniendo recordatorios próximos:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
