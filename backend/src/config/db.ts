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
    const pool = await sql.connect(sqlConfig);
    return pool;
  } catch (err) {
    throw err;
  }
}; 