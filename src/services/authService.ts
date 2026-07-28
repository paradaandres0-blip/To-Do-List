import api from './api';
import { AVATAR_CONFIG } from '../constants/config';
import { normalizeRole } from '../utils/roleRouting';

// ── Tipos ──
export interface LoginPayload {
  email:    string;
  password: string;
}

export interface AuthUser {
  id:      string;
  name:    string;
  email:   string;
  role:    'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  avatar?: string;
  phone?:  string;
  city?:   string;
  /** Solo docentes — enlaza con teachers.id (portal /docente) */
  teacherId?: string;
  /** Solo estudiantes — enlaza con students.id */
  studentId?: string;
}

interface BackendAuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  teacherId?: string;
  studentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  token: string;
  user:  AuthUser;
  refreshToken?: string;
}

export interface RefreshResponse {
  token: string;
}

const normalizeAuthUser = (user: BackendAuthUser): AuthUser => {
  const role = normalizeRole(user.role) ?? 'STUDENT';
  return {
    ...user,
    role,
  };
};

// ────────────────────────────────────────────
// POST /auth/login
// ────────────────────────────────────────────
export const loginRequest = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await api.post<{ token: string; refreshToken?: string; user: BackendAuthUser }>('/auth/login', payload);
  return {
    token: data.token,
    refreshToken: data.refreshToken,
    user: normalizeAuthUser(data.user),
  };
};

export const verifyPasswordRequest = async (email: string, password: string): Promise<boolean> => {
  try {
    await loginRequest({ email, password });
    return true;
  } catch {
    return false;
  }
};

// ────────────────────────────────────────────
// POST /auth/logout
// ────────────────────────────────────────────
export const logoutRequest = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch {
    // Si falla, limpiamos localmente de todas formas
  }
};

// ────────────────────────────────────────────
// GET /auth/me  — refrescar datos del usuario
// ────────────────────────────────────────────
export const getMeRequest = async (): Promise<AuthUser> => {
  const { data } = await api.get<{ success: boolean; data: BackendAuthUser }>('/auth/me');
  return normalizeAuthUser(data.data);
};

// ────────────────────────────────────────────
// POST /auth/refresh  — obtener nuevo access token
// ────────────────────────────────────────────
export const refreshRequest = async (refreshToken: string): Promise<RefreshResponse> => {
  const { data } = await api.post<RefreshResponse>('/auth/refresh', { refreshToken });
  return data;
};

// ────────────────────────────────────────────
// PATCH /users/me  — actualizar datos del usuario
// ────────────────────────────────────────────
export const updateProfileRequest = async (payload: Partial<AuthUser>): Promise<AuthUser> => {
  const { data } = await api.patch<AuthUser>('/users/me', payload);
  return data;
};

// ────────────────────────────────────────────
// PATCH /auth/change-password  — cambiar contraseña
// ────────────────────────────────────────────
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword:     string;
}

export const changePasswordRequest = async (payload: ChangePasswordPayload): Promise<void> => {
  await api.patch('/auth/change-password', payload);
};

// ────────────────────────────────────────────
// POST /auth/forgot-password  — solicitar link de recuperación
// ────────────────────────────────────────────
export const forgotRequest = async (email: string): Promise<{ message: string }> => {
  const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email });
  return data;
};

// ────────────────────────────────────────────
// POST /auth/reset-password  — restablecer contraseña con token
// ────────────────────────────────────────────
export const resetRequest = async (token: string, password: string): Promise<{ message: string }> => {
  const { data } = await api.post<{ message: string }>('/auth/reset-password', { token, password });
  return data;
};

// ────────────────────────────────────────────
// POST /auth/register  — registro de nuevo usuario
// ────────────────────────────────────────────
export interface RegisterPayload { name: string; email: string; password: string; }
export const registerRequest = async (payload: RegisterPayload): Promise<{ message: string }> => {
  const { data } = await api.post<{ message: string }>('/auth/register', payload);
  return data;
};

// ────────────────────────────────────────────
// PATCH /users/me/notifications — guardar preferencias de notificaciones
// ────────────────────────────────────────────
export interface NotificationPrefs {
  sesiones:  boolean;
  programas: boolean;
  alumnos:   boolean;
  reportes:  boolean;
}

export const saveNotificationsRequest = async (prefs: NotificationPrefs): Promise<void> => {
  await api.patch('/users/me/notifications', prefs);
};

// ── Tipos y límites para avatar ──
export const AVATAR_MAX_SIZE = AVATAR_CONFIG.maxSize;
export const AVATAR_ALLOWED_TYPES = AVATAR_CONFIG.allowedTypes;
export type AvatarAllowedType = (typeof AVATAR_ALLOWED_TYPES)[number];

export interface AvatarValidationError {
  code: 'SIZE_EXCEEDED' | 'INVALID_TYPE' | 'COMPRESSION_FAILED';
  message: string;
}

export const validateAvatarFile = (file: File): AvatarValidationError | null => {
  if (file.size > AVATAR_MAX_SIZE) {
    return {
      code: 'SIZE_EXCEEDED',
      message: `La imagen no debe superar 2 MB (tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)} MB)`,
    };
  }
  if (!AVATAR_ALLOWED_TYPES.includes(file.type as AvatarAllowedType)) {
    return {
      code: 'INVALID_TYPE',
      message: `Solo se permiten imágenes JPG, PNG o WebP (tipo recibido: ${file.type})`,
    };
  }
  return null;
};

// ────────────────────────────────────────────
// POST /users/me/avatar  — subir avatar de usuario
// ────────────────────────────────────────────
export const uploadAvatarRequest = async (file: File): Promise<{ avatarUrl: string }> => {
  const validationError = validateAvatarFile(file);
  if (validationError) {
    throw new Error(validationError.message);
  }

  const { getCompressedFile } = await import('../utils/imageCompression');
  const compressed = await getCompressedFile(file, { maxSizeBytes: AVATAR_MAX_SIZE });
  const formData = new FormData();
  formData.append('avatar', compressed);
  const { data } = await api.post<{ avatarUrl: string }>('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};