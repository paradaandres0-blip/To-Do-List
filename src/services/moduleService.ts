import api from './api';
import type { ApiResponse } from '../types/api.types';
import type { Module } from '../types/module.types';

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
let MOCK_MODULES: Module[] = [
  {
    id: '1', course: 'Entrenamiento Funcional Completo', title: 'Fundamentos del Movimiento',
    lessons: 8, duration: '4h 30m', status: 'Publicado', progress: 100,
  },
  {
    id: '2', course: 'Entrenamiento Funcional Completo', title: 'Hipertrofia y Fuerza',
    lessons: 10, duration: '5h 20m', status: 'Publicado', progress: 78,
  },
  {
    id: '3', course: 'Nutrición Deportiva Avanzada', title: 'Macronutrientes Esenciales',
    lessons: 7, duration: '3h 45m', status: 'Publicado', progress: 55,
  },
  {
    id: '4', course: 'Nutrición Deportiva Avanzada', title: 'Planes de Alimentación',
    lessons: 6, duration: '3h 10m', status: 'Borrador', progress: 20,
  },
  {
    id: '5', course: 'Mindfulness y Bienestar Mental', title: 'Mindfulness y Meditación',
    lessons: 9, duration: '6h 00m', status: 'Publicado', progress: 90,
  },
  {
    id: '6', course: 'Mindfulness y Bienestar Mental', title: 'Gestión del Estrés',
    lessons: 5, duration: '2h 30m', status: 'Publicado', progress: 42,
  },
];

// ── GET /modules ──
export const getModulesRequest = async (): Promise<Module[]> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return [...MOCK_MODULES];
  }
  const response = await api.get<ApiResponse<Module[]>>('/modules');
  return extractData(response);
};

// ── POST /modules ──
export const createModuleRequest = async (payload: Omit<Module, 'id'>): Promise<Module> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const newModule: Module = {
      ...payload,
      id: Math.random().toString(36).substring(2, 9),
    };
    MOCK_MODULES = [newModule, ...MOCK_MODULES];
    return newModule;
  }
  const response = await api.post<ApiResponse<Module>>('/modules', payload);
  return extractData(response);
};

// ── PUT /modules/:id ──
export const updateModuleRequest = async (id: string, payload: Partial<Omit<Module, 'id'>>): Promise<Module> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const index = MOCK_MODULES.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Módulo no encontrado');
    const updated: Module = {
      ...MOCK_MODULES[index],
      ...payload,
    };
    MOCK_MODULES[index] = updated;
    return updated;
  }
  const response = await api.put<ApiResponse<Module>>(`/modules/${id}`, payload);
  return extractData(response);
};

// ── DELETE /modules/:id ──
export const deleteModuleRequest = async (id: string): Promise<void> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    MOCK_MODULES = MOCK_MODULES.filter((m) => m.id !== id);
    return;
  }
  await api.delete(`/modules/${id}`);
};
