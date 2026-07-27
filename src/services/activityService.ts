import api from './api';
import type { Activity } from '../types/activity.types';
import type { ApiResponse } from '../types/api.types';

const IS_MOCK = import.meta.env.VITE_AUTH_MODE === 'mock';

// ── Helper: extraer data de ApiResponse ──
const extractData = <T>(response: { data: ApiResponse<T> | T }): T => {
  const d = response.data;
  if (d && typeof d === 'object' && 'success' in d && 'data' in d) {
    return (d as ApiResponse<T>).data;
  }
  return d as T;
};

const stamp = () => new Date().toISOString();

// ── Datos mock ──
let MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    title: 'Rutina de Fuerza Nivel 2',
    description: 'Completar 3 series de 12 repeticiones de press banca, sentadilla y peso muerto.',
    moduleId: '1',
    courseId: 'Entrenamiento Funcional Completo',
    studentId: '1',
    teacherId: 't1',
    lesson: 'Semana 3 - Fuerza básica',
    status: 'En revisión',
    progress: 75,
    createdAt: stamp(),
    updatedAt: stamp(),
  },
  {
    id: 'a2',
    title: 'Plan Nutricional Semana 3',
    description: 'Diseñar un plan de alimentación con macros calculados para la semana.',
    moduleId: '2',
    courseId: 'Nutrición Deportiva Avanzada',
    studentId: '2',
    teacherId: 't1',
    lesson: 'Macronutrientes',
    attachmentUrl: '#',
    attachmentName: 'plantilla-plan.docx',
    status: 'Aprobada',
    progress: 100,
    createdAt: stamp(),
    updatedAt: stamp(),
  },
  {
    id: 'a3',
    title: 'Sesión de Meditación 10 min',
    description: 'Realizar una sesión de meditación guiada de 10 minutos y registrar la experiencia.',
    moduleId: '5',
    courseId: 'Mindfulness y Bienestar Mental',
    studentId: '3',
    teacherId: 't1',
    lesson: 'Mindfulness básico',
    status: 'En desarrollo',
    progress: 40,
    createdAt: stamp(),
    updatedAt: stamp(),
  },
  {
    id: 'a4',
    title: 'Evaluación de Composición Corporal',
    description: 'Tomar medidas corporales y calcular IMC, porcentaje de grasa y masa muscular.',
    moduleId: '4',
    courseId: 'Entrenamiento Funcional Completo',
    studentId: '4',
    teacherId: 't1',
    lesson: 'Semana 1 - Evaluación inicial',
    status: 'Pendiente',
    progress: 0,
    createdAt: stamp(),
    updatedAt: stamp(),
  },
  {
    id: 'a5',
    title: 'Dieta Anti-inflamatoria',
    description: 'Investigar y listar 10 alimentos anti-inflamatorios y crear un menú de 3 días.',
    moduleId: '3',
    courseId: 'Nutrición Deportiva Avanzada',
    studentId: '6',
    teacherId: 't1',
    lesson: 'Nutrición avanzada',
    status: 'Pendiente',
    progress: 0,
    createdAt: stamp(),
    updatedAt: stamp(),
  },
  {
    id: 'a6',
    title: 'Técnicas de Respiración',
    description: 'Practicar la técnica 4-7-8 durante 5 minutos, 3 veces al día.',
    moduleId: '6',
    courseId: 'Mindfulness y Bienestar Mental',
    studentId: '1',
    teacherId: 't1',
    lesson: 'Respiración consciente',
    status: 'En desarrollo',
    progress: 30,
    createdAt: stamp(),
    updatedAt: stamp(),
  },
  // ── Actividades para el Estudiante Demo (id:9) ──
  {
    id: 'a7',
    title: 'Fundamentos del Movimiento - Evaluación',
    description: 'Completar la evaluación práctica de los fundamentos del movimiento funcional.',
    moduleId: '1',
    courseId: 'Entrenamiento Funcional Completo',
    studentId: '9',
    teacherId: 't1',
    lesson: 'Semana 1 - Fundamentos',
    status: 'En desarrollo',
    progress: 45,
    createdAt: stamp(),
    updatedAt: stamp(),
  },
  {
    id: 'a8',
    title: 'Hipertrofia y Fuerza - Rutina inicial',
    description: 'Realizar la rutina de hipertrofia nivel básico y registrar cargas.',
    moduleId: '2',
    courseId: 'Entrenamiento Funcional Completo',
    studentId: '9',
    teacherId: 't1',
    lesson: 'Semana 4 - Hipertrofia',
    status: 'Pendiente',
    progress: 0,
    createdAt: stamp(),
    updatedAt: stamp(),
  },
  {
    id: 'a9',
    title: 'Mindfulness - Práctica diaria',
    description: 'Registrar 7 días de práctica de mindfulness de 5 minutos mínimo.',
    moduleId: '5',
    courseId: 'Mindfulness y Bienestar Mental',
    studentId: '9',
    teacherId: 't1',
    lesson: 'Semana 1 - Mindfulness',
    status: 'Aprobada',
    progress: 100,
    createdAt: stamp(),
    updatedAt: stamp(),
  },
];

// ── GET /activities ──
export const getActivitiesRequest = async (): Promise<Activity[]> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return [...MOCK_ACTIVITIES];
  }
  const response = await api.get<ApiResponse<Activity[]>>('/activities');
  return extractData(response);
};

// ── GET /activities?teacherId=xxx ──
export const getActivitiesByTeacherRequest = async (teacherId: string): Promise<Activity[]> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_ACTIVITIES.filter((a) => a.teacherId === teacherId);
  }
  const response = await api.get<ApiResponse<Activity[]>>(`/activities?teacherId=${teacherId}`);
  return extractData(response);
};

// ── GET /activities?studentId=xxx ──
export const getActivitiesByStudentRequest = async (studentId: string): Promise<Activity[]> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_ACTIVITIES.filter((a) => a.studentId === studentId);
  }
  const response = await api.get<ApiResponse<Activity[]>>(`/activities?studentId=${studentId}`);
  return extractData(response);
};

// ── POST /activities ──
export const createActivityRequest = async (payload: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const now = stamp();
    const activity: Activity = {
      ...payload,
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11),
      createdAt: now,
      updatedAt: now,
    };
    MOCK_ACTIVITIES = [activity, ...MOCK_ACTIVITIES];
    return { ...activity };
  }
  const response = await api.post<ApiResponse<Activity>>('/activities', payload);
  return extractData(response);
};

// ── PUT /activities/:id ──
export const updateActivityRequest = async (id: string, payload: Partial<Omit<Activity, 'id' | 'createdAt'>>): Promise<Activity> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const index = MOCK_ACTIVITIES.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Actividad no encontrada');
    MOCK_ACTIVITIES[index] = {
      ...MOCK_ACTIVITIES[index],
      ...payload,
      updatedAt: stamp(),
    };
    return { ...MOCK_ACTIVITIES[index] };
  }
  const response = await api.put<ApiResponse<Activity>>(`/activities/${id}`, payload);
  return extractData(response);
};

// ── DELETE /activities/:id ──
export const deleteActivityRequest = async (id: string): Promise<void> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    MOCK_ACTIVITIES = MOCK_ACTIVITIES.filter((a) => a.id !== id);
    return;
  }
  await api.delete(`/activities/${id}`);
};