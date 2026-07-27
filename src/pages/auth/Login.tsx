import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Dumbbell, Apple, Brain, Flame } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema, type LoginFormValues } from '../../schemas/auth.schema';
import { getMockAccounts } from '../../services/mockDb';

const FLOATING_ICONS = [
  { icon: Dumbbell, top: '5%',    left: '5%',   size: 42, rotate: '-20deg', color: '#a78bfa', opacity: 0.35 },
  { icon: Apple,    top: '8%',    right: '7%',  size: 36, rotate: '15deg',  color: '#86efac', opacity: 0.35 },
  { icon: Brain,    top: '32%',   left: '3%',   size: 30, rotate: '-8deg',  color: '#7dd3fc', opacity: 0.28 },
  { icon: Flame,    top: '28%',   right: '4%',  size: 34, rotate: '12deg',  color: '#fda4af', opacity: 0.30 },
  { icon: Dumbbell, bottom: '28%', right: '5%', size: 38, rotate: '25deg',  color: '#c4b5fd', opacity: 0.28 },
  { icon: Apple,    bottom: '22%', left: '4%',  size: 32, rotate: '-12deg', color: '#6ee7b7', opacity: 0.30 },
  { icon: Brain,    bottom: '8%',  right: '8%', size: 36, rotate: '18deg',  color: '#93c5fd', opacity: 0.32 },
  { icon: Flame,    bottom: '6%',  left: '6%',  size: 30, rotate: '-15deg', color: '#fb7185', opacity: 0.28 },
];

export const Login = () => {
  const { handleLogin, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    clearError();
    try {
      await handleLogin(data.email, data.password);
    } catch {
      // El error ya queda en el store y se muestra en el JSX
    }
  };

  return (
    <div className="w-full min-h-full flex flex-col justify-center py-0 relative">

      {/* Íconos flotantes */}
      {FLOATING_ICONS.map(({ icon: Icon, top, left, right, bottom, size, rotate, color, opacity }, i) => (
        <div key={i} className="absolute pointer-events-none"
          style={{ top, left, right, bottom, transform: `rotate(${rotate})`, opacity }}>
          <Icon size={size} color={color} strokeWidth={1.5} />
        </div>
      ))}

      {/* Logo */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
          <Dumbbell size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-white font-extrabold text-sm tracking-tight leading-none block">WorkFlow</span>
          <span className="text-purple-400 font-bold text-[10px] tracking-widest uppercase leading-none block">Academy</span>
        </div>
      </div>

      {/* Encabezado */}
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-white tracking-tight leading-tight mb-1">
          Bienvenido de nuevo
        </h1>
        <p className="text-slate-500 text-xs leading-relaxed">Salud · Nutrición · Bienestar Mental</p>
      </div>

      {/* Chips */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { icon: <Dumbbell size={11} />, label: 'Fitness'    },
          { icon: <Apple    size={11} />, label: 'Nutrición'  },
          { icon: <Brain    size={11} />, label: 'Bienestar'  },
          { icon: <Flame    size={11} />, label: 'Motivación' },
        ].map((c) => (
          <span key={c.label}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold"
            style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', color: '#c4b5fd' }}>
            {c.icon} {c.label}
          </span>
        ))}
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-xs font-semibold text-slate-400">Correo electrónico</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-600">
              <Mail size={15} />
            </span>
            <input id="email" type="email" autoComplete="email" placeholder="admin@workflow.com"
              className={`input-dark w-full rounded-xl pl-9 pr-4 py-2.5 text-sm ${errors.email ? 'error' : ''}`}
              {...register('email', {
                required: 'El correo es obligatorio',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' },
                onChange: () => clearError(),
              })}
            />
          </div>
          {errors.email && <p className="text-[11px] text-red-400">{errors.email.message}</p>}
        </div>

        {/* Contraseña */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-semibold text-slate-400">Contraseña</label>
            <a href="#" className="text-[11px] font-medium" style={{ color: '#a78bfa' }}>
              ¿Olvidaste la contraseña?
            </a>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-600">
              <Lock size={15} />
            </span>
            <input id="password" type={showPassword ? 'text' : 'password'}
              autoComplete="current-password" placeholder="••••••••"
              className={`input-dark w-full rounded-xl pl-9 pr-10 py-2.5 text-sm ${errors.password ? 'error' : ''}`}
              {...register('password', {
                required: 'La contraseña es obligatoria',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                onChange: () => clearError(),
              })}
            />
            <button type="button" tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-600 hover:text-slate-300 transition-colors">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p className="text-[11px] text-red-400">{errors.password.message}</p>}
        </div>

        {/* Error del servidor */}
        {error && (
          <div className="rounded-lg px-3 py-2.5 text-xs font-medium text-red-300 flex items-center gap-2"
            style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Botón submit */}
        <button type="submit" disabled={isLoading}
          className="btn-glow relative w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden group mt-1"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.08),transparent 60%)' }} />
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Ingresando...</span>
            </>
          ) : (
            <>
              <span>Ingresar al sistema</span>
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      {/* Divisor */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span className="text-[11px] text-slate-600 font-medium">o continúa con</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Sociales */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="relative group">
          <button type="button" disabled
            className="w-full glass flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-medium text-slate-500 cursor-not-allowed opacity-40 transition-all select-none">
            <svg width="15" height="15" viewBox="0 0 24 24" className="grayscale">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
              <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
              <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
              <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
            </svg>
            Google
          </button>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-950/90 text-slate-300 text-[10px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg border border-slate-800">
            Próximamente
          </span>
        </div>
        <div className="relative group">
          <button type="button" disabled
            className="w-full glass flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-medium text-slate-500 cursor-not-allowed opacity-40 transition-all select-none">
            <svg width="15" height="15" viewBox="0 0 24 24" className="grayscale">
              <path fill="#F25022" d="M1 1h10v10H1z"/>
              <path fill="#00A4EF" d="M13 1h10v10H13z"/>
              <path fill="#7FBA00" d="M1 13h10v10H1z"/>
              <path fill="#FFB900" d="M13 13h10v10H13z"/>
            </svg>
            Microsoft
          </button>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-950/90 text-slate-300 text-[10px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg border border-slate-800">
            Próximamente
          </span>
        </div>
      </div>

      {/* Credenciales demo */}
      <div
        className="mt-4 rounded-xl px-3 py-3 space-y-2"
        style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#c4b5fd' }}>
          Accesos de prueba
        </p>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <span className="text-slate-300 font-semibold">Admin:</span>{' '}
          admin@workflow.academy · 123456
        </p>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <span className="text-slate-300 font-semibold">Docente:</span>{' '}
          docente@workflow.academy · docente123
        </p>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <span className="text-slate-300 font-semibold">Estudiante:</span>{' '}
          estudiante@workflow.academy · estudiante123
        </p>
      </div>

      {/* Footer */}
      <p className="text-center text-[11px] text-slate-600 mt-4">
        ¿No tienes cuenta?{' '}
        <a href="#" className="font-semibold" style={{ color: '#a78bfa' }}>Solicitar acceso</a>
      </p>
    </div>
  );
};
