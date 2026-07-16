# Guía de Constantes — Workflow Academy

## Objetivo

Centralizar valores hardcodeados (colores, timeouts, URLs, configuraciones) para facilitar mantenimiento, cambios de tema y deployment.

---

## Estructura

```
src/constants/
├── colors.ts   # Paleta de colores de la aplicación
└── config.ts   # Configuraciones generales (API, timeouts, validaciones, etc.)
```

---

## Uso de Colores

### Importación
```typescript
import { COLORS } from '../constants/colors';
```

### Ejemplos de Uso

#### En estilos inline
```typescript
// Antes
style={{ color: '#7c3aed' }}
style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}

// Ahora
import { COLORS } from '../constants/colors';
style={{ color: COLORS.primary }}
style={{ background: COLORS.gradientPrimary }}
```

#### En clases condicionales
```typescript
// Antes
style={{ 
  background: isActive ? 'rgba(124,58,237,0.25)' : 'transparent',
  border: isActive ? '1px solid rgba(124,58,237,0.3)' : 'none'
}}

// Ahora
style={{ 
  background: isActive ? COLORS.gradientPrimaryHover : 'transparent',
  border: isActive ? `1px solid ${COLORS.primaryBorder}` : 'none'
}}
```

---

## Uso de Configuración

### Importación
```typescript
import { 
  API_CONFIG, 
  STORAGE_KEYS, 
  AVATAR_CONFIG, 
  TIMEOUTS, 
  VALIDATION 
} from '../constants/config';
```

### Ejemplos de Uso

#### API Configuration
```typescript
// Antes
const url = 'http://localhost:3000/api';
localStorage.setItem('wf_auth', data);

// Ahora
const url = API_CONFIG.baseURL;
localStorage.setItem(STORAGE_KEYS.auth, data);
```

#### Timeouts
```typescript
// Antes
await new Promise((r) => setTimeout(r, 800));
await new Promise((r) => setTimeout(r, 300));

// Ahora
await new Promise((r) => setTimeout(r, TIMEOUTS.mock.medium));
await new Promise((r) => setTimeout(r, TIMEOUTS.mock.short));
```

#### Validaciones
```typescript
// Antes
if (password.length < 6) { ... }
if (email.length < 5) { ... }

// Ahora
if (password.length < VALIDATION.password.minLength) { ... }
if (email.length < VALIDATION.email.minLength) { ... }
```

#### Avatar Configuration
```typescript
// Antes
const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Ahora
import { AVATAR_CONFIG } from '../constants/config';
const MAX_SIZE = AVATAR_CONFIG.maxSize;
const ALLOWED_TYPES = AVATAR_CONFIG.allowedTypes;
```

---

## Categorías de Constantes

### Colores (`colors.ts`)

| Categoría | Uso | Ejemplo |
|-----------|-----|---------|
| **Primarios** | Gradientes principales, botones | `COLORS.primary`, `COLORS.gradientPrimary` |
| **Textos** | Jerarquía de texto | `COLORS.textPrimary`, `COLORS.textSecondary` |
| **Fondos** | Backgrounds de componentes | `COLORS.bgPrimary`, `COLORS.bgSecondary` |
| **Bordes** | Separadores, borders | `COLORS.borderPrimary`, `COLORS.borderSecondary` |
| **Estados** | Success, warning, error | `COLORS.success`, `COLORS.error`, `COLORS.warning` |
| **Sombras** | Elevación | `COLORS.shadowSm`, `COLORS.shadowMd` |

### Configuración (`config.ts`)

| Categoría | Uso | Ejemplo |
|-----------|-----|---------|
| **API** | URLs, timeouts, endpoints | `API_CONFIG.baseURL`, `API_CONFIG.endpoints.auth.login` |
| **Storage** | Keys de localStorage | `STORAGE_KEYS.token`, `STORAGE_KEYS.auth` |
| **Avatar** | Límites y tipos | `AVATAR_CONFIG.maxSize`, `AVATAR_CONFIG.allowedTypes` |
| **Pagination** | Valores por defecto | `PAGINATION.defaultPageSize` |
| **Timeouts** | Delays de mock y API | `TIMEOUTS.api`, `TIMEOUTS.mock.short` |
| **Validation** | Longitudes mín/máx | `VALIDATION.password.minLength` |
| **Features** | Feature flags | `FEATURES.mockMode`, `FEATURES.enableNotifications` |

---

## Convenciones

