# Frontend - Plataforma SaaS para Red de Agencias de Autos

Frontend desarrollado con **React 18**, **TypeScript**, **Vite** y **Tailwind CSS** para la plataforma de gestión y búsqueda de vehículos entre agencias.

## 🚀 Tecnologías

- **React 18** - Biblioteca UI moderna
- **TypeScript** - Lenguaje tipado
- **Vite** - Build tool rápido
- **Tailwind CSS** - Framework CSS utility-first
- **React Router v6** - Navegación
- **TanStack Query (React Query)** - Gestión de estado del servidor
- **Axios** - Cliente HTTP
- **Zustand** - Estado global (autenticación)
- **React Hook Form** - Manejo de formularios
- **Headless UI** - Componentes accesibles
- **Heroicons** - Iconos

## 📋 Requisitos Previos

- Node.js >= 18
- npm o yarn
- Backend corriendo en `http://localhost:3000`

## 🛠️ Instalación

1. **Instalar dependencias:**

```bash
npm install
```

2. **Configurar variables de entorno:**

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000/api
```

3. **Iniciar el servidor de desarrollo:**

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 🎯 Scripts Disponibles

```bash
npm run dev         # Inicia el servidor de desarrollo
npm run build       # Compila para producción
npm run preview     # Preview del build de producción
npm run lint        # Ejecuta ESLint
```

## 📚 Estructura del Proyecto

```
frontend/
├── src/
│   ├── api/                  # Clientes API
│   │   ├── client.ts         # Axios configurado
│   │   ├── auth.ts
│   │   ├── vehicles.ts
│   │   ├── agencies.ts
│   │   ├── favorites.ts
│   │   ├── admin.ts
│   │   └── whatsapp.ts
│   ├── components/
│   │   ├── common/           # Componentes reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── RoleGuard.tsx
│   │   └── layout/           # Layout components
│   │       ├── Layout.tsx
│   │       ├── Sidebar.tsx
│   │       └── Topbar.tsx
│   ├── pages/                # Páginas principales
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── vehicles/
│   │   │   ├── MyVehiclesPage.tsx
│   │   │   ├── VehicleFormPage.tsx
│   │   │   └── VehicleDetailPage.tsx
│   │   ├── search/
│   │   │   └── SearchPage.tsx
│   │   ├── favorites/
│   │   │   └── FavoritesPage.tsx
│   │   ├── profile/
│   │   │   └── ProfilePage.tsx
│   │   └── admin/
│   │       └── AdminDashboardPage.tsx
│   ├── store/                # Zustand stores
│   │   └── authStore.ts
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   ├── App.tsx               # Configuración de rutas
│   ├── main.tsx              # Punto de entrada
│   └── index.css             # Estilos globales
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🗺️ Rutas Principales

### Públicas
- `/login` - Inicio de sesión
- `/register` - Registro de nueva agencia

### Protegidas (Requieren autenticación)
- `/dashboard` - Dashboard principal
- `/vehicles` - Mis vehículos
- `/vehicles/new` - Crear nuevo vehículo
- `/vehicles/:id/edit` - Editar vehículo
- `/vehicles/:id` - Detalle de vehículo
- `/search` - Buscar vehículos en la red
- `/favorites` - Mis favoritos
- `/profile` - Mi perfil y datos de la agencia

### Admin (Solo Super Admin)
- `/admin` - Panel de administración
  - Gestión de agencias
  - Estadísticas generales
  - Aprobación/bloqueo de agencias

## 🎨 Componentes Principales

### Componentes Comunes
- **Button** - Botón con variantes (primary, secondary, danger) y estados de carga
- **Input** - Input con label y manejo de errores
- **StatusBadge** - Badge para mostrar estados con colores
- **Pagination** - Componente de paginación
- **ProtectedRoute** - Guard de autenticación
- **RoleGuard** - Guard por rol de usuario

### Layout
- **Layout** - Estructura principal con sidebar y topbar
- **Sidebar** - Menú lateral de navegación
- **Topbar** - Barra superior con información del usuario

## 🔒 Autenticación

El sistema de autenticación utiliza:
- **JWT** con access tokens (15 min) y refresh tokens (7 días)
- **Zustand** para almacenamiento persistente del estado
- **Axios interceptors** para renovación automática de tokens
- Redirección automática al login si el token expira

## 📱 Responsive Design

La aplicación es completamente responsive gracias a:
- **Tailwind CSS** con breakpoints móviles, tablets y desktop
- Grid y Flexbox para layouts adaptativos
- Menú colapsable en móviles
- Tablas responsive con scroll horizontal

## 🔧 Configuración de Producción

Para compilar para producción:

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`

Para servir el build localmente:

```bash
npm run preview
```

## 🌐 Variables de Entorno

- `VITE_API_URL` - URL del backend API (default: `http://localhost:3000/api`)

## 🎨 Personalización de Estilos

Los colores primarios se pueden cambiar en `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Personaliza aquí
      },
    },
  },
},
```

## 🐛 Debugging

Para debug en Chrome DevTools:
1. Abre las DevTools
2. Busca la pestaña "Components" (React DevTools extension requerida)
3. Inspecciona el estado y props de componentes

## 📝 Notas de Desarrollo

- El puerto por defecto es `5173`
- Hot-reload automático en desarrollo
- TypeScript strict mode habilitado
- ESLint configurado con reglas de React
- Prettier para formateo de código

## 🚧 Próximas Funcionalidades

- [ ] Upload real de imágenes (actualmente solo URLs)
- [ ] Notificaciones push
- [ ] Chat interno entre agencias
- [ ] Sistema de alertas de búsqueda
- [ ] PWA (Progressive Web App)
- [ ] Modo oscuro
- [ ] Multi-idioma (i18n)

## 📞 Soporte

Para dudas o problemas, contacta al equipo de desarrollo.

