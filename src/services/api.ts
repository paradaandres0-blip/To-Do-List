import axios from 'axios';
import { genericApiResponseSchema, genericPaginatedResponseSchema, apiErrorSchema } from '../schemas/api.schema';

// ── Logging de respuestas inválidas ──
const logInvalidResponse = (url: string, data: unknown, validationErrors: unknown) => {
  console.warn(`[API Validation] Respuesta inválida para ${url}:`, {
    url,
    data,
    validationErrors,
    timestamp: new Date().toISOString(),
  });
};

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

// ── Response interceptor: validación de respuestas + manejo global de errores ──
api.interceptors.response.use(
  (response) => {
    // Validar solo en modo real (con backend)
    const isReal = import.meta.env.VITE_AUTH_MODE !== 'mock';
    if (isReal && response.data) {
      const url = response.config?.url ?? 'unknown';

      // Verificar si la respuesta tiene forma de ApiResponse o PaginatedResponse
      const apiResult = genericApiResponseSchema.safeParse(response.data);
      const paginatedResult = genericPaginatedResponseSchema.safeParse(response.data);

      if (!apiResult.success && !paginatedResult.success) {
        logInvalidResponse(url, response.data, {
          apiErrors: apiResult.error?.issues,
          paginatedErrors: paginatedResult.error?.issues,
        });
      }
    }
    return response;
  },
  (error) => {
    // Validar errores con apiErrorSchema en modo real
    const isReal = import.meta.env.VITE_AUTH_MODE !== 'mock';
    if (isReal && error.response?.data) {
      const errorResult = apiErrorSchema.safeParse(error.response.data);
      if (!errorResult.success) {
        console.warn('[API Validation] Error response no sigue el estándar ApiError:', {
          url: error.config?.url,
          data: error.response.data,
          validationErrors: errorResult.error.issues,
          timestamp: new Date().toISOString(),
        });
      }
    }
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
