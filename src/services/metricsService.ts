import api from './api';
import type { DashboardMetrics } from '../types/metrics.types';
import { getSharedMetrics } from './sharedMockDb';

const IS_MOCK = import.meta.env.VITE_AUTH_MODE === 'mock';

const MOCK_PREV = {       // datos del período anterior para calcular trend
  students:  10,
  programs:  5,
  sessions:  300,
  satisfaction: 96,
};

function calcTrend(current: number, previous: number): string {
  if (previous === 0) return '+100%';
  const pct = ((current - previous) / previous) * 100;
  return (pct >= 0 ? '+' : '') + pct.toFixed(0) + '%';
}

// ── GET /metrics/dashboard ──
export const getDashboardMetricsRequest = async (): Promise<DashboardMetrics> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 600)); // simula latencia

    const shared = getSharedMetrics();
    const studentsActive = shared.studentsActive;
    const studentsTotal = shared.studentsTotal;
    const programsActive = shared.programsActive;
    const sessionsCompleted = shared.sessionsCompleted;
    const satisfaction = shared.averageProgress;

    return {
      studentsActive,
      studentsTotal,
      programsActive,
      sessionsCompleted,
      satisfaction,
      trends: {
        students:     calcTrend(studentsActive,    MOCK_PREV.students),
        programs:     calcTrend(programsActive,    MOCK_PREV.programs),
        sessions:     calcTrend(sessionsCompleted, MOCK_PREV.sessions),
        satisfaction: calcTrend(satisfaction,      MOCK_PREV.satisfaction),
      },
    };
  }

  // ── Modo real: GET /metrics/dashboard ──
  const { data } = await api.get<{ success: boolean; data: DashboardMetrics }>('/metrics/dashboard');
  return data.data;
};
