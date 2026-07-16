/**
 * Configuración general de la aplicación Workflow Academy
 * Centralizada para facilitar mantenimiento y deployment.
 */

// ── API Configuration ──
export const API_CONFIG = {
  /** URL base del API (desde variable de entorno o fallback) */
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  
  /** Timeout de requests en ms */
  timeout: 10_000,
  
  /** Endpoints críticos */
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      me: '/auth/me',
      profile: '/users/me',
      changePassword: '/auth/change-password',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password',
      register: '/auth/register',
      notifications: '/users/me/notifications',
      avatar: '/users/me/avatar',
    },
    teachers: '/teachers',
    students: '/students',
    tasks: '/tasks',
    courses: '/courses',
    modules: '/modules',
  },
} as const;

// ── Storage Keys ──
export const STORAGE_KEYS = {
  token: 'wf_token',
  refreshToken: 'wf_refresh',
  auth: 'wf_auth',
  org: 'wf_org',
} as const;

// ── Avatar Configuration ──
export const AVATAR_CONFIG = {
  maxSize: 2 * 1024 * 1024, // 2MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  maxWidth: 800,
  quality: 0.7,
} as const;

// ── Pagination Defaults ──
export const PAGINATION = {
  defaultPage: 1,
  defaultPageSize: 10,
} as const;

// ── Timeouts ──
export const TIMEOUTS = {
  api: 10_000,
  mock: {
    short: 300,
    medium: 400,
    long: 600,
    extraLong: 800,
  },
} as const;

// ── Validation ──
export const VALIDATION = {
  email: {
    minLength: 5,
    maxLength: 255,
  },
  password: {
    minLength: 6,
    maxLength: 100,
  },
  name: {
    minLength: 2,
    maxLength: 100,
  },
  phone: {
    minLength: 7,
    maxLength: 20,
  },
} as const;

// ── App Info ──
export const APP_INFO = {
  name: 'WorkFlow Academy',
  version: '1.0.0',
  description: 'Plataforma de gestión de entrenamiento y bienestar',
} as const;

// ── Feature Flags ──
export const FEATURES = {
  mockMode: import.meta.env.VITE_AUTH_MODE === 'mock',
  enableNotifications: true,
  enableReports: true,
  enableExport: true,
} as const;

// ── Tipos exportados ──
export type ApiConfig = typeof API_CONFIG;
export type StorageKeys = typeof STORAGE_KEYS;
export type AvatarConfig = typeof AVATAR_CONFIG;
export type PaginationConfig = typeof PAGINATION;
export type TimeoutsConfig = typeof TIMEOUTS;
export type ValidationConfig = typeof VALIDATION;
export type AppInfo = typeof APP_INFO;
export type FeaturesConfig = typeof FEATURES;