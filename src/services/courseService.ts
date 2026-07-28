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

// ── GET /courses ──
export const getCoursesRequest = async (): Promise<Course[]> => {
  const response = await api.get<ApiResponse<Course[]>>('/courses');
  return extractData(response);
};

// ── POST /courses ──
export const createCourseRequest = async (payload: Omit<Course, 'id' | 'modulesCount' | 'lastUpdate'>): Promise<Course> => {
  const response = await api.post<ApiResponse<Course>>('/courses', payload);
  return extractData(response);
};

// ── PUT /courses/:id ──
export const updateCourseRequest = async (id: string, payload: Partial<Omit<Course, 'id' | 'modulesCount' | 'lastUpdate'>>): Promise<Course> => {
  const response = await api.put<ApiResponse<Course>>(`/courses/${id}`, payload);
  return extractData(response);
};

// ── DELETE /courses/:id ──
export const deleteCourseRequest = async (id: string): Promise<void> => {
  await api.delete(`/courses/${id}`);
};
