# Backend - Plataforma SaaS para Red de Agencias de Autos

Backend desarrollado con **NestJS**, **Prisma** y **PostgreSQL** para la plataforma de gestión y búsqueda de vehículos entre agencias.

## 🚀 Tecnologías

- **NestJS** 10 - Framework Node.js modular y escalable
- **Prisma** - ORM type-safe para PostgreSQL
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación con access y refresh tokens
- **bcrypt** - Hash de contraseñas
- **TypeScript** - Lenguaje tipado

## 📋 Requisitos Previos

- Node.js >= 18
- PostgreSQL >= 14
- npm o yarn

## 🛠️ Instalación

1. **Instalar dependencias:**

```bash
npm install
```

2. **Configurar variables de entorno:**

Crea un archivo `.env` en la raíz del proyecto (puedes copiar `.env.example`):

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dealership_network?schema=public"
JWT_SECRET="tu-secreto-super-seguro"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="tu-refresh-token-secreto"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

3. **Configurar la base de datos:**

Asegúrate de tener PostgreSQL corriendo y crea la base de datos:

```bash
createdb dealership_network
```

O desde psql:

```sql
CREATE DATABASE dealership_network;
```

4. **Ejecutar migraciones de Prisma:**

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. **Poblar la base de datos con datos de prueba:**

```bash
npm run prisma:seed
```

Esto creará:
- Un Super Admin
- 2 Agencias activas con vehículos
- 1 Agencia pendiente de aprobación

## 🎯 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Inicia el servidor en modo desarrollo con hot-reload

# Producción
npm run build              # Compila el proyecto
npm run start:prod         # Inicia el servidor en modo producción

# Prisma
npm run prisma:generate    # Genera el cliente de Prisma
npm run prisma:migrate     # Ejecuta migraciones
npm run prisma:studio      # Abre Prisma Studio (GUI para ver la BD)
npm run prisma:seed        # Pobla la base de datos con datos de prueba

# Linting
npm run lint               # Ejecuta ESLint
npm run format             # Formatea el código con Prettier
```

## 🔑 Credenciales de Prueba

Después de ejecutar el seed, puedes usar estas credenciales:

**Super Admin:**
- Email: `admin@dealershipnetwork.com`
- Password: `admin123`

**Agencia 1 (Premium Autos - Activa):**
- Email: `juan@premiumautos.com`
- Password: `premium123`

**Agencia 2 (Auto Elite - Activa):**
- Email: `maria@autoelite.com`
- Password: `elite123`

**Agencia 3 (Pendiente de aprobación):**
- Email: `carlos@nuevosautos.com`
- Password: `newagency123`

## 📚 Estructura del Proyecto

```
backend/
├── prisma/
│   ├── schema.prisma      # Esquema de base de datos
│   └── seed.ts            # Script de seed
├── src/
│   ├── auth/              # Módulo de autenticación
│   │   ├── decorators/
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── agencies/          # Módulo de agencias
│   ├── vehicles/          # Módulo de vehículos
│   ├── favorites/         # Módulo de favoritos
│   ├── admin/             # Módulo de administración
│   ├── whatsapp-logs/     # Módulo de logs de WhatsApp
│   ├── prisma/            # Módulo de Prisma
│   ├── app.module.ts      # Módulo principal
│   └── main.ts            # Punto de entrada
├── .env                   # Variables de entorno
├── package.json
└── README.md
```

## 🌐 API Endpoints

### Autenticación

- `POST /api/auth/register-agency` - Registrar nueva agencia
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar access token
- `POST /api/auth/logout` - Cerrar sesión

### Agencias

- `GET /api/agencies/me` - Obtener mi agencia
- `PATCH /api/agencies/me` - Actualizar mi agencia

### Vehículos

- `GET /api/vehicles/mine` - Mis vehículos
- `POST /api/vehicles` - Crear vehículo
- `GET /api/vehicles/:id` - Detalle de vehículo
- `PATCH /api/vehicles/:id` - Actualizar vehículo
- `PATCH /api/vehicles/:id/status` - Cambiar estado
- `DELETE /api/vehicles/:id` - Eliminar vehículo
- `GET /api/vehicles/search` - Buscar vehículos (buscador global)

### Favoritos

- `GET /api/favorites` - Mis favoritos
- `POST /api/favorites` - Agregar a favoritos
- `DELETE /api/favorites/:id` - Quitar de favoritos

### Admin (Solo Super Admin)

- `GET /api/admin/agencies` - Listar agencias
- `PATCH /api/admin/agencies/:id/approve` - Aprobar agencia
- `PATCH /api/admin/agencies/:id/block` - Bloquear agencia
- `GET /api/admin/stats` - Estadísticas del dashboard

### WhatsApp Logs

- `POST /api/whatsapp-logs` - Registrar click en WhatsApp

## 🔒 Seguridad

- Contraseñas hasheadas con **bcrypt** (10 rounds)
- Autenticación JWT con access y refresh tokens
- Guards de autorización por rol
- Validación de inputs con **class-validator**
- Sanitización automática con **class-transformer**
- CORS configurado

## 🗄️ Base de Datos

El esquema incluye las siguientes tablas:

- `agencies` - Agencias
- `users` - Usuarios
- `vehicles` - Vehículos
- `vehicle_photos` - Fotos de vehículos
- `favorites` - Favoritos
- `search_alerts` - Alertas de búsqueda (preparado para futuro)
- `whatsapp_click_logs` - Logs de clicks en WhatsApp

## 📊 Prisma Studio

Para visualizar y editar datos en una interfaz gráfica:

```bash
npm run prisma:studio
```

Abre tu navegador en `http://localhost:5555`

## 🐛 Debugging

Para debug con VS Code, agrega esto a `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug NestJS",
  "runtimeArgs": ["--nolazy", "-r", "ts-node/register"],
  "args": ["${workspaceFolder}/src/main.ts"],
  "autoAttachChildProcesses": true
}
```

## 📝 Notas de Desarrollo

- El puerto por defecto es `3000`
- La API está prefijada con `/api`
- Los access tokens expiran en 15 minutos
- Los refresh tokens expiran en 7 días
- Las agencias nuevas quedan en estado `pending` hasta aprobación

## 🚧 Próximas Funcionalidades

- [ ] Sistema de alertas de búsqueda
- [ ] Roles internos por agencia (vendedor, gerente)
- [ ] Subida real de imágenes a S3
- [ ] Recuperación de contraseña por email
- [ ] Notificaciones push
- [ ] API para aplicación móvil

## 📞 Soporte

Para dudas o problemas, contacta al equipo de desarrollo.

