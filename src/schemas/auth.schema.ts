import { z } from 'zod';

const emailSchema = z.string().trim().min(1, 'El correo electrónico es obligatorio').email('Ingresa un correo electrónico válido');
const passwordSchema = z.string().min(6, 'La contraseña debe tener al menos 6 caracteres');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es obligatoria').pipe(passwordSchema),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: emailSchema,
  password: passwordSchema,
  confirm: z.string().min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm'],
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirm: z.string().min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm'],
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: emailSchema,
  phone: z.string().trim().min(7, 'El teléfono debe tener al menos 7 caracteres'),
  city: z.string().trim().min(2, 'La ciudad debe tener al menos 2 caracteres'),
});

export const changePasswordSchema = z.object({
  current: z.string().min(1, 'La contraseña actual es obligatoria'),
  newPass: passwordSchema,
  confirm: z.string().min(1, 'Confirma tu nueva contraseña'),
}).refine((data) => data.newPass === data.confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm'],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
