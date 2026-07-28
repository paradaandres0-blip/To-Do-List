import api from './api';
import type { DashboardMetrics } from '../types/metrics.types';

export const getDashboardMetricsRequest = async (): Promise<DashboardMetrics> => {
  const { data } = await api.get<{ success: boolean; data: DashboardMetrics }>('/metrics/dashboard');
  return data.data;
};
