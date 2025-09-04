import express from 'express';
import { authenticateJWT } from '../middlewares/auth';
import { checkActiveSession } from '../middlewares/activeSession';
import {
  getAllReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  markAsPaid,
  getUpcomingReminders
} from '../controllers/remindersController';

const router = express.Router();

// Todas las rutas requieren autenticación y sesión activa
router.use(authenticateJWT);
router.use(checkActiveSession);

// Obtener todos los recordatorios del usuario
router.get('/', getAllReminders);

// Obtener recordatorios próximos a vencer
router.get('/upcoming', getUpcomingReminders);

// Crear un nuevo recordatorio
router.post('/', createReminder);

// Actualizar un recordatorio
router.put('/:id', updateReminder);

// Eliminar un recordatorio
router.delete('/:id', deleteReminder);

// Marcar recordatorio como pagado
router.patch('/:id/paid', markAsPaid);

export default router;
