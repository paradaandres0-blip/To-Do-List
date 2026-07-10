import { Outlet } from 'react-router-dom';
import { Dumbbell, Apple, Brain } from 'lucide-react';

const features = [
  { icon: <Dumbbell size={18} />, text: 'Programas de entrenamiento físico' },
  { icon: <Apple   size={18} />, text: 'Planes de nutrición personalizados' },
  { icon: <Brain   size={18} />, text: 'Bienestar mental y mindfulness'     },
];

// Imágenes de fondo combinadas: pesas + comida saludable (Unsplash)
const BG_IMAGES = [
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80', // gym pesas
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1600&q=80', // comida saludable
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1600&q=80', // entrenamiento
];

export const AuthLayout = () => {
  return (
    <div className="h-screen flex overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── PANEL IZQUIERDO — Formulario ── */}
      <div
        className="flex-1 flex flex-col justify-center items-center px-8 sm:px-12 lg:px-14 relative overflow-hidden"
        style={{ background: '#0f172a', height: '100vh' }}
      >
        {/* Textura de puntos */}
        <div className="dot-texture absolute inset-0 pointer-events-none" />

        {/* Orbe morado top-left */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)', filter: 'blur(45px)' }}
        />
        {/* Orbe azul bottom-right */}
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />

        <div className="relative z-10 w-full max-w-sm">
          <Outlet />
        </div>
      </div>

      {/* ── PANEL DERECHO — Fondo con imágenes ── */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden flex-col justify-between py-14 px-14">

        {/* ── COLLAGE DE IMÁGENES DE FONDO ── */}
        {/* Imagen principal: pesas / gym */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${BG_IMAGES[0]}')` }}
        />

        {/* Overlay oscuro degradado para legibilidad */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.88) 0%, rgba(30,10,60,0.80) 40%, rgba(15,23,42,0.75) 100%)',
          }}
        />

        {/* Tarjetas flotantes con miniaturas adicionales */}
        {/* Miniatura comida saludable — esquina inferior derecha */}
        <div
          className="absolute bottom-24 right-8 w-44 h-32 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl"
          style={{ zIndex: 10 }}
        >
          <img
            src={BG_IMAGES[1]}
            alt="Nutrición"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'rgba(15,23,42,0.35)' }} />
          <div className="absolute bottom-2 left-3 text-white text-xs font-bold drop-shadow">🥗 Nutrición</div>
        </div>

        {/* Miniatura entrenamiento — esquina superior derecha */}
        <div
          className="absolute top-20 right-8 w-36 h-24 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl"
          style={{ zIndex: 10 }}
        >
          <img
            src={BG_IMAGES[2]}
            alt="Entrenamiento"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'rgba(15,23,42,0.35)' }} />
          <div className="absolute bottom-2 left-3 text-white text-xs font-bold drop-shadow">💪 Fitness</div>
        </div>

        {/* ── CONTENIDO SOBRE LAS IMÁGENES ── */}

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}
          >
            <Dumbbell size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-extrabold text-xl tracking-tight">WorkFlow Academy</span>
        </div>

        {/* Contenido central */}
        <div className="relative z-10 flex flex-col gap-7">

          {/* Badge */}
          <span
            className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.45)', color: '#c4b5fd' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse inline-block" />
            Plataforma de Bienestar
          </span>

          {/* Título */}
          <div>
            <h2 className="text-5xl font-extrabold text-white leading-tight tracking-tight mb-3">
              Transforma vidas
              <br />
              <span style={{
                background: 'linear-gradient(90deg,#c4b5fd,#93c5fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                con cada programa.
              </span>
            </h2>
            <p className="text-slate-300 text-base leading-relaxed max-w-md">
              Gestiona cursos de salud física, nutrición y bienestar mental en un solo lugar.
            </p>
          </div>

          {/* Features */}
          <ul className="flex flex-col gap-3">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(124,58,237,0.22)', border: '1px solid rgba(124,58,237,0.4)', color: '#c4b5fd' }}
                >
                  {f.icon}
                </span>
                <span className="text-slate-300 text-sm font-medium">{f.text}</span>
              </li>
            ))}
          </ul>

          {/* Stats glass */}
          <div className="glass rounded-2xl p-5 flex items-center gap-5 w-fit">
            {[
              { val: '+2K',  label: 'Alumnos'      },
              { val: '98%',  label: 'Satisfacción' },
              { val: '50+',  label: 'Programas'    },
            ].map((s, i, arr) => (
              <div key={s.label} className="flex items-center gap-5">
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-white">{s.val}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
                {i < arr.length - 1 && <div className="w-px h-8 bg-white/10" />}
              </div>
            ))}
          </div>


        </div>

        {/* Footer */}
        <p className="relative z-10 text-slate-600 text-xs">
          © 2026 WorkFlow Academy · Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};
