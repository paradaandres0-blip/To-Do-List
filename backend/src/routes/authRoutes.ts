import { Router } from 'express';
import { register, login, refreshToken, logout, forgotPassword, resetPassword, changePassword } from '../services/authService';
import { authenticateToken } from '../middleware/auth';
import { rateLimiter, strictRateLimiter } from '../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validators/authValidator';

const router = Router();

// POST /auth/register
router.post('/register', rateLimiter, async (req, res) => {
  try {
    // Validar input
    const { email, password, name, role } = registerSchema.parse(req.body);

    // Registrar usuario
    const result = await register(email, password, name, role);

    res.status(201).json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validación fallida', details: error.errors });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    // Validar input
    const { email, password } = loginSchema.parse(req.body);

    // Login
    const result = await login(email, password);

    res.json({
      token: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      user: result.user,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validación fallida', details: error.errors });
    } else {
      res.status(401).json({ error: error.message });
    }
  }
});

// POST /auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    // Validar input
    const { refreshToken: token } = refreshTokenSchema.parse(req.body);

    // Refresh token
    const result = await refreshToken(token);

    res.json({
      token: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      user: result.user,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validación fallida', details: error.errors });
    } else {
      res.status(401).json({ error: error.message });
    }
  }
});

// POST /auth/logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const result = await logout();

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /auth/forgot-password
router.post('/forgot-password', strictRateLimiter, async (req, res) => {
  try {
    // Validar input
    const { email } = forgotPasswordSchema.parse(req.body);

    // Forgot password
    const result = await forgotPassword(email);

    res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validación fallida', details: error.errors });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    // Validar input
    const { token, password } = resetPasswordSchema.parse(req.body);

    // Reset password
    const result = await resetPassword(token, password);

    res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validación fallida', details: error.errors });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// POST /auth/change-password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    // Validar input
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    // Change password
    const result = await changePassword(req.user!.userId, currentPassword, newPassword);

    res.json(result);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validación fallida', details: error.errors });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

export default router;

