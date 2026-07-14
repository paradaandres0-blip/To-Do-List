import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export const PrivateRoute = () => {
  // Lee directo de localStorage para no depender del ciclo de rehidratación de Zustand
  const token =
    useAuthStore((s) => s.token) ??
    localStorage.getItem('wf_token');

  return token ? <Outlet /> : <Navigate to="/auth/login" replace />;
};