### Nomenclatura
- **Colores**: `COLORS.primary`, `COLORS.textSecondary`, `COLORS.bgPrimary`
- **Config**: `API_CONFIG`, `STORAGE_KEYS`, `TIMEOUTS`
- **Constantes específicas**: `AVATAR_MAX_SIZE` (deprecated, usar `AVATAR_CONFIG.maxSize`)

### Orden de Importación
```typescript
// 1. React y librerías externas
import { useState } from 'react';
import axios from 'axios';

// 2. Constantes
import { COLORS, API_CONFIG, TIMEOUTS } from '../constants/config';

// 3. Servicios y stores
import useAuthStore from '../store/authStore';

// 4. Componentes
import { Button } from '../components/common';
```

### Cuándo Usar Constantes

✅ **Usar constantes para:**
- Colores repetidos en múltiples archivos
- URLs y endpoints de API
- Timeouts y delays
- Límites de validación
- Keys de localStorage
- Feature flags

❌ **No usar constantes para:**
- Valores únicos en un solo archivo
- Colores dinámicos (gradientes con variables)
- Configuraciones específicas de un componente

---

## Migración de Código Existente

### Paso 1: Identificar valores hardcodeados
```bash
# Buscar colores hardcodeados
grep -r "#7c3aed\|#2563eb\|#0f172a" src/

# Buscar timeouts hardcodeados
grep -r "setTimeout(r, [0-9]" src/
```

### Paso 2: Reemplazar gradualmente
```typescript
// Antes
style={{ color: '#7c3aed' }}
await new Promise((r) => setTimeout(r, 800));

// Ahora
import { COLORS, TIMEOUTS } from '../constants/config';
style={{ color: COLORS.primary }}
await new Promise((r) => setTimeout(r, TIMEOUTS.mock.medium));
```

### Paso 3: Verificar consistencia
- Asegurar que todos los archivos usen las constantes
- Verificar que no queden valores hardcodeados duplicados
- Probar que la UI se vea igual después de la migración

---

## Agregar Nuevas Constantes

### Colores
```typescript
// En src/constants/colors.ts
export const COLORS = {
  // ... existentes
  
  // Nuevo color
  brandAccent: '#f59e0b',  // amber-500
} as const;
```

### Configuración
```typescript
// En src/constants/config.ts
export const API_CONFIG = {
  // ... existentes
  
  // Nuevo endpoint
  endpoints: {
    // ... existentes
    analytics: '/analytics',
  },
} as const;
```

---

## Environment Variables

### Variables Soportadas

| Variable | Descripción | Default | Ejemplo |
|----------|-------------|---------|---------|
| `VITE_API_URL` | URL base del API | `http://localhost:3000/api` | `https://api.workflow.com` |
| `VITE_AUTH_MODE` | Modo de autenticación | `mock` | `real` |
| `VITE_APP_VERSION` | Versión de la app | `1.0.0` | `2.0.0` |

### Uso
```typescript
const apiUrl = import.meta.env.VITE_API_URL ?? API_CONFIG.baseURL;
const isMock = import.meta.env.VITE_AUTH_MODE === 'mock';
```

### Archivo `.env`
```env
VITE_API_URL=https://api.workflowacademy.co
VITE_AUTH_MODE=mock
VITE_APP_VERSION=1.0.0
```

---

## Beneficios

1. **Mantenibilidad**: Cambiar un color en un solo lugar
2. **Consistencia**: Garantizar que se usen los mismos valores en toda la app
3. **Temas**: Fácil implementación de dark mode o temas personalizados
4. **Type Safety**: TypeScript valida que las constantes existan
5. **Documentación**: Las constantes sirven como documentación viva

---

## Checklist de Migración

- [ ] Crear `src/constants/colors.ts` con paleta completa
- [ ] Crear `src/constants/config.ts` con configuraciones
- [ ] Reemplazar colores en servicios críticos (authService, api)
- [ ] Reemplazar timeouts en servicios
- [ ] Reemplazar colores en componentes comunes
- [ ] Reemplazar colores en páginas principales
- [ ] Actualizar localStorage keys
- [ ] Documentar uso en `docs/CONSTANTS_GUIDE.md`
- [ ] Verificar que no queden valores hardcodeados críticos
- [ ] Actualizar `.env.example` con nuevas variables

---

## Notas

- Las constantes son **inmutables** (`as const`) para garantizar type safety
- Se puede migrar gradualmente, no es necesario cambiar todo de una vez
- Priorizar servicios y componentes compartidos antes que páginas
- Usar `COLORS` para colores, no strings hex directamente
- Agrupar constantes relacionadas en objetos (no crear constantes sueltas)