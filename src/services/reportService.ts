import api from './api';
import type { ApiResponse } from '../types/api.types';
import type { ReportSession, ReportStudent } from '../types/report.types';

export interface ReportData { students: ReportStudent[]; sessions: ReportSession[]; programs: string[]; }

const extractData = <T>(response: { data: unknown }): T => {
  const d = response.data;
  if (d && typeof d === 'object' && 'success' in d && 'data' in d) {
    return (d as ApiResponse<T>).data;
  }
  return d as T;
};

export const getReportsRequest = async (): Promise<ReportData> => {
  const response = await api.get<ApiResponse<ReportData>>('/reports');
  return extractData(response);
};

export const createReportSessionRequest = async (payload: Omit<ReportSession, 'id'>): Promise<ReportSession> => {
  const response = await api.post<ApiResponse<ReportSession>>('/reports/sessions', payload);
  return extractData(response);
};

export const updateReportSessionRequest = async (id: string, payload: Partial<Omit<ReportSession, 'id'>>): Promise<ReportSession> => {
  const response = await api.put<ApiResponse<ReportSession>>(`/reports/sessions/${id}`, payload);
  return extractData(response);
};

export const deleteReportSessionRequest = async (id: string): Promise<void> => {
  await api.delete(`/reports/sessions/${id}`);
};