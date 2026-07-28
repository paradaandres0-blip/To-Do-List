/**
 * Una actividad es una tarjeta dentro de un módulo (columna).
 * El docente crea actividades para que los estudiantes las completen.
 */
export interface Activity {
  id: string;
  /** Título de la actividad (ej: "Rutina de fuerza nivel 2") */
  title: string;
  /** Descripción / instrucciones */
  description: string;
  /** Módulo al que pertenece (column) */
  moduleId: string;
  /** Curso al que pertenece */
  course?: string;
  /** Estudiante asignado */
  studentId: string;
  /** Docente que creó/asignó la actividad */
  teacherId: string;
  /** URL o path del documento adjunto */
  attachmentUrl?: string;
  /** Nombre del archivo adjunto */
  attachmentName?: string;
  /** Lección asociada */
  lesson: string;
  /** Estado de la actividad */
  status: ActivityStatus;
  /** Progreso (0-100) que registra el docente */
  progress: number;
  /** Fecha de creación */
  createdAt: string;
  /** Fecha de última actualización */
  updatedAt: string;
}

export type ActivityStatus = 'Pendiente' | 'En desarrollo' | 'En revisión' | 'Aprobada';

export const ACTIVITY_STATUSES: ActivityStatus[] = [
  'Pendiente',
  'En desarrollo',
  'En revisión',
  'Aprobada',
];