# 🔧 Solución de Problemas de Conexión a Supabase

## ❌ Error Actual

```
Error: P1001: Can't reach database server at `db.fnijnweluhggvvqxhmmw.supabase.co:5432`
```

## 🔍 Posibles Causas y Soluciones

### 1. Verificar que la base de datos esté activa

1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard/project/fnijnweluhggvvqxhmmw
2. Verifica que el proyecto esté **activo** (no pausado)
3. Si está pausado, haz clic en "Restore" para reactivarlo

### 2. Usar la URL del Session Pooler (Recomendado)

El Session Pooler es más confiable para conexiones externas. Para obtener la URL correcta:

1. Ve a **Settings** → **Database** en Supabase
2. Busca la sección **Connection Pooling**
3. Copia la URL del **Session Pooler** (puerto 6543)
4. Debería verse algo como:
   ```
   postgresql://postgres.fnijnweluhggvvqxhmmw:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

5. Actualiza el `.env` con esta URL completa

### 3. Verificar restricciones de red/firewall

- Algunas redes corporativas bloquean conexiones a bases de datos externas
- Prueba desde otra red (por ejemplo, datos móviles o WiFi diferente)
- Verifica que tu firewall no esté bloqueando el puerto 5432 o 6543

### 4. Habilitar conexiones externas en Supabase

1. Ve a **Settings** → **Database**
2. Verifica que **Allow connections from** esté configurado correctamente
3. Asegúrate de que no haya restricciones de IP

### 5. Probar con psql directamente

Para verificar que la conexión funciona:

```bash
psql "postgresql://postgres:V0Np1fnnq8LcAnIQ@db.fnijnweluhggvvqxhmmw.supabase.co:5432/postgres"
```

Si esto funciona, el problema está en Prisma. Si no funciona, el problema es de red/conectividad.

### 6. Usar Transaction Pooler (Alternativa)

Si el Session Pooler no funciona, prueba con el **Transaction Pooler**:

1. Ve a **Settings** → **Database** → **Connection Pooling**
2. Copia la URL del **Transaction Pooler** (puerto 6543)
3. Actualiza el `.env`

## 📝 URL Actual Configurada

```
postgresql://postgres:V0Np1fnnq8LcAnIQ@db.fnijnweluhggvvqxhmmw.supabase.co:5432/postgres?schema=public
```

## ✅ Próximos Pasos Recomendados

1. **Obtener la URL del Session Pooler desde el dashboard de Supabase**
2. **Actualizar el `.env` con la URL del pooler**
3. **Probar nuevamente las migraciones**

Si necesitas ayuda para actualizar la URL, puedes usar:

```bash
# Editar manualmente el archivo .env
nano backend/.env

# O usar el script (si tienes la nueva URL completa)
# Edita el script update-db-password.sh para aceptar la URL completa
```

