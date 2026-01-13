# 🔧 Solución para Errores 500 en Suscripciones y Módulos

## Problema

Los errores 500 ocurren porque **Prisma Client no está actualizado** en producción con las nuevas tablas y relaciones.

## Solución Paso a Paso

### 1. Verificar que el Script SQL se ejecutó

En Supabase, verifica que existan las tablas:
- `subscriptions`
- `agency_modules`
- `user_module_permissions`

### 2. Regenerar Prisma Client en Render

**IMPORTANTE:** Render necesita regenerar Prisma Client después de ejecutar el script SQL.

#### Opción A: Forzar Rebuild en Render (Recomendado)

1. Ve a tu servicio en Render: https://dashboard.render.com
2. Ve a la configuración del servicio backend
3. Haz clic en **"Manual Deploy"** → **"Clear build cache & deploy"**
4. Esto forzará a Render a:
   - Ejecutar `npm install`
   - Ejecutar `prisma generate` (por el script `prebuild`)
   - Compilar el código

#### Opción B: Verificar Build Command en Render

Asegúrate de que el **Build Command** en Render sea:
```bash
npm install && npm run prisma:generate && npm run build
```

O simplemente:
```bash
npm install && npm run build
```

(El `prebuild` script ejecutará `prisma generate` automáticamente)

### 3. Verificar Variables de Entorno

En Render, verifica que `DATABASE_URL` esté configurada correctamente:
- Debe apuntar a Supabase
- Debe usar el formato correcto con la contraseña

### 4. Revisar Logs en Render

Después del rebuild, revisa los logs:
1. Ve a tu servicio en Render
2. Abre la pestaña **"Logs"**
3. Busca errores relacionados con:
   - `PrismaClient`
   - `subscriptions`
   - `agency_modules`

### 5. Verificar que Prisma Client se Generó

En los logs del build, deberías ver:
```
✔ Generated Prisma Client
```

Si no aparece, hay un problema con la generación.

## Verificación Final

Después de hacer el rebuild:

1. **Prueba el endpoint de módulos:**
   ```
   GET /api/admin/agencies/{agencyId}/modules
   ```

2. **Prueba actualizar un plan:**
   ```
   PATCH /api/admin/agencies/{agencyId}/subscription
   Body: { "plan": "basic" }
   ```

3. **Revisa los logs en tiempo real:**
   - Los nuevos logs mostrarán información detallada del error si persiste

## Si el Error Persiste

1. **Revisa los logs detallados** en Render (ahora con mejor logging)
2. **Verifica que las tablas existan** en Supabase Table Editor
3. **Verifica que Prisma Client esté actualizado** ejecutando localmente:
   ```bash
   cd backend
   npm run prisma:generate
   ```
   Y luego comparando el archivo generado con el de producción.

## Nota Importante

El script `prebuild` en `package.json` ejecuta `prisma generate` automáticamente antes del build, pero a veces Render necesita un rebuild completo para que tome efecto.

