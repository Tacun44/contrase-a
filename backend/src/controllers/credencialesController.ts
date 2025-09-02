import { Request, Response } from "express";
import { getConnection } from "../config/db";
import { encrypt, decrypt } from "../utils/crypto";

// Crear credencial
export const crearCredencial = async (req: Request, res: Response) => {
  const { servicio, usuario, contraseña, notas } = req.body;
  if (!servicio || !usuario || !contraseña) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }
  try {
    const contraseña_encriptada = encrypt(contraseña);
    const pool = await getConnection();
    await pool.request()
      .input("servicio", servicio)
      .input("usuario", usuario)
      .input("contraseña_encriptada", contraseña_encriptada)
      .input("notas", notas)
      .execute("sp_CrearCredencial");
    res.json({ message: "Credencial guardada" });
  } catch (err: any) {
    res.status(500).json({ error: "Error al guardar credencial", details: err.message || err });
  }
};

// Listar credenciales permitidas
export const listarCredenciales = async (req: Request, res: Response) => {
  try {
    // El id del usuario debería venir del JWT (req.user.id), aquí lo simulamos con 1 para pruebas
    const id_usuario = (req as any).user?.id || 1;
    const pool = await getConnection();
    const result = await pool.request()
      .input("id_usuario", id_usuario)
      .execute("sp_ObtenerCredencialesPorUsuario");
    const credenciales = result.recordset.map((c: any) => ({
      ...c,
      contraseña: decrypt(c.contraseña_encriptada)
    }));
    res.json(credenciales);
  } catch (err: any) {
    res.status(500).json({ error: "Error al obtener credenciales", details: err.message || err });
  }
}; 