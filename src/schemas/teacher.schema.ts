import { z } from 'zod';

export const teacherStatusSchema = z.enum(['Activo', 'Inactivo', 'Licencia']);

export const teacherSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().trim().min(1, 'El correo electrónico es obligatorio').email('Ingresa un correo electrónico válido'),
  phone: z.string().trim().min(7, 'El teléfono debe tener al menos 7 caracteres'),
  city: z.string().trim().min(2, 'La ciudad debe tener al menos 2 caracteres'),
  specialties: z.array(z.string().trim().min(1, 'La especialidad no puede estar vacía')).min(1, 'Selecciona al menos una especialidad'),
  status: teacherStatusSchema,
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
});
