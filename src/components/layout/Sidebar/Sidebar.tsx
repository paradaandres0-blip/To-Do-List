import { NavLink } from 'react-router-dom';
import {
  Dumbbell, LayoutDashboard, BookOpen, Users, User,
  ClipboardList, Building2, BarChart2, LogOut, Settings, Layers,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import useAuthStore from '../../../store/authStore';

const NAV_ITEMS = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard',   roles: ['admin'] },
  { to: '/organizations', icon: Building2,        label: 'Centros',     roles: ['admin'] },
  { to: '/groups',        icon: Users,            label: 'Grupos',      roles: ['admin'] },
  { to: '/courses',       icon: BookOpen,         label: 'Programas',   roles: ['admin'] },
  { to: '/modules',       icon: Layers,           label: 'Módulos',     roles: ['admin'] },
  { to: '/students',      icon: Users,            label: 'Alumnos',     roles: ['admin'] },
  { to: '/teachers',      icon: GraduationCap,    label: 'Docentes',    roles: ['admin'] },
  { to: '/tasks',         icon: ClipboardList,    label: 'Sesiones',    roles: ['admin'] },
  { to: '/reports',       icon: BarChart2,        label: 'Reportes',    roles: ['admin'] },
];

export default function Sidebar() {
  const { handleLogout: hookLogout } = useAuth();
  const user = useAuthStore((s) => s.user);

  const handleLogout = async () => {
    await hookLogout();
  };

  return (
    <aside
      className="flex flex-col h-full w-64 bg-slate-900 border-r border-white/5"
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-purple-600 to-blue-600"
        >
          <Dumbbell size={18} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-white font-extrabold text-sm tracking-tight leading-tight block">WorkFlow</span>
          <span className="text-purple-400 font-bold text-xs tracking-widest uppercase leading-tight block">Academy</span>
        </div>
      </div>

      {/* ── Navegación ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-3">
          Menú Principal
        </p>

        {NAV_ITEMS.filter((item) => user && item.roles.includes(user.role)).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'text-white bg-gradient-to-r from-purple-600/25 to-blue-600/15 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'} />
                {label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-white/5 pt-3">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150"
        >
          <User size={18} className="text-slate-500" />
          Mi Perfil
        </NavLink>
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150"
        >
          <Settings size={18} className="text-slate-500" />
          Configuración
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
