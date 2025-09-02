import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getConnection } from './config/db';
import authRoutes from "./routes/authRoutes";
import credencialesRoutes from "./routes/credencialesRoutes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/ping', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT 1 AS ok');
    res.json({ db: result.recordset[0].ok === 1, message: 'API funcionando' });
  } catch (err) {
    res.status(500).json({ error: 'Error de conexión a la base de datos', details: err.message || err });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/credenciales", credencialesRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
}); 