import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, CheckSquare } from 'lucide-react';

interface LoginFormInputs {
  email: string;
  password: string;
}

export const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    setLoginError('');
    await new Promise((resolve) => setTimeout(resolve, 900));
    // Acepta cualquier email/contraseña válidos (mínimo 6 chars)
    if (data.email && data.password.length >= 6) {
      navigate('/dashboard', { replace: true });
    } else {
      setLoginError('Contraseña muy corta. Mínimo 6 caracteres.');
    }
  };

  return (
    <div className="w-full flex flex-col">

      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5 mb-10">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
        >
          <CheckSquare size={22} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-white font-bold text-xl tracking-tight">TaskEdu</span>
      </div>

      {/* ── Encabezado ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Bienvenido de nuevo
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Ingresa tus credenciales para acceder a tu espacio de trabajo.
        </p>
      </div>

      {/* ── Formulario ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-300">
            Correo electrónico
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
              <Mail size={17} />
            </span>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@taskedu.com"
              className={`input-dark w-full rounded-xl pl-10 pr-4 py-3 text-sm ${errors.email ? 'error' : ''}`}
              {...register('email', {
                required: 'El correo es obligatorio',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: 'Formato de correo inválido',
                },
              })}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-400 font-medium mt-0.5">{errors.email.message}</p>
          )}
        </div>

        {/* Contraseña */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">
              Contraseña
            </label>
            <a
              href="#"
              className="text-xs font-medium transition-colors"
              style={{ color: '#a78bfa' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#7c3aed')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#a78bfa')}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
              <Lock size={17} />
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`input-dark w-full rounded-xl pl-10 pr-11 py-3 text-sm ${errors.password ? 'error' : ''}`}
              {...register('password', {
                required: 'La contraseña es obligatoria',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400 font-medium mt-0.5">{errors.password.message}</p>
          )}
        </div>

        {/* Error general */}
        {loginError && (
          <div className="rounded-xl px-4 py-3 text-xs font-medium text-red-300"
            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)' }}>
            {loginError}
          </div>
        )}

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-glow relative w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-semibold text-white transition-all duration-300 mt-2 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden group"
          style={{
            background: isSubmitting
              ? 'linear-gradient(135deg, #5b21b6, #1d4ed8)'
              : 'linear-gradient(135deg, #7c3aed, #2563eb)',
          }}
        >
          {/* Shine effect */}
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)',
            }}
          />

          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Ingresando...</span>
            </>
          ) : (
            <>
              <span>Ingresar al sistema</span>
              <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      {/* ── Divisor ── */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <span className="text-xs text-slate-600 font-medium">o continúa con</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
      </div>

      {/* ── Botones Sociales ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Google */}
        <button
          type="button"
          className="glass flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-300 hover:text-white transition-all duration-200 hover:border-white/20"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
            <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
            <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
            <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
          </svg>
          Google
        </button>

        {/* Microsoft */}
        <button
          type="button"
          className="glass flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-300 hover:text-white transition-all duration-200 hover:border-white/20"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#F25022" d="M1 1h10v10H1z"/>
            <path fill="#00A4EF" d="M13 1h10v10H13z"/>
            <path fill="#7FBA00" d="M1 13h10v10H1z"/>
            <path fill="#FFB900" d="M13 13h10v10H13z"/>
          </svg>
          Microsoft
        </button>
      </div>

      {/* ── Footer ── */}
      <p className="text-center text-xs text-slate-600 mt-8">
        ¿No tienes cuenta?{' '}
        <a
          href="#"
          className="font-semibold transition-colors"
          style={{ color: '#a78bfa' }}
        >
          Solicitar acceso
        </a>
      </p>
    </div>
  );
};
