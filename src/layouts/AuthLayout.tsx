import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Lado Izquierdo - Contenedor del Formulario */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:w-1/3">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Aquí se inyectará la página de Login */}
          <Outlet />
        </div>
      </div>

      {/* Lado Derecho - Branding (Oculto en pantallas pequeñas) */}
      <div className="hidden lg:block lg:flex-1 relative w-full bg-dark overflow-hidden">
        {/* Elemento decorativo usando el color primario */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark to-primary opacity-90" />
        
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white px-12">
          <h2 className="text-4xl font-bold mb-4 tracking-tight text-center">
            El futuro de la educación basada en proyectos.
          </h2>
          <p className="text-light-gray text-lg text-center max-w-lg">
            Gestiona módulos, asigna tareas y colabora en tiempo real con una experiencia fluida y profesional.
          </p>
        </div>
      </div>
    </div>
  );
};