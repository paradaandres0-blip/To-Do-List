import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

// Layouts
import { AuthLayout }      from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { TeacherLayout }   from '../layouts/TeacherLayout';
import { PrivateRoute }    from './PrivateRoute';
import { RoleGate }        from './RoleGate';

// Auth
import { Login }         from '../pages/auth/Login';

// Dashboard (admin)
import { Dashboard }     from '../pages/dashboard/Dashboard';
import { Courses }       from '../pages/courses/Courses';
import { Tasks }         from '../pages/tasks/Tasks';
import { Modules }       from '../pages/modules/Modules';
import { Organizations } from '../pages/organizations/Organizations';
import { Reports }       from '../pages/reports/Reports';
import { Profile }       from '../pages/profile/Profile';
import { Students }      from '../pages/students/Students';
import { Teachers }      from '../pages/teachers/Teachers';
import { TeacherProfile } from '../pages/teachers/TeacherProfile';
import { Settings }      from '../pages/settings/Settings';
import { Groups }        from '../pages/groups/Groups';

// Portal docente
import { TeacherBoard }      from '../pages/teachers/TeacherBoard';
import { MyTeacherProfile }  from '../pages/teachers/MyTeacherProfile';

const router = createBrowserRouter([
  { path: '/login', element: <Navigate to="/auth/login" replace /> },

  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: '',      element: <Navigate to="login" replace /> },
    ],
  },

  {
    element: <PrivateRoute />,
    children: [
      // ── Admin ──
      {
        element: <RoleGate allow={['admin']} />,
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
              { path: 'teachers',      element: <Teachers />      },
              { path: 'teachers/:id',  element: <TeacherProfile /> },
              { path: 'settings',      element: <Settings />      },
            ],
          },
        ],
      },

      // ── Docente (instructor) ──
      {
        element: <RoleGate allow={['instructor']} />,
        children: [
          {
            path: '/docente',
            element: <TeacherLayout />,
            children: [
              { path: '',       element: <TeacherBoard /> },
              { path: 'perfil', element: <MyTeacherProfile /> },
            ],
          },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/auth/login" replace /> },
]);

export const AppRouter = () => <RouterProvider router={router} />;
