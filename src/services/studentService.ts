import api from './api';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';
import type { Student } from '../types/student.types';
import {
  SHARED_STUDENTS,
  cloneStudents,
  addStudent as sharedAddStudent,
  updateStudent as sharedUpdateStudent,
  removeStudent as sharedRemoveStudent,
  getProgramForGroup,
} from './sharedMockDb';

export const IS_MOCK = import.meta.env.VITE_AUTH_MODE === 'mock';
type StudentPayload = Omit<Student, 'id' | 'sessions' | 'progress' | 'joinedAt' | 'active' | 'program'> & Partial<Pick<Student, 'program' | 'active'>>;

const extractData = <T>(response: { data: ApiResponse<T> | T }): T => {
  const d = response.data;
  if (d && typeof d === 'object' && 'success' in d && 'data' in d) {
    return (d as ApiResponse<T>).data;
  }
  return d as T;
};

export const getStudentsRequest = async (page = 1, pageSize = 50): Promise<PaginatedResponse<Student>> => {
  if (IS_MOCK) {
    const all = cloneStudents();
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const data = all.slice(start, start + pageSize);
    return { data, total, page, pageSize, totalPages };
  }
  const response = await api.get<PaginatedResponse<Student>>('/students', { params: { page, pageSize } });
  return extractData(response);
};

export const getStudentByIdRequest = async (id: string): Promise<Student> => {
  if (IS_MOCK) {
    const student = SHARED_STUDENTS.find((item) => item.id === id);
    if (!student) throw new Error('Alumno no encontrado');
    return { ...student };
  }
  const response = await api.get<ApiResponse<Student>>(`/students/${id}`);
  return extractData(response);
};

export const createStudentRequest = async (payload: StudentPayload): Promise<Student> => {
  if (IS_MOCK) {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    const program = getProgramForGroup(payload.group) || payload.program || '';
    const created: Student = {
      ...payload,
      id,
      program,
      active: payload.active ?? true,
      sessions: 0,
      progress: 0,
      joinedAt: new Date().toISOString().split('T')[0],
    };
    sharedAddStudent(created);
    return { ...created };
  }
  const response = await api.post<ApiResponse<Student>>('/students', payload);
  return extractData(response);
};

export const updateStudentRequest = async (
  id: string,
  payload: Partial<StudentPayload & Pick<Student, 'sessions' | 'progress'>>
): Promise<Student> => {
  if (IS_MOCK) {
    const index = SHARED_STUDENTS.findIndex((student) => student.id === id);
    if (index === -1) throw new Error('Alumno no encontrado');
    if (payload.group) {
      payload.program = getProgramForGroup(payload.group) || payload.program;
    }
    sharedUpdateStudent(id, payload);
    return { ...SHARED_STUDENTS[index] };
  }
  const response = await api.put<ApiResponse<Student>>(`/students/${id}`, payload);
  return extractData(response);
};

export const deleteStudentRequest = async (id: string): Promise<void> => {
  if (IS_MOCK) {
    const exists = SHARED_STUDENTS.some((student) => student.id === id);
    if (!exists) throw new Error('Alumno no encontrado');
    sharedRemoveStudent(id);
    return;
  }
  await api.delete(`/students/${id}`);
};