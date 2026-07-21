import rateLimit from 'express-rate-limit';

// Rate limiter para endpoints de autenticación
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 solicitudes por ventana
  message: {
    error: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter más estricto para forgot-password
export const strictRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Máximo 3 solicitudes por hora
  message: {
    error: 'Demasiadas solicitudes de recuperación de contraseña, por favor intenta más tarde',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
