import api from './api';

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
}

export interface LoginResponse {
  token: string;
  user:  AuthUser;
  refreshToken?: string;
}

export interface RefreshResponse {
  token: string;
}

// ── Usuario mock para desarrollo sin backend ──
const MOCK_USER: AuthUser = {
  id:    '1',
  name:  'Julián Parada',
  email: 'admin@workflow.com',
  role:  'admin',
};

const IS_MOCK = import.meta.env.VITE_AUTH_MODE === 'mock';

// ────────────────────────────────────────────
// POST /auth/login
// ────────────────────────────────────────────
export const loginRequest = async (payload: LoginPayload): Promise<LoginResponse> => {
  // ── Modo mock: simula respuesta del backend ──
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 800)); // simula latencia
    if (!payload.email || payload.password.length < 6) {
      throw { response: { data: { message: 'Credenciales inválidas.' } } };
    }
    return {
      token: 'mock-jwt-token-' + Date.now(),
      user:  { ...MOCK_USER, email: payload.email },
      refreshToken: 'mock-refresh-token-' + Date.now(),
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
  if (IS_MOCK) return MOCK_USER;
  const { data } = await api.get<AuthUser>('/auth/me');
  return data;
};

// ────────────────────────────────────────────
// POST /auth/refresh  — obtener nuevo access token
// ────────────────────────────────────────────
export const refreshRequest = async (refreshToken: string): Promise<RefreshResponse> => {
  if (IS_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
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
    await new Promise((r) => setTimeout(r, 600));
    return { ...MOCK_USER, ...payload };
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
    await new Promise((r) => setTimeout(r, 700));
    // Simula que la contraseña actual incorrecta devuelve error
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
    await new Promise((r) => setTimeout(r, 600));
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
    await new Promise((r) => setTimeout(r, 600));
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
    await new Promise((r) => setTimeout(r, 700));
    return { message: 'Solicitud de acceso enviada. Un administrador revisará tu cuenta.' };
  }
  const { data } = await api.post<{ message: string }>('/auth/register', payload);
  return data;
};
