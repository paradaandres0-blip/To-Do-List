import { useState } from 'react';
import { Bell, ChevronDown, User, Settings, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';

const NOTIFICATIONS = [
  { id: 1, text: 'Nueva inscripción en "Fitness Funcional"', time: 'Hace 5 min',  unread: true  },
  { id: 2, text: 'Plan nutricional "Semana 3" aprobado',      time: 'Hace 1 hora', unread: true  },
  { id: 3, text: 'Sesión de meditación completada por Laura', time: 'Hace 2 horas', unread: false },
];

export default function Navbar() {
  const navigate   = useNavigate();
  const logout     = useAuthStore((s) => s.logout);
  const user       = useAuthStore((s) => s.user);
  const [showNotif,   setShowNotif]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login', { replace: true });
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-6 flex-shrink-0 relative z-30"
      style={{ background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >

      {/* ── Acciones ── */}
      <div className="flex items-center gap-2 ml-auto">

        {/* ── Notificaciones ── */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown notificaciones */}
          {showNotif && (
            <div
              className="absolute right-0 top-11 w-80 rounded-2xl overflow-hidden shadow-2xl z-50"
              style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-sm font-bold text-white">Notificaciones</p>
                <button onClick={() => setShowNotif(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {NOTIFICATIONS.map((n) => (
                  <div key={n.id} className="px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors cursor-pointer">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: n.unread ? '#7c3aed' : 'transparent', border: n.unread ? 'none' : '1px solid #334155' }}
                    />
                    <div>
                      <p className="text-xs text-slate-300 leading-relaxed">{n.text}</p>
                      <p className="text-[10px] text-slate-600 mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button className="w-full text-center text-xs font-semibold transition-colors" style={{ color: '#a78bfa' }}>
                  Ver todas las notificaciones
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Perfil ── */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-colors hover:bg-white/5"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
              {user?.name?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-white leading-tight">{user?.name?.split(' ')[0] ?? 'Admin'}</p>
              <p className="text-[11px] text-slate-500 leading-tight">WorkFlow Academy</p>
            </div>
            <ChevronDown size={13} className={`text-slate-500 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown perfil */}
          {showProfile && (
            <div
              className="absolute right-0 top-11 w-52 rounded-2xl overflow-hidden shadow-2xl z-50"
              style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-sm font-bold text-white">{user?.name ?? 'Administrador'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{user?.email ?? 'admin@workflow.com'}</p>
              </div>
              <div className="py-1.5">
                {[
                  { icon: User,     label: 'Mi Perfil',      action: () => { navigate('/profile');  setShowProfile(false); } },
                  { icon: Settings, label: 'Configuración',  action: () => { navigate('/settings'); setShowProfile(false); } },
                ].map((item) => (
                  <button key={item.label} onClick={item.action}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                    <item.icon size={15} className="text-slate-500" />
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={15} />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay para cerrar dropdowns */}
      {(showNotif || showProfile) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowNotif(false); setShowProfile(false); }} />
      )}
    </header>
  );
}
