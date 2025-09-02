import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getConnection } from '../config/db';

export const login = async (req: Request, res: Response) => {
  const { correo, contraseña } = req.body;
  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'Correo y contraseña requeridos' });
  }
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('correo', correo)
      .execute('sp_AutenticarUsuario');
    const user = result.recordset[0];
    if (!user) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    const valid = await bcrypt.compare(contraseña, user.contraseña_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET as string, { expiresIn: '2h' });
    res.json({ token, user: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol } });
  } catch (err: any) {
    res.status(500).json({ error: 'Error en login', details: err.message || err });
  }
}; 