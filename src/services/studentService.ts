import api from './api';
import type { PaginatedResponse } from '../types/api.types';
import type { Student } from '../types/student.types';

export const IS_MOCK = import.meta.env.VITE_AUTH_MODE === 'mock';
type StudentPayload = Omit<Student, 'id' | 'sessions' | 'progress' | 'joinedAt'>;

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

/** Fuente temporal en memoria; se reemplaza por el API al usar VITE_AUTH_MODE=real. */
let MOCK_STUDENTS: Student[] = [
  ['1','Mariana López','mariana@mail.com','+57 300 111 2222','Entrenamiento Funcional','Cohorte Fitness','Activo',48,82,180,'t2'],
  ['2','Carlos Ruiz','carlos@mail.com','+57 310 333 4444','Nutrición Deportiva','Programa Nutrición Pro','Activo',41,67,150,'t1'],
  ['3','Laura Gómez','laura@mail.com','+57 320 555 6666','Mindfulness','Bienestar Mental','Activo',37,74,170,'t1'],
  ['4','Diego Torres','diego@mail.com','+57 315 777 8888','Pérdida de Peso','Cohorte Fitness','Activo',33,55,120,'t1'],
  ['5','Sofía Martínez','sofia@mail.com','+57 311 999 0000','Entrenamiento Funcional','Cohorte Fitness','Inactivo',12,28,140,'t2'],
  ['6','Andrés Peña','andres@mail.com','+57 305 123 4567','Nutrición Deportiva','Programa Nutrición Pro','Activo',29,60,90,'t1'],
  ['7','Valentina Cruz','vale@mail.com','+57 318 234 5678','Mindfulness','Bienestar Mental','Suspendido',5,10,100,'t1'],
  ['8','Juliana Ríos','juliana@mail.com','+57 312 345 6789','Pérdida de Peso','Cohorte Fitness','Activo',44,90,200,'t2'],
  ['9','Camila Pérez','camila@mail.com','+57 301 222 3333','Entrenamiento Funcional','Cohorte Fitness','Activo',18,35,60,'t2'],
  ['10','Sergio Díaz','sergio@mail.com','+57 302 444 5555','Fuerza y Acondicionamiento','Cohorte Fitness','Activo',8,15,30,'t2'],
  ['11','Isabella Rodríguez','isabella@mail.com','+57 300 555 6666','Entrenamiento Funcional','Cohorte Fitness','Pendiente',0,0,2,'t1'],
  ['12','Mateo Fernández','mateo@mail.com','+57 301 777 8888','Nutrición Deportiva','Programa Nutrición Pro','Pendiente',0,0,5,'t2'],
  ['13','Camila Santos','camila.s@mail.com','+57 310 999 0000','Mindfulness','Bienestar Mental','Pendiente',0,0,1,'t1'],
].map(([id, name, email, phone, program, group, status, sessions, progress, days, teacherId]) => ({
  id: id as string, name: name as string, email: email as string, phone: phone as string,
  program: program as string, group: group as string, status: status as Student['status'],
  sessions: sessions as number, progress: progress as number, joinedAt: daysAgo(days as number), teacherId: teacherId as string,
}));

const clone = (student: Student) => ({ ...student });

export const getStudentsRequest = async (): Promise<PaginatedResponse<Student>> => {
  if (IS_MOCK) return { data: MOCK_STUDENTS.map(clone), total: MOCK_STUDENTS.length, page: 1, pageSize: 20, totalPages: 1 };
  const { data } = await api.get<PaginatedResponse<Student>>('/students');
  return data;
};

export const getStudentByIdRequest = async (id: string): Promise<Student> => {
  if (IS_MOCK) {
    const student = MOCK_STUDENTS.find((item) => item.id === id);
    if (!student) throw new Error('Alumno no encontrado');
    return clone(student);
  }
  const { data } = await api.get<Student>(`/students/${id}`);
  return data;
};

export const createStudentRequest = async (payload: StudentPayload): Promise<Student> => {
  if (IS_MOCK) {
    const created: Student = { ...payload, id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2), sessions: 0, progress: 0, joinedAt: new Date().toISOString().split('T')[0] };
    MOCK_STUDENTS = [created, ...MOCK_STUDENTS];
    return clone(created);
  }
  const { data } = await api.post<Student>('/students', payload);
  return data;
};

export const updateStudentRequest = async (id: string, payload: Partial<StudentPayload & Pick<Student, 'sessions' | 'progress'>>): Promise<Student> => {
  if (IS_MOCK) {
    const index = MOCK_STUDENTS.findIndex((student) => student.id === id);
    if (index === -1) throw new Error('Alumno no encontrado');
    MOCK_STUDENTS[index] = { ...MOCK_STUDENTS[index], ...payload };
    return clone(MOCK_STUDENTS[index]);
  }
  const { data } = await api.put<Student>(`/students/${id}`, payload);
  return data;
};

export const deleteStudentRequest = async (id: string): Promise<void> => {
  if (IS_MOCK) {
    const exists = MOCK_STUDENTS.some((student) => student.id === id);
    if (!exists) throw new Error('Alumno no encontrado');
    MOCK_STUDENTS = MOCK_STUDENTS.filter((student) => student.id !== id);
    return;
  }
  await api.delete(`/students/${id}`);
};
