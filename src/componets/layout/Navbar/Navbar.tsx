import { Bell, Search, ChevronDown } from 'lucide-react';

export default function Navbar() {
  return (
    <header
      className="h-16 flex items-center justify-between px-6 flex-shrink-0"
      style={{
        background: '#0f172a',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* ── Buscador ── */}
      <div className="relative hidden sm:flex items-center">
        <Search size={16} className="absolute left-3 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar..."
          className="pl-9 pr-4 py-2 text-sm rounded-xl text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/40 w-64 transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
        />
      </div>

      {/* ── Acciones ── */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notificaciones */}
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Bell size={17} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
          />
        </button>

        {/* Perfil */}
        <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-colors hover:bg-white/5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
          >
            A
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-white leading-tight">Admin</p>
            <p className="text-[11px] text-slate-500 leading-tight">Administrador</p>
          </div>
          <ChevronDown size={14} className="text-slate-500" />
        </button>
      </div>
    </header>
  );
}
