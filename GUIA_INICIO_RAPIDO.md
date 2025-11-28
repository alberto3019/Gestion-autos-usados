# 🚀 GUÍA DE INICIO RÁPIDO

Esta guía te llevará paso a paso para levantar el proyecto completo en tu máquina local.

## ⚡ Pasos para Levantar el Proyecto

### 1️⃣ Verificar Requisitos

Asegúrate de tener instalado:

```bash
# Verificar Node.js (debe ser >= 18)
node --version

# Verificar PostgreSQL (debe ser >= 14)
psql --version

# Verificar npm
npm --version
```

Si no tienes PostgreSQL instalado, descárgalo de: https://www.postgresql.org/download/

### 2️⃣ Preparar la Base de Datos

```bash
# Abrir PostgreSQL
psql postgres

# Dentro de psql, crear la base de datos:
CREATE DATABASE dealership_network;

# Salir de psql
\q
```

### 3️⃣ Configurar el Backend

```bash
# Navegar a la carpeta del backend
cd backend

# Instalar dependencias (esto puede tardar unos minutos)
npm install

# El archivo .env ya existe, pero verifica que tenga estas líneas:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/dealership_network?schema=public"
# Si tu usuario de PostgreSQL es diferente, actualízalo

# Generar el cliente de Prisma
npm run prisma:generate

# Ejecutar las migraciones (crear las tablas)
npm run prisma:migrate

# Poblar la base de datos con datos de prueba
npm run prisma:seed

# Iniciar el servidor backend
npm run start:dev
```

✅ El backend ahora está corriendo en `http://localhost:3000`

**¡IMPORTANTE!** Deja esta terminal abierta mientras trabajas en el proyecto.

### 4️⃣ Configurar el Frontend (En una Nueva Terminal)

```bash
# Abre una NUEVA terminal

# Navegar a la carpeta del frontend
cd "frontend"

# Instalar dependencias
npm install

# El archivo .env ya existe con:
# VITE_API_URL=http://localhost:3000/api

# Iniciar el servidor frontend
npm run dev
```

✅ El frontend ahora está corriendo en `http://localhost:5173`

### 5️⃣ Acceder a la Aplicación

Abre tu navegador en: **http://localhost:5173**

## 🔑 Credenciales de Prueba

El seed creó estos usuarios de prueba:

### Super Administrador
- **Email:** admin@dealershipnetwork.com
- **Password:** admin123
- **Funciones:** Puede aprobar/bloquear agencias y ver estadísticas globales

### Agencia 1: Premium Autos (Activa)
- **Email:** juan@premiumautos.com
- **Password:** premium123
- **Vehículos:** 3 vehículos cargados
- **Ubicación:** Buenos Aires, CABA

### Agencia 2: Auto Elite (Activa)
- **Email:** maria@autoelite.com
- **Password:** elite123
- **Vehículos:** 3 vehículos cargados
- **Ubicación:** Córdoba, Córdoba

### Agencia 3: Nuevos Autos (Pendiente de Aprobación)
- **Email:** carlos@nuevosautos.com
- **Password:** newagency123
- **Estado:** Pendiente - necesita aprobación del admin
- **Ubicación:** Rosario, Santa Fe

## 🧪 Flujo de Prueba Recomendado

### Paso 1: Probar el Login de Super Admin
1. Ve a `http://localhost:5173/login`
2. Usa: `admin@dealershipnetwork.com` / `admin123`
3. Verás el panel de administración

### Paso 2: Aprobar una Agencia Pendiente
1. En el menú lateral, click en "Administración"
2. Verás la lista de agencias
3. Filtra por "Pendientes"
4. Click en "Aprobar" para la agencia "Nuevos Autos"

### Paso 3: Probar Login como Agencia
1. Cierra sesión (menú superior derecho)
2. Login con: `juan@premiumautos.com` / `premium123`
3. Explora el dashboard con estadísticas

### Paso 4: Crear un Nuevo Vehículo
1. En el menú lateral, click en "Mis Vehículos"
2. Click en "Nuevo Vehículo"
3. Completa el formulario (todos los campos marcados con * son obligatorios)
4. Para las fotos, puedes usar URLs de ejemplo como:
   - `https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800`
   - `https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800`
5. Click en "Crear Vehículo"

