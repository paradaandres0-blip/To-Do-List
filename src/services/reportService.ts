import api from './api';
import type { ReportSession, ReportStudent } from '../types/report.types';

export const IS_MOCK = import.meta.env.VITE_AUTH_MODE === 'mock';
export interface ReportData { students: ReportStudent[]; sessions: ReportSession[]; programs: string[]; }

const MOCK_REPORTS: ReportData = {
  students: [
    { id:'1', name:'Mariana López', program:'Entrenamiento Funcional', joinedAt:'2025-06-04', status:'Activo', progress:82 },
    { id:'2', name:'Carlos Ruiz', program:'Nutrición Deportiva', joinedAt:'2025-06-15', status:'Activo', progress:67 },
    { id:'3', name:'Laura Gómez', program:'Mindfulness', joinedAt:'2025-06-22', status:'Activo', progress:74 },
    { id:'4', name:'Diego Torres', program:'Pérdida de Peso', joinedAt:'2025-07-01', status:'Activo', progress:55 },
    { id:'5', name:'Sofía Martínez', program:'Entrenamiento Funcional', joinedAt:'2025-07-04', status:'Inactivo', progress:28 },
    { id:'6', name:'Andrés Peña', program:'Nutrición Deportiva', joinedAt:'2025-07-08', status:'Activo', progress:60 },
    { id:'7', name:'Valentina Cruz', program:'Mindfulness', joinedAt:'2025-07-12', status:'Suspendido', progress:10 },
    { id:'8', name:'Juliana Ríos', program:'Pérdida de Peso', joinedAt:'2025-07-18', status:'Activo', progress:90 },
  ],
  sessions: [
    { id:'1', course:'Entrenamiento Funcional', date:'2025-07-05', status:'Completada', duration:45 },
    { id:'2', course:'Nutrición Deportiva', date:'2025-07-07', status:'Completada', duration:30 },
    { id:'3', course:'Mindfulness', date:'2025-07-09', status:'En curso', duration:25 },
    { id:'4', course:'Pérdida de Peso', date:'2025-07-11', status:'Completada', duration:50 },
    { id:'5', course:'Entrenamiento Funcional', date:'2025-07-14', status:'Pendiente', duration:40 },
    { id:'6', course:'Nutrición Deportiva', date:'2025-07-16', status:'Completada', duration:40 },
    { id:'7', course:'Mindfulness', date:'2025-07-19', status:'Completada', duration:35 },
    { id:'8', course:'Pérdida de Peso', date:'2025-07-21', status:'Completada', duration:55 },
  ],
  programs: ['Entrenamiento Funcional', 'Nutrición Deportiva', 'Mindfulness', 'Pérdida de Peso', 'Bienestar Mental'],
};
const copy = (): ReportData => ({ students: MOCK_REPORTS.students.map((student) => ({ ...student })), sessions: MOCK_REPORTS.sessions.map((session) => ({ ...session })), programs: [...MOCK_REPORTS.programs] });

export const getReportsRequest = async (): Promise<ReportData> => {
  if (IS_MOCK) return copy();
  const { data } = await api.get<ReportData>('/reports'); return data;
};
export const createReportSessionRequest = async (payload: Omit<ReportSession, 'id'>): Promise<ReportSession> => {
  if (IS_MOCK) { const session = { id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2), ...payload }; MOCK_REPORTS.sessions = [session, ...MOCK_REPORTS.sessions]; return { ...session }; }
  const { data } = await api.post<ReportSession>('/reports/sessions', payload); return data;
};
export const updateReportSessionRequest = async (id: string, payload: Partial<Omit<ReportSession, 'id'>>): Promise<ReportSession> => {
  if (IS_MOCK) { const index = MOCK_REPORTS.sessions.findIndex((session) => session.id === id); if (index === -1) throw new Error('Sesión no encontrada'); MOCK_REPORTS.sessions[index] = { ...MOCK_REPORTS.sessions[index], ...payload }; return { ...MOCK_REPORTS.sessions[index] }; }
  const { data } = await api.put<ReportSession>(`/reports/sessions/${id}`, payload); return data;
};
export const deleteReportSessionRequest = async (id: string): Promise<void> => {
  if (IS_MOCK) { MOCK_REPORTS.sessions = MOCK_REPORTS.sessions.filter((session) => session.id !== id); return; }
  await api.delete(`/reports/sessions/${id}`);
};
