import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log("🔐 MIDDLEWARE - Verificando autenticación");
  const authHeader = req.headers.authorization;
  console.log("🔐 MIDDLEWARE - Auth header:", authHeader);
  
  if (!authHeader) {
    console.log("🔴 MIDDLEWARE - No hay token");
    return res.status(401).json({ error: "Token requerido" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🔐 MIDDLEWARE - Token extraído:", token ? "Sí" : "No");
  console.log("🔐 MIDDLEWARE - JWT_SECRET:", process.env.JWT_SECRET ? "Configurado" : "No configurado");
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    console.log("🟢 MIDDLEWARE - Token válido, usuario:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("🔴 MIDDLEWARE - Error verificando token:", err);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}; 