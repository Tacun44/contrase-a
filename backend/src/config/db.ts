import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

export const sqlConfig: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER as string,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false, // Cambia a true si usas Azure
    trustServerCertificate: true,
  },
};

export const getConnection = async () => {
  try {
    console.log("🗄️ DATABASE - Intentando conectar a la base de datos...");
    console.log("🗄️ DATABASE - Configuración:", {
      server: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT,
      user: process.env.DB_USER
    });
    
    const pool = await sql.connect(sqlConfig);
    console.log("🟢 DATABASE - Conexión exitosa a la base de datos");
    return pool;
  } catch (err) {
    console.log("🔴 DATABASE - Error conectando a la base de datos:", err);
    throw err;
  }
}; 