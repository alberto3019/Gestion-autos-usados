# 🚗 AutoStock360

Sistema completo B2B para crear una red colaborativa entre agencias de autos, permitiéndoles compartir inventarios, buscar vehículos y contactarse entre sí.

## 📋 Descripción General

Esta es una plataforma web tipo SaaS diseñada para **agencias de autos (concesionarias/agencieros)** que funciona como una red interna cerrada donde las agencias pueden:

- ✅ Gestionar su propia flota de vehículos
- 🔍 Buscar vehículos de otras agencias con filtros avanzados
- 💬 Contactarse directamente por WhatsApp
- ⭐ Marcar vehículos favoritos
- 📊 Ver estadísticas y métricas
- 🔐 Sistema de roles y permisos

## 🏗️ Arquitectura del Proyecto

```
/
├── backend/          # NestJS + Prisma + PostgreSQL
│   ├── src/
│   ├── prisma/
│   └── README.md
├── frontend/         # React + TypeScript + Vite + Tailwind
│   ├── src/
│   └── README.md
└── README.md         # Este archivo
```

## 🚀 Stack Tecnológico

### Backend
- **NestJS** - Framework Node.js modular y escalable
- **Prisma** - ORM type-safe para PostgreSQL
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación con access + refresh tokens
- **bcrypt** - Hash de contraseñas
- **TypeScript** - Lenguaje tipado

### Frontend
- **React 18** - Biblioteca UI moderna
- **TypeScript** - Lenguaje tipado
- **Vite** - Build tool rápido
- **Tailwind CSS** - Framework CSS utility-first
- **TanStack Query** - Gestión de estado del servidor
- **Zustand** - Estado global
- **React Router v6** - Navegación

## 📦 Instalación Rápida

### Requisitos Previos

- Node.js >= 18
- PostgreSQL >= 14
- npm o yarn

### 1. Clonar el Repositorio

```bash
cd "Gestion Concesionarias Autos"
```

### 2. Configurar Backend

```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de PostgreSQL

# Crear base de datos
createdb dealership_network

# Ejecutar migraciones y seed
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Iniciar servidor
npm run start:dev
```

El backend estará en `http://localhost:3000`

### 3. Configurar Frontend

```bash
cd ../frontend
npm install

# Configurar variables de entorno
echo "VITE_API_URL=http://localhost:3000/api" > .env

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará en `http://localhost:5173`

## 🔑 Credenciales de Prueba

Después de ejecutar el seed del backend, puedes usar:

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

## 📚 Funcionalidades Principales

### Para Agencias

#### 1. Gestión de Flota
- ✅ Crear, editar y eliminar vehículos
- ✅ Subir múltiples fotos por vehículo
- ✅ Cambiar estados (disponible, reservado, vendido, pausado)
- ✅ Filtrar por marca, modelo, año, estado
- ✅ Notas internas (privadas) y públicas

#### 2. Buscador Global
- 🔍 Búsqueda avanzada con múltiples filtros:
  - Marca, modelo, versión
  - Rango de años
  - Rango de precios
  - Kilometraje máximo
  - Tipo de combustible
  - Transmisión
  - Ubicación (provincia/ciudad)
- 📊 Ordenamiento por fecha, precio o kilometraje
- 🎯 Resultados con paginación

#### 3. Ficha de Vehículo
- 📸 Galería de fotos
- 📋 Información completa del vehículo
- 🏢 Datos de la agencia propietaria
- 💬 Botón de WhatsApp con mensaje pre-configurado
- ⭐ Marcar como favorito

#### 4. Favoritos
- ❤️ Guardar vehículos de interés
- 📌 Acceso rápido a vehículos guardados
- 🗑️ Eliminar de favoritos

#### 5. Perfil de Agencia
- ✏️ Editar datos de contacto
- 🔗 Agregar redes sociales (Instagram, Facebook, web)
- 📍 Actualizar ubicación

### Para Super Admin

#### 6. Panel de Administración
- 📊 Dashboard con estadísticas:
  - Total de agencias (activas, pendientes, bloqueadas)
  - Total de vehículos publicados
  - Clicks en WhatsApp
- ✅ Aprobar agencias pendientes
- 🚫 Bloquear agencias
- 👀 Ver listado completo de agencias
- 📈 Métricas de uso

## 🗄️ Modelo de Datos

### Tablas Principales

- **agencies** - Agencias registradas
- **users** - Usuarios del sistema (multi-rol)
- **vehicles** - Vehículos publicados
- **vehicle_photos** - Fotos de vehículos
- **favorites** - Vehículos favoritos por usuario
- **whatsapp_click_logs** - Registro de clicks en WhatsApp
- **search_alerts** - Alertas de búsqueda (preparado para futuro)

### Relaciones

```
agencies (1) → (N) users
agencies (1) → (N) vehicles
vehicles (1) → (N) vehicle_photos
users (N) → (N) favorites → (N) vehicles
```

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Autenticación JWT con tokens de corta duración
- ✅ Refresh tokens para renovación automática
- ✅ Guards de autorización por rol
- ✅ Validación de inputs con class-validator
- ✅ Sanitización automática
- ✅ CORS configurado
- ✅ Protección contra inyección SQL (Prisma ORM)

## 🌐 API Endpoints

