// src/infrastructure/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 1. Agregamos la fecha a la interfaz para que TypeScript la reconozca
export interface AuthRequest extends Request {
  usuario?: {
    id_usuario: number;
    rol: string;
    fecha_vencimiento_cuota?: Date; // <-- NUEVO
  };
}

// ----------------------------------------------------
// BARRERA 1: ¿Tenés una credencial válida y al día?
// ----------------------------------------------------
export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const headerAuth = req.headers.authorization;

  if (!headerAuth || !headerAuth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token válido.' });
    return;
  }

  const token = headerAuth.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    
    // --- NUEVO: CONTROL DE VENCIMIENTO ---
    // Si el usuario es un ALUMNO, verificamos si su fecha caducó
    if (payload.rol === 'ALUMNO' && payload.fecha_vencimiento_cuota) {
  const hoy = new Date();
  const vencimiento = new Date(payload.fecha_vencimiento_cuota);
  if (vencimiento < hoy) {
    res.status(403).json({ 
      error: 'Tu cuota ha vencido. Por favor, contactá al administrador para renovar tu acceso.' 
    });
    return; // ¡Lo rebotamos acá mismo!
      }
    }
    // --------------------------------------

    req.usuario = payload;
    next(); 
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado. Iniciá sesión nuevamente.' });
    return;
  }
};

// ----------------------------------------------------
// BARRERA 2: ¿Tenés el rol necesario para entrar acá?
// ----------------------------------------------------
export const verificarRol = (rolesPermitidos: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    
    if (!req.usuario) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      res.status(403).json({ error: 'No tenés permisos suficientes para realizar esta acción.' });
      return;
    }

    next();
  };
};
export interface AuthRequest extends Request {
  usuario?: {
    id_usuario: number;
    rol: string;
    fecha_vencimiento_cuota?: Date;
    permiso?: string; // <-- ¡Agregamos esto para el 2FA!
  };
}