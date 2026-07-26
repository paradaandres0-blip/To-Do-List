# 🎓 Workflow Academy - Sistema de Gestión Educativa

Sistema de gestión educativa full-stack con autenticación JWT, gestión de roles (estudiantes, profesores, administradores), y módulos completos para cursos, tareas, grupos y reportes.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Variables de Entorno](#variables-de-entorno)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Despliegue](#despliegue)
- [Contribución](#contribución)

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

### 🎨 Interfaz de Usuario
- Diseño moderno con TailwindCSS
- Animaciones con Framer Motion
- Responsive design
- Iconos con Lucide React
- Formularios validados con Zod

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

### Testing
- **Vitest 4.1.10** - Framework de testing
- **Testing Library** - Testing de componentes React
- **Jest DOM** - Utilidades para testing DOM

## 🏗 Arquitectura

```
to-do-list/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── components/     # Componentes reutilizables
│   │   ├── services/       # Servicios de API
│   │   ├── store/          # Estado global (Zustand)
│   │   ├── hooks/          # Custom hooks
│   │   ├── schemas/        # Esquemas de validación (Zod)
│   │   ├── types/          # Definiciones TypeScript
│   │   ├── utils/          # Utilidades
│   │   └── routes/         # Configuración de rutas
│   └── public/             # Archivos estáticos
├── backend/                 # API Express
│   ├── src/
│   │   ├── routes/         # Rutas de la API
│   │   ├── services/       # Lógica de negocio
│   │   ├── middleware/     # Middleware de autenticación
│   │   ├── config/         # Configuraciones
│   │   ├── validators/     # Validación de datos
│   │   └── scripts/        # Scripts de utilidad
│   └── prisma/             # Esquemas de base de datos
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

### Instalar dependencias del Frontend
```bash
npm install
```

### Instalar dependencias del Backend
```bash
cd backend
npm install
cd ..
```

## ⚙️ Configuración

### Configuración del Backend

1. Copiar el archivo de ejemplo de variables de entorno:
```bash
cd backend
cp .env.example .env
```

2. Configurar las variables de entorno en `backend/.env`:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/workflow_academy"
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
CORS_ORIGIN=http://localhost:5173
```

3. Configurar la base de datos PostgreSQL:
```bash
# Crear base de datos
createdb workflow_academy

# Generar cliente Prisma
npm run db:generate

# Sincronizar esquema con base de datos
npm run db:push
```

### Configuración del Frontend

1. Copiar el archivo de ejemplo de variables de entorno:
```bash
cp .env.example .env
```

2. Configurar las variables de entorno en `.env`:
```env
VITE_API_URL=http://localhost:3000
```

## 🚀 Ejecución

### Iniciar el Backend
```bash
cd backend
npm run dev
```
El servidor estará disponible en `http://localhost:3000`

### Iniciar el Frontend
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`

### Scripts Disponibles

#### Frontend
```bash
npm run dev       # Iniciar servidor de desarrollo
npm run build     # Compilar para producción
npm run preview   # Previsualizar build de producción
npm run lint      # Ejecutar ESLint
npm run test      # Ejecutar tests
npm run test:run  # Ejecutar tests en modo CI
npm run test:coverage  # Ejecutar tests con cobertura
```

#### Backend
```bash
npm run dev       # Iniciar servidor con hot reload
npm run build     # Compilar TypeScript
npm start         # Iniciar servidor en producción
npm run db:generate  # Generar cliente Prisma
npm run db:push  # Sincronizar esquema con DB
npm run db:studio  # Abrir Prisma Studio
```

## 📁 Estructura del Proyecto

### Frontend - Páginas Principales
- `auth/` - Login, registro, recuperación de contraseña
- `courses/` - Gestión de cursos
- `dashboard/` - Panel principal con estadísticas
- `groups/` - Gestión de grupos de estudio
- `modules/` - Módulos educativos
- `organizations/` - Gestión de organizaciones
- `profile/` - Perfil de usuario
- `reports/` - Reportes y métricas
- `settings/` - Configuración de la aplicación
- `students/` - Gestión de estudiantes
- `tasks/` - Gestión de tareas
- `teachers/` - Gestión de profesores

### Backend - Estructura de API
- `routes/` - Definición de endpoints REST
- `services/` - Lógica de negocio y acceso a datos
- `middleware/` - Autenticación y autorización
- `config/` - Configuración de logger y base de datos
- `validators/` - Validación de entrada de datos
- `scripts/` - Scripts de mantenimiento y testing

## 🔐 Variables de Entorno

### Backend (.env)
```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos
DATABASE_URL="postgresql://user:password@localhost:5432/workflow_academy"

# JWT
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
# API URL
VITE_API_URL=http://localhost:3000
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cierre de sesión
- `POST /api/auth/refresh` - Renovar token de acceso
- `POST /api/auth/forgot-password` - Solicitar recuperación de contraseña
- `POST /api/auth/reset-password` - Restablecer contraseña
- `GET /api/auth/me` - Obtener usuario actual

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Cursos
- `GET /api/courses` - Listar cursos
- `POST /api/courses` - Crear curso
- `GET /api/courses/:id` - Obtener curso
- `PUT /api/courses/:id` - Actualizar curso
- `DELETE /api/courses/:id` - Eliminar curso

### Tareas
- `GET /api/tasks` - Listar tareas
- `POST /api/tasks` - Crear tarea
- `GET /api/tasks/:id` - Obtener tarea
- `PUT /api/tasks/:id` - Actualizar tarea
- `DELETE /api/tasks/:id` - Eliminar tarea

### Grupos
- `GET /api/groups` - Listar grupos
- `POST /api/groups` - Crear grupo
- `GET /api/groups/:id` - Obtener grupo
- `PUT /api/groups/:id` - Actualizar grupo
- `DELETE /api/groups/:id` - Eliminar grupo

## 🧪 Testing

### Ejecutar Tests del Frontend
```bash
npm run test           # Modo watch
npm run test:run       # Ejecución única
npm run test:coverage  # Con reporte de cobertura
```

### Ejecutar Tests del Backend
```bash
cd backend
npm test
```

### Cobertura de Tests
- Servicios: studentService, teacherService, reportService
- Componentes: Card, Table, Pagination
- Validación de formularios con Zod
- Meta: ≥80% de cobertura

## 🚀 Despliegue

### Frontend (Vercel/Netlify)
1. Compilar la aplicación:
```bash
npm run build
```

2. Desplegar la carpeta `dist/`

### Backend (Railway/Heroku/AWS)
1. Configurar variables de entorno en la plataforma
2. Compilar TypeScript:
```bash
cd backend
npm run build
```

3. Iniciar servidor:
```bash
npm start
```

### Base de Datos (Supabase/Neon/Railway)
1. Configurar DATABASE_URL en variables de entorno
2. Ejecutar migraciones:
```bash
npm run db:push
```

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama para feature (`git checkout -b feature/nueva-feature`)
3. Commit cambios (`git commit -m 'Agregar nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abrir Pull Request

### Convenciones de Commits
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Documentación
- `style:` - Formato/código
- `refactor:` - Refactorización
- `test:` - Tests
- `chore:` - Mantenimiento

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 👥 Autores

- **Julian Andrés Parada y Bairon Ardila Mendoza** - Desarrollador Full Stack

## 📞 Contacto

- GitHub: [@paradaandres0-blip](https://github.com/paradaandres0-blip)
- Email: paradaandres0@gmail.com

## 🙏 Agradecimientos

- React Community
- Vite Team
- TailwindCSS Team
- Prisma Team
