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
  return programs
    .map((item) => ({
      program: String(item?.program ?? ''),
      mentor: String(item?.mentor ?? ''),
    }))
    .filter((entry) => entry.program || entry.mentor);
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

export const getGroupsRequest = async (opts?: { teacherId?: string }): Promise<Group[]> => {
  const q = opts?.teacherId ? `?teacherId=${encodeURIComponent(opts.teacherId)}` : '';
  const response = await api.get<ApiResponse<Group[]>>(`/groups${q}`);
  return extractData(response).map(normalizeGroup);
};

export const createGroupRequest = async (payload: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>): Promise<Group> => {
  const response = await api.post<ApiResponse<Group>>('/groups', payload);
  return normalizeGroup(extractData(response));
};

export const updateGroupRequest = async (
  id: string,
  payload: Partial<Omit<Group, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<Group> => {
  const response = await api.put<ApiResponse<Group>>(`/groups/${id}`, payload);
  return normalizeGroup(extractData(response));
};

export const deleteGroupRequest = async (id: string): Promise<void> => {
  await api.delete(`/groups/${id}`);
};