### Paso 5: Buscar Vehículos en la Red
1. En el menú lateral, click en "Buscar Vehículos"
2. Aplica filtros (por ejemplo: marca "Toyota")
3. Verás vehículos de todas las agencias
4. Click en un vehículo para ver el detalle

### Paso 6: Probar Favoritos y WhatsApp
1. En el detalle de un vehículo de otra agencia:
2. Click en el corazón para agregar a favoritos
3. Click en "Contactar por WhatsApp" (se abrirá WhatsApp Web con un mensaje pre-armado)
4. Ve a "Favoritos" en el menú lateral para ver tus vehículos guardados

### Paso 7: Editar Perfil de la Agencia
1. En el menú lateral, click en "Mi Perfil"
2. Edita los datos de contacto de tu agencia
3. Agrega URLs de redes sociales
4. Click en "Guardar Cambios"

## 🛠️ Herramientas Útiles

### Prisma Studio (Ver/Editar Base de Datos)
En la terminal del backend, ejecuta:
```bash
npm run prisma:studio
```
Se abrirá una interfaz gráfica en `http://localhost:5555` donde puedes ver y editar los datos.

### Ver Logs del Backend
Los logs aparecen en la terminal donde ejecutaste `npm run start:dev`

### Reiniciar la Base de Datos
Si quieres empezar de cero:
```bash
cd backend
npm run prisma:migrate reset
npm run prisma:seed
```

## ❌ Problemas Comunes

### Error: "Cannot connect to database"
**Solución:**
1. Verifica que PostgreSQL esté corriendo
2. Verifica tu usuario y contraseña en `backend/.env`
3. Asegúrate de que la base de datos `dealership_network` existe

### Error: "Port 3000 already in use"
**Solución:**
```bash
# Mata el proceso que está usando el puerto 3000
lsof -ti:3000 | xargs kill

# Luego reinicia el backend
npm run start:dev
```

### Error: Frontend no se conecta al Backend
**Solución:**
1. Verifica que el backend esté corriendo (deberías ver logs en la terminal)
2. Verifica que `frontend/.env` tenga: `VITE_API_URL=http://localhost:3000/api`
3. Reinicia el frontend (Ctrl+C y luego `npm run dev` nuevamente)

### Error: "Module not found" o errores de dependencias
**Solución:**
```bash
# Borra node_modules y reinstala
rm -rf node_modules
npm install
```

### La página está en blanco
**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que el backend esté corriendo
4. Verifica que estés en `http://localhost:5173` (no otra URL)

## 📊 Estructura de Carpetas Importante

```
/
├── backend/
│   ├── src/              ← Código del backend
│   ├── prisma/           ← Esquema de base de datos
│   ├── .env              ← Variables de entorno del backend
│   └── package.json
│
├── frontend/
│   ├── src/              ← Código del frontend
│   ├── .env              ← Variables de entorno del frontend
│   └── package.json
│
└── README.md             ← Documentación principal
```

## 🎯 Próximos Pasos

Una vez que el proyecto esté corriendo:

1. **Explora el código:**
   - Backend: `backend/src/`
   - Frontend: `frontend/src/`

2. **Lee la documentación:**
   - `README.md` - Documentación general
   - `backend/README.md` - Documentación del backend
   - `frontend/README.md` - Documentación del frontend

3. **Experimenta:**
   - Crea más vehículos
   - Registra nuevas agencias
   - Prueba todos los filtros de búsqueda
   - Marca favoritos

## 📞 ¿Necesitas Ayuda?

Si tienes problemas que no se resuelven con esta guía:

1. Revisa los logs en las terminales del backend y frontend
2. Abre las DevTools del navegador (F12) y busca errores
3. Verifica que todos los puertos estén libres (3000 para backend, 5173 para frontend)

## ✅ Checklist de Verificación

Antes de considerar que todo está funcionando, verifica:

- [ ] Backend corriendo en http://localhost:3000
- [ ] Frontend corriendo en http://localhost:5173
- [ ] Puedes hacer login con las credenciales de prueba
- [ ] Ves vehículos en el dashboard
- [ ] El buscador muestra resultados
- [ ] Puedes crear un nuevo vehículo
- [ ] Los favoritos funcionan
- [ ] El botón de WhatsApp genera el enlace correcto

---

**¡Listo! Ya tienes el proyecto corriendo localmente.** 🎉

Ahora puedes empezar a desarrollar nuevas funcionalidades o personalizar el sistema según tus necesidades.

