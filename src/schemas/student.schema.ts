import { z } from 'zod';

export const studentStatusSchema = z.enum(['Activo', 'Inactivo', 'Suspendido', 'Pendiente']);

const assignmentFields = {
  program: z.string().trim().min(1, 'Selecciona un programa'),
  group: z.string().trim().min(1, 'Selecciona un grupo'),
};

export const studentSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().trim().min(1, 'El correo electrónico es obligatorio').email('Ingresa un correo electrónico válido'),
  phone: z.string().trim().min(7, 'El teléfono debe tener al menos 7 caracteres'),
  ...assignmentFields,
  status: studentStatusSchema,
});

export const studentAssignmentSchema = z.object(assignmentFields);

export type StudentFormValues = z.infer<typeof studentSchema>;
export type StudentAssignmentFormValues = z.infer<typeof studentAssignmentSchema>;
