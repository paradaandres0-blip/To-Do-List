import api from './api';
import type {
  CreateTeacherPayload,
  Teacher,
  UpdateTeacherPayload,
} from '../types/teacher.types';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';

export type TeacherResponse = Teacher & { generatedPassword?: string };

const extractData = <T>(response: { data: unknown }): T => {
  const d = response.data;
  if (d && typeof d === 'object' && 'success' in d && 'data' in d) {
    return (d as ApiResponse<T>).data;
  }
  return d as T;
};

export const getTeachersRequest = async (page = 1, pageSize = 10): Promise<PaginatedResponse<Teacher>> => {
  const response = await api.get<ApiResponse<Teacher[]> | PaginatedResponse<Teacher>>('/teachers', { params: { page, pageSize } });
  const result = extractData<PaginatedResponse<Teacher> | Teacher[]>(response);

  if (Array.isArray(result)) {
    const total = result.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const data = result.slice(start, start + pageSize);
    return { data, total, page, pageSize, totalPages };
  }

  return result as PaginatedResponse<Teacher>;
};

export const getTeacherByIdRequest = async (id: string): Promise<Teacher> => {
  const response = await api.get<ApiResponse<Teacher>>(`/teachers/${id}`);
  return extractData(response);
};

export const createTeacherRequest = async (
  payload: CreateTeacherPayload,
): Promise<TeacherResponse> => {
  const response = await api.post<ApiResponse<TeacherResponse>>('/teachers', payload);
  return extractData(response);
};

export const updateTeacherRequest = async (
  id: string,
  payload: UpdateTeacherPayload,
): Promise<Teacher> => {
  const response = await api.put<ApiResponse<Teacher>>(`/teachers/${id}`, payload);
  return extractData(response);
};

export const deleteTeacherRequest = async (id: string): Promise<void> => {
  await api.delete(`/teachers/${id}`);
};

export const resetTeacherPasswordRequest = async (id: string): Promise<string> => {
  const response = await api.post<ApiResponse<{ generatedPassword: string }>>(`/teachers/${id}/reset-password`);
  const data = extractData<{ generatedPassword: string }>(response);
  return data.generatedPassword;
};
