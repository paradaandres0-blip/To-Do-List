import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import type { AuthUser } from '../services/authService';
import { getHomeForRole, normalizeRole } from '../utils/roleRouting';

type Role = AuthUser['role'];

interface RoleGateProps {
  allow: Role[];
}

const homeForRole = (role: Role) => getHomeForRole(role);

/** Protege rutas por rol (admin vs instructor/docente). */
export const RoleGate = ({ allow }: RoleGateProps) => {
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user?.role) as Role | null;

  if (!role) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allow.includes(role)) {
    return <Navigate to={homeForRole(role)} replace />;
  }

  return <Outlet />;
};
