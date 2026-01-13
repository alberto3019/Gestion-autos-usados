# ⚠️ IMPORTANTE: Ejecutar Script SQL en Supabase

## Problema Actual

Los errores 500 que estás viendo se deben a que **las tablas de suscripciones y módulos no existen en la base de datos de producción**.

## Solución

**DEBES ejecutar el script SQL completo en Supabase antes de usar estas funcionalidades.**

### Pasos:

1. **Ve a Supabase Dashboard:**
   - https://supabase.com/dashboard/project/fnijnweluhggvvqxhmmw

2. **Abre el SQL Editor:**
   - En el menú lateral, haz clic en "SQL Editor"
   - Haz clic en "New query"

3. **Copia y pega el script SQL completo:**
   - El script está en el mensaje anterior que te envié
   - O busca el script que incluye:
     - Creación de enums (SubscriptionPlan, ManagementModule, etc.)
     - Creación de tablas (subscriptions, agency_modules, etc.)
     - Creación de índices y foreign keys
     - **Sección 6: Script para crear suscripciones básicas**

4. **Ejecuta el script:**
   - Haz clic en "Run" o presiona Cmd+Enter
   - Espera a que termine (puede tardar unos segundos)

5. **Verifica que se ejecutó correctamente:**
   - Deberías ver mensajes de éxito
   - Si hay errores, revisa que las tablas no existan ya

## ¿Qué hace el script?

1. **Crea los enums necesarios** (SubscriptionPlan, ManagementModule, etc.)
2. **Crea todas las tablas nuevas** (subscriptions, agency_modules, etc.)
3. **Crea índices y relaciones** (foreign keys)
4. **Crea suscripciones básicas** para todas las agencias existentes que no tienen suscripción

## Después de ejecutar el script

Una vez ejecutado el script:
- Las agencias existentes tendrán una suscripción "basic" automáticamente
- Podrás actualizar planes desde el panel admin
- Podrás habilitar/deshabilitar módulos
- El dashboard mostrará el plan de cada agencia

## Si sigues viendo errores 500

1. Verifica en Supabase que las tablas existen:
   - Ve a "Table Editor" en Supabase
   - Deberías ver las tablas: `subscriptions`, `agency_modules`, etc.

2. Verifica los logs del backend en Render:
   - Ve a tu servicio en Render
   - Revisa los logs para ver el error específico

3. Asegúrate de que el backend esté usando la URL correcta de la base de datos:
   - Verifica la variable de entorno `DATABASE_URL` en Render

