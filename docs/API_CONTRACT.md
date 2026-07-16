# API Contract — Workflow Academy

## Estándar de Respuestas API

Todas las respuestas del backend deben seguir el estándar `ApiResponse<T>` definido en `src/types/api.types.ts` para garantizar consistencia entre todos los endpoints.

---

## 📦 ApiResponse\<T\> (Respuesta Estándar)

```typescript
interface ApiResponse<T> {
  data:    T;       // Datos de la respuesta
  message: string;  // Mensaje descriptivo
  success: boolean; // Indica si la operación fue exitosa
}
```

### Ejemplo — Éxito

```json
{
  "data": {
    "id": "1",
    "name": "Ana Gómez",
    "email": "ana@workflow.academy"
  },
  "message": "Docente obtenido correctamente",
  "success": true
}
```

### Ejemplo — Error

```json
{
  "message": "Docente no encontrado",
  "statusCode": 404,
  "errors": {
    "id": ["El docente con ID 999 no existe"]
  }
}
```

---

## 📦 PaginatedResponse\<T\> (Respuesta Paginada)

```typescript
interface PaginatedResponse<T> {
  data:       T[];   // Arreglo de elementos
  total:      number; // Total de registros
  page:       number; // Página actual
  pageSize:   number; // Elementos por página
  totalPages: number; // Total de páginas
}
```

### Ejemplo

