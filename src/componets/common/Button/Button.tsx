import React from 'react';
import { Loader2 } from 'lucide-react';

// Tipado estricto para las props del botón, extendiendo las nativas de HTML
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  // Diccionario de estilos según la variante
  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-saas-sm border border-transparent',
    secondary: 'bg-secondary hover:bg-secondary-hover text-white shadow-saas-sm border border-transparent',
    outline: 'bg-transparent hover:bg-background text-dark border border-light-gray/60',
    ghost: 'bg-transparent hover:bg-background text-dark-gray border border-transparent',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-saas-sm border border-transparent',
  };

  // Diccionario de tamaños (padding y tamaño de fuente)
  const sizes = {
    sm: 'py-1.5 px-3 text-xs',
    md: 'py-2.5 px-4 text-sm',
    lg: 'py-3 px-6 text-base',
  };

  // Clases base compartidas por todos los botones
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  // Combinación final de clases
  const combinedClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      className={combinedClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Estado de carga */}
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      
      {/* Icono Izquierdo (solo si no está cargando) */}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      
      {/* Texto del botón */}
      {children}
      
      {/* Icono Derecho */}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};