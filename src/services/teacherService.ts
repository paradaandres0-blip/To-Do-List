import api from './api';
import type {
  CreateTeacherPayload,
  Teacher,
  UpdateTeacherPayload,
} from '../types/teacher.types';

const IS_MOCK = import.meta.env.VITE_AUTH_MODE === 'mock';

const nowIso = () => new Date().toISOString();

/**
 * Mock en memoria — simula la tabla `teachers` de PostgreSQL.
 * Al conectar el API real, solo hay que poner VITE_AUTH_MODE=real
 * y apuntar VITE_API_URL al backend.
 */
let MOCK_TEACHERS: Teacher[] = [
  {
    id: 't1',
    name: 'Ana Gómez',
    email: 'ana.gomez@workflow.academy',
    phone: '+57 300 555 0101',
    city: 'Bogotá',
    specialties: ['Nutrición Deportiva', 'Pérdida de Peso'],
    status: 'Activo',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: 't2',
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@workflow.academy',
    phone: '+57 310 555 0202',
    city: 'Medellín',
    specialties: ['Entrenamiento Funcional', 'Fuerza y Acondicionamiento'],
    status: 'Activo',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

// ── GET /teachers ──
export const getTeachersRequest = async (): Promise<Teacher[]> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return [...MOCK_TEACHERS];
  }
  const { data } = await api.get<Teacher[]>('/teachers');
  return data;
};

// ── GET /teachers/:id ──
export const getTeacherByIdRequest = async (id: string): Promise<Teacher> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const found = MOCK_TEACHERS.find((t) => t.id === id);
    if (!found) throw new Error('Docente no encontrado');
    return { ...found };
  }
  const { data } = await api.get<Teacher>(`/teachers/${id}`);
  return data;
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
  const { data } = await api.post<Teacher>('/teachers', payload);
  return data;
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
  const { data } = await api.put<Teacher>(`/teachers/${id}`, payload);
  return data;
};

// ── DELETE /teachers/:id ──
export const deleteTeacherRequest = async (id: string): Promise<void> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 250));
    MOCK_TEACHERS = MOCK_TEACHERS.filter((t) => t.id !== id);
    return;
  }
  await api.delete(`/teachers/${id}`);
};
