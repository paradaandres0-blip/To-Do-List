import api from './api';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';
import type { Student } from '../types/student.types';
import { studentSchema } from '../schemas/student.schema';
import { addMockAccount, getPasswordForAccount } from './mockDb';

export const IS_MOCK = import.meta.env.VITE_AUTH_MODE === 'mock';
type StudentPayload = Omit<Student, 'id' | 'sessions' | 'progress' | 'joinedAt'>;

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

// Validar y crear datos mock con tipos correctos
const createMockStudent = (data: Partial<Student> & { id: string }): Student => {
  const validated = studentSchema.parse({
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    program: data.program,
    group: data.group,
    status: data.status,
  });
  return {
    ...validated,
    sessions: data.sessions ?? 0,
    progress: data.progress ?? 0,
    joinedAt: data.joinedAt ?? daysAgo(0),
    teacherId: data.teacherId ?? '',
  } as Student;
};

/** Fuente temporal en memoria; se reemplaza por el API al usar VITE_AUTH_MODE=real. */
let MOCK_STUDENTS: Student[] = [
  createMockStudent({ id:'1', name:'Mariana López', email:'mariana@mail.com', phone:'+57 300 111 2222', program:'Entrenamiento Funcional', group:'Cohorte Fitness', status:'Activo', sessions:48, progress:82, joinedAt:daysAgo(180), teacherId:'t2' }),
  createMockStudent({ id:'2', name:'Carlos Ruiz', email:'carlos@mail.com', phone:'+57 310 333 4444', program:'Nutrición Deportiva', group:'Programa Nutrición Pro', status:'Activo', sessions:41, progress:67, joinedAt:daysAgo(150), teacherId:'t1' }),
  createMockStudent({ id:'3', name:'Laura Gómez', email:'laura@mail.com', phone:'+57 320 555 6666', program:'Mindfulness', group:'Bienestar Mental', status:'Activo', sessions:37, progress:74, joinedAt:daysAgo(170), teacherId:'t1' }),
  createMockStudent({ id:'4', name:'Diego Torres', email:'diego@mail.com', phone:'+57 315 777 8888', program:'Pérdida de Peso', group:'Cohorte Fitness', status:'Activo', sessions:33, progress:55, joinedAt:daysAgo(120), teacherId:'t1' }),
  createMockStudent({ id:'5', name:'Sofía Martínez', email:'sofia@mail.com', phone:'+57 311 999 0000', program:'Entrenamiento Funcional', group:'Cohorte Fitness', status:'Inactivo', sessions:12, progress:28, joinedAt:daysAgo(140), teacherId:'t2' }),
  createMockStudent({ id:'6', name:'Andrés Peña', email:'andres@mail.com', phone:'+57 305 123 4567', program:'Nutrición Deportiva', group:'Programa Nutrición Pro', status:'Activo', sessions:29, progress:60, joinedAt:daysAgo(90), teacherId:'t1' }),
  createMockStudent({ id:'7', name:'Valentina Cruz', email:'vale@mail.com', phone:'+57 318 234 5678', program:'Mindfulness', group:'Bienestar Mental', status:'Suspendido', sessions:5, progress:10, joinedAt:daysAgo(100), teacherId:'t1' }),
  createMockStudent({ id:'8', name:'Juliana Ríos', email:'juliana@mail.com', phone:'+57 312 345 6789', program:'Pérdida de Peso', group:'Cohorte Fitness', status:'Activo', sessions:44, progress:90, joinedAt:daysAgo(200), teacherId:'t2' }),
  createMockStudent({ id:'9', name:'Camila Pérez', email:'camila@mail.com', phone:'+57 301 222 3333', program:'Entrenamiento Funcional', group:'Cohorte Fitness', status:'Activo', sessions:18, progress:35, joinedAt:daysAgo(60), teacherId:'t2' }),
  createMockStudent({ id:'10', name:'Sergio Díaz', email:'sergio@mail.com', phone:'+57 302 444 5555', program:'Fuerza y Acondicionamiento', group:'Cohorte Fitness', status:'Activo', sessions:8, progress:15, joinedAt:daysAgo(30), teacherId:'t2' }),
  createMockStudent({ id:'11', name:'Isabella Rodríguez', email:'isabella@mail.com', phone:'+57 300 555 6666', program:'Entrenamiento Funcional', group:'Cohorte Fitness', status:'Pendiente', sessions:0, progress:0, joinedAt:daysAgo(2), teacherId:'t1' }),
  createMockStudent({ id:'12', name:'Mateo Fernández', email:'mateo@mail.com', phone:'+57 301 777 8888', program:'Nutrición Deportiva', group:'Programa Nutrición Pro', status:'Pendiente', sessions:0, progress:0, joinedAt:daysAgo(5), teacherId:'t2' }),
  createMockStudent({ id:'13', name:'Camila Santos', email:'camila.s@mail.com', phone:'+57 310 999 0000', program:'Mindfulness', group:'Bienestar Mental', status:'Pendiente', sessions:0, progress:0, joinedAt:daysAgo(1), teacherId:'t1' }),
  ];

const clone = (student: Student) => ({ ...student });

// ── Helper: extraer data de ApiResponse ──
const extractData = <T>(response: { data: ApiResponse<T> | T }): T => {
  const d = response.data;
  // Si tiene la forma ApiResponse { data, message, success }, extraer d.data
  if (d && typeof d === 'object' && 'success' in d && 'data' in d) {
    return (d as ApiResponse<T>).data;
  }
  return d as T;
};

export const getStudentsRequest = async (page = 1, pageSize = 10): Promise<PaginatedResponse<Student>> => {
  if (IS_MOCK) {
    const total = MOCK_STUDENTS.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const data = MOCK_STUDENTS.slice(start, start + pageSize).map(clone);
    return { data, total, page, pageSize, totalPages };
  }
  const response = await api.get<PaginatedResponse<Student>>('/students', { params: { page, pageSize } });
  return extractData(response);
};

export const getStudentByIdRequest = async (id: string): Promise<Student> => {
  if (IS_MOCK) {
    const student = MOCK_STUDENTS.find((item) => item.id === id);
    if (!student) throw new Error('Alumno no encontrado');
    return clone(student);
  }
  const response = await api.get<ApiResponse<Student>>(`/students/${id}`);
  return extractData(response);
};

export const createStudentRequest = async (payload: StudentPayload): Promise<Student> => {
  if (IS_MOCK) {
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    const created: Student = { ...payload, id, sessions: 0, progress: 0, joinedAt: new Date().toISOString().split('T')[0] };
    MOCK_STUDENTS = [created, ...MOCK_STUDENTS];

    // Crear también cuenta de login para el estudiante
    addMockAccount(created.email, created.name, 'student');

    return clone(created);
  }
  const response = await api.post<ApiResponse<Student>>('/students', payload);
  return extractData(response);
};

export const updateStudentRequest = async (id: string, payload: Partial<StudentPayload & Pick<Student, 'sessions' | 'progress'>>): Promise<Student> => {
  if (IS_MOCK) {
    const index = MOCK_STUDENTS.findIndex((student) => student.id === id);
    if (index === -1) throw new Error('Alumno no encontrado');
    MOCK_STUDENTS[index] = { ...MOCK_STUDENTS[index], ...payload };
    return clone(MOCK_STUDENTS[index]);
  }
  const response = await api.put<ApiResponse<Student>>(`/students/${id}`, payload);
  return extractData(response);
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
