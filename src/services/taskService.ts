import api from './api';
import type { Task, TaskForm } from '../types/task.types';
import type { ApiResponse } from '../types/api.types';
import { taskSchema } from '../schemas/task.schema';

// ── Helper: extraer data de ApiResponse ──
const extractData = <T>(response: { data: ApiResponse<T> | T }): T => {
  const d = response.data;
  if (d && typeof d === 'object' && 'success' in d && 'data' in d) {
    return (d as ApiResponse<T>).data;
  }
  return d as T;
};

export const IS_MOCK = import.meta.env.VITE_AUTH_MODE === 'mock';
const stamp = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

// Validar y crear datos mock con tipos correctos
const createMockTask = (data: Partial<Task> & { id: string }): Task => {
  const validated = taskSchema.parse({
    id: data.id,
    title: data.title,
    course: data.course,
    due: data.due,
    priority: data.priority,
    status: data.status,
    updatedAt: data.updatedAt,
  });
  return validated as Task;
};

let MOCK_TASKS: Task[] = [
  createMockTask({ id:'1', title:'Plan Nutricional Semana 3', course:'Nutrición Avanzada', due:'2025-07-15', priority:'Alta', status:'En revisión', updatedAt:stamp(2) }),
  createMockTask({ id:'2', title:'Rutina de Fuerza Nivel 2', course:'Entrenamiento Físico', due:'2025-07-18', priority:'Alta', status:'Aprobada', updatedAt:stamp(5) }),
  createMockTask({ id:'3', title:'Sesión de Meditación 10 min', course:'Bienestar Mental', due:'2025-07-20', priority:'Media', status:'En desarrollo', updatedAt:stamp(24) }),
  createMockTask({ id:'4', title:'Evaluación de Composición Corp.', course:'Seguimiento Corporal', due:'2025-07-22', priority:'Media', status:'Pendiente', updatedAt:stamp(48) }),
  createMockTask({ id:'5', title:'Dieta Anti-inflamatoria', course:'Nutrición Básica', due:'2025-07-25', priority:'Baja', status:'Pendiente', updatedAt:stamp(72) }),
  createMockTask({ id:'6', title:'Técnicas de Respiración', course:'Bienestar Mental', due:'2025-07-28', priority:'Alta', status:'En desarrollo', updatedAt:stamp(96) }),
];

export const getTasksRequest = async (page = 1, pageSize = 10): Promise<Task[]> => {
  if (IS_MOCK) {
    const start = (page - 1) * pageSize;
    return MOCK_TASKS.slice(start, start + pageSize).map((task) => ({ ...task }));
  }
  const response = await api.get<{ success: boolean; data: Task[] }>('/tasks', { params: { page, pageSize } });
  return response.data.data;
};
export const createTaskRequest = async (payload: TaskForm): Promise<Task> => {
  if (IS_MOCK) {
    const task = { id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2), ...payload, updatedAt: new Date().toISOString() };
    MOCK_TASKS = [task, ...MOCK_TASKS]; return { ...task };
  }
  const response = await api.post<ApiResponse<Task>>('/tasks', payload); return extractData(response);
};
export const updateTaskRequest = async (id: string, payload: Partial<TaskForm>): Promise<Task> => {
  if (IS_MOCK) {
    const index = MOCK_TASKS.findIndex((task) => task.id === id);
    if (index === -1) throw new Error('Tarea no encontrada');
    MOCK_TASKS[index] = { ...MOCK_TASKS[index], ...payload, updatedAt: new Date().toISOString() };
    return { ...MOCK_TASKS[index] };
  }
  const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, payload); return extractData(response);
};
export const deleteTaskRequest = async (id: string): Promise<void> => {
  if (IS_MOCK) { MOCK_TASKS = MOCK_TASKS.filter((task) => task.id !== id); return; }
  await api.delete(`/tasks/${id}`);
};
