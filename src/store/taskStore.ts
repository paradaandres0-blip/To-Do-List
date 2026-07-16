import { create } from 'zustand';
import { createTaskRequest, deleteTaskRequest, getTasksRequest, updateTaskRequest } from '../services/taskService';
import type { Task, TaskForm } from '../types/task.types';
import { TASK_STATUSES } from '../types/task.types';

interface TaskState {
  tasks: Task[];
  error: string | null;
  loadTasks: () => Promise<void>;
  addTask: (data: TaskForm) => Promise<void>;
  updateTask: (id: string, data: TaskForm) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  cycleStatus: (id: string) => Promise<void>;
  getRecent: (limit?: number) => Task[];
  getById: (id: string) => Task | undefined;
  clearError: () => void;
}

const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  error: null,
  loadTasks: async () => {
    try {
      const response = await getTasksRequest();
      set({ tasks: response.data, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar las tareas';
      set({ error: message });
      console.error('Error al cargar tareas:', err);
    }
  },
  addTask: async (data) => {
    const created = await createTaskRequest(data);
    set((state) => ({ tasks: [created, ...state.tasks] }));
  },
  updateTask: async (id, data) => {
    const updated = await updateTaskRequest(id, data);
    set((state) => ({ tasks: state.tasks.map((task) => task.id === id ? updated : task) }));
  },
  deleteTask: async (id) => {
    await deleteTaskRequest(id);
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
  },
  cycleStatus: async (id) => {
    const task = get().tasks.find((item) => item.id === id);
    if (!task) return;
    const nextStatus = TASK_STATUSES[(TASK_STATUSES.indexOf(task.status) + 1) % TASK_STATUSES.length];
    const updated = await updateTaskRequest(id, { status: nextStatus });
    set((state) => ({ tasks: state.tasks.map((item) => item.id === id ? updated : item) }));
  },
  getRecent: (limit = 4) => [...get().tasks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, limit),
  getById: (id) => get().tasks.find((task) => task.id === id),
  clearError: () => set({ error: null }),
}));

void useTaskStore.getState().loadTasks().catch((error: unknown) => console.error('No se pudieron cargar las tareas', error));

/** Tiempo relativo en español a partir de un ISO timestamp. */
export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return 'Reciente';
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'Hace un momento';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Hace 1 día' : `Hace ${days} días`;
}

export default useTaskStore;
