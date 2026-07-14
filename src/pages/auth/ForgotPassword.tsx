import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, ArrowRight } from 'lucide-react';
import { forgotRequest } from '../../services/authService';

interface FormInputs { email: string }

export const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormInputs) => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await forgotRequest(data.email);
      setMessage(res.message ?? 'Revisa tu correo para continuar.');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Error al solicitar recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-full flex flex-col justify-center py-0 relative">
      <h2 className="text-xl font-bold text-white mb-3">Recuperar contraseña</h2>
      <p className="text-sm text-slate-500 mb-4">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full max-w-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400">Correo electrónico</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-600"><Mail size={15} /></span>
            <input type="email" placeholder="tu@correo.com" autoComplete="email"
              className={`input-dark w-full rounded-xl pl-9 pr-4 py-2.5 text-sm ${errors.email ? 'error' : ''}`}
              {...register('email', { required: 'El correo es obligatorio', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' } })}
            />
          </div>
          {errors.email && <p className="text-[11px] text-red-400">{errors.email.message}</p>}
        </div>

        {error && <div className="rounded-lg px-3 py-2.5 text-xs font-medium text-red-300" style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)' }}>{error}</div>}
        {message && <div className="rounded-lg px-3 py-2.5 text-xs font-medium text-green-300" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.12)' }}>{message}</div>}

        <button disabled={loading} type="submit" className="btn-glow relative w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold text-white">
          {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          <ArrowRight size={14} />
        </button>
      </form>
    </div>
  );
};
