import api from './api';
import type { DashboardMetrics } from '../types/metrics.types';

const IS_MOCK = import.meta.env.VITE_AUTH_MODE === 'mock';

// ── Datos mock de alumnos (mismos que Students.tsx) ──
const MOCK_STUDENTS = [
  { status:'Activo',     sessions:48 },
  { status:'Activo',     sessions:41 },
  { status:'Activo',     sessions:37 },
  { status:'Activo',     sessions:33 },
  { status:'Inactivo',   sessions:12 },
  { status:'Activo',     sessions:29 },
  { status:'Suspendido', sessions:5  },
  { status:'Activo',     sessions:44 },
];

const MOCK_PROGRAMS = 6;  // total programas activos
const MOCK_PREV = {       // datos del período anterior para calcular trend
  students:  6,
  programs:  5,
  sessions:  10200,
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

    const studentsActive    = MOCK_STUDENTS.filter((s) => s.status === 'Activo').length;
    const studentsTotal     = MOCK_STUDENTS.length;
    const sessionsCompleted = MOCK_STUDENTS.reduce((a, s) => a + s.sessions, 0);
    const satisfaction      = 98;

    return {
      studentsActive,
      studentsTotal,
      programsActive: MOCK_PROGRAMS,
      sessionsCompleted,
      satisfaction,
      trends: {
        students:     calcTrend(studentsActive,    MOCK_PREV.students),
        programs:     calcTrend(MOCK_PROGRAMS,     MOCK_PREV.programs),
        sessions:     calcTrend(sessionsCompleted, MOCK_PREV.sessions),
        satisfaction: calcTrend(satisfaction,      MOCK_PREV.satisfaction),
      },
    };
  }

  // ── Modo real: GET /metrics/dashboard ──
  const { data } = await api.get<DashboardMetrics>('/metrics/dashboard');
  return data;
};
