import { z } from 'zod';

export const taskStatusSchema = z.enum(['Pendiente', 'En desarrollo', 'En revisión', 'Aprobada']);
export const taskPrioritySchema = z.enum(['Alta', 'Media', 'Baja']);

export const taskSchema = z.object({
  id: z.string().min(1, 'El ID es obligatorio'),
  title: z.string().trim().min(1, 'El título es obligatorio'),
  course: z.string().trim().min(1, 'El curso es obligatorio'),
  due: z.string().min(1, 'La fecha es obligatoria'),
  priority: taskPrioritySchema,
  status: taskStatusSchema,
  updatedAt: z.string().min(1, 'La fecha de actualización es obligatoria'),
});

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio'),
  course: z.string().trim().min(1, 'El curso es obligatorio'),
  due: z.string().min(1, 'La fecha es obligatoria'),
  priority: taskPrioritySchema,
  status: taskStatusSchema,
});

export type Task = z.infer<typeof taskSchema>;
export type TaskForm = z.infer<typeof taskFormSchema>;