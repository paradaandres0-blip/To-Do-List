import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Visual variant of the card. */
  variant?: CardVariant;
  /** Optional title shown at the top of the card. */
  title?: React.ReactNode;
  /** Optional footer content. */
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  title,
  footer,
  ...props
}) => {
  const variantClasses: Record<CardVariant, string> = {
    default: 'bg-white/90 border border-slate-200 shadow-sm',
    elevated: 'bg-white border border-slate-200 shadow-lg',
    outlined: 'bg-transparent border-2 border-slate-300',
  };

  return (
    <section className={`rounded-xl p-4 ${variantClasses[variant]} ${className}`} {...props}>
      {title ? <div className="mb-3 text-sm font-semibold text-slate-800">{title}</div> : null}
      <div>{children}</div>
      {footer ? <div className="mt-4 text-sm text-slate-500">{footer}</div> : null}
    </section>
  );
};
