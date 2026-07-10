import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

// Layouts
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Pages
import { Login } from '../pages/auth/Login';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { Organizations } from '../pages/organizations/Organizations';

const router = createBrowserRouter([
  // ── Redirecciones cortas para facilitar acceso ──
  { path: '/login', element: <Navigate to="/auth/login" replace /> },

  // ── Rutas públicas ──
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: '',      element: <Navigate to="login" replace /> },
    ],
  },

  // ── Rutas privadas ──
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { path: 'dashboard',     element: <Dashboard /> },
      { path: 'organizations', element: <Organizations /> },
      { path: '',              element: <Navigate to="/auth/login" replace /> },
    ],
  },

  // ── Fallback ──
  { path: '*', element: <Navigate to="/auth/login" replace /> },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
