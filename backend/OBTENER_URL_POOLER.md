# 🔗 Cómo Obtener la URL del Session Pooler de Supabase

## 📍 Pasos para Obtener la URL Correcta

### 1. Accede a tu Dashboard de Supabase

Ve a: https://supabase.com/dashboard/project/fnijnweluhggvvqxhmmw

### 2. Ve a Settings → Database

En el menú lateral izquierdo, haz clic en:
- **Settings** (⚙️)
- Luego **Database**

### 3. Busca "Connection Pooling"

Desplázate hasta la sección **Connection Pooling** o **Connection string**

### 4. Copia la URL del Session Pooler

Deberías ver algo como:

**Session mode (recommended):**
```
postgresql://postgres.fnijnweluhggvvqxhmmw:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

O puede ser:
```
postgresql://postgres.fnijnweluhggvvqxhmmw:[YOUR-PASSWORD]@db.fnijnweluhggvvqxhmmw.supabase.co:6543/postgres?pgbouncer=true
```

### 5. Reemplaza [YOUR-PASSWORD] con tu contraseña

La contraseña es: `V0Np1fnnq8LcAnIQ`

### 6. Actualiza el archivo .env

Reemplaza la línea `DATABASE_URL` en `backend/.env` con la URL completa del pooler.

**Ejemplo:**
```env
DATABASE_URL="postgresql://postgres.fnijnweluhggvvqxhmmw:V0Np1fnnq8LcAnIQ@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

## ⚠️ Nota Importante

- El **usuario** en la URL del pooler puede ser diferente: `postgres.fnijnweluhggvvqxhmmw` en lugar de solo `postgres`
- El **host** también puede ser diferente: puede ser `aws-0-[REGION].pooler.supabase.com` en lugar de `db.fnijnweluhggvvqxhmmw.supabase.co`
- El **puerto** del pooler es **6543** (no 5432)

## 🚀 Después de Actualizar

Una vez que actualices el `.env` con la URL correcta del pooler:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

## 📸 ¿Dónde Encontrar la URL?

Si no encuentras la sección "Connection Pooling", busca:
- **Connection string**
- **Database URL**
- **Connection info**
- O haz clic en el botón **"Connect to your project"** que viste antes

La URL del pooler suele estar en una pestaña o sección separada de la conexión directa.

