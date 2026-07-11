import axios from 'axios';

// ── Instancia base ──
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// ── Request interceptor: adjunta el JWT si existe ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wf_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: manejo global de errores ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expirado o inválido → limpiar sesión y redirigir
    if (error.response?.status === 401) {
      localStorage.removeItem('wf_token');
      localStorage.removeItem('wf_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;
