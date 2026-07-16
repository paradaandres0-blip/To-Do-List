import api from './api';
import type { ApiResponse } from '../types/api.types';
import type { Course } from '../types/course.types';

// ── Helper: extraer data de ApiResponse ──
const extractData = <T>(response: { data: ApiResponse<T> | T }): T => {
  const d = response.data;
  if (d && typeof d === 'object' && 'success' in d && 'data' in d) {
    return (d as ApiResponse<T>).data;
  }
  return d as T;
};

const IS_MOCK = import.meta.env.VITE_AUTH_MODE === 'mock';

// ── Datos mock iniciales ──
let MOCK_COURSES: Course[] = [
  {
    id: '1',
    title: 'Entrenamiento Funcional Completo',
    description: 'Programa de 12 semanas para desarrollar fuerza, resistencia y movilidad con ejercicios funcionales.',
    group: 'Cohorte Fitness 2026',
    modulesCount: 8,
    status: 'Publicado',
    lastUpdate: 'Hace 2 días',
  },
  {
    id: '2',
    title: 'Nutrición Deportiva Avanzada',
    description: 'Diseño de planes de alimentación para optimizar el rendimiento físico y la recuperación muscular.',
    group: 'Programa Nutrición Pro',
    modulesCount: 5,
    status: 'Borrador',
    lastUpdate: 'Hace 5 horas',
  },
  {
    id: '3',
    title: 'Mindfulness y Bienestar Mental',
    description: 'Técnicas de meditación, respiración consciente y gestión del estrés para equilibrio emocional.',
    group: 'Cohorte Bienestar 2026',
    modulesCount: 6,
    status: 'Publicado',
    lastUpdate: 'Hace 1 semana',
  },
];

// ── GET /courses ──
export const getCoursesRequest = async (): Promise<Course[]> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return [...MOCK_COURSES];
  }
  const response = await api.get<ApiResponse<Course[]>>('/courses');
  return extractData(response);
};

// ── POST /courses ──
export const createCourseRequest = async (payload: Omit<Course, 'id' | 'modulesCount' | 'lastUpdate'>): Promise<Course> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const newCourse: Course = {
      ...payload,
      id: Math.random().toString(36).substring(2, 9),
      modulesCount: 0,
      lastUpdate: 'Justo ahora',
    };
    MOCK_COURSES = [newCourse, ...MOCK_COURSES];
    return newCourse;
  }
  const response = await api.post<ApiResponse<Course>>('/courses', payload);
  return extractData(response);
};

// ── PUT /courses/:id ──
export const updateCourseRequest = async (id: string, payload: Partial<Omit<Course, 'id' | 'modulesCount' | 'lastUpdate'>>): Promise<Course> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const index = MOCK_COURSES.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Curso no encontrado');
    const updated: Course = {
      ...MOCK_COURSES[index],
      ...payload,
      lastUpdate: 'Justo ahora',
    };
    MOCK_COURSES[index] = updated;
    return updated;
  }
  const response = await api.put<ApiResponse<Course>>(`/courses/${id}`, payload);
  return extractData(response);
};

// ── DELETE /courses/:id ──
export const deleteCourseRequest = async (id: string): Promise<void> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    MOCK_COURSES = MOCK_COURSES.filter((c) => c.id !== id);
    return;
  }
  await api.delete(`/courses/${id}`);
};
