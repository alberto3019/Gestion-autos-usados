# ✅ Checklist de Despliegue - Sistema de Gestión AutoStock360

## 📋 Pasos para Desplegar en Producción

### 🔧 1. Backend - Preparación

#### 1.1. Verificar Schema de Prisma
```bash
cd backend
npx prisma format
npx prisma validate
```

#### 1.2. Crear Migración de Base de Datos
```bash
# Crear la migración con los nuevos modelos
npx prisma migrate dev --name add_management_system

# O si ya tienes la migración:
npx prisma migrate deploy
```

#### 1.3. Generar Prisma Client
```bash
npx prisma generate
```

#### 1.4. Verificar que el Backend Compila
```bash
npm run build
# O
npm run start:dev  # Para verificar que no hay errores
```

### 🎨 2. Frontend - Preparación

#### 2.1. Verificar que Compila
```bash
cd frontend
npm run build
```

#### 2.2. Verificar Linter
```bash
npm run lint
```

### 🚀 3. Despliegue en Producción

#### 3.1. Subir Código a Git
```bash
git add .
git commit -m "feat: Sistema completo de gestión con planes y módulos"
git push origin main  # o tu rama de producción
```

#### 3.2. Desplegar Backend
- Desplegar el código actualizado
- Ejecutar migraciones de Prisma en producción
- Reiniciar el servidor backend

#### 3.3. Desplegar Frontend
- Desplegar el código actualizado
- Verificar que las variables de entorno estén configuradas

### 📊 4. Migración de Datos Existentes

#### 4.1. Ejecutar Script de Migración
**IMPORTANTE**: Ejecutar esto DESPUÉS de desplegar el código en producción

```bash
cd backend
npx ts-node src/scripts/create-basic-subscriptions.ts
```

Este script:
- ✅ Solo AGREGA suscripciones básicas
- ✅ NO modifica ni elimina datos existentes
- ✅ Es seguro ejecutarlo múltiples veces
- ✅ Mantiene intactos todos los datos (vehículos, usuarios, clientes, etc.)

#### 4.2. Verificar Resultados
El script mostrará:
- Cuántas agencias se procesaron
- Cuántas suscripciones se crearon
- Si hubo algún error

### ✅ 5. Verificación Post-Despliegue

#### 5.1. Verificar Backend
- [ ] Las nuevas rutas de gestión funcionan
- [ ] El sistema de permisos funciona
- [ ] Las suscripciones se crean correctamente

#### 5.2. Verificar Frontend
- [ ] El sidebar muestra los módulos habilitados
- [ ] Las páginas de gestión son accesibles
- [ ] El super admin puede gestionar planes y módulos

#### 5.3. Verificar Funcionalidad
- [ ] Nuevas agencias reciben plan básico automáticamente
- [ ] Agencias existentes tienen suscripción básica
- [ ] Los módulos básicos están habilitados (stock, clients, statistics)
- [ ] El super admin puede cambiar planes y módulos

### 🔍 6. Pruebas Recomendadas

#### 6.1. Como Super Admin
1. Iniciar sesión como super admin
2. Ir a una agencia existente
3. Verificar que tiene suscripción básica
4. Probar cambiar el plan
5. Probar habilitar/deshabilitar módulos

#### 6.2. Como Agency Admin
1. Iniciar sesión como agency admin
2. Verificar que ve los módulos habilitados en el sidebar
3. Probar acceder a cada módulo habilitado
4. Verificar que no puede acceder a módulos no habilitados

#### 6.3. Como Agency User
1. Iniciar sesión como agency user
2. Verificar permisos de módulos
3. Probar acceso según permisos asignados

### 📝 7. Notas Importantes

#### ⚠️ Antes de Desplegar
- [ ] Hacer backup de la base de datos (recomendado)
- [ ] Verificar que todas las dependencias estén instaladas
- [ ] Verificar variables de entorno

#### ⚠️ Durante el Despliegue
- [ ] Ejecutar migraciones ANTES de desplegar el código nuevo
- [ ] Verificar que las migraciones se ejecutaron correctamente
- [ ] Ejecutar el script de migración DESPUÉS de desplegar

#### ⚠️ Después del Despliegue
- [ ] Verificar que no hay errores en los logs
- [ ] Probar funcionalidades críticas
- [ ] Monitorear el sistema durante las primeras horas

### 🆘 8. Rollback (Si es Necesario)

Si algo sale mal:

1. **Revertir código**: `git revert` o volver al commit anterior
2. **Las migraciones de Prisma**: Las nuevas tablas no afectan las existentes
3. **Datos**: El script solo agrega datos, no los elimina, así que los datos están seguros

### 📞 9. Soporte

Si encuentras algún problema:
1. Revisar logs del backend
2. Verificar que las migraciones se ejecutaron
3. Verificar que el script de migración se ejecutó
4. Verificar permisos de base de datos

---

## 🎯 Resumen Rápido

1. ✅ **Backend**: Compilar y verificar
2. ✅ **Frontend**: Compilar y verificar
3. ✅ **Git**: Subir cambios
4. ✅ **Desplegar**: Backend y Frontend
5. ✅ **Migraciones**: Ejecutar migraciones de Prisma
6. ✅ **Script**: Ejecutar script de migración de suscripciones
7. ✅ **Verificar**: Probar funcionalidades

¡Todo listo para producción! 🚀

