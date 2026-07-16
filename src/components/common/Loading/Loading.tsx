import { Loader2 } from 'lucide-react';
import { COLORS } from '../../../constants/colors';

// ── Tipos ──
type LoadingVariant = 'spinner' | 'skeleton' | 'dots' | 'overlay';
type LoadingSize = 'sm' | 'md' | 'lg';

interface LoadingProps {
  /** Variante del loading */
  variant?: LoadingVariant;
  /** Tamaño del componente */
  size?: LoadingSize;
  /** Texto opcional */
  text?: string;
  /** Clases adicionales */
  className?: string;
  /** Para skeleton: ancho personalizado */
  width?: string | number;
  /** Para skeleton: alto personalizado */
  height?: string | number;
  /** Mostrar overlay oscuro */
  overlay?: boolean;
  /** Callback al hacer clic en el overlay */
  onOverlayClick?: () => void;
}

// ── Tamaños ──
const SIZES = {
  sm: { spinner: 16, dots: 8, text: 'text-xs' },
  md: { spinner: 24, dots: 10, text: 'text-sm' },
  lg: { spinner: 40, dots: 12, text: 'text-base' },
} as const;

// ── Variante: Spinner ──
const Spinner = ({ size, text }: Pick<LoadingProps, 'size' | 'text'>) => (
  <div className="flex flex-col items-center justify-center gap-3">
    <Loader2
      size={SIZES[size ?? 'md'].spinner}
      className="animate-spin"
      style={{ color: COLORS.primary }}
    />
    {text && (
      <p className={`${SIZES[size ?? 'md'].text} font-medium`} style={{ color: COLORS.textTertiary }}>
        {text}
      </p>
    )}
  </div>
);

// ── Variante: Dots ──
const Dots = ({ size, text }: Pick<LoadingProps, 'size' | 'text'>) => (
  <div className="flex flex-col items-center justify-center gap-3">
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-full animate-bounce"
          style={{
            width: SIZES[size ?? 'md'].dots,
            height: SIZES[size ?? 'md'].dots,
            backgroundColor: COLORS.primary,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
    {text && (
      <p className={`${SIZES[size ?? 'md'].text} font-medium`} style={{ color: COLORS.textTertiary }}>
        {text}
      </p>
    )}
  </div>
);

// ── Variante: Skeleton ──
const Skeleton = ({
  width,
  height,
  text,
}: Pick<LoadingProps, 'width' | 'height' | 'text'>) => (
  <div className="flex flex-col items-center justify-center gap-3">
    <div
      className="rounded-lg animate-pulse"
      style={{
        width: width ?? '100%',
        height: height ?? 20,
        backgroundColor: COLORS.bgTertiary,
      }}
    />
    {text && (
      <p className={`${SIZES.md.text} font-medium`} style={{ color: COLORS.textTertiary }}>
        {text}
      </p>
    )}
  </div>
);

// ── Variante: Overlay ──
const Overlay = ({
  size,
  text,
  onOverlayClick,
}: Pick<LoadingProps, 'size' | 'text' | 'onOverlayClick'>) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    onClick={onOverlayClick}
  >
    <div className="bg-white rounded-2xl p-6 shadow-2xl">
      <Spinner size={size} text={text} />
    </div>
  </div>
);

// ── Componente principal ──
export const Loading = ({
  variant = 'spinner',
  size = 'md',
  text,
  className = '',
  width,
  height,
  overlay = false,
  onOverlayClick,
}: LoadingProps) => {
  if (overlay) {
    return <Overlay size={size} text={text} onOverlayClick={onOverlayClick} />;
  }

  const content = (() => {
    switch (variant) {
      case 'spinner':
        return <Spinner size={size} text={text} />;
      case 'dots':
        return <Dots size={size} text={text} />;
      case 'skeleton':
        return <Skeleton width={width} height={height} text={text} />;
      default:
        return <Spinner size={size} text={text} />;
    }
  })();

  return <div className={`flex items-center justify-center ${className}`}>{content}</div>;
};

// ── Exportaciones adicionales ──
export { Spinner, Dots, Skeleton, Overlay };