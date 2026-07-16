# Estrategia de Testing — Workflow Academy

## Objetivo

Garantizar la calidad y estabilidad del código mediante tests automatizados que cubran componentes críticos, servicios y stores, con un mínimo del 70% de cobertura.

---

## Stack de Testing

- **Vitest** — Framework de testing rápido y compatible con Vite.
- **@testing-library/react** — Testing de componentes React con foco en el comportamiento del usuario.
- **@testing-library/jest-dom** — Matchers adicionales para aserciones DOM.
- **@testing-library/user-event** — Simulación de interacciones de usuario más realistas.
- **jsdom** — Entorno de DOM simulado para tests.

---

## Estructura de Tests

```
src/test/
├── components/          # Tests de componentes UI
│   ├── Button.test.tsx
│   ├── Input.test.tsx
│   └── Modal.test.tsx
├── services/            # Tests de servicios y lógica de negocio
│   └── authService.test.ts
├── stores/              # Tests de stores de Zustand
│   └── authStore.test.ts
└── setup.ts             # Configuración global de tests
```

---

## Convenciones

### Nomenclatura
- Archivos de test: `*.test.tsx` o `*.test.ts`
- Nombres descriptivos: `Button.test.tsx`, `authService.test.ts`

### Estructura de un Test
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Component } from '../path/to/Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeDefined();
  });

  it('should handle user interaction', () => {
    const handleClick = vi.fn();
    render(<Component onClick={handleClick} />);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Mocking
- **localStorage**: Mock global en `src/test/setup.ts`
- **API calls**: Mock de axios con `vi.mock()`
- **Hooks personalizados**: Mock con `vi.fn()`

---

## Cobertura Mínima

Configurada en `vitest.config.ts`:
- **Líneas**: 70%
- **Funciones**: 70%
- **Ramas**: 70%
- **Sentencias**: 70%

### Exclusiones
- `node_modules/`
- `src/test/`
- `**/*.d.ts`
- `**/*.config.*`
- `**/dist/**`

---

## Comandos

```bash
# Ejecutar tests en modo watch
npm test

# Ejecutar tests una sola vez
npm run test:run

# Ejecutar tests con reporte de cobertura
npm run test:coverage
```

---

## CI/CD Integration

### GitLab CI
El pipeline debe incluir un stage de testing:

```yaml
test:
  stage: test
  image: node:20
  cache:
    paths:
      - node_modules/
  script:
    - npm ci
    - npm run test:run
  coverage: '/Lines\s*:\s*(\d+\.?\d*)%/'
```

### Reporte de Cobertura
- El reporte se genera en `coverage/` (HTML, JSON, texto)
- El pipeline falla si la cobertura está por debajo del 70%
- Se recomienda revisar el reporte HTML localmente con `npm run test:coverage`

---

## Prioridades de Testing

### Alta Prioridad
1. **Componentes comunes**: Button, Input, Modal, Pagination
2. **Servicios críticos**: authService, studentService, teacherService
3. **Stores**: authStore, taskStore, studentStore

### Media Prioridad
1. **Hooks personalizados**: useAvatarUpload, useNotifications
2. **Utilidades**: imageCompression, dashboardData
3. **Páginas críticas**: Dashboard, Teachers, Students

### Baja Prioridad
1. Componentes de layout (Sidebar, Navbar)
2. Páginas de configuración
3. Componentes visuales puros

---

## Buenas Prácticas

1. **Tests independientes**: Cada test debe poder ejecutarse de forma aislada.
2. **Nombres descriptivos**: Usar nombres que describan el comportamiento esperado.
3. **Arrange-Act-Assert**: Estructurar tests en tres fases claras.
4. **Mocking mínimo**: Solo mockear dependencias externas (API, localStorage).
5. **Evitar implementación interna**: Testear comportamiento, no detalles de implementación.
6. **Limpiar mocks**: Usar `beforeEach` para resetear estado entre tests.

---

## Ejemplos por Tipo

### Componente
```typescript
it('should show error message when input is invalid', () => {
  render(<Input error="Email inválido" />);
  expect(screen.getByText('Email inválido')).toBeDefined();
});
```

### Servicio
```typescript
it('should return user data on successful login', async () => {
  const result = await loginRequest({ email: 'admin@test.com', password: 'pass' });
  expect(result.user).toBeDefined();
  expect(result.token).toBeDefined();
});
```

### Store
```typescript
it('should update user state', () => {
  const { result } = renderHook(() => useAuthStore());
  act(() => {
    result.current.setUser({ id: '1', name: 'Test', email: 'test@test.com', role: 'admin' });
  });
  expect(result.current.user?.name).toBe('Test');
});
```

---

## Mantenimiento

- Revisar cobertura regularmente en cada PR.
- Actualizar tests cuando cambie la lógica de negocio.
- Refactorizar tests duplicados o frágiles.
- Documentar casos edge case descubiertos durante el desarrollo.

---

## Recursos

- [Vitest Docs](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/react)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)