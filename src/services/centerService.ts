import api from './api';
import type { ApiResponse } from '../types/api.types';
import type { Center } from '../types/center.types';

const extractData = <T>(response: { data: ApiResponse<T> | T }): T => {
  const d = response.data;
  if (d && typeof d === 'object' && 'success' in d && 'data' in d) {
    return (d as ApiResponse<T>).data;
  }
  return d as T;
};

const IS_MOCK = import.meta.env.VITE_AUTH_MODE === 'mock';
const STORAGE_KEY = 'workflowacademy-centers';

const loadCentersFromStorage = (): Center[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const persistCenters = (centers: Center[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(centers));
};

let MOCK_CENTERS: Center[] = loadCentersFromStorage().length > 0 ? loadCentersFromStorage() : [
  {
    id: 'c1',
    name: 'WorkFlow Academy',
    website: 'www.workflowacademy.co',
    plan: 'Enterprise',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c2',
    name: 'Centro de Salud Vital',
    website: 'www.saludvital.co',
    plan: 'Pro',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

if (IS_MOCK && loadCentersFromStorage().length === 0) {
  persistCenters(MOCK_CENTERS);
}

export const getCentersRequest = async (): Promise<Center[]> => {
  if (IS_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...MOCK_CENTERS];
  }
  const response = await api.get<ApiResponse<Center[]>>('/centers');
  return extractData(response);
};

export const createCenterRequest = async (payload: Omit<Center, 'id' | 'createdAt' | 'updatedAt'>): Promise<Center> => {
  if (IS_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const created: Center = {
      ...payload,
      id: crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_CENTERS = [created, ...MOCK_CENTERS];
    persistCenters(MOCK_CENTERS);
    return created;
  }
  const response = await api.post<ApiResponse<Center>>('/centers', payload);
  return extractData(response);
};

export const updateCenterRequest = async (
  id: string,
  payload: Partial<Omit<Center, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<Center> => {
  if (IS_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = MOCK_CENTERS.findIndex((center) => center.id === id);
    if (index === -1) throw new Error('Centro no encontrado');
    const updated: Center = {
      ...MOCK_CENTERS[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    MOCK_CENTERS[index] = updated;
    persistCenters(MOCK_CENTERS);
    return updated;
  }
  const response = await api.put<ApiResponse<Center>>(`/centers/${id}`, payload);
  return extractData(response);
};

export const deleteCenterRequest = async (id: string): Promise<void> => {
  if (IS_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    MOCK_CENTERS = MOCK_CENTERS.filter((center) => center.id !== id);
    persistCenters(MOCK_CENTERS);
    return;
  }
  await api.delete(`/centers/${id}`);
};
