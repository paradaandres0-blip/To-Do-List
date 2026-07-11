import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, LoginPayload } from '../services/authService';
import { loginRequest, logoutRequest } from '../services/authService';

// ── Tipos del store ──
interface AuthState {
  user:        AuthUser | null;
  token:       string   | null;
  isLoading:   boolean;
  error:       string   | null;

  // Acciones
  login:       (payload: LoginPayload) => Promise<void>;
  logout:      () => Promise<void>;
  clearError:  () => void;
  setUser:     (user: AuthUser) => void;
}

// ── Store ──
const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      user:      null,
      token:     null,
      isLoading: false,
      error:     null,

      // ── LOGIN ──
      login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await loginRequest(payload);

          // Guardamos el token en localStorage para el interceptor de axios
          localStorage.setItem('wf_token', token);

          set({ user, token, isLoading: false, error: null });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })
              .response?.data?.message ?? 'Credenciales incorrectas';
          set({ isLoading: false, error: message });
          throw err; // re-throw para que el componente pueda manejarlo
        }
      },

      // ── LOGOUT ──
      logout: async () => {
        set({ isLoading: true });
        await logoutRequest();
        localStorage.removeItem('wf_token');
        set({ user: null, token: null, isLoading: false, error: null });
      },

      clearError: () => set({ error: null }),
      setUser:    (user) => set({ user }),
    }),
    {
      name:    'wf_auth',          // clave en localStorage
      partialize: (state) => ({    // solo persistir user y token
        user:  state.user,
        token: state.token,
      }),
    }
  )
);

export default useAuthStore;
