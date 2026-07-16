import { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string | null;
  alt: string;
  className?: string;
  placeholder?: string;
  /** Color de fondo del placeholder (default: #1e293b) */
  bgColor?: string;
}

/**
 * Componente de imagen con lazy loading.
 * Muestra un placeholder hasta que la imagen entra en el viewport.
 * Útil para avatares y cualquier imagen que no sea crítica.
 */
export const LazyImage = ({
  src,
  alt,
  className = '',
  placeholder,
  bgColor = '#1e293b',
}: LazyImageProps) => {
  const imgRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }, // carga 200px antes de que sea visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Si no hay src, mostrar placeholder con inicial
  if (!src) {
    return (
      <div
        ref={imgRef}
        className={`flex items-center justify-center ${className}`}
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-white font-semibold text-lg select-none">
          {placeholder ?? alt.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative ${className}`} style={{ backgroundColor: bgColor }}>
      {/* Placeholder mientras carga */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/50 text-sm">Cargando...</span>
        </div>
      )}
      {/* Imagen real — solo renderizar cuando está en viewport */}
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
        />
      )}
    </div>
  );
};

export default LazyImage;