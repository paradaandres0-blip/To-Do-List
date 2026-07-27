import api from './api';
import { STORAGE_KEYS, AVATAR_CONFIG, TIMEOUTS } from '../constants/config';
import { findMockAccount } from './mockDb';

// ── Tipos ──
export interface LoginPayload {
  email:    string;
  password: string;
}

export interface AuthUser {
  id:      string;
  name:    string;
  email:   string;
  role:    'admin' | 'instructor' | 'student';
  avatar?: string;
  phone?:  string;
  city?:   string;
  /** Solo docentes — enlaza con teachers.id (portal /docente) */
  teacherId?: string;
}

export interface LoginResponse {
  token: string;
  user:  AuthUser;
  refreshToken?: string;
}

export interface RefreshResponse {
  token: string;
}

const IS_MOCK = import.meta.env.VITE_AUTH_MODE === 'mock';

const readPersistedUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.auth);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { user?: AuthUser } };
    return parsed.state?.user ?? null;
  } catch {
    return null;
  }
};

// ────────────────────────────────────────────
// POST /auth/login
// ────────────────────────────────────────────
export const loginRequest = async (payload: LoginPayload): Promise<LoginResponse> => {
  // ── Modo mock: simula respuesta del backend ──
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, TIMEOUTS.mock.medium));
    const email = payload.email.trim().toLowerCase();
    const password = payload.password;

    const account = findMockAccount(email);

    if (!account) {
      throw { response: { data: { message: 'Credenciales inválidas.' } } };
    }

    if (account.password !== password) {
      throw { response: { data: { message: 'Contraseña incorrecta.' } } };
    }

    const rolePrefix = account.user.role === 'admin' ? 'admin'
      : account.user.role === 'instructor' ? 'instructor'
      : 'student';

    return {
      token: `mock-jwt-${rolePrefix}-${Date.now()}`,
      user: { ...account.user },
      refreshToken: `mock-refresh-${rolePrefix}-${Date.now()}`,
    };
  }

  // ── Modo real: llama al backend ──
  const { data } = await api.post<LoginResponse>('/auth/login', payload);
  return data;
};

// ────────────────────────────────────────────
// POST /auth/logout
// ────────────────────────────────────────────
export const logoutRequest = async (): Promise<void> => {
  if (IS_MOCK) return;
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
  if (IS_MOCK) {
    const persisted = readPersistedUser();
    if (persisted) return persisted;
    const admin = findMockAccount('admin@workflow.academy');
    return { ...admin!.user };
  }
  const { data } = await api.get<AuthUser>('/auth/me');
  return data;
};

// ────────────────────────────────────────────
// POST /auth/refresh  — obtener nuevo access token
// ────────────────────────────────────────────
export const refreshRequest = async (refreshToken: string): Promise<RefreshResponse> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, TIMEOUTS.mock.medium));
    return { token: 'mock-jwt-token-refreshed-' + Date.now() };
  }

  const { data } = await api.post<RefreshResponse>('/auth/refresh', { refreshToken });
  return data;
};

// ────────────────────────────────────────────
// PATCH /users/me  — actualizar datos del usuario
// ────────────────────────────────────────────
export const updateProfileRequest = async (payload: Partial<AuthUser>): Promise<AuthUser> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, TIMEOUTS.mock.long));
    const base = readPersistedUser() ?? findMockAccount('admin@workflow.academy')!.user;
    return { ...base, ...payload };
  }

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
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, TIMEOUTS.mock.long));
    if (payload.currentPassword.length < 6) {
      throw { response: { data: { message: 'Contraseña actual incorrecta.' } } };
    }
    return;
  }

  await api.patch('/auth/change-password', payload);
};

// ────────────────────────────────────────────
// POST /auth/forgot-password  — solicitar link de recuperación
// ────────────────────────────────────────────
export const forgotRequest = async (email: string): Promise<{ message: string }> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, TIMEOUTS.mock.long));
    return { message: 'Si el correo existe, recibirás un enlace en breve.' };
  }
  const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email });
  return data;
};

// ────────────────────────────────────────────
// POST /auth/reset-password  — restablecer contraseña con token
// ────────────────────────────────────────────
export const resetRequest = async (token: string, password: string): Promise<{ message: string }> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, TIMEOUTS.mock.long));
    return { message: 'Contraseña restablecida correctamente.' };
  }
  const { data } = await api.post<{ message: string }>('/auth/reset-password', { token, password });
  return data;
};

// ────────────────────────────────────────────
// POST /auth/register  — registro de nuevo usuario
// ────────────────────────────────────────────
export interface RegisterPayload { name: string; email: string; password: string; }
export const registerRequest = async (payload: RegisterPayload): Promise<{ message: string }> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, TIMEOUTS.mock.long));
    return { message: 'Solicitud de acceso enviada. Un administrador revisará tu cuenta.' };
  }
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
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, TIMEOUTS.mock.short));
    return;
  }
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

  if (IS_MOCK) {
    const { getCompressedFile } = await import('../utils/imageCompression');
    const compressed = await getCompressedFile(file);
    await new Promise((r) => setTimeout(r, TIMEOUTS.mock.medium));
    const url = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(compressed);
    });
    return { avatarUrl: url };
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