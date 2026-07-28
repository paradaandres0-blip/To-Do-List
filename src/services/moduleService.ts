import api from './api';
import type { ApiResponse } from '../types/api.types';
import type { Module } from '../types/module.types';

const extractData = <T>(response: { data: ApiResponse<T> | T }): T => {
  const d = response.data;
  if (d && typeof d === 'object' && 'success' in d && 'data' in d) {
    return (d as ApiResponse<T>).data;
  }
  return d as T;
};

export const getModulesRequest = async (): Promise<Module[]> => {
  const response = await api.get<ApiResponse<Module[]>>('/modules');
  return extractData(response);
};

export const createModuleRequest = async (
  payload: Omit<Module, 'id' | 'progress'> & Partial<Pick<Module, 'progress'>>
): Promise<Module> => {
  const response = await api.post<ApiResponse<Module>>('/modules', payload);
  return extractData(response);
};

export const updateModuleRequest = async (
  id: string,
  payload: Partial<Omit<Module, 'id' | 'progress'>> & Partial<Pick<Module, 'progress'>>
): Promise<Module> => {
  const response = await api.put<ApiResponse<Module>>(`/modules/${id}`, payload);
  return extractData(response);
};

export const deleteModuleRequest = async (id: string): Promise<void> => {
  await api.delete(`/modules/${id}`);
};
