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

export const getCentersRequest = async (): Promise<Center[]> => {
  const response = await api.get<ApiResponse<Center[]>>('/centers');
  return extractData(response);
};

export const createCenterRequest = async (payload: Omit<Center, 'id' | 'createdAt' | 'updatedAt'>): Promise<Center> => {
  const response = await api.post<ApiResponse<Center>>('/centers', payload);
  return extractData(response);
};

export const updateCenterRequest = async (
  id: string,
  payload: Partial<Omit<Center, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<Center> => {
  const response = await api.put<ApiResponse<Center>>(`/centers/${id}`, payload);
  return extractData(response);
};

export const disableCenterRequest = async (id: string, adminEmail: string, adminPassword: string): Promise<void> => {
  await api.post(`/centers/${id}/disable`, { adminEmail, adminPassword });
};

export const enableCenterRequest = async (id: string, adminEmail: string, adminPassword: string): Promise<void> => {
  await api.post(`/centers/${id}/enable`, { adminEmail, adminPassword });
};

export const deleteCenterRequest = async (id: string, adminEmail: string, adminPassword: string): Promise<void> => {
  await api.delete(`/centers/${id}`, { data: { adminEmail, adminPassword } });
};
