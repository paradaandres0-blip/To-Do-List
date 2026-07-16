import { create } from 'zustand';
import {
  deleteStudentRequest, getStudentsRequest, updateStudentRequest,
} from '../services/studentService';
import type { Student } from '../types/student.types';

interface StudentState {
  students: Student[];
  loadStudents: () => Promise<void>;
  getTopBySessions: (limit?: number) => Student[];
  getByTeacherId: (teacherId: string) => Student[];
  updateStudentProgress: (id: string, progress: number) => Promise<void>;
  getPendingRequests: () => Student[];
  acceptRequest: (id: string) => Promise<void>;
  rejectRequest: (id: string) => Promise<void>;
  assignToGroup: (id: string, program: string, group: string, teacherId?: string) => Promise<void>;
}

const useStudentStore = create<StudentState>((set, get) => ({
  students: [],
  loadStudents: async () => {
    const response = await getStudentsRequest();
    set({ students: response.data });
  },
  getTopBySessions: (limit = 4) => [...get().students].filter((student) => student.status === 'Activo' && student.sessions > 0).sort((a, b) => b.sessions - a.sessions).slice(0, limit),
  getByTeacherId: (teacherId) => get().students.filter((student) => student.teacherId === teacherId),
  updateStudentProgress: async (id, progress) => {
    const updated = await updateStudentRequest(id, { progress: Math.max(0, Math.min(100, progress)) });
    set((state) => ({ students: state.students.map((student) => student.id === id ? updated : student) }));
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
  assignToGroup: async (id, program, group, teacherId) => {
    const updated = await updateStudentRequest(id, { program, group, teacherId });
    set((state) => ({ students: state.students.map((student) => student.id === id ? updated : student) }));
  },
}));

void useStudentStore.getState().loadStudents().catch((error: unknown) => console.error('No se pudieron cargar los alumnos', error));
export default useStudentStore;
