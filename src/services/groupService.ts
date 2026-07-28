import api from './api';
import type { ApiResponse } from '../types/api.types';
import type { Group } from '../types/group.types';

const extractData = <T>(response: { data: ApiResponse<T> | T }): T => {
  const d = response.data;
  if (d && typeof d === 'object' && 'success' in d && 'data' in d) {
    return (d as ApiResponse<T>).data;
  }
  return d as T;
};

const normalizeGroupStatus = (status: unknown): Group['status'] => {
  const value = String(status ?? '').toLowerCase();
  if (value.includes('en curso') || value.includes('en_curso') || value.includes('encurso')) return 'En curso';
  if (value.includes('inscripcion')) return 'Inscripciones';
  if (value.includes('finalizado')) return 'Finalizado';
  return 'Inscripciones';
};

const normalizeGroupPrograms = (programs: unknown): Group['programs'] => {
  if (!Array.isArray(programs)) return [];
  return programs.map((item) => ({
    program: String(item?.program ?? ''),
    mentor: String(item?.mentor ?? ''),
  })).filter((entry) => entry.program || entry.mentor);
};

const normalizeGroup = (group: any): Group => ({
  id: String(group.id),
  name: String(group.name ?? ''),
  centerId: String(group.centerId ?? ''),
  status: normalizeGroupStatus(group.status),
  active: Boolean(group.active ?? true),
  programs: normalizeGroupPrograms(group.programs),
  createdAt: group.createdAt?.toISOString?.() ?? String(group.createdAt ?? ''),
  updatedAt: group.updatedAt?.toISOString?.() ?? String(group.updatedAt ?? ''),
});

const IS_MOCK = import.meta.env.VITE_AUTH_MODE === 'mock';
const STORAGE_KEY = 'workflowacademy-groups';

const loadGroupsFromStorage = (): Group[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const persistGroups = (groups: Group[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
};

let MOCK_GROUPS: Group[] = loadGroupsFromStorage().length > 0 ? loadGroupsFromStorage() : [
  {
    id: 'g1',
    name: 'Cohorte Fitness 2026',
    centerId: 'c1',
    status: 'En curso',
    active: true,
    programs: [{ program: 'Entrenamiento Funcional', mentor: 'Carlos Ruiz' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'g2',
    name: 'Programa Nutrición Pro',
    centerId: 'c1',
    status: 'Inscripciones',
    active: true,
    programs: [{ program: 'Nutrición Deportiva', mentor: 'Ana Gómez' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

if (IS_MOCK && loadGroupsFromStorage().length === 0) {
  persistGroups(MOCK_GROUPS);
}

export const getGroupsRequest = async (): Promise<Group[]> => {
  if (IS_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_GROUPS.map(normalizeGroup);
  }
  const response = await api.get<ApiResponse<Group[]>>('/groups');
  return extractData(response).map(normalizeGroup);
};

export const createGroupRequest = async (payload: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>): Promise<Group> => {
  if (IS_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const created: Group = {
      ...payload,
      id: crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_GROUPS = [created, ...MOCK_GROUPS];
    persistGroups(MOCK_GROUPS);
    return normalizeGroup(created);
  }
  const response = await api.post<ApiResponse<Group>>('/groups', payload);
  return normalizeGroup(extractData(response));
};

export const updateGroupRequest = async (
  id: string,
  payload: Partial<Omit<Group, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<Group> => {
  if (IS_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = MOCK_GROUPS.findIndex((group) => group.id === id);
    if (index === -1) throw new Error('Grupo no encontrado');
    const updated: Group = {
      ...MOCK_GROUPS[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    MOCK_GROUPS[index] = updated;
    persistGroups(MOCK_GROUPS);
    return normalizeGroup(updated);
  }
  const response = await api.put<ApiResponse<Group>>(`/groups/${id}`, payload);
  return normalizeGroup(extractData(response));
};

export const deleteGroupRequest = async (id: string): Promise<void> => {
  if (IS_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    MOCK_GROUPS = MOCK_GROUPS.filter((group) => group.id !== id);
    persistGroups(MOCK_GROUPS);
    return;
  }
  await api.delete(`/groups/${id}`);
};
