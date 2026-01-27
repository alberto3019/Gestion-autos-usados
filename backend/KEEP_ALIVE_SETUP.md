# 🔄 Configuración de Keep-Alive para Render.com

Este documento explica cómo mantener el servidor activo en Render.com para evitar los "cold starts" de 50 segundos.

## ✅ Soluciones Implementadas

### 1. Endpoint de Health Check
Se ha creado un endpoint público en `/api/health` que devuelve el estado del servidor:
- **URL:** `https://gestion-autos-usados.onrender.com/api/health`
- **Método:** GET
- **Autenticación:** No requerida (público)
- **Respuesta:** 
  ```json
  {
    "status": "ok",
    "timestamp": "2026-01-27T09:30:00.000Z",
    "uptime": 12345.67
  }
  ```

### 2. Keep-Alive desde el Frontend
El frontend ahora hace ping automático cada 4 minutos cuando hay usuarios activos en la plataforma. Esto mantiene el servidor despierto durante el uso activo.

## 🌐 Configuración de Servicio Externo (Recomendado)

Para mantener el servidor activo 24/7, incluso cuando no hay usuarios, configura un servicio de monitoreo externo.

### Opción 1: UptimeRobot (Gratis - Recomendado)

1. **Registrarse en UptimeRobot:**
   - Ve a https://uptimerobot.com
   - Crea una cuenta gratuita (hasta 50 monitores)

2. **Crear un Monitor:**
   - Click en "Add New Monitor"
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** Gestion Autos - Keep Alive
   - **URL:** `https://gestion-autos-usados.onrender.com/api/health`
   - **Monitoring Interval:** 5 minutes (mínimo permitido)
   - **Alert Contacts:** (opcional) Configura alertas si el servidor está caído

3. **Guardar:**
   - Click en "Create Monitor"
   - El servicio comenzará a hacer ping cada 5 minutos automáticamente

### Opción 2: cron-job.org (Gratis)

1. **Registrarse:**
   - Ve a https://cron-job.org
   - Crea una cuenta gratuita

2. **Crear un Cron Job:**
   - Click en "Create cronjob"
   - **Title:** Keep Alive - Gestion Autos
   - **Address:** `https://gestion-autos-usados.onrender.com/api/health`
   - **Schedule:** Cada 5 minutos (`*/5 * * * *`)
   - **Request Method:** GET
   - **Save**

### Opción 3: Pingdom (Plan Gratuito Limitado)

1. **Registrarse en Pingdom:**
   - Ve a https://www.pingdom.com
   - Plan gratuito permite 1 check

2. **Crear Check:**
   - **Check Type:** HTTP
   - **URL:** `https://gestion-autos-usados.onrender.com/api/health`
   - **Check Interval:** 5 minutes
   - **Save**

## 📊 Cómo Funciona

1. **Servicio Externo:** Hace ping cada 5 minutos al endpoint `/api/health`
2. **Frontend Keep-Alive:** Cuando hay usuarios activos, hace ping cada 4 minutos
3. **Resultado:** El servidor nunca se duerme porque siempre recibe tráfico

## ⚠️ Notas Importantes

- **Intervalo Mínimo:** Render.com típicamente duerme el servidor después de ~5 minutos de inactividad
- **Intervalo Recomendado:** 4-5 minutos es ideal (menos que el timeout de Render)
- **Costo:** Todos los servicios mencionados tienen planes gratuitos
- **Límites:** 
  - UptimeRobot: 50 monitores gratis
  - cron-job.org: Ilimitado en plan gratuito
  - Pingdom: 1 check gratis

## 🔍 Verificación

Para verificar que todo funciona:

1. **Probar el endpoint manualmente:**
   ```bash
   curl https://gestion-autos-usados.onrender.com/api/health
   ```
   Deberías recibir una respuesta JSON con `status: "ok"`

2. **Verificar en Render:**
   - Ve al dashboard de Render
   - Revisa los logs del servicio
   - Deberías ver requests al endpoint `/api/health` cada 4-5 minutos

3. **Verificar en el navegador:**
   - Abre la consola del navegador
   - Deberías ver logs: `✅ Keep-alive ping exitoso` cada 4 minutos

## 🚀 Próximos Pasos

1. Configura uno de los servicios externos mencionados arriba
2. Verifica que el servidor no se duerme después de 5 minutos
3. Monitorea los logs para confirmar que los pings están funcionando

## 💡 Alternativa: Upgrade de Plan

Si en el futuro quieres evitar completamente los cold starts, considera hacer upgrade a un plan de pago en Render.com que mantiene el servidor siempre activo.

