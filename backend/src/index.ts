import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getConnection } from './config/db';
import authRoutes from "./routes/authRoutes";
import credencialesRoutes from "./routes/credencialesRoutes";
import usersRoutes from "./routes/usersRoutes";
import documentsRoutes from "./routes/documentsRoutes";
import remindersRoutes from "./routes/remindersRoutes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/ping', async (req, res) => {
  console.log("🏓 PING - Verificando conexión a la base de datos...");
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT 1 AS ok');
    console.log("🟢 PING - Consulta exitosa:", result.recordset[0]);
    res.json({ db: result.recordset[0].ok === 1, message: 'API funcionando' });
  } catch (err) {
    console.log("🔴 PING - Error en la consulta:", err);
    res.status(500).json({ error: 'Error de conexión a la base de datos', details: err.message || err });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/credenciales", credencialesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/reminders", remindersRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
}); 