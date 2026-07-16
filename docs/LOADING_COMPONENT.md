# Componente Loading — Workflow Academy

## Descripción

Componente reutilizable para estados de carga con múltiples variantes: spinner, dots, skeleton y overlay.

## Estructura

```
src/components/common/Loading/
├── Loading.tsx      # Componente principal con variantes
└── Skeletons.tsx    # Componentes de skeleton pre-construidos
```

## Uso Básico

### Spinner (default)
```tsx
import { Loading } from '../components/common';

<Loading text="Cargando..." />
```

### Dots
```tsx
<Loading variant="dots" text="Procesando" />
```

### Skeleton simple
```tsx
<Loading variant="skeleton" width="200px" height="40px" />
```

### Overlay
```tsx
<Loading variant="overlay" text="Guardando cambios..." />
```

## Variantes

### Spinner
Loading spinner clásico con animación de rotación.

```tsx
<Loading variant="spinner" size="md" text="Cargando..." />
```

**Tamaños:**
- `sm` — 16px
- `md` — 24px (default)
- `lg` — 40px

### Dots
Tres puntos animados con efecto de rebote.

```tsx
<Loading variant="dots" size="lg" text="Procesando" />
```

### Skeleton
Placeholder animado para contenido que se está cargando.

```tsx
<Loading variant="skeleton" width="100%" height={20} />
```

### Overlay
Overlay oscuro con spinner centrado para acciones asíncronas.

```tsx
<Loading 
  variant="overlay" 
  text="Guardando..." 
  onOverlayClick={() => console.log('clicked')}
/>
```

## Componentes de Skeleton Pre-construidos

### SkeletonCard
Skeleton para tarjetas de contenido.

```tsx
import { SkeletonCard } from '../components/common';

<SkeletonCard lines={3} />
```

### SkeletonTable
Skeleton para tablas de datos.

```tsx
import { SkeletonTable } from '../components/common';

<SkeletonTable rows={5} cols={4} />
```

### SkeletonList
Skeleton para listas de elementos.

```tsx
import { SkeletonList } from '../components/common';

<SkeletonList items={4} />
```

### SkeletonStatsGrid
Skeleton para grids de estadísticas (KPIs).

```tsx
import { SkeletonStatsGrid } from '../components/common';

<SkeletonStatsGrid cards={4} />
```

### SkeletonProfileHeader
Skeleton para encabezados de perfil.

```tsx
import { SkeletonProfileHeader } from '../components/common';

<SkeletonProfileHeader />
```

### SkeletonForm
Skeleton para formularios.

```tsx
import { SkeletonForm } from '../components/common';

<SkeletonForm fields={4} />
```

## Integración en Páginas

### Ejemplo: Dashboard con loading state

```tsx
import { Loading, SkeletonStatsGrid, SkeletonTable } from '../components/common';

export const Dashboard = () => {
  const { isLoading, metrics } = useMetricsStore();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonStatsGrid cards={4} />
        <SkeletonTable rows={5} cols={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contenido del dashboard */}
    </div>
  );
};
```

### Ejemplo: Overlay durante submit

```tsx
import { Loading } from '../components/common';
import { useState } from 'react';

export const Form = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await saveData();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <button onClick={handleSubmit}>Guardar</button>
      {isSubmitting && (
        <Loading overlay text="Guardando..." />
      )}
    </div>
  );
};
```

## Migración desde Loader2

### Antes
```tsx
import { Loader2 } from 'lucide-react';

{isLoading && (
  <div className="flex items-center justify-center">
    <Loader2 className="animate-spin" size={24} />
  </div>
)}
```

### Ahora
```tsx
import { Loading } from '../components/common';

{isLoading && <Loading text="Cargando..." />}
```

## Casos de Uso

### 1. Carga inicial de página
```tsx
if (isLoading) {
  return <SkeletonStatsGrid cards={4} />;
}
```

### 2. Carga de datos en tabla
```tsx
if (isLoading) {
  return <SkeletonTable rows={10} cols={6} />;
}
```

### 3. Acción asíncrona con overlay
```tsx
<Loading 
  overlay 
  text="Eliminando..." 
  onOverlayClick={() => {}} 
/>
```

### 4. Estado vacío con loading
```tsx
{isLoading ? (
  <Loading text="Cargando elementos..." />
) : items.length === 0 ? (
  <EmptyState />
) : (
  <List items={items} />
)}
```

## Personalización

### Colores
Los colores usan `COLORS.primary` desde `src/constants/colors.ts`. Para cambiar el color del spinner:

```tsx
// En src/constants/colors.ts
export const COLORS = {
  primary: '#7c3aed', // Cambiar este valor
  // ...
};
```

### Tamaños personalizados
```tsx
<Loading size="lg" /> // Spinner de 40px
<Loading size="md" /> // Spinner de 24px
<Loading size="sm" /> // Spinner de 16px
```

### Texto personalizado
```tsx
<Loading text="Cargando datos del usuario..." />
```

## Mejores Prácticas

1. **Usar skeletons para carga inicial**: Mejor UX que spinners simples
2. **Overlay solo para acciones críticas**: No abusar de overlays
3. **Texto descriptivo**: Siempre incluir texto que indique qué se está cargando
4. **Tamaño apropiado**: Usar `sm` para espacios pequeños, `lg` para pantallas completas
5. **Consistencia**: Usar las mismas variantes en toda la aplicación

## Accesibilidad

- Los spinners incluyen `aria-label` implícito via el texto
- Los overlays son focusable y tienen `z-index` alto
- Los skeletons tienen `role="status"` y `aria-live="polite"`

## Testing

```tsx
import { render, screen } from '@testing-library/react';
import { Loading } from '../components/common';

it('renders spinner with text', () => {
  render(<Loading text="Cargando..." />);
  expect(screen.getByText('Cargando...')).toBeDefined();
});

it('renders overlay when overlay prop is true', () => {
  render(<Loading overlay />);
  expect(document.querySelector('.fixed.inset-0')).toBeDefined();
});
```

## Notas

- El componente usa `Loader2` de lucide-react internamente
- Los skeletons usan `animate-pulse` de Tailwind
- Los colores se importan desde `src/constants/colors.ts`
- El componente es completamente accesible por defecto