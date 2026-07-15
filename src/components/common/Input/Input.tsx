import React, { forwardRef } from 'react';

// Tipado de las props, extendiendo las nativas de un input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    // Generamos un ID único si no se provee uno (útil para accesibilidad)
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="w-full">
        {/* Label Opcional */}
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-dark-gray mb-1.5">
            {label}
          </label>
        )}
        
        <div className="relative">
          {/* Icono a la izquierda */}
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-light-gray">
              {icon}
            </div>
          )}
          
          {/* Campo de Entrada */}
          <input
            ref={ref}
            id={inputId}
            className={`block w-full rounded-lg leading-5 bg-background text-dark placeholder-light-gray focus:outline-none focus:ring-2 transition-colors sm:text-sm border
              ${icon ? 'pl-10 pr-3' : 'px-3'} 
              ${error 
                ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
                : 'border-light-gray/60 focus:ring-primary/20 focus:border-primary'
              } 
              ${className} py-2.5`}
            {...props}
          />
        </div>

        {/* Mensaje de Error */}
        {error && (
          <p className="mt-1.5 text-sm text-red-500 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

// Es una buena práctica asignar el displayName cuando se usa forwardRef
Input.displayName = 'Input';