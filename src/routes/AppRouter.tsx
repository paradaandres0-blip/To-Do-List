import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

// Layouts
import { AuthLayout }      from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PrivateRoute }    from './PrivateRoute';

// Auth
import { Login }         from '../pages/auth/Login';

// Dashboard
import { Dashboard }     from '../pages/dashboard/Dashboard';
import { Courses }       from '../pages/courses/Courses';
import { Tasks }         from '../pages/tasks/Tasks';
import { Modules }       from '../pages/modules/Modules';
import { Organizations } from '../pages/organizations/Organizations';
import { Reports }       from '../pages/reports/Reports';
import { Profile }       from '../pages/profile/Profile';
import { Students }      from '../pages/students/Students';
import { Settings }      from '../pages/settings/Settings';
import { Groups }        from '../pages/groups/Groups';

const router = createBrowserRouter([
  // ── Accesos cortos ──
  { path: '/login', element: <Navigate to="/auth/login" replace /> },

  // ── Rutas públicas (Auth) ──
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: '',      element: <Navigate to="login" replace /> },
    ],
  },

  // ── Rutas privadas (requieren token) ──
  {
    element: <PrivateRoute />,
    children: [
      {
        path: '/',
        element: <DashboardLayout />,
        children: [
          { path: '',              element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard',     element: <Dashboard />     },
          { path: 'courses',       element: <Courses />       },
          { path: 'tasks',         element: <Tasks />         },
          { path: 'modules',       element: <Modules />       },
          { path: 'groups',        element: <Groups />        },
          { path: 'organizations', element: <Organizations /> },
          { path: 'reports',       element: <Reports />       },
          { path: 'profile',       element: <Profile />       },
          { path: 'students',      element: <Students />      },
          { path: 'settings',      element: <Settings />      },
        ],
      },
    ],
  },

  // ── Fallback ──
  { path: '*', element: <Navigate to="/auth/login" replace /> },
]);

export const AppRouter = () => <RouterProvider router={router} />;
