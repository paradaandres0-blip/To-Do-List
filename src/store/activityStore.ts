import { create } from 'zustand';
import type { Activity } from '../types/activity.types';
import {
  getActivitiesRequest,
  getActivitiesByTeacherRequest,
  getActivitiesByStudentRequest,
  createActivityRequest,
  updateActivityRequest,
  deleteActivityRequest,
} from '../services/activityService';

interface ActivityState {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;

  loadActivities: () => Promise<void>;
  loadByTeacher: (teacherId: string) => Promise<void>;
  loadByStudent: (studentId: string) => Promise<void>;
  createActivity: (payload: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateActivity: (id: string, payload: Partial<Omit<Activity, 'id' | 'createdAt'>>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  getByModule: (moduleId: string) => Activity[];
  getByStudent: (studentId: string) => Activity[];
}

const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  isLoading: false,
  error: null,

  loadActivities: async () => {
    set({ isLoading: true, error: null });
    try {
      const activities = await getActivitiesRequest();
      set({ activities, isLoading: false });
    } catch {
      set({ isLoading: false, error: 'Error al cargar actividades' });
    }
  },

  loadByTeacher: async (teacherId: string) => {
    set({ isLoading: true, error: null });
    try {
      const activities = await getActivitiesByTeacherRequest(teacherId);
      set({ activities, isLoading: false });
    } catch {
      set({ isLoading: false, error: 'Error al cargar actividades' });
    }
  },

  loadByStudent: async (studentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const activities = await getActivitiesByStudentRequest(studentId);
      set({ activities, isLoading: false });
    } catch {
      set({ isLoading: false, error: 'Error al cargar actividades' });
    }
  },

  createActivity: async (payload) => {
    try {
      const created = await createActivityRequest(payload);
      set((state) => ({ activities: [created, ...state.activities] }));
    } catch {
      set({ error: 'Error al crear actividad' });
    }
  },

  updateActivity: async (id, payload) => {
    try {
      const updated = await updateActivityRequest(id, payload);
      set((state) => ({
        activities: state.activities.map((a) => (a.id === id ? updated : a)),
      }));
    } catch {
      set({ error: 'Error al actualizar actividad' });
    }
  },

  deleteActivity: async (id) => {
    try {
      await deleteActivityRequest(id);
      set((state) => ({ activities: state.activities.filter((a) => a.id !== id) }));
    } catch {
      set({ error: 'Error al eliminar actividad' });
    }
  },

  getByModule: (moduleId) => get().activities.filter((a) => a.moduleId === moduleId),

  getByStudent: (studentId) => get().activities.filter((a) => a.studentId === studentId),
}));

export default useActivityStore;