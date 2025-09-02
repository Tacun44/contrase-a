import { Request, Response } from "express";
import { getConnection } from "../config/db";
import { encrypt, decrypt } from "../utils/crypto";

// Credenciales temporales para desarrollo (sin base de datos)
let credencialesTemporales = [
  // Credenciales de Emmanuel (ID: 1)
  {
    id: 1,
    id_usuario: 1,
    servicio: "Gmail",
    usuario: "emmanuel@gmail.com",
    contraseña: "mi_contraseña_gmail",
    notas: "Cuenta personal de Gmail",
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: 2,
    id_usuario: 1,
    servicio: "Facebook",
    usuario: "emmanuel_fb",
    contraseña: "mi_contraseña_facebook",
    notas: "Cuenta de Facebook personal",
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: 3,
    id_usuario: 1,
    servicio: "GitHub",
    usuario: "emmanuel_dev",
    contraseña: "mi_contraseña_github",
    notas: "Cuenta de desarrollo",
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  // Credenciales de Victor (ID: 2)
  {
    id: 4,
    id_usuario: 2,
    servicio: "LinkedIn",
    usuario: "victor.ding@empresa.com",
    contraseña: "victor_linkedin_2024",
    notas: "Perfil profesional de Victor",
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: 5,
    id_usuario: 2,
    servicio: "Slack",
    usuario: "victor.ding",
    contraseña: "victor_slack_work",
    notas: "Cuenta de trabajo en Slack",
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    id: 6,
    id_usuario: 2,
    servicio: "GitHub",
    usuario: "victor.ding.dev",
    contraseña: "victor_github_2024",
    notas: "Cuenta de desarrollo de Victor",
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  }
];

// Crear credencial
export const crearCredencial = async (req: Request, res: Response) => {
  const { servicio, usuario, contraseña, notas } = req.body;
  if (!servicio || !usuario || !contraseña) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }
  
  try {
    const id_usuario = (req as any).user?.id || 1;
    console.log("💾 CREDENCIALES - Usuario creando credencial:", id_usuario);
    
    // Crear nueva credencial temporal
    const nuevaCredencial = {
      id: credencialesTemporales.length + 1,
      id_usuario: id_usuario,
      servicio,
      usuario,
      contraseña, // En desarrollo no encriptamos por simplicidad
      notas: notas || "",
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString()
    };
    
    credencialesTemporales.push(nuevaCredencial);
    console.log("✅ CREDENCIALES - Credencial creada:", nuevaCredencial.servicio);
    res.json({ message: "Credencial guardada", credencial: nuevaCredencial });
  } catch (err: any) {
    console.log("🔴 CREDENCIALES - Error al crear:", err.message || err);
    res.status(500).json({ error: "Error al guardar credencial", details: err.message || err });
  }
};

// Listar credenciales permitidas
export const listarCredenciales = async (req: Request, res: Response) => {
  try {
    const id_usuario = (req as any).user?.id || 1;
    console.log("🔍 CREDENCIALES - Usuario solicitando credenciales:", id_usuario);
    
    // Filtrar credenciales por usuario
    const credencialesUsuario = credencialesTemporales.filter(c => c.id_usuario === id_usuario);
    console.log("📋 CREDENCIALES - Credenciales encontradas:", credencialesUsuario.length);
    
    res.json(credencialesUsuario);
  } catch (err: any) {
    console.log("🔴 CREDENCIALES - Error:", err.message || err);
    res.status(500).json({ error: "Error al obtener credenciales", details: err.message || err });
  }
}; 