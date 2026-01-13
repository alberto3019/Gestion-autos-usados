# 🚀 Pasos de Despliegue - Local vs Producción

## 📍 DÓNDE EJECUTAR CADA PASO

### 💻 EN TU MÁQUINA LOCAL (Ahora)

#### 1. Crear la Migración de Prisma
```bash
cd backend
npx prisma migrate dev --name add_management_system
```
**¿Por qué aquí?** Porque crea los archivos de migración que luego se suben a Git.

#### 2. Verificar que Compila
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```
**¿Por qué aquí?** Para asegurarte de que no hay errores antes de subir a producción.

#### 3. Subir a Git
```bash
git add .
git commit -m "feat: Sistema completo de gestión con planes y módulos"
git push origin main  # o tu rama
```
**¿Por qué aquí?** Para subir el código a tu repositorio.

---

### 🌐 EN PRODUCCIÓN (Después de desplegar)

#### 4. Desplegar el Código
- Hacer pull del código actualizado en el servidor
- O usar tu sistema de CI/CD (Vercel, Railway, etc.)

#### 5. Ejecutar Migraciones en Producción
```bash
cd backend
npx prisma migrate deploy
```
**¿Por qué aquí?** Porque esto aplica las migraciones a la base de datos de producción.

#### 6. Ejecutar Script de Migración de Suscripciones
```bash
cd backend
npx ts-node src/scripts/create-basic-subscriptions.ts
```
**¿Por qué aquí?** Porque este script modifica la base de datos de producción para agregar suscripciones a agencias existentes.

---

## 📋 RESUMEN VISUAL

```
┌─────────────────────────────────────────┐
│  TU MÁQUINA LOCAL (Ahora)              │
├─────────────────────────────────────────┤
│ ✅ 1. npx prisma migrate dev            │
│ ✅ 2. npm run build (backend/frontend) │
│ ✅ 3. git add, commit, push            │
└─────────────────────────────────────────┘
                    ↓
              [Git Push]
                    ↓
┌─────────────────────────────────────────┐
│  PRODUCCIÓN (Después)                  │
├─────────────────────────────────────────┤
│ ✅ 4. Desplegar código (git pull/CI/CD) │
│ ✅ 5. npx prisma migrate deploy         │
│ ✅ 6. npx ts-node src/scripts/...       │
└─────────────────────────────────────────┘
```

---

## ⚠️ IMPORTANTE

- **NO ejecutes `prisma migrate deploy` en local** si ya tienes datos en producción
- **NO ejecutes el script de suscripciones en local** a menos que quieras afectar tu base de datos local
- **SÍ ejecuta `prisma migrate dev` en local** para crear los archivos de migración
- **SÍ ejecuta todo en producción** después de desplegar el código

---

## 🎯 ORDEN CORRECTO

### Fase 1: Local (Ahora)
1. `npx prisma migrate dev --name add_management_system`
2. `npm run build` (backend y frontend)
3. `git add . && git commit && git push`

### Fase 2: Producción (Después)
1. Desplegar código (automático o manual)
2. `npx prisma migrate deploy`
3. `npx ts-node src/scripts/create-basic-subscriptions.ts`

