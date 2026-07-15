import { create } from 'zustand';
import type { Student } from '../types/student.types';

interface StudentState {
  students: Student[];
  getTopBySessions: (limit?: number) => Student[];
}

const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

/** Data falsa local — fechas relativas a hoy, sin año 2025 fijo. */
const INITIAL_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Mariana López',
    email: 'mariana@mail.com',
    phone: '+57 300 111 2222',
    program: 'Entrenamiento Funcional',
    group: 'Cohorte Fitness',
    status: 'Activo',
    sessions: 48,
    progress: 82,
    joinedAt: daysAgo(180),
  },
  {
    id: '2',
    name: 'Carlos Ruiz',
    email: 'carlos@mail.com',
    phone: '+57 310 333 4444',
    program: 'Nutrición Deportiva',
    group: 'Programa Nutrición Pro',
    status: 'Activo',
    sessions: 41,
    progress: 67,
    joinedAt: daysAgo(150),
  },
  {
    id: '3',
    name: 'Laura Gómez',
    email: 'laura@mail.com',
    phone: '+57 320 555 6666',
    program: 'Mindfulness',
    group: 'Bienestar Mental',
    status: 'Activo',
    sessions: 37,
    progress: 74,
    joinedAt: daysAgo(170),
  },
  {
    id: '4',
    name: 'Diego Torres',
    email: 'diego@mail.com',
    phone: '+57 315 777 8888',
    program: 'Pérdida de Peso',
    group: 'Cohorte Fitness',
    status: 'Activo',
    sessions: 33,
    progress: 55,
    joinedAt: daysAgo(120),
  },
  {
    id: '5',
    name: 'Sofía Martínez',
    email: 'sofia@mail.com',
    phone: '+57 311 999 0000',
    program: 'Entrenamiento Funcional',
    group: 'Cohorte Fitness',
    status: 'Inactivo',
    sessions: 12,
    progress: 28,
    joinedAt: daysAgo(140),
  },
  {
    id: '6',
    name: 'Andrés Peña',
    email: 'andres@mail.com',
    phone: '+57 305 123 4567',
    program: 'Nutrición Deportiva',
    group: 'Programa Nutrición Pro',
    status: 'Activo',
    sessions: 29,
    progress: 60,
    joinedAt: daysAgo(90),
  },
  {
    id: '7',
    name: 'Valentina Cruz',
    email: 'vale@mail.com',
    phone: '+57 318 234 5678',
    program: 'Mindfulness',
    group: 'Bienestar Mental',
    status: 'Suspendido',
    sessions: 5,
    progress: 10,
    joinedAt: daysAgo(100),
  },
  {
    id: '8',
    name: 'Juliana Ríos',
    email: 'juliana@mail.com',
    phone: '+57 312 345 6789',
    program: 'Pérdida de Peso',
    group: 'Cohorte Fitness',
    status: 'Activo',
    sessions: 44,
    progress: 90,
    joinedAt: daysAgo(200),
  },
];

const useStudentStore = create<StudentState>((_set, get) => ({
  students: INITIAL_STUDENTS,

  getTopBySessions: (limit = 4) => {
    return [...get().students]
      .filter((s) => s.status === 'Activo' && s.sessions > 0)
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, limit);
  },
}));

export default useStudentStore;