### Autenticación
- `POST /api/auth/register-agency` - Registrar nueva agencia
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión

### Agencias
- `GET /api/agencies/me` - Obtener mi agencia
- `PATCH /api/agencies/me` - Actualizar mi agencia

### Vehículos
- `GET /api/vehicles/mine` - Mis vehículos
- `POST /api/vehicles` - Crear vehículo
- `GET /api/vehicles/:id` - Detalle de vehículo
- `PATCH /api/vehicles/:id` - Actualizar vehículo
- `DELETE /api/vehicles/:id` - Eliminar vehículo
- `GET /api/vehicles/search` - Buscar vehículos

### Favoritos
- `GET /api/favorites` - Listar favoritos
- `POST /api/favorites` - Agregar favorito
- `DELETE /api/favorites/:id` - Quitar favorito

### Admin
- `GET /api/admin/agencies` - Listar agencias
- `PATCH /api/admin/agencies/:id/approve` - Aprobar agencia
- `PATCH /api/admin/agencies/:id/block` - Bloquear agencia
- `GET /api/admin/stats` - Estadísticas

## 📱 Rutas del Frontend

### Públicas
- `/login` - Inicio de sesión
- `/register` - Registro de agencia

### Agencias (Protegidas)
- `/dashboard` - Dashboard principal
- `/vehicles` - Mis vehículos
- `/vehicles/new` - Crear vehículo
- `/vehicles/:id` - Detalle de vehículo
- `/search` - Buscador global
- `/favorites` - Mis favoritos
- `/profile` - Mi perfil

### Admin (Super Admin)
- `/admin` - Panel de administración

## 🧪 Testing Local

### Flujo de Prueba Recomendado

1. **Registrar una nueva agencia**
   - Ir a `/register`
   - Completar formulario
   - Verificar que queda "pendiente"

2. **Aprobar agencia como Super Admin**
   - Login como admin
   - Ir a `/admin`
   - Aprobar la agencia pendiente

3. **Login como agencia aprobada**
   - Cargar vehículos nuevos
   - Ver dashboard con estadísticas

4. **Probar búsqueda**
   - Ir a `/search`
   - Aplicar filtros
   - Ver vehículos de otras agencias

5. **Probar favoritos y WhatsApp**
   - Marcar vehículos como favoritos
   - Hacer click en "Contactar por WhatsApp"

## 🚧 Próximas Funcionalidades

### Corto Plazo
- [ ] Sistema de alertas de búsqueda guardadas
- [ ] Roles internos por agencia (vendedor, gerente)
- [ ] Upload real de imágenes a S3/Cloudinary
- [ ] Recuperación de contraseña por email

### Mediano Plazo
- [ ] Chat interno entre agencias
- [ ] Notificaciones push
- [ ] Sistema de reputación/reviews
- [ ] Historial de transacciones
- [ ] Reportes y analytics avanzados

### Largo Plazo
- [ ] Aplicación móvil (React Native)
- [ ] Sistema de pagos integrado
- [ ] Marketplace público para clientes finales
- [ ] Integración con sistemas de gestión (ERP)
- [ ] API pública para integraciones

## 📊 Prisma Studio

Para visualizar y editar la base de datos con interfaz gráfica:

```bash
cd backend
npm run prisma:studio
```

Abre `http://localhost:5555`

## 🛠️ Comandos Útiles

### Backend

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Prisma
npm run prisma:generate    # Generar cliente
npm run prisma:migrate     # Ejecutar migraciones
npm run prisma:studio      # Abrir Prisma Studio
npm run prisma:seed        # Poblar DB con datos de prueba
```

### Frontend

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run preview

# Linting
npm run lint
```

## 📝 Convenciones de Código

### Backend (NestJS)
- PascalCase para clases
- camelCase para métodos y variables
- DTOs con sufijo `.dto.ts`
- Servicios inyectables con `@Injectable()`
- Guards para autenticación/autorización

### Frontend (React)
- PascalCase para componentes
- camelCase para funciones y variables
- Hooks personalizados con prefijo `use`
- Tipos en TypeScript para props

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Verifica que PostgreSQL esté corriendo
- Verifica la `DATABASE_URL` en `.env`
- Asegúrate de que la base de datos existe

### Error: "Port 3000 already in use"
- Cambia el `PORT` en `backend/.env`
- O mata el proceso: `lsof -ti:3000 | xargs kill`

### Error: "CORS policy"
- Verifica que `FRONTEND_URL` en `backend/.env` coincida con la URL del frontend
- Verifica que `VITE_API_URL` en `frontend/.env` apunte al backend correcto

### Frontend no se conecta al backend
- Verifica que el backend esté corriendo en `http://localhost:3000`
- Revisa la consola del navegador para errores de red
- Verifica el archivo `.env` del frontend

## 📄 Licencia

Este proyecto es de código cerrado y confidencial.

## 👥 Equipo de Desarrollo

- **Arquitectura**: Diseño modular y escalable
- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: React + TypeScript + Tailwind
- **DevOps**: Configuración de entornos y deployment

## 📞 Soporte

Para preguntas, dudas o reportar issues, contacta al equipo de desarrollo.

---

**Versión:** 1.0.0 (MVP)  
**Última actualización:** Noviembre 2025

