import api from './api';
import type { Task, TaskForm } from '../types/task.types';
import type { ApiResponse } from '../types/api.types';

// ── Helper: extraer data de ApiResponse ──
const extractData = <T>(response: { data: ApiResponse<T> | T }): T => {
  const d = response.data;
  if (d && typeof d === 'object' && 'success' in d && 'data' in d) {
    return (d as ApiResponse<T>).data;
  }
  return d as T;
};

export const getTasksRequest = async (page = 1, pageSize = 10): Promise<Task[]> => {
  const response = await api.get<{ success: boolean; data: Task[] }>('/tasks', { params: { page, pageSize } });
  return response.data.data;
};

export const createTaskRequest = async (payload: TaskForm): Promise<Task> => {
  const response = await api.post<ApiResponse<Task>>('/tasks', payload);
  return extractData(response);
};

export const updateTaskRequest = async (id: string, payload: Partial<TaskForm>): Promise<Task> => {
  const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, payload);
  return extractData(response);
};

export const deleteTaskRequest = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};
