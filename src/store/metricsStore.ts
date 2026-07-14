import { create } from 'zustand';
import type { DashboardMetrics } from '../types/metrics.types';
import { getDashboardMetricsRequest } from '../services/metricsService';

interface MetricsState {
  metrics:   DashboardMetrics | null;
  isLoading: boolean;
  error:     string | null;
  lastFetch: number | null; // timestamp del último fetch

  fetchMetrics:  () => Promise<void>;
  refreshMetrics: () => Promise<void>; // fuerza recarga aunque haya caché
}

const CACHE_MS = 60_000; // 1 minuto de caché

const useMetricsStore = create<MetricsState>((set, get) => ({
  metrics:   null,
  isLoading: false,
  error:     null,
  lastFetch: null,

  // Fetch con caché — no recarga si los datos tienen menos de 1 min
  fetchMetrics: async () => {
    const { lastFetch, isLoading } = get();
    if (isLoading) return;
    if (lastFetch && Date.now() - lastFetch < CACHE_MS) return; // usa caché

    set({ isLoading: true, error: null });
    try {
      const metrics = await getDashboardMetricsRequest();
      set({ metrics, isLoading: false, lastFetch: Date.now() });
    } catch {
      set({ isLoading: false, error: 'No se pudieron cargar las métricas' });
    }
  },

  // Fuerza recarga ignorando caché
  refreshMetrics: async () => {
    set({ isLoading: true, error: null, lastFetch: null });
    try {
      const metrics = await getDashboardMetricsRequest();
      set({ metrics, isLoading: false, lastFetch: Date.now() });
    } catch {
      set({ isLoading: false, error: 'Error al actualizar métricas' });
    }
  },
}));

export default useMetricsStore;
