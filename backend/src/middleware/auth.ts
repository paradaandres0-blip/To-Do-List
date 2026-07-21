import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../services/authService';

// Extender el tipo Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

// Middleware para autenticar token
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Token no proporcionado' });
      return;
    }

    // Verificar el token
    const payload = verifyAccessToken(token);
    req.user = payload;

    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware para autorizar por rol
export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'No tienes permisos para acceder a este recurso' });
      return;
    }

    next();
  };
};
