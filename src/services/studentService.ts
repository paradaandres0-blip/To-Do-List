import api from './api';
import type { Student } from '../types/student.types';
import type { PaginatedResponse } from '../types/api.types';

const IS_MOCK = import.meta.env.VITE_AUTH_MODE === 'mock';

// ── Datos mock ──
const MOCK_STUDENTS: Student[] = [
  { id:'1', name:'Mariana López',   email:'mariana@mail.com', phone:'+57 300 111 2222', program:'Entrenamiento Funcional', group:'Cohorte Fitness 2026',  status:'Activo',    sessions:48, progress:82, joinedAt:'2025-01-10' },
  { id:'2', name:'Carlos Ruiz',     email:'carlos@mail.com',  phone:'+57 310 333 4444', program:'Nutrición Deportiva',     group:'Programa Nutrición Pro', status:'Activo',    sessions:41, progress:67, joinedAt:'2025-02-14' },
  { id:'3', name:'Laura Gómez',     email:'laura@mail.com',   phone:'+57 320 555 6666', program:'Mindfulness',             group:'Bienestar Mental',       status:'Activo',    sessions:37, progress:74, joinedAt:'2025-01-22' },
  { id:'4', name:'Diego Torres',    email:'diego@mail.com',   phone:'+57 315 777 8888', program:'Pérdida de Peso',         group:'Cohorte Fitness 2026',   status:'Activo',    sessions:33, progress:55, joinedAt:'2025-03-05' },
  { id:'5', name:'Sofía Martínez',  email:'sofia@mail.com',   phone:'+57 311 999 0000', program:'Entrenamiento Funcional', group:'Cohorte Fitness 2026',   status:'Inactivo',  sessions:12, progress:28, joinedAt:'2025-02-28' },
  { id:'6', name:'Andrés Peña',     email:'andres@mail.com',  phone:'+57 305 123 4567', program:'Nutrición Deportiva',     group:'Programa Nutrición Pro', status:'Activo',    sessions:29, progress:60, joinedAt:'2025-04-01' },
  { id:'7', name:'Valentina Cruz',  email:'vale@mail.com',    phone:'+57 318 234 5678', program:'Mindfulness',             group:'Bienestar Mental',       status:'Suspendido',sessions:5,  progress:10, joinedAt:'2025-03-15' },
  { id:'8', name:'Juliana Ríos',    email:'juliana@mail.com', phone:'+57 312 345 6789', program:'Pérdida de Peso',         group:'Cohorte Fitness 2026',   status:'Activo',    sessions:44, progress:90, joinedAt:'2025-01-05' },
];

// ── GET /students ──
export const getStudentsRequest = async (): Promise<PaginatedResponse<Student>> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    return { data: MOCK_STUDENTS, total: MOCK_STUDENTS.length, page: 1, pageSize: 20, totalPages: 1 };
  }
  const { data } = await api.get<PaginatedResponse<Student>>('/students');
  return data;
};

// ── POST /students ──
export const createStudentRequest = async (payload: Omit<Student, 'id' | 'sessions' | 'progress' | 'joinedAt'>): Promise<Student> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return { ...payload, id: Math.random().toString(36).slice(2), sessions: 0, progress: 0, joinedAt: new Date().toISOString().split('T')[0] };
  }
  const { data } = await api.post<Student>('/students', payload);
  return data;
};

// ── DELETE /students/:id ──
export const deleteStudentRequest = async (id: string): Promise<void> => {
  if (IS_MOCK) { await new Promise((r) => setTimeout(r, 300)); return; }
  await api.delete(`/students/${id}`);
};
