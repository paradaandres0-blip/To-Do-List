import { create } from 'zustand';
import type { Task, TaskForm } from '../types/task.types';
import { TASK_STATUSES } from '../types/task.types';

interface TaskState {
  tasks: Task[];
  addTask: (data: TaskForm) => void;
  updateTask: (id: string, data: TaskForm) => void;
  deleteTask: (id: string) => void;
  cycleStatus: (id: string) => void;
  getRecent: (limit?: number) => Task[];
  getById: (id: string) => Task | undefined;
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Plan Nutricional Semana 3',
    course: 'Nutrición Avanzada',
    due: '2025-07-15',
    priority: 'Alta',
    status: 'En revisión',
    updatedAt: hoursAgo(2),
  },
  {
    id: '2',
    title: 'Rutina de Fuerza Nivel 2',
    course: 'Entrenamiento Físico',
    due: '2025-07-18',
    priority: 'Alta',
    status: 'Aprobada',
    updatedAt: hoursAgo(5),
  },
  {
    id: '3',
    title: 'Sesión de Meditación 10 min',
    course: 'Bienestar Mental',
    due: '2025-07-20',
    priority: 'Media',
    status: 'En desarrollo',
    updatedAt: hoursAgo(24),
  },
  {
    id: '4',
    title: 'Evaluación de Composición Corp.',
    course: 'Seguimiento Corporal',
    due: '2025-07-22',
    priority: 'Media',
    status: 'Pendiente',
    updatedAt: hoursAgo(48),
  },
  {
    id: '5',
    title: 'Dieta Anti-inflamatoria',
    course: 'Nutrición Básica',
    due: '2025-07-25',
    priority: 'Baja',
    status: 'Pendiente',
    updatedAt: hoursAgo(72),
  },
  {
    id: '6',
    title: 'Técnicas de Respiración',
    course: 'Bienestar Mental',
    due: '2025-07-28',
    priority: 'Alta',
    status: 'En desarrollo',
    updatedAt: hoursAgo(96),
  },
];

const nowIso = () => new Date().toISOString();

const useTaskStore = create<TaskState>((set, get) => ({
  tasks: INITIAL_TASKS,

  addTask: (data) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...data,
      updatedAt: nowIso(),
    };
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
  },

  updateTask: (id, data) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: nowIso() } : t,
      ),
    }));
  },

  deleteTask: (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },

  cycleStatus: (id) => {
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id !== id) return t;
        const idx = TASK_STATUSES.indexOf(t.status);
        const next = TASK_STATUSES[(idx + 1) % TASK_STATUSES.length];
        return { ...t, status: next, updatedAt: nowIso() };
      }),
    }));
  },

  getRecent: (limit = 4) => {
    return [...get().tasks]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, limit);
  },

  getById: (id) => get().tasks.find((t) => t.id === id),
}));

/** Tiempo relativo en español a partir de un ISO timestamp */
export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return 'Reciente';

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'Hace un momento';
  if (minutes < 60) return `Hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hace 1 día';
  return `Hace ${days} días`;
}

export default useTaskStore;