```json
{
  "data": [
    { "id": "1", "name": "Ana Gómez" },
    { "id": "2", "name": "Carlos Ruiz" }
  ],
  "total": 2,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

---

## 📋 Endpoints

### Autenticación — `authService.ts`

| Método | Endpoint | Request | Respuesta Éxito | Códigos |
|--------|----------|---------|-----------------|---------|
| POST | `/auth/login` | `{ email, password }` | `ApiResponse<{ token, user, refreshToken? }>` | 200, 401 |
| POST | `/auth/logout` | — | `ApiResponse<null>` | 200, 401 |
| GET | `/auth/me` | — | `ApiResponse<AuthUser>` | 200, 401 |
| POST | `/auth/refresh` | `{ refreshToken }` | `ApiResponse<{ token }>` | 200, 401 |
| PATCH | `/users/me` | `{ name?, email?, phone?, city? }` | `ApiResponse<AuthUser>` | 200, 400, 401 |
| PATCH | `/auth/change-password` | `{ currentPassword, newPassword }` | `ApiResponse<null>` | 200, 400, 401 |
| POST | `/auth/forgot-password` | `{ email }` | `ApiResponse<{ message }>` | 200, 404 |
| POST | `/auth/reset-password` | `{ token, password }` | `ApiResponse<{ message }>` | 200, 400, 404 |
| POST | `/auth/register` | `{ name, email, password }` | `ApiResponse<{ message }>` | 201, 400, 409 |
| PATCH | `/users/me/notifications` | `{ sesiones, programas, alumnos, reportes }` | `ApiResponse<null>` | 200, 401 |
| POST | `/users/me/avatar` | `FormData { avatar }` | `ApiResponse<{ avatarUrl }>` | 200, 400, 401 |

### Docentes — `teacherService.ts`

| Método | Endpoint | Request | Respuesta Éxito | Códigos |
|--------|----------|---------|-----------------|---------|
| GET | `/teachers` | `?page=1&pageSize=10` | `PaginatedResponse<Teacher>` | 200 |
| GET | `/teachers/:id` | — | `ApiResponse<Teacher>` | 200, 404 |
| POST | `/teachers` | `CreateTeacherPayload` | `ApiResponse<Teacher>` | 201, 400, 409 |
| PUT | `/teachers/:id` | `UpdateTeacherPayload` | `ApiResponse<Teacher>` | 200, 400, 404, 409 |
| DELETE | `/teachers/:id` | — | `ApiResponse<null>` | 200, 404 |

### Estudiantes — `studentService.ts`

| Método | Endpoint | Request | Respuesta Éxito | Códigos |
|--------|----------|---------|-----------------|---------|
| GET | `/students` | `?page=1&pageSize=10` | `PaginatedResponse<Student>` | 200 |
| GET | `/students/:id` | — | `ApiResponse<Student>` | 200, 404 |
| POST | `/students` | `StudentPayload` | `ApiResponse<Student>` | 201, 400 |
| PUT | `/students/:id` | `Partial<StudentPayload>` | `ApiResponse<Student>` | 200, 400, 404 |
| DELETE | `/students/:id` | — | `ApiResponse<null>` | 200, 404 |

### Tareas — `taskService.ts`

| Método | Endpoint | Request | Respuesta Éxito | Códigos |
|--------|----------|---------|-----------------|---------|
| GET | `/tasks` | `?page=1&pageSize=10` | `PaginatedResponse<Task>` | 200 |
| POST | `/tasks` | `TaskForm` | `ApiResponse<Task>` | 201, 400 |
| PUT | `/tasks/:id` | `Partial<TaskForm>` | `ApiResponse<Task>` | 200, 400, 404 |
| DELETE | `/tasks/:id` | — | `ApiResponse<null>` | 200, 404 |

### Cursos — `courseService.ts`

| Método | Endpoint | Request | Respuesta Éxito | Códigos |
|--------|----------|---------|-----------------|---------|
| GET | `/courses` | — | `ApiResponse<Course[]>` | 200 |
| POST | `/courses` | `CreateCoursePayload` | `ApiResponse<Course>` | 201, 400 |
| PUT | `/courses/:id` | `Partial<CoursePayload>` | `ApiResponse<Course>` | 200, 400, 404 |
| DELETE | `/courses/:id` | — | `ApiResponse<null>` | 200, 404 |

### Módulos — `moduleService.ts`

| Método | Endpoint | Request | Respuesta Éxito | Códigos |
|--------|----------|---------|-----------------|---------|
| GET | `/modules` | — | `ApiResponse<Module[]>` | 200 |
| POST | `/modules` | `CreateModulePayload` | `ApiResponse<Module>` | 201, 400 |
| PUT | `/modules/:id` | `Partial<ModulePayload>` | `ApiResponse<Module>` | 200, 400, 404 |
| DELETE | `/modules/:id` | — | `ApiResponse<null>` | 200, 404 |

---

## 🛡️ Esquemas de Validación (Zod)

Los esquemas de validación para las respuestas API están definidos en `src/schemas/api.schema.ts`:

- **`apiResponseSchema<T>`** — Valida que una respuesta cumpla con `ApiResponse<T>`.
- **`paginatedResponseSchema<T>`** — Valida que una respuesta cumpla con `PaginatedResponse<T>`.
- **`apiErrorSchema`** — Valida que un error siga el estándar `ApiError`.
- **`genericApiResponseSchema`** — Versión genérica sin tipado específico de `data`.
- **`genericPaginatedResponseSchema`** — Versión genérica sin tipado específico de `data[]`.

La validación se ejecuta automáticamente en el interceptor de Axios (`src/services/api.ts`) cuando `VITE_AUTH_MODE !== 'mock'`.

Si la respuesta no cumple con el estándar, se registra una advertencia en consola con:
- URL del endpoint
- Datos recibidos
- Errores de validación detallados
- Timestamp

---

## 🔄 Flujo de Validación

```
Backend Response
       │
       ▼
Response Interceptor (api.ts)
       │
       ├── safeParse(ApiResponse)
       │   └── ❌ Falló → safeParse(PaginatedResponse)
       │       ├── ❌ Ambos fallan → console.warn
       │       └── ✅ OK → pasa
       │
       └── ✅ OK → pasa al caller

Error Response
       │
       ▼
Error Interceptor (api.ts)
       │
       ├── safeParse(ApiError)
       │   ├── ❌ Falló → console.warn
       │   └── ✅ OK → procesa error normalmente
       │
       └── Procesa error (401 refresh, etc.)
```

---

## 🧪 Modo Mock vs Real

- **Modo Mock** (`VITE_AUTH_MODE=mock`): La validación Zod está deshabilitada. Los servicios usan datos locales en memoria.
- **Modo Real** (`VITE_AUTH_MODE=real`): La validación Zod se ejecuta en todas las respuestas. Si el backend no cumple el estándar, se registra una advertencia.

> **Importante:** La validación es **no bloqueante** — las respuestas inválidas se registran pero no se rechazan, para no interrumpir el flujo durante la migración al estándar.