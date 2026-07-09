import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, CheckSquare } from 'lucide-react';

// Tipado para los datos del formulario
interface LoginFormInputs {
  email: string;
  password: string;
}

export const Login = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  // Función simulada de inicio de sesión
  const onSubmit = async (data: LoginFormInputs) => {
    console.log('Datos enviados:', data);
    // Simulamos un retraso de red de 1 segundo
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Redirigimos al dashboard tras el "login" exitoso
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="w-full flex flex-col justify-center">
      {/* Encabezado del Formulario */}
      <div className="mb-10 text-center lg:text-left">
        <div className="flex items-center justify-center lg:justify-start gap-2 text-dark font-bold text-2xl tracking-tight mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-saas-md">
            <CheckSquare size={24} strokeWidth={2.5} />
          </div>
          <span>TaskEdu</span>
        </div>
        <h1 className="text-3xl font-bold text-dark mb-2">Bienvenido de nuevo</h1>
        <p className="text-dark-gray/70">
          Ingresa tus credenciales para acceder a tu espacio de trabajo.
        </p>
      </div>

      {/* Formulario con React Hook Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        {/* Campo Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-dark-gray mb-1.5">
            Correo Electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-light-gray drop-shadow-sm" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="admin@taskedu.com"
              className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg leading-5 bg-background text-dark placeholder-light-gray focus:outline-none focus:ring-2 focus:border-primary transition-colors sm:text-sm ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-light-gray/60 focus:ring-primary/20'
              }`}
              {...register('email', { 
                required: 'El correo es obligatorio',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: 'Formato de correo inválido'
                }
              })}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Campo Contraseña */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-dark-gray">
              Contraseña
            </label>
            <a href="#" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-light-gray drop-shadow-sm" />
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg leading-5 bg-background text-dark placeholder-light-gray focus:outline-none focus:ring-2 focus:border-primary transition-colors sm:text-sm ${
                errors.password ? 'border-red-500 focus:ring-red-200' : 'border-light-gray/60 focus:ring-primary/20'
              }`}
              {...register('password', { 
                required: 'La contraseña es obligatoria',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' }
              })}
            />
          </div>
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-saas-sm mt-4"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Ingresando...
            </span>
          ) : (
            <>
              Ingresar al sistema
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};