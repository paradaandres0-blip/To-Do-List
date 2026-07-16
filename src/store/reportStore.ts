import { create } from 'zustand';
import { getReportsRequest } from '../services/reportService';
import type { ReportSession, ReportStudent } from '../types/report.types';

interface ReportState {
  students: ReportStudent[];
  sessions: ReportSession[];
  programs: string[];
  loadReports: () => Promise<void>;
}

const useReportStore = create<ReportState>((set) => ({
  students: [],
  sessions: [],
  programs: [],
  loadReports: async () => set(await getReportsRequest()),
}));

void useReportStore.getState().loadReports().catch((error: unknown) => console.error('No se pudieron cargar los reportes', error));
export default useReportStore;
