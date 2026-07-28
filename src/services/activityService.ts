import api from './api';
import type { Activity } from '../types/activity.types';
import type { ApiResponse } from '../types/api.types';

const extractData = <T>(response: { data: ApiResponse<T> | T }): T => {
  const d = response.data;
  if (d && typeof d === 'object' && 'success' in d && 'data' in d) {
    return (d as ApiResponse<T>).data;
  }
  return d as T;
};

export const getActivitiesRequest = async (): Promise<Activity[]> => {
  const response = await api.get<ApiResponse<Activity[]>>('/activities');
  return extractData(response);
};

export const getActivitiesByTeacherRequest = async (teacherId: string): Promise<Activity[]> => {
  const response = await api.get<ApiResponse<Activity[]>>('/activities', { params: { teacherId } });
  return extractData(response);
};

export const getActivitiesByStudentRequest = async (studentId: string, context?: { course?: string; group?: string; program?: string; moduleId?: string }): Promise<Activity[]> => {
  const response = await api.get<ApiResponse<Activity[]>>('/activities', {
    params: {
      studentId,
      course: context?.course,
      group: context?.group,
      program: context?.program,
      moduleId: context?.moduleId,
    },
  });
  return extractData(response);
};

export const createActivityRequest = async (payload: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity> => {
  const response = await api.post<ApiResponse<Activity>>('/activities', payload);
  return extractData(response);
};

export const updateActivityRequest = async (id: string, payload: Partial<Omit<Activity, 'id' | 'createdAt'>>): Promise<Activity> => {
  const response = await api.put<ApiResponse<Activity>>(`/activities/${id}`, payload);
  return extractData(response);
};

export const updateActivitySubmissionRequest = async (id: string, payload: Pick<Activity, 'studentSubmissionStatus' | 'studentSubmissionText' | 'studentSubmissionAttachmentUrl' | 'studentSubmissionAttachmentName'>): Promise<Activity> => {
  const response = await api.put<ApiResponse<Activity>>(`/activities/${id}/submission`, payload);
  return extractData(response);
};

export const deleteActivityRequest = async (id: string): Promise<void> => {
  await api.delete(`/activities/${id}`);
};