import { Outlet } from 'react-router-dom';
import { CheckSquare, Shield, Zap, Users } from 'lucide-react';

const features = [
  { icon: <Zap size={18} />,    text: 'Gestión de tareas en tiempo real' },
  { icon: <Users size={18} />,  text: 'Colaboración por equipos y grupos' },
  { icon: <Shield size={18} />, text: 'Roles y permisos por organización' },
];

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ─────────── PANEL IZQUIERDO — Formulario ─────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-10 lg:px-16 py-12 bg-[#0f172a] relative overflow-hidden">

        {/* Textura de puntos */}
        <div className="dot-texture absolute inset-0 pointer-events-none" />

        {/* Orbe decorativo top-left */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Orbe decorativo bottom-right */}
        <div
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Contenido del formulario */}
        <div className="relative z-10 w-full max-w-sm">
          <Outlet />
        </div>
      </div>

      {/* ─────────── PANEL DERECHO — Branding ─────────── */}
      <div
        className="hidden lg:flex lg:flex-1 relative overflow-hidden flex-col justify-between py-16 px-14"
        style={{
          background: 'linear-gradient(135deg, #1e0a3c 0%, #1e1b4b 35%, #0f172a 70%, #0c1a3a 100%)',
        }}
      >
        {/* Textura de puntos */}
        <div className="dot-texture absolute inset-0 pointer-events-none opacity-60" />

        {/* Orbes decorativos */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at top right, rgba(124,58,237,0.3) 0%, transparent 60%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at bottom left, rgba(37,99,235,0.25) 0%, transparent 60%)',
          }}
        />

        {/* Línea decorativa diagonal */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(135deg, rgba(124,58,237,0.05) 25%, transparent 25%, transparent 50%, rgba(124,58,237,0.05) 50%, rgba(124,58,237,0.05) 75%, transparent 75%)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Logo top */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
          >
            <CheckSquare size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">TaskEdu</span>
        </div>

        {/* Contenido central */}
        <div className="relative z-10 flex flex-col gap-8">
          {/* Badge */}
          <span
            className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
            style={{
              background: 'rgba(124,58,237,0.18)',
              border: '1px solid rgba(124,58,237,0.4)',
              color: '#a78bfa',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse inline-block" />
            Plataforma Educativa
          </span>

          {/* Título principal */}
          <div>
            <h2 className="text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
              Gestiona el aprendizaje
              <br />
              <span
                style={{
                  background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                de forma inteligente.
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Unifica módulos, tareas y colaboración en un solo espacio diseñado para equipos de alto rendimiento.
            </p>
          </div>

          {/* Features */}
          <ul className="flex flex-col gap-3">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(124,58,237,0.2)',
                    border: '1px solid rgba(124,58,237,0.35)',
                    color: '#a78bfa',
                  }}
                >
                  {f.icon}
                </span>
                <span className="text-slate-300 text-sm font-medium">{f.text}</span>
              </li>
            ))}
          </ul>

          {/* Tarjeta de stats glass */}
          <div
            className="glass rounded-2xl p-5 flex items-center gap-5 w-fit"
            style={{ marginTop: '8px' }}
          >
            <div className="text-center">
              <p className="text-3xl font-extrabold text-white">+500</p>
              <p className="text-xs text-slate-400 mt-0.5">Estudiantes</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-extrabold text-white">98%</p>
              <p className="text-xs text-slate-400 mt-0.5">Satisfacción</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-extrabold text-white">24/7</p>
              <p className="text-xs text-slate-400 mt-0.5">Disponibilidad</p>
            </div>
          </div>
        </div>

        {/* Footer branding */}
        <p className="relative z-10 text-slate-600 text-xs">
          © 2026 TaskEdu · Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};
