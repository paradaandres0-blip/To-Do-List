# 🎓 Workflow Academy - Sistema de Gestión Educativa

Sistema de gestión educativa full-stack con autenticación JWT, gestión de roles (estudiantes, profesores, administradores), y módulos completos para cursos, tareas, grupos y reportes.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)

## ✨ Características

### 🔐 Autenticación y Seguridad
- Sistema de autenticación JWT (JSON Web Tokens)
- Gestión de roles: Estudiantes, Profesores, Administradores
- Protección de rutas con middleware
- Recuperación de contraseña
- Refresh tokens para sesiones prolongadas

### 👥 Gestión de Usuarios
- Registro y login de usuarios
- Perfiles de usuario personalizables
- Gestión de estudiantes y profesores
- Asignación de roles y permisos

### 📚 Gestión Académica
- **Cursos**: Creación, edición y gestión de cursos
- **Módulos**: Organización de contenido por módulos
- **Tareas**: Asignación y seguimiento de tareas
- **Grupos**: Gestión de grupos de estudio
- **Organizaciones**: Gestión de organizaciones educativas

### 📊 Reportes y Dashboard
- Dashboard con estadísticas en tiempo real
- Reportes de progreso de estudiantes
- Métricas de rendimiento
- Exportación de datos

## 🛠 Tecnologías

### Frontend
- **React 19.2.7** - Framework de UI
- **TypeScript 6.0.2** - Tipado estático
- **Vite 8.1.3** - Build tool y desarrollo
- **TailwindCSS 4.3.2** - Framework de estilos
- **Zustand 5.0.14** - State management
- **React Router DOM 7.18.1** - Routing
- **React Hook Form 7.81.0** - Gestión de formularios
- **Zod 4.4.3** - Validación de esquemas
- **Axios 1.18.1** - Cliente HTTP
- **Framer Motion 12.42.2** - Animaciones
- **Lucide React 1.24.0** - Iconos

### Backend
- **Node.js** - Runtime de JavaScript
- **Express 5.2.1** - Framework web
- **TypeScript 7.0.2** - Tipado estático
- **PostgreSQL** - Base de datos relacional
- **Prisma ORM 5.22.0** - ORM para base de datos
- **JWT** - Autenticación
- **Winston 3.19.0** - Logging
- **Helmet 8.3.0** - Seguridad HTTP
- **CORS** - Cross-Origin Resource Sharing

## 🏗 Arquitectura

```
to-do-list/
├── src/                      # Frontend (React)
│   ├── pages/               # Páginas de la aplicación
│   │   ├── auth/           # Login, registro, recuperación
│   │   ├── courses/        # Gestión de cursos
│   │   ├── dashboard/      # Panel principal
│   │   ├── groups/         # Gestión de grupos
│   │   ├── modules/        # Módulos educativos
│   │   ├── organizations/  # Gestión de organizaciones
│   │   ├── profile/        # Perfil de usuario
│   │   ├── reports/        # Reportes y métricas
│   │   ├── settings/       # Configuración
│   │   ├── students/       # Gestión de estudiantes
│   │   ├── tasks/          # Gestión de tareas
│   │   └── teachers/       # Gestión de profesores
│   ├── components/         # Componentes reutilizables
│   │   ├── common/         # Button, Input, Card, Table, etc.
│   │   └── layout/         # Layouts de la aplicación
│   ├── services/           # Servicios de API
│   │   ├── api.ts          # Configuración de Axios
│   │   ├── authService.ts  # Servicios de autenticación
│   │   ├── studentService.ts
│   │   ├── teacherService.ts
│   │   └── taskService.ts
│   ├── store/              # Estado global (Zustand)
│   │   ├── authStore.ts    # Estado de autenticación
│   │   ├── studentStore.ts
│   │   └── taskStore.ts
│   ├── routes/             # Configuración de rutas
│   │   ├── AppRouter.tsx   # Router principal
│   │   ├── PrivateRoute.tsx # Rutas protegidas
│   │   └── RoleGate.tsx    # Control por roles
│   ├── schemas/            # Validación con Zod
│   ├── types/              # Definiciones TypeScript
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utilidades
│   ├── layouts/            # Layouts de la aplicación
│   ├── App.tsx             # Componente principal
│   └── main.tsx            # Punto de entrada
├── backend/                # Backend (Express)
│   ├── src/
│   │   ├── routes/         # Rutas de la API
│   │   │   └── authRoutes.ts
│   │   ├── services/       # Lógica de negocio
│   │   │   └── authService.ts
│   │   ├── middleware/     # Middleware de autenticación
│   │   ├── config/         # Configuraciones
│   │   └── validators/     # Validación de datos
│   ├── prisma/             # Esquemas de base de datos
│   └── index.ts            # Punto de entrada
└── docs/                   # Documentación
```

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

### Clonar el repositorio
```bash
git clone https://github.com/paradaandres0-blip/To-Do-List.git
cd To-Do-List
```

### Instalar dependencias
```bash
npm install
cd backend
npm install
cd ..
```

## ⚙️ Configuración

### Backend (.env)
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/workflow_academy"
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_AUTH_MODE=mock
```

## 🚀 Ejecución

### Iniciar Backend
```bash
cd backend
npm run dev
```

### Iniciar Frontend
```bash
npm run dev
```

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 👥 Autores

- **Andrés Parada** - Desarrollador Full Stack
