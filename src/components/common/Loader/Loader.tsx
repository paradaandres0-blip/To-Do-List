import React from 'react';

export type LoaderVariant = 'spinner' | 'skeleton';

export interface LoaderProps {
  /** Which loader style to render. */
  variant?: LoaderVariant;
  /** Optional label shown under the loader. */
  label?: string;
  /** Number of skeleton blocks to render when using skeleton mode. */
  count?: number;
  /** Extra class names. */
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  variant = 'spinner',
  label = 'Cargando...',
  count = 3,
  className = '',
}) => {
  if (variant === 'skeleton') {
    return (
      <div className={`space-y-2 ${className}`} role="status" aria-label="loading skeleton">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="h-4 w-full animate-pulse rounded bg-slate-200" />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`} role="status" aria-label="loading spinner">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
      <span className="text-sm text-slate-600">{label}</span>
    </div>
  );
};
