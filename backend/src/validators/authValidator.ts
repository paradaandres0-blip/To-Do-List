import { z } from 'zod';

// Esquema de registro
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  role: z.enum(['ADMIN', 'INSTRUCTOR', 'STUDENT']).optional(),
});

// Esquema de login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

// Esquema de refresh token
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token es requerido'),
});

// Esquema de forgot password
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

// Esquema de reset password
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token es requerido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

// Esquema de change password
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual es requerida'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
