import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

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
      navigate('/dashboard', { replace: true });
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
