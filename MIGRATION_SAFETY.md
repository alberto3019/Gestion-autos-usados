# 🔒 Seguridad de Migración - Suscripciones Básicas

## ✅ Garantías de Seguridad

Este script de migración está diseñado para ser **100% seguro** y **NO modifica ni elimina datos existentes**.

### 🛡️ Protecciones Implementadas

1. **Solo lectura de datos existentes**: El script solo lee agencias y verifica si tienen suscripción
2. **Solo agrega datos**: Únicamente crea nuevas suscripciones y módulos, nunca modifica existentes
3. **Upsert seguro**: Usa `upsert` para evitar duplicados y no sobrescribir configuraciones existentes
4. **Verificación doble**: Verifica dos veces antes de crear para evitar conflictos
5. **Idempotente**: Puede ejecutarse múltiples veces sin causar problemas

### 📊 Qué hace el script

1. ✅ **Lee** todas las agencias existentes
2. ✅ **Identifica** cuáles NO tienen suscripción
3. ✅ **Crea** una suscripción básica para esas agencias
4. ✅ **Habilita** los módulos por defecto (stock, clients, statistics)
5. ✅ **No toca** agencias que ya tienen suscripción
6. ✅ **No modifica** módulos existentes si ya están configurados
7. ✅ **No elimina** ningún dato

### 🚫 Qué NO hace el script

- ❌ NO elimina datos existentes
- ❌ NO modifica suscripciones existentes
- ❌ NO cambia módulos ya configurados
- ❌ NO toca vehículos, usuarios, clientes, etc.
- ❌ NO modifica configuraciones de agencias
- ❌ NO elimina registros de ninguna tabla

### 📝 Datos que se mantienen intactos

- ✅ Vehículos y sus fotos
- ✅ Usuarios y permisos
- ✅ Clientes y sus datos
- ✅ Transacciones de cashflow
- ✅ Ventas y comisiones
- ✅ Financiamientos
- ✅ Balances
- ✅ Facturas
- ✅ Peritajes
- ✅ Configuraciones de agencia
- ✅ Logs de actividad
- ✅ Favoritos
- ✅ Notificaciones

### 🔄 Para Nuevas Agencias

Las nuevas agencias registradas después del deploy:
- ✅ Reciben automáticamente plan básico
- ✅ Con módulos: stock, clients, statistics
- ✅ Sin afectar agencias existentes

### 🚀 Ejecución en Producción

```bash
# 1. Hacer backup de la base de datos (recomendado pero no estrictamente necesario)
# Ya que el script solo agrega datos

# 2. Ejecutar el script
cd backend
npx ts-node src/scripts/create-basic-subscriptions.ts

# 3. Verificar resultados
# El script mostrará cuántas suscripciones se crearon
```

### ⚠️ Notas Importantes

- El script puede ejecutarse múltiples veces de forma segura
- Si una agencia ya tiene suscripción, será saltada
- Si un módulo ya está configurado, no será modificado
- Todos los datos existentes permanecen intactos

