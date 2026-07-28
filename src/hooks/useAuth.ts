import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { getHomeForRole } from '../utils/roleRouting';

/**
 * Hook centralizado de autenticación.
 * Encapsula el acceso al store y la navegación.
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const { user, token, isLoading, error, login, logout, clearError } = useAuthStore();

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      clearError();
      await login({ email, password });
      const role = useAuthStore.getState().user?.role;
      navigate(getHomeForRole(role), { replace: true });
    },
    [login, navigate, clearError]
  );

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/auth/login', { replace: true });
  }, [logout, navigate]);

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!token,
    handleLogin,
    handleLogout,
    clearError,
  };
};
