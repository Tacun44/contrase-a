import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getConnection } from '../config/db';

export const login = async (req: Request, res: Response) => {
  const { usuario_o_correo, contraseña } = req.body;
  
  console.log("🟡 BACKEND - Datos recibidos:", { usuario_o_correo, contraseña });
  
  if (!usuario_o_correo || !contraseña) {
    console.log("🔴 BACKEND - Faltan datos obligatorios");
    return res.status(400).json({ error: 'Usuario/Correo y contraseña requeridos' });
  }
  
  // Usuarios para desarrollo
  const usuariosTemporales = [
    {
      id: 1,
      nombre: 'emmanuel',
      correo: 'emmanuel@empresa.com',
      contraseña: '1033096191',
      rol: 'admin'
    },
    {
      id: 2,
      nombre: 'victor',
      nombre_completo: 'Victor Ding',
      correo: 'victor@empresa.com',
      contraseña: '1003249588',
      rol: 'admin'
    }
  ];

  try {
    // Buscar usuario por nombre, nombre completo o correo
    const user = usuariosTemporales.find(u => 
      u.nombre === usuario_o_correo || 
      u.correo === usuario_o_correo ||
      (u as any).nombre_completo === usuario_o_correo
    );

    console.log("🔍 BACKEND - Usuario encontrado:", user ? "Sí" : "No");

    if (!user) {
      console.log("🔴 BACKEND - Usuario no encontrado");
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Verificar contraseña (sin hash por simplicidad en desarrollo)
    const contraseñaCorrecta = user.contraseña === contraseña;
    console.log("🔐 BACKEND - Contraseña correcta:", contraseñaCorrecta);

    if (!contraseñaCorrecta) {
      console.log("🔴 BACKEND - Contraseña incorrecta");
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, rol: user.rol }, 
      process.env.JWT_SECRET || 'secret_temporal', 
      { expiresIn: '2h' }
    );

    const responseData = { 
      token, 
      user: { 
        id: user.id, 
        nombre: user.nombre, 
        correo: user.correo, 
        rol: user.rol 
      } 
    };

    console.log("🟢 BACKEND - Login exitoso, enviando respuesta:", responseData);
    res.json(responseData);
  } catch (err: any) {
    console.log("🔴 BACKEND - Error en login:", err.message || err);
    res.status(500).json({ error: 'Error en login', details: err.message || err });
  }
}; 