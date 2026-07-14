import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { resetRequest } from '../../services/authService';

interface FormInputs { password: string; confirm: string }

export const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormInputs>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (data: FormInputs) => {
    setError(null);
    setMessage(null);
    if (!token) { setError('Token inválido'); return; }
    if (data.password !== data.confirm) { setError('Las contraseñas no coinciden'); return; }
    setLoading(true);
    try {
      const res = await resetRequest(token, data.password);
      setMessage(res.message ?? 'Contraseña actualizada.');
      setTimeout(() => navigate('/auth/login'), 1400);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Error al resetear contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-full flex flex-col justify-center py-0 relative">
      <h2 className="text-xl font-bold text-white mb-3">Restablecer contraseña</h2>
      <p className="text-sm text-slate-500 mb-4">Ingresa una nueva contraseña para tu cuenta.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full max-w-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400">Nueva contraseña</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-600"><Lock size={15} /></span>
            <input type="password" placeholder="Nueva contraseña" className={`input-dark w-full rounded-xl pl-9 pr-4 py-2.5 text-sm ${errors.password ? 'error' : ''}`}
              {...register('password', { required: 'La contraseña es obligatoria', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
            />
          </div>
          {errors.password && <p className="text-[11px] text-red-400">{errors.password.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400">Confirmar contraseña</label>
          <input type="password" placeholder="Confirmar contraseña" className={`input-dark w-full rounded-xl pr-4 py-2.5 text-sm ${errors.confirm ? 'error' : ''}`}
            {...register('confirm', { required: 'Confirma tu contraseña' })}
          />
          {errors.confirm && <p className="text-[11px] text-red-400">{errors.confirm.message}</p>}
        </div>

        {error && <div className="rounded-lg px-3 py-2.5 text-xs font-medium text-red-300" style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)' }}>{error}</div>}
        {message && <div className="rounded-lg px-3 py-2.5 text-xs font-medium text-green-300" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.12)' }}>{message}</div>}

        <button disabled={loading} type="submit" className="btn-glow relative w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold text-white">
          {loading ? 'Guardando...' : 'Restablecer contraseña'}
          <ArrowRight size={14} />
        </button>
      </form>
    </div>
  );
};
