/**
 * Estado de un estudiante dentro del reporte.
 */
export type StudentStatus = 'Activo' | 'Inactivo' | 'Suspendido';

/**
 * Registro de un estudiante mostrado en los reportes.
 */
export interface ReportStudent {
  /** Identificador único del estudiante. */
  id: string;
  /** Nombre completo del estudiante. */
  name: string;
  /** Programa al que pertenece. */
  program: string;
  /** Fecha de ingreso al programa. */
  joinedAt: string;
  /** Estado actual del estudiante. */
  status: StudentStatus;
  /** Progreso porcentual del estudiante. */
  progress: number;
}

/**
 * Sesión o clase incluida en el reporte.
 */
export interface ReportSession {
  /** Identificador único de la sesión. */
  id: string;
  /** Nombre del curso asociado. */
  course: string;
  /** Fecha de la sesión. */
  date: string;
  /** Estado actual de la sesión. */
  status: 'Completada' | 'En curso' | 'Pendiente';
  /** Duración estimada en minutos. */
  duration: number;
}

/**
 * Filtros disponibles para los reportes.
 */
export interface ReportFilters {
  /** Programa seleccionado para filtrar. */
  program?: string;
  /** Estado del estudiante seleccionado. */
  status?: StudentStatus;
  /** Fecha de inicio del rango. */
  from?: string;
  /** Fecha de fin del rango. */
  to?: string;
}
