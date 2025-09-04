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

  // Usuarios temporales como respaldo
  const usuariosTemporales = [
    {
      id: 1,
      nombre: 'emmanuel',
      nombre_completo: 'Emmanuel',
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
    },
    {
      id: 3,
      nombre: 'ositopanda',
      nombre_completo: 'Ositopanda Private',
      correo: 'ositopanda.private@gmail.com',
      contraseña: '1033096191',
      rol: 'admin'
    },
    {
      id: 4,
      nombre: 'agenteia',
      nombre_completo: 'Agente IA Mobilsoft',
      correo: 'agenteiamobilsoft@gmail.com',
      contraseña: 'AgenteIA2024!',
      rol: 'admin'
    },
    {
      id: 5,
      nombre: 'developer',
      nombre_completo: 'Developer Demo',
      correo: 'developer@demo.mobilsoft.co',
      contraseña: 'Developer2025!',
      rol: 'user'
    },
    {
      id: 6,
      nombre: 'gerencia',
      nombre_completo: 'Gerencia Mobilsoft',
      correo: 'gerencia@mobilsoft.co',
      contraseña: 'VPSAdmin2024!',
      rol: 'admin'
    },
    {
      id: 7,
      nombre: 'root',
      nombre_completo: 'Root VPS',
      correo: 'root@vps.mobilsoft.co',
      contraseña: 'RootVPS2024!',
      rol: 'admin'
    },
    {
      id: 8,
      nombre: 'mobilsoft',
      nombre_completo: 'Mobilsoft SAS',
      correo: 'mobilsoftsas@gmail.com',
      contraseña: 'TestPassword123!',
      rol: 'admin'
    },
    {
      id: 9,
      nombre: 'whither',
      nombre_completo: 'Whither Developer',
      correo: 'whither82@gmail.com',
      contraseña: 'Purbea2024!',
      rol: 'user'
    }
  ];

  try {
    // Intentar conectar a la base de datos
    try {
      const pool = await getConnection();
      
      // Buscar usuario en la tabla users (adaptado a tu estructura real)
      const result = await pool.request()
        .input('usuario_o_correo', usuario_o_correo)
        .query(`
          SELECT id, username, password, role
          FROM users 
          WHERE username = @usuario_o_correo
        `);

      if (result.recordset.length > 0) {
        const user = result.recordset[0];
        console.log("🔍 BACKEND - Usuario encontrado en BD:", user.username);

        // Verificar contraseña (asumiendo que está hasheada con bcrypt)
        const contraseñaValida = await bcrypt.compare(contraseña, user.password);
        
        if (contraseñaValida) {
          console.log("✅ BACKEND - Usuario autenticado desde BD:", user.username);

          // Marcar este usuario como activo y desactivar todos los demás
          try {
            // Desactivar todos los usuarios
            await pool.request().query(`
              UPDATE users SET isActive = 0
            `);
            
            // Activar solo el usuario que se está logueando
            await pool.request()
              .input('userId', user.id)
              .query(`
                UPDATE users SET isActive = 1 WHERE id = @userId
              `);
            
            console.log("🔄 BACKEND - Estado de usuarios actualizado:", user.username, "activo, otros inactivos");
          } catch (statusError) {
            console.log("⚠️ BACKEND - Error actualizando estado de usuarios:", statusError.message);
            // Continuar con el login aunque falle la actualización de estado
          }

          // Generar JWT
          const token = jwt.sign(
            {
              id: user.id,
              rol: user.role || 'user',
              nombre: user.username,
              nombre_completo: user.username, // Usar username como nombre completo
              correo: user.username // Usar username como correo ya que no hay campo email
            },
            process.env.JWT_SECRET || 'secret_temporal',
            { expiresIn: '2h' }
          );

          const responseData = {
            token,
            user: {
              id: user.id,
              nombre: user.username,
              nombre_completo: user.username, // Usar username como nombre completo
              correo: user.username, // Usar username como correo
              rol: user.role || 'user'
            }
          };

          console.log("🎉 BACKEND - Login exitoso desde BD, token generado");
          return res.json(responseData);
        }
      }
    } catch (dbError) {
      console.log("⚠️ BACKEND - Error de BD, usando datos temporales:", dbError.message);
    }

    // Fallback a datos temporales
    console.log("🔄 BACKEND - Usando datos temporales como respaldo");
    
    // Buscar usuario por nombre, nombre completo o correo
    const user = usuariosTemporales.find(u => 
      u.nombre === usuario_o_correo || 
      u.correo === usuario_o_correo ||
      u.nombre_completo === usuario_o_correo
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

    console.log("✅ BACKEND - Usuario autenticado:", user.nombre);

    // Generar JWT
    const token = jwt.sign(
      {
        id: user.id,
        rol: user.rol,
        nombre: user.nombre,
        nombre_completo: user.nombre_completo || user.nombre,
        correo: user.correo
      },
      process.env.JWT_SECRET || 'secret_temporal',
      { expiresIn: '2h' }
    );

    const responseData = {
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        nombre_completo: user.nombre_completo || user.nombre,
        correo: user.correo,
        rol: user.rol
      }
    };

    console.log("🎉 BACKEND - Login exitoso con datos temporales, token generado");
    res.json(responseData);
  } catch (err: any) {
    console.log("🔴 BACKEND - Error en login:", err.message || err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};