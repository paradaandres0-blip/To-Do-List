import { NavLink, Outlet } from 'react-router-dom';
import { Dumbbell, LayoutGrid, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const NAV = [
  { to: '/docente', end: true, icon: LayoutGrid, label: 'Tablero' },
  { to: '/docente/perfil', end: false, icon: User, label: 'Mi Perfil' },
];

/** Barra superior del portal docente — más espacio para el tablero. */
export const TeacherLayout = () => {
  const { user, handleLogout } = useAuth();

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#f8fafc' }}>
      <header
        className="flex-shrink-0 z-20"
        style={{ background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-4 px-4 md:px-6 h-14">
          {/* Brand */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
            >
              <Dumbbell size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-extrabold text-sm tracking-tight leading-none block">
                WorkFlow
              </span>
              <span className="text-purple-400 font-bold text-[10px] tracking-widest uppercase leading-none block">
                Docente
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1 flex-1 min-w-0" role="navigation" aria-label="Navegación principal">
            {NAV.map(({ to, end, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                aria-label={label}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        background:
                          'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(37,99,235,0.15))',
                        border: '1px solid rgba(124,58,237,0.3)',
                      }
                    : { border: '1px solid transparent' }
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} className={isActive ? 'text-purple-400' : 'text-slate-500'} />
                    <span className="hidden xs:inline sm:inline">{label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" aria-hidden="true" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User + logout */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-white leading-tight truncate max-w-[160px]">
                {user?.name}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight truncate max-w-[180px]">
                {user?.email}
              </p>
            </div>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
            >
              {user?.name?.charAt(0).toUpperCase() ?? 'D'}
            </div>
            <button
              type="button"
              onClick={() => handleLogout()}
              title="Cerrar sesión"
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={15} />
              <span className="hidden lg:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="py-4 px-4 md:px-6 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
