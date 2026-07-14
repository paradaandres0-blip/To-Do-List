import axios from 'axios';

// ── Limpiar auth store cuando el token expira sin importar el ciclo de React ──
const clearAuthState = () => {
  localStorage.removeItem('wf_token');
  localStorage.removeItem('wf_refresh');
  // Borra la clave persistida de Zustand para que al recargar no rehidrate con datos viejos
  localStorage.removeItem('wf_auth');
};

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
    const originalRequest = error.config;

    // Token expirado o inválido → intentar refresh flow
    if (error.response?.status === 401 && !originalRequest?._retry) {
      const refreshToken = localStorage.getItem('wf_refresh');
      if (!refreshToken) {
        clearAuthState();
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }

      // Cola para peticiones que lleguen mientras se refresca
      if (!(api as any)._isRefreshing) {
        (api as any)._isRefreshing = true;
        (api as any)._failedQueue = [] as Array<any>;

        const refreshClient = axios.create({ baseURL: api.defaults.baseURL });
        refreshClient.post('/auth/refresh', { refreshToken })
          .then(({ data }) => {
            const newToken = data?.token;
            if (newToken) {
              localStorage.setItem('wf_token', newToken);
              api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            }

            (api as any)._failedQueue.forEach((prom: any) => {
              prom.resolve(newToken);
            });
            (api as any)._failedQueue = [];
          })
          .catch((err) => {
            (api as any)._failedQueue.forEach((prom: any) => {
              prom.reject(err);
            });
            (api as any)._failedQueue = [];
            // Refresh también falló → sesión expirada definitivamente
            clearAuthState();
            window.location.href = '/auth/login';
          })
          .finally(() => {
            (api as any)._isRefreshing = false;
          });
      }

      return new Promise((resolve, reject) => {
        (api as any)._failedQueue.push({
          resolve: (token: string) => {
            if (!originalRequest.headers) originalRequest.headers = {};
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(axios(originalRequest));
          },
          reject: (err: any) => reject(err),
        });
      });
    }

    // Otros errores → pasar adelante
    return Promise.reject(error);
  }
);

export default api;
