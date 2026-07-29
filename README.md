# 🎓 Workflow Academy

Aplicación full-stack actual del proyecto Workflow Academy.

Este repositorio contiene un frontend React + Vite y un backend Express + Prisma, con autenticación JWT, refresh tokens, rutas protegidas por rol y gestión de recursos educativos.

## 📋 Contenidos

- [Qué hace](#qué-hace)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Flujo de la aplicación](#flujo-de-la-aplicación)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Rutas principales](#rutas-principales)
- [Licencia](#licencia)

## Qué hace

Workflow Academy es un sistema de gestión educativa que incluye:

- Autenticación JWT con refresh tokens
- Control de acceso por roles: `ADMIN`, `INSTRUCTOR`, `STUDENT`
- Dashboard y rutas diferenciadas por rol
- Gestión de cursos, módulos, grupos, centros, estudiantes y docentes
- Creación y seguimiento de actividades
- Lógica de desactivación/reactivación de centros en cascada
- Validación de datos con Zod y manejo avanzado de errores

## Tecnologías

### Frontend

- `React 19`
- `TypeScript`
- `Vite 8`
- `Tailwind CSS 4`
- `Zustand`
- `React Router DOM 7`
- `Axios`
- `Zod`
- `React Hook Form`
- `Framer Motion`
- `Lucide React`

### Backend

- `Node.js`
- `Express 5`
- `TypeScript`
- `Prisma 5`
- `PostgreSQL`
- `bcrypt`
- `jsonwebtoken`
- `helmet`
- `cors`
- `winston`

## Arquitectura

La aplicación está organizada en dos capas principales:

- Frontend en `src/`
- Backend en `backend/src/`
- Modelo de datos en `backend/prisma/schema.prisma`

### Estructura clave

```
workflowacademy/
├── backend/
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       └── index.ts
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── store/
│   ├── schemas/
│   ├── types/
│   ├── hooks/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── README.md
```

## Flujo de la aplicación

### Inicio

1. El frontend inicia en `src/App.tsx`.
2. Si hay token guardado en `localStorage.wf_token`, se llama a `refreshSession()`.
3. `refreshSession()` consulta `/api/auth/me` para validar el usuario.
4. Si la sesión es válida, se carga el router.
5. Si no es válida, el usuario se redirige a `/auth/login`.

### Login y autenticación

1. El usuario envía credenciales a `POST /api/auth/login`.
2. El backend valida el usuario con `bcrypt` y genera `accessToken` + `refreshToken`.
3. El frontend guarda los tokens en `localStorage`.
4. Axios agrega `Authorization: Bearer <token>` en cada petición.
5. Si una petición responde 401, se intenta refrescar el token con `POST /api/auth/refresh`.

### Control de acceso

- `PrivateRoute` exige token válido antes de mostrar rutas internas.
- `RoleGate` permite el acceso solo si el rol del usuario coincide.
- Las rutas principales son:
  - Admin: `/dashboard`, `/courses`, `/tasks`, `/modules`, `/groups`, `/organizations`, `/reports`, `/students`, `/teachers`, `/settings`
  - Docente: `/docente`, `/docente/perfil`
  - Estudiante: `/estudiante`, `/estudiante/perfil`

### Lógica central

- El backend usa Prisma para persistir datos.
- `Group.programs` es JSON con asignación de mentores.
- Las actividades pueden derivar el `teacherId` desde módulo → curso → grupo → mentor.
- Los centros pueden desactivarse/reactivarse en cascada, afectando grupos, estudiantes, cursos, módulos y actividades.
- El front valida las respuestas con Zod y registra errores de API.

## Instalación

### Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm

### Pasos

```bash
git clone <repositorio>
cd workflowacademy
npm install
cd backend
npm install
```

## Configuración

### Backend

Crear `.env` en `backend/` con:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/workflow_academy"
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
FRONTEND_URL=http://localhost:5173
```

### Frontend

Crear `.env` en la raíz con:

```env
VITE_API_URL=http://localhost:3000/api
```

## Ejecución

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
npm run dev
```

## Rutas principales

### Autenticación
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`
- `GET /api/auth/me`

### Centros y grupos
- `GET /api/centers`
- `POST /api/centers`
- `PUT /api/centers/:id`
- `POST /api/centers/:id/disable`
- `POST /api/centers/:id/enable`
- `DELETE /api/centers/:id`
- `GET /api/groups`
- `POST /api/groups`
- `PUT /api/groups/:id`
- `DELETE /api/groups/:id`
- `POST /api/groups/sync-mentors`

### Cursos y módulos
- `GET /api/courses`
- `POST /api/courses`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`
- `GET /api/modules`
- `POST /api/modules`
- `PUT /api/modules/:id`
- `DELETE /api/modules/:id`

### Actividades
- `GET /api/activities`
- `POST /api/activities`
- `PUT /api/activities/:id/submission`
- `PUT /api/activities/:id`
- `DELETE /api/activities/:id`

### Docentes y estudiantes
- `GET /api/teachers`
- `GET /api/teachers/:id`
- `POST /api/teachers`
- `PUT /api/teachers/:id`
- `POST /api/teachers/:id/reset-password`
- `DELETE /api/teachers/:id`
- `GET /api/students`
- `POST /api/students`
- `PUT /api/students/:id`
- `POST /api/students/:id/reset-password`
- `DELETE /api/students/:id`

## Licencia

Licencia ISC.

## Observaciones

- El backend seedea datos demo al iniciar el servidor.
- El refresh token no se almacena en base de datos; se gestiona desde el cliente con JWT.
- Algunos endpoints de centro usan credenciales admin enviadas en el cuerpo de la petición.
- El frontend valida respuestas y notifica si hay datos inconsistentes.
