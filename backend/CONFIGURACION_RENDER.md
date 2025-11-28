# 🚀 Configuración de Render para el Backend NestJS

## ✅ Verificación del package.json

Tu `package.json` está **correctamente configurado**:

```json
{
  "scripts": {
    "build": "nest build",           // ✅ Correcto para NestJS
    "start:prod": "node dist/main"   // ✅ Correcto para producción
  }
}
```

## ⚙️ Configuración en Render Dashboard

### 1. Root Directory
- **Valor:** `backend`

### 2. Build Command
- **Valor:** `npm install && npm run prisma:generate && npm run build`

**Explicación:**
- `npm install` - Instala dependencias
- `npm run prisma:generate` - Genera el cliente de Prisma (necesario antes del build)
- `npm run build` - Compila el proyecto NestJS (ejecuta `nest build`)

### 3. Start Command
- **Valor:** `npm run start:prod`

**Explicación:**
- Ejecuta `node dist/main` que es el punto de entrada compilado de NestJS

## 🔧 Variables de Entorno en Render

Configura estas variables de entorno en **Render Dashboard → Environment**:

### Obligatorias:
```
DATABASE_URL=postgresql://postgres.fnijnweluhggvvqxhmmw:V0Np1fnnq8LcAnIQ@db.fnijnweluhggvvqxhmmw.supabase.co:6543/postgres?pgbouncer=true&schema=public
JWT_SECRET=ezLPdetfG7Qh2894i90AwmCdl7v9Z0HcAY/N0YqZ3ZA=
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=H/ZTqrRluLe06OSuwqzE4fTA9oisqInUk86wRWUbWNA=
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://tu-frontend.vercel.app
API_URL=https://tu-backend.onrender.com
```

### Opcionales (si usas):
```
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...
```

## ⚠️ Comandos que NO debes usar

❌ **NO uses:**
- `next build` (esto es para Next.js, no para NestJS)
- `npm start` (esto ejecuta `nest start` que es para desarrollo)
- `ts-node` directamente (solo para desarrollo)

✅ **SÍ usa:**
- `npm run build` (ejecuta `nest build`)
- `npm run start:prod` (ejecuta `node dist/main`)

## 🔍 Verificación

Después de configurar, verifica en los logs de Render que:

1. **Build exitoso:**
   ```
   ✔ Generated Prisma Client
   ✔ Build completed successfully
   ```

2. **Start exitoso:**
   ```
   🚀 Servidor corriendo en http://localhost:10000
   📚 API disponible en http://localhost:10000/api
   ```

## 🐛 Troubleshooting

### Error: "Cannot find module '@prisma/client'"
**Solución:** Asegúrate de que el Build Command incluya `npm run prisma:generate`

### Error: "next build" o "Next.js"
**Solución:** Verifica que el Build Command sea exactamente:
```
npm install && npm run prisma:generate && npm run build
```

### Error: "Cannot find module 'dist/main'"
**Solución:** Verifica que el Build Command se ejecutó correctamente y que existe `dist/main.js`

## 📝 Resumen de Comandos para Render

| Campo | Valor |
|------|-------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install && npm run prisma:generate && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Environment** | `Node` |

