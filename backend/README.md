# Workflow Academy Backend

Backend para la aplicación Workflow Academy con Node.js, Express, TypeScript y PostgreSQL.

## Instalación

```bash
npm install
```

## Configuración

1. Copiar `.env.example` a `.env`
2. Configurar las variables de entorno según sea necesario

## Scripts

- `npm run dev` - Iniciar servidor en modo desarrollo con hot reload
- `npm run build` - Compilar TypeScript a JavaScript
- `npm start` - Iniciar servidor en modo producción
- `npm test` - Ejecutar tests

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/         # Configuraciones (logger, database)
│   ├── controllers/    # Controladores de Express
│   ├── middleware/     # Middleware personalizado
│   ├── models/         # Modelos de base de datos
│   ├── routes/         # Rutas de Express
│   ├── services/       # Lógica de negocio
│   ├── utils/          # Utilidades
│   └── index.ts        # Punto de entrada
├── logs/               # Logs de la aplicación
├── dist/               # Código compilado
└── .env                # Variables de entorno
```

## Variables de Entorno

- `PORT` - Puerto del servidor (default: 3000)
- `NODE_ENV` - Entorno (development/production)
- `DATABASE_URL` - URL de conexión a PostgreSQL
- `JWT_SECRET` - Secreto para tokens de acceso
- `JWT_REFRESH_SECRET` - Secreto para tokens de refresh
- `JWT_ACCESS_EXPIRATION` - Tiempo de expiración de access token
- `JWT_REFRESH_EXPIRATION` - Tiempo de expiración de refresh token

## Base de Datos

PostgreSQL debe estar instalado y configurado. La base de datos `workflow_academy` debe existir.

## Desarrollo

El servidor se inicia en `http://localhost:3000`

Health check: `GET http://localhost:3000/health`
