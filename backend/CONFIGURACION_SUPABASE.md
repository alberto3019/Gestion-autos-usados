# 🔧 Configuración de Supabase

## ✅ Lo que ya está configurado

- ✅ Archivo `.env` creado con la estructura correcta
- ✅ Secretos JWT generados automáticamente
- ✅ URL de conexión a Supabase configurada

## 📝 Pasos para completar la configuración

### 1. Obtener la contraseña de Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard/project/fnijnweluhggvvqxhmmw
2. Ve a **Settings** → **Database**
3. Busca la sección **Database password**
4. Si no la tienes, haz clic en **Reset database password** y copia la nueva contraseña

### 2. Actualizar el archivo .env

Tienes dos opciones:

#### Opción A: Usar el script automático (recomendado)

```bash
cd backend
./update-db-password.sh TU_PASSWORD_AQUI
```

#### Opción B: Editar manualmente

Abre el archivo `backend/.env` y reemplaza `[TU_PASSWORD]` con tu contraseña real:

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD_AQUI@db.fnijnweluhggvvqxhmmw.supabase.co:5432/postgres?schema=public"
```

### 3. Probar la conexión

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

Si todo está bien, verás:
- ✅ Cliente de Prisma generado
- ✅ Migraciones ejecutadas correctamente

## ⚠️ Importante: Session Pooler para Render/Vercel

Supabase menciona que algunas plataformas (como **Render** y **Vercel**) son IPv4-only y pueden no funcionar con la conexión directa.

### Para producción en Render/Vercel:

1. En Supabase, ve a **Settings** → **Database** → **Connection Pooling**
2. Usa el **Session Pooler** o **Transaction Pooler**
3. La URL será diferente, algo como:
   ```
   postgresql://postgres:[PASSWORD]@[PROJECT-REF].pooler.supabase.com:6543/postgres
   ```

### Para desarrollo local:

La conexión directa funciona perfectamente:
```
postgresql://postgres:[PASSWORD]@db.fnijnweluhggvvqxhmmw.supabase.co:5432/postgres
```

## 🔐 Variables de entorno configuradas

- ✅ `DATABASE_URL` - Conexión a Supabase
- ✅ `JWT_SECRET` - Secreto para tokens JWT (generado automáticamente)
- ✅ `JWT_REFRESH_SECRET` - Secreto para refresh tokens (generado automáticamente)
- ✅ `PORT` - Puerto del servidor (3000)
- ✅ `FRONTEND_URL` - URL del frontend (http://localhost:5173)
- ✅ `API_URL` - URL de la API (http://localhost:3000)

## 📚 Próximos pasos

Una vez configurada la base de datos:

1. Ejecutar migraciones: `npm run prisma:migrate`
2. Poblar con datos de prueba: `npm run prisma:seed`
3. Iniciar el servidor: `npm run start:dev`

