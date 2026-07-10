import { NavLink, useNavigate } from 'react-router-dom';
import {
  Dumbbell, LayoutDashboard, BookOpen, Users, User,
  ClipboardList, Building2, BarChart2, LogOut, Settings, Layers,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/courses',       icon: BookOpen,         label: 'Programas'     },
  { to: '/modules',       icon: Layers,           label: 'Módulos'       },
  { to: '/tasks',         icon: ClipboardList,    label: 'Sesiones'      },
  { to: '/groups',        icon: Users,            label: 'Grupos'        },
  { to: '/organizations', icon: Building2,        label: 'Centros'       },
  { to: '/reports',       icon: BarChart2,        label: 'Reportes'      },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside
      className="flex flex-col h-full w-64"
      style={{ background: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
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

        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? { background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(37,99,235,0.15))', border: '1px solid rgba(124,58,237,0.3)' }
                : {}
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
      <div className="px-3 pb-4 space-y-0.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', paddingTop: '12px' }}>
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
          onClick={() => navigate('/auth/login')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
