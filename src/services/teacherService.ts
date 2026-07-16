import api from './api';
import type {
  CreateTeacherPayload,
  Teacher,
  UpdateTeacherPayload,
} from '../types/teacher.types';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';
import { teacherSchema } from '../schemas/teacher.schema';

// ── Helper: extraer data de ApiResponse ──
const extractData = <T>(response: { data: ApiResponse<T> | T }): T => {
  const d = response.data;
  if (d && typeof d === 'object' && 'success' in d && 'data' in d) {
    return (d as ApiResponse<T>).data;
  }
  return d as T;
};

const IS_MOCK = import.meta.env.VITE_AUTH_MODE === 'mock';

const nowIso = () => new Date().toISOString();

// Validar y crear datos mock con tipos correctos
const createMockTeacher = (data: Partial<Teacher> & { id: string }): Teacher => {
  const validated = teacherSchema.parse({
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    city: data.city,
    specialties: data.specialties,
    status: data.status,
  });
  return {
    ...validated,
    createdAt: data.createdAt ?? nowIso(),
    updatedAt: data.updatedAt ?? nowIso(),
  } as Teacher;
};

/**
 * Mock en memoria — simula la tabla `teachers` de PostgreSQL.
 * Al conectar el API real, solo hay que poner VITE_AUTH_MODE=real
 * y apuntar VITE_API_URL al backend.
 */
let MOCK_TEACHERS: Teacher[] = [
  createMockTeacher({
    id: 't1',
    name: 'Ana Gómez',
    email: 'ana.gomez@workflow.academy',
    phone: '+57 300 555 0101',
    city: 'Bogotá',
    specialties: ['Nutrición Deportiva', 'Pérdida de Peso'],
    status: 'Activo',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }),
  createMockTeacher({
    id: 't2',
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@workflow.academy',
    phone: '+57 310 555 0202',
    city: 'Medellín',
    specialties: ['Entrenamiento Funcional', 'Fuerza y Acondicionamiento'],
    status: 'Activo',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }),
];

// ── GET /teachers ──
export const getTeachersRequest = async (page = 1, pageSize = 10): Promise<PaginatedResponse<Teacher>> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const total = MOCK_TEACHERS.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const data = MOCK_TEACHERS.slice(start, start + pageSize).map((t) => ({ ...t }));
    return { data, total, page, pageSize, totalPages };
  }
  const response = await api.get<PaginatedResponse<Teacher>>('/teachers', { params: { page, pageSize } });
  return extractData(response);
};

// ── GET /teachers/:id ──
export const getTeacherByIdRequest = async (id: string): Promise<Teacher> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const found = MOCK_TEACHERS.find((t) => t.id === id);
    if (!found) throw new Error('Docente no encontrado');
    return { ...found };
  }
  const response = await api.get<ApiResponse<Teacher>>(`/teachers/${id}`);
  return extractData(response);
};

// ── POST /teachers ──
export const createTeacherRequest = async (
  payload: CreateTeacherPayload,
): Promise<Teacher> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 350));
    const emailTaken = MOCK_TEACHERS.some(
      (t) => t.email.toLowerCase() === payload.email.toLowerCase(),
    );
    if (emailTaken) throw new Error('Ya existe un docente con ese correo');

    const stamp = nowIso();
    const created: Teacher = {
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11),
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      city: payload.city.trim(),
      specialties: [...payload.specialties],
      status: payload.status ?? 'Activo',
      createdAt: stamp,
      updatedAt: stamp,
    };
    MOCK_TEACHERS = [created, ...MOCK_TEACHERS];
    return created;
  }
  const response = await api.post<ApiResponse<Teacher>>('/teachers', payload);
  return extractData(response);
};

// ── PUT /teachers/:id ──
export const updateTeacherRequest = async (
  id: string,
  payload: UpdateTeacherPayload,
): Promise<Teacher> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const index = MOCK_TEACHERS.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Docente no encontrado');

    if (payload.email) {
      const emailTaken = MOCK_TEACHERS.some(
        (t) =>
          t.id !== id &&
          t.email.toLowerCase() === payload.email!.toLowerCase(),
      );
      if (emailTaken) throw new Error('Ya existe un docente con ese correo');
    }

    const updated: Teacher = {
      ...MOCK_TEACHERS[index],
      ...payload,
      email: payload.email
        ? payload.email.trim().toLowerCase()
        : MOCK_TEACHERS[index].email,
      name: payload.name?.trim() ?? MOCK_TEACHERS[index].name,
      phone: payload.phone?.trim() ?? MOCK_TEACHERS[index].phone,
      city: payload.city?.trim() ?? MOCK_TEACHERS[index].city,
      specialties: payload.specialties
        ? [...payload.specialties]
        : MOCK_TEACHERS[index].specialties,
      updatedAt: nowIso(),
    };
    MOCK_TEACHERS[index] = updated;
    return updated;
  }
  const response = await api.put<ApiResponse<Teacher>>(`/teachers/${id}`, payload);
  return extractData(response);
};

// ── DELETE /teachers/:id ── (soft-delete: cambia status a Inactivo)
export const deleteTeacherRequest = async (id: string): Promise<void> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 250));
    const index = MOCK_TEACHERS.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Docente no encontrado');
    // Soft-delete: cambiar status a Inactivo en lugar de eliminar
    MOCK_TEACHERS[index] = {
      ...MOCK_TEACHERS[index],
      status: 'Inactivo',
      updatedAt: nowIso(),
    };
    return;
  }
  await api.delete(`/teachers/${id}`);
};
