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
const STORAGE_KEY = 'workflowacademy-modules';

const loadModulesFromStorage = (): Module[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const persistModules = (modules: Module[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
};

// ── Datos mock iniciales ──
let MOCK_MODULES: Module[] = loadModulesFromStorage().length > 0 ? loadModulesFromStorage() : [
  {
    id: '1', course: 'Entrenamiento Funcional Completo', title: 'Fundamentos del Movimiento',
    lessons: 0, duration: '4h 30m', status: 'Activo', progress: 100,
  },
  {
    id: '2', course: 'Entrenamiento Funcional Completo', title: 'Hipertrofia y Fuerza',
    lessons: 0, duration: '5h 20m', status: 'Activo', progress: 78,
  },
  {
    id: '3', course: 'Nutrición Deportiva Avanzada', title: 'Macronutrientes Esenciales',
    lessons: 0, duration: '3h 45m', status: 'Inactivo', progress: 20,
  },
  {
    id: '4', course: 'Nutrición Deportiva Avanzada', title: 'Planes de Alimentación',
    lessons: 0, duration: '3h 10m', status: 'Inactivo', progress: 20,
  },
  {
    id: '5', course: 'Mindfulness y Bienestar Mental', title: 'Mindfulness y Meditación',
    lessons: 0, duration: '6h 00m', status: 'Activo', progress: 90,
  },
  {
    id: '6', course: 'Mindfulness y Bienestar Mental', title: 'Gestión del Estrés',
    lessons: 0, duration: '2h 30m', status: 'Activo', progress: 42,
  },
];

if (IS_MOCK && loadModulesFromStorage().length === 0) {
  persistModules(MOCK_MODULES);
}

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
export const createModuleRequest = async (
  payload: Omit<Module, 'id' | 'progress'> & Partial<Pick<Module, 'progress'>>
): Promise<Module> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const newModule: Module = {
      ...payload,
      id: Math.random().toString(36).substring(2, 9),
      progress: payload.progress ?? 0,
    };
    MOCK_MODULES = [newModule, ...MOCK_MODULES];
    persistModules(MOCK_MODULES);
    return newModule;
  }
  const response = await api.post<ApiResponse<Module>>('/modules', payload);
  return extractData(response);
};

// ── PUT /modules/:id ──
export const updateModuleRequest = async (
  id: string,
  payload: Partial<Omit<Module, 'id' | 'progress'>> & Partial<Pick<Module, 'progress'>>
): Promise<Module> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const index = MOCK_MODULES.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Módulo no encontrado');
    const updated: Module = {
      ...MOCK_MODULES[index],
      ...payload,
      progress: payload.progress ?? MOCK_MODULES[index].progress,
    };
    MOCK_MODULES[index] = updated;
    persistModules(MOCK_MODULES);
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
    persistModules(MOCK_MODULES);
    return;
  }
  await api.delete(`/modules/${id}`);
};
