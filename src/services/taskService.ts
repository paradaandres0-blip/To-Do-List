import api from './api';
import type { Task, TaskForm } from '../types/task.types';

export const IS_MOCK = import.meta.env.VITE_AUTH_MODE === 'mock';
const stamp = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();
let MOCK_TASKS: Task[] = [
  { id:'1', title:'Plan Nutricional Semana 3', course:'Nutrición Avanzada', due:'2025-07-15', priority:'Alta', status:'En revisión', updatedAt:stamp(2) },
  { id:'2', title:'Rutina de Fuerza Nivel 2', course:'Entrenamiento Físico', due:'2025-07-18', priority:'Alta', status:'Aprobada', updatedAt:stamp(5) },
  { id:'3', title:'Sesión de Meditación 10 min', course:'Bienestar Mental', due:'2025-07-20', priority:'Media', status:'En desarrollo', updatedAt:stamp(24) },
  { id:'4', title:'Evaluación de Composición Corp.', course:'Seguimiento Corporal', due:'2025-07-22', priority:'Media', status:'Pendiente', updatedAt:stamp(48) },
  { id:'5', title:'Dieta Anti-inflamatoria', course:'Nutrición Básica', due:'2025-07-25', priority:'Baja', status:'Pendiente', updatedAt:stamp(72) },
  { id:'6', title:'Técnicas de Respiración', course:'Bienestar Mental', due:'2025-07-28', priority:'Alta', status:'En desarrollo', updatedAt:stamp(96) },
];

export const getTasksRequest = async (): Promise<Task[]> => {
  if (IS_MOCK) return MOCK_TASKS.map((task) => ({ ...task }));
  const { data } = await api.get<Task[]>('/tasks');
  return data;
};
export const createTaskRequest = async (payload: TaskForm): Promise<Task> => {
  if (IS_MOCK) {
    const task = { id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2), ...payload, updatedAt: new Date().toISOString() };
    MOCK_TASKS = [task, ...MOCK_TASKS]; return { ...task };
  }
  const { data } = await api.post<Task>('/tasks', payload); return data;
};
export const updateTaskRequest = async (id: string, payload: Partial<TaskForm>): Promise<Task> => {
  if (IS_MOCK) {
    const index = MOCK_TASKS.findIndex((task) => task.id === id);
    if (index === -1) throw new Error('Tarea no encontrada');
    MOCK_TASKS[index] = { ...MOCK_TASKS[index], ...payload, updatedAt: new Date().toISOString() };
    return { ...MOCK_TASKS[index] };
  }
  const { data } = await api.put<Task>(`/tasks/${id}`, payload); return data;
};
export const deleteTaskRequest = async (id: string): Promise<void> => {
  if (IS_MOCK) { MOCK_TASKS = MOCK_TASKS.filter((task) => task.id !== id); return; }
  await api.delete(`/tasks/${id}`);
};
