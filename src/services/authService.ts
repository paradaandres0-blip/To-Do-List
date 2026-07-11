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
}

export interface LoginResponse {
  token: string;
  user:  AuthUser;
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
