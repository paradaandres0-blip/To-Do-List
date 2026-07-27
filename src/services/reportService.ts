import api from './api';
import type { ReportSession, ReportStudent } from '../types/report.types';
import { getSharedMetrics, cloneStudents } from './sharedMockDb';

export const IS_MOCK = import.meta.env.VITE_AUTH_MODE === 'mock';
export interface ReportData { students: ReportStudent[]; sessions: ReportSession[]; programs: string[]; }

const MOCK_SESSIONS: ReportSession[] = [
  { id:'1', course:'Entrenamiento Funcional', date:'2025-07-05', status:'Completada', duration:45 },
  { id:'2', course:'Nutrición Deportiva', date:'2025-07-07', status:'Completada', duration:30 },
  { id:'3', course:'Mindfulness', date:'2025-07-09', status:'En curso', duration:25 },
  { id:'4', course:'Pérdida de Peso', date:'2025-07-11', status:'Completada', duration:50 },
  { id:'5', course:'Entrenamiento Funcional', date:'2025-07-14', status:'Pendiente', duration:40 },
  { id:'6', course:'Nutrición Deportiva', date:'2025-07-16', status:'Completada', duration:40 },
  { id:'7', course:'Mindfulness', date:'2025-07-19', status:'Completada', duration:35 },
  { id:'8', course:'Pérdida de Peso', date:'2025-07-21', status:'Completada', duration:55 },
];

// Track local session changes for mock mode
let localSessions: ReportSession[] = [...MOCK_SESSIONS];

function getMockReportData(): ReportData {
  const allStudents = cloneStudents();
  // ReportStudent.status no incluye 'Pendiente'; solo tomamos los que coinciden
  const students: ReportStudent[] = allStudents
    .filter((s): s is typeof s & { status: 'Activo' | 'Inactivo' | 'Suspendido' } =>
      ['Activo', 'Inactivo', 'Suspendido'].includes(s.status)
    )
    .map((s) => ({
      id: s.id,
      name: s.name,
      program: s.program,
      joinedAt: s.joinedAt,
      status: s.status as 'Activo' | 'Inactivo' | 'Suspendido',
      progress: s.progress,
    }));
  const metrics = getSharedMetrics();
  return {
    students,
    sessions: [...localSessions],
    programs: metrics.uniquePrograms,
  };
}

export const getReportsRequest = async (): Promise<ReportData> => {
  if (IS_MOCK) return getMockReportData();
  const { data } = await api.get<ReportData>('/reports');
  return data;
};

export const createReportSessionRequest = async (payload: Omit<ReportSession, 'id'>): Promise<ReportSession> => {
  if (IS_MOCK) {
    const session: ReportSession = {
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      ...payload,
    };
    localSessions = [session, ...localSessions];
    return { ...session };
  }
  const { data } = await api.post<ReportSession>('/reports/sessions', payload);
  return data;
};

export const updateReportSessionRequest = async (id: string, payload: Partial<Omit<ReportSession, 'id'>>): Promise<ReportSession> => {
  if (IS_MOCK) {
    const index = localSessions.findIndex((session) => session.id === id);
    if (index === -1) throw new Error('Sesión no encontrada');
    localSessions[index] = { ...localSessions[index], ...payload };
    return { ...localSessions[index] };
  }
  const { data } = await api.put<ReportSession>(`/reports/sessions/${id}`, payload);
  return data;
};

export const deleteReportSessionRequest = async (id: string): Promise<void> => {
  if (IS_MOCK) {
    localSessions = localSessions.filter((session) => session.id !== id);
    return;
  }
  await api.delete(`/reports/sessions/${id}`);
};