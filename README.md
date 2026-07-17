# Internships API

Backend API para el sistema de seguimiento de pasantías. Construido con AdonisJS v7 + TypeScript.

## Stack

- **Framework:** AdonisJS v7
- **Lenguaje:** TypeScript
- **Base de datos:** SQLite (dev) / PostgreSQL (prod)
- **Autenticación:** Bearer tokens + Google OAuth

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Generar APP_KEY
node ace generate:key

# Ejecutar migraciones
node ace migration:run

# Iniciar servidor de desarrollo
npm run dev
```

## Scripts

- `npm run dev` - Servidor de desarrollo con HMR
- `npm run build` - Compilar para producción
- `npm run start` - Iniciar servidor en producción
- `npm run test` - Ejecutar tests
- `npm run lint` - Linting
- `npm run typecheck` - Verificación de tipos

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/v1/auth/signup | Registro de usuario |
| POST | /api/v1/auth/login | Inicio de sesión |
| GET | /api/v1/auth/google/redirect | OAuth Google |
| GET | /api/v1/account/profile | Perfil de usuario |
| POST | /api/v1/account/logout | Cerrar sesión |
| GET | /api/v1/log-entries | Listar bitácoras |
| POST | /api/v1/log-entries | Crear bitácora |
| GET | /api/v1/attendances | Listar asistencias |
| POST | /api/v1/attendances/check-in | Registrar entrada |
| POST | /api/v1/attendances/check-out | Registrar salida |

## Despliegue

### Docker

```bash
docker build -t internships-back .
docker run -p 3333:3333 internships-back
```

### Railway

El repositorio incluye `railway.json` configurado para despliegue automático.

## Variables de entorno

Ver `.env.example` para la lista completa de variables requeridas.

## Licencia

MIT
