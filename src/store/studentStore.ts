import { create } from 'zustand';
import {
  deleteStudentRequest, getStudentsRequest, updateStudentRequest,
} from '../services/studentService';
import type { Student } from '../types/student.types';

const asStudentArray = (value: unknown): Student[] => {
  if (Array.isArray(value)) return value as Student[];
  if (value && typeof value === 'object' && 'data' in value && Array.isArray((value as { data?: unknown }).data)) {
    return (value as { data: Student[] }).data;
  }
  return [];
};

interface StudentState {
  students: Student[];
  loadStudents: () => Promise<void>;
  getTopBySessions: (limit?: number) => Student[];
  getByTeacherId: (teacherId: string) => Student[];
  getByCourseId: (courseId: string) => Student[];
  getByGroup: (groupName: string) => Student[];
  updateStudentProgress: (id: string, progress: number) => Promise<void>;
  updateStudent: (id: string, payload: Partial<Omit<Student, 'id' | 'sessions' | 'progress' | 'joinedAt'>>) => Promise<Student>;
  getPendingRequests: () => Student[];
  acceptRequest: (id: string) => Promise<void>;
  rejectRequest: (id: string) => Promise<void>;
  assignToGroup: (id: string, group: string) => Promise<void>;
}

const useStudentStore = create<StudentState>((set, get) => ({
  students: [],
  loadStudents: async () => {
    try {
      const response = await getStudentsRequest(1, 1000);
      set({ students: asStudentArray(response?.data ?? response) });
    } catch (error) {
      console.error('No se pudieron cargar los alumnos', error);
      set({ students: [] });
    }
  },
  getTopBySessions: (limit = 4) => {
    const safeStudents = asStudentArray(get().students);
    return [...safeStudents]
      .filter((student) => student.status === 'Activo' && student.sessions > 0)
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, limit);
  },
  getByTeacherId: (teacherId) => get().students.filter((student) => student.teacherId === teacherId),
  getByCourseId: (courseId) => get().students.filter((student) => student.program === courseId || student.group === courseId),
  getByGroup: (groupName) => get().students.filter((student) => student.group === groupName),
  updateStudentProgress: async (id, progress) => {
    const updated = await updateStudentRequest(id, { progress: Math.max(0, Math.min(100, progress)) });
    set((state) => ({ students: state.students.map((student) => student.id === id ? updated : student) }));
  },
  updateStudent: async (id, payload) => {
    const updated = await updateStudentRequest(id, payload);
    set((state) => ({ students: state.students.map((student) => student.id === id ? updated : student) }));
    return updated;
  },
  getPendingRequests: () => get().students.filter((student) => student.status === 'Pendiente'),
  acceptRequest: async (id) => {
    const updated = await updateStudentRequest(id, { status: 'Activo' });
    set((state) => ({ students: state.students.map((student) => student.id === id ? updated : student) }));
  },
  rejectRequest: async (id) => {
    await deleteStudentRequest(id);
    set((state) => ({ students: state.students.filter((student) => student.id !== id) }));
  },
  assignToGroup: async (id, group) => {
    const updated = await updateStudentRequest(id, { group });
    set((state) => ({ students: state.students.map((student) => student.id === id ? updated : student) }));
  },
}));

void useStudentStore.getState().loadStudents();
export default useStudentStore;