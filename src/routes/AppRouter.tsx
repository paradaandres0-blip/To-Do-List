import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

// Layouts
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Pages (Importaciones preparadas para los siguientes pasos)
// auth
import { Login } from '../pages/auth/Login';
// dashboard
import { Dashboard } from '../pages/dashboard/Dashboard';
import { Organizations } from '../pages/organizations/Organizations';
// Aquí irán el resto de importaciones (Groups, Courses, etc.) a medida que las creemos.

const router = createBrowserRouter([
  {
    // Rutas públicas (Autenticación)
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      // Redirección por defecto en auth
      { path: '', element: <Navigate to="login" replace /> },
    ],
  },
  {
    // Rutas privadas (Sistema principal)
    path: '/',
    element: <DashboardLayout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'organizations', element: <Organizations /> },
      // Redirección por defecto al entrar al sistema
      { path: '', element: <Navigate to="dashboard" replace /> },
    ],
  },
  {
    // Fallback: Cualquier ruta no encontrada redirige al login por seguridad
    path: '*',
    element: <Navigate to="/auth/login" replace />,
  }
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};