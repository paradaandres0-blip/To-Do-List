import api from './api';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';
import type { Student } from '../types/student.types';

type StudentPayload = Omit<Student, 'id' | 'sessions' | 'progress' | 'joinedAt' | 'active' | 'program'> &
  Partial<Pick<Student, 'program' | 'active'>> & { password?: string };

type StudentResponse = Student & { generatedPassword?: string };

const extractData = <T>(response: { data: unknown }): T => {
  const d = response.data;
  if (d && typeof d === 'object' && 'success' in d && 'data' in d) {
    return (d as ApiResponse<T>).data;
  }
  return d as T;
};

export const getStudentsRequest = async (page = 1, pageSize = 1000): Promise<PaginatedResponse<Student>> => {
  const response = await api.get<ApiResponse<PaginatedResponse<Student>> | PaginatedResponse<Student> | ApiResponse<Student[]>>('/students', { params: { page, pageSize } });
  const extracted = extractData<PaginatedResponse<Student> | Student[]>(response);

  if (Array.isArray(extracted)) {
    return { data: extracted, total: extracted.length, page, pageSize, totalPages: 1 };
  }

  return extracted;
};

export const getStudentByIdRequest = async (id: string): Promise<Student> => {
  const response = await api.get<ApiResponse<Student>>(`/students/${id}`);
  return extractData(response);
};

export const createStudentRequest = async (payload: StudentPayload): Promise<StudentResponse> => {
  const response = await api.post<ApiResponse<StudentResponse>>('/students', payload);
  return extractData(response);
};

export const updateStudentRequest = async (
  id: string,
  payload: Partial<StudentPayload & Pick<Student, 'sessions' | 'progress'>>
): Promise<Student> => {
  const response = await api.put<ApiResponse<Student>>(`/students/${id}`, payload);
  return extractData(response);
};

export const deleteStudentRequest = async (id: string): Promise<void> => {
  await api.delete(`/students/${id}`);
};

export const resetStudentPasswordRequest = async (id: string): Promise<string> => {
  const response = await api.post<ApiResponse<{ generatedPassword: string }>>(`/students/${id}/reset-password`);
  const data = extractData<{ generatedPassword: string }>(response);
  return data.generatedPassword;
};