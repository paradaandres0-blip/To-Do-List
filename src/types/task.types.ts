export type Priority = 'Alta' | 'Media' | 'Baja';
export type Status = 'Pendiente' | 'En desarrollo' | 'En revisión' | 'Aprobada';

export interface Task {
  id: string;
  title: string;
  course: string;
  due: string;
  priority: Priority;
  status: Status;
  /** ISO timestamp — usado para ordenar actividad reciente */
  updatedAt: string;
}

export interface TaskForm {
  title: string;
  course: string;
  due: string;
  priority: Priority;
  status: Status;
}

export const TASK_STATUSES: Status[] = [
  'Pendiente',
  'En desarrollo',
  'En revisión',
  'Aprobada',
];

export const TASK_PRIORITIES: Priority[] = ['Alta', 'Media', 'Baja'];
