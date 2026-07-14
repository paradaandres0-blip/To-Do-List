import { create } from 'zustand';

type StudentStatus = 'Activo' | 'Inactivo' | 'Suspendido';

type ReportStudent = {
  id: string;
  name: string;
  program: string;
  joinedAt: string;
  status: StudentStatus;
  progress: number;
};

type ReportSession = {
  id: string;
  course: string;
  date: string;
  status: 'Completada' | 'En curso' | 'Pendiente';
  duration: number;
};

interface ReportState {
  students: ReportStudent[];
  sessions: ReportSession[];
  programs: string[];
}

const STUDENTS: ReportStudent[] = [
  { id: '1', name: 'Mariana López',  program: 'Entrenamiento Funcional', joinedAt: '2025-06-04', status: 'Activo',     progress: 82 },
  { id: '2', name: 'Carlos Ruiz',    program: 'Nutrición Deportiva',     joinedAt: '2025-06-15', status: 'Activo',     progress: 67 },
  { id: '3', name: 'Laura Gómez',    program: 'Mindfulness',             joinedAt: '2025-06-22', status: 'Activo',     progress: 74 },
  { id: '4', name: 'Diego Torres',   program: 'Pérdida de Peso',         joinedAt: '2025-07-01', status: 'Activo',     progress: 55 },
  { id: '5', name: 'Sofía Martínez', program: 'Entrenamiento Funcional', joinedAt: '2025-07-04', status: 'Inactivo',   progress: 28 },
  { id: '6', name: 'Andrés Peña',    program: 'Nutrición Deportiva',     joinedAt: '2025-07-08', status: 'Activo',     progress: 60 },
  { id: '7', name: 'Valentina Cruz', program: 'Mindfulness',             joinedAt: '2025-07-12', status: 'Suspendido', progress: 10 },
  { id: '8', name: 'Juliana Ríos',   program: 'Pérdida de Peso',         joinedAt: '2025-07-18', status: 'Activo',     progress: 90 },
];

const SESSIONS: ReportSession[] = [
  { id: '1', course: 'Entrenamiento Funcional', date: '2025-07-05', status: 'Completada', duration: 45 },
  { id: '2', course: 'Nutrición Deportiva',     date: '2025-07-07', status: 'Completada', duration: 30 },
  { id: '3', course: 'Mindfulness',             date: '2025-07-09', status: 'En curso',   duration: 25 },
  { id: '4', course: 'Pérdida de Peso',         date: '2025-07-11', status: 'Completada', duration: 50 },
  { id: '5', course: 'Entrenamiento Funcional', date: '2025-07-14', status: 'Pendiente',  duration: 40 },
  { id: '6', course: 'Nutrición Deportiva',     date: '2025-07-16', status: 'Completada', duration: 40 },
  { id: '7', course: 'Mindfulness',             date: '2025-07-19', status: 'Completada', duration: 35 },
  { id: '8', course: 'Pérdida de Peso',         date: '2025-07-21', status: 'Completada', duration: 55 },
];

const PROGRAMS = [
  'Entrenamiento Funcional',
  'Nutrición Deportiva',
  'Mindfulness',
  'Pérdida de Peso',
  'Bienestar Mental',
];

const useReportStore = create<ReportState>(() => ({
  students: STUDENTS,
  sessions: SESSIONS,
  programs: PROGRAMS,
}));

export default useReportStore;
