/**
 * Script para crear suscripciones básicas para todas las agencias existentes
 * 
 * IMPORTANTE: Este script es SEGURO y NO modifica ni elimina datos existentes.
 * Solo agrega suscripciones básicas a agencias que no tienen suscripción.
 * 
 * Ejecutar con: npx ts-node src/scripts/create-basic-subscriptions.ts
 * 
 * Este script debe ejecutarse una vez después de subir los cambios a producción
 * para asegurar que todas las agencias existentes tengan suscripción básica.
 * 
 * El script es idempotente: puede ejecutarse múltiples veces de forma segura.
 */

import { PrismaClient, ManagementModule, SubscriptionPlan } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Creando suscripciones básicas para agencias existentes...');
  console.log('⚠️  Este script es SEGURO: solo agrega datos, NO modifica ni elimina información existente.\n');

  // Obtener todas las agencias que no tienen suscripción
  // Usamos include para verificar que realmente no tienen suscripción
  const allAgencies = await prisma.agency.findMany({
    include: {
      subscription: true,
    },
  });

  // Filtrar solo las que no tienen suscripción
  const agenciesWithoutSubscription = allAgencies.filter(agency => !agency.subscription);

  console.log(`📊 Total de agencias: ${allAgencies.length}`);
  console.log(`📊 Agencias con suscripción: ${allAgencies.length - agenciesWithoutSubscription.length}`);
  console.log(`📊 Agencias sin suscripción: ${agenciesWithoutSubscription.length}\n`);

  if (agenciesWithoutSubscription.length === 0) {
    console.log('✅ Todas las agencias ya tienen suscripción. No hay nada que hacer.');
    return;
  }

  let created = 0;
  let skipped = 0;
  let errors = 0;

  // Módulos por defecto del plan básico (igual que en SubscriptionsService)
  const basicModules: ManagementModule[] = [
    ManagementModule.stock,
    ManagementModule.clients,
    ManagementModule.statistics,
  ];

  for (const agency of agenciesWithoutSubscription) {
    try {
      // Verificar nuevamente que no tiene suscripción (protección adicional)
      const existingSubscription = await prisma.subscription.findUnique({
        where: { agencyId: agency.id },
      });

      if (existingSubscription) {
        skipped++;
        console.log(`⏭️  Saltando agencia ${agency.commercialName}: ya tiene suscripción`);
        continue;
      }

      // Crear suscripción básica usando upsert para evitar errores de duplicados
      const subscription = await prisma.subscription.upsert({
        where: { agencyId: agency.id },
        create: {
          agencyId: agency.id,
          plan: SubscriptionPlan.basic,
          isActive: true,
          startDate: new Date(),
        },
        update: {
          // Si por alguna razón ya existe, no la actualizamos
        },
      });

      // Habilitar módulos por defecto del plan básico
      // Usamos upsert para evitar errores si el módulo ya existe
      for (const module of basicModules) {
        await prisma.agencyModule.upsert({
          where: {
            agencyId_module: {
              agencyId: agency.id,
              module: module,
            },
          },
          create: {
            agencyId: agency.id,
            module: module,
            subscriptionId: subscription.id,
            isEnabled: true,
            enabledAt: new Date(),
          },
          update: {
            // Si el módulo ya existe, no lo modificamos
            // Esto asegura que no perdamos configuraciones existentes
          },
        });
      }

      created++;
      console.log(`✅ Suscripción creada para: ${agency.commercialName} (ID: ${agency.id.substring(0, 8)}...)`);
    } catch (error: any) {
      errors++;
      // Solo mostrar error si no es un error de duplicado (que es esperado con upsert)
      if (!error.code || error.code !== 'P2002') {
        console.error(`❌ Error procesando ${agency.commercialName} (${agency.id}):`, error.message || error);
      } else {
        skipped++;
        console.log(`⏭️  Saltando ${agency.commercialName}: ya tiene suscripción o módulos configurados`);
      }
    }
  }

  console.log('\n📈 Resumen del proceso:');
  console.log(`   ✅ Suscripciones creadas: ${created}`);
  console.log(`   ⏭️  Saltadas (ya existían): ${skipped}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log('\n🎉 Proceso completado!');
  console.log('✅ Todos los datos existentes (vehículos, usuarios, etc.) se mantienen intactos.');
}

main()
  .catch((e) => {
    console.error('\n❌ Error durante la ejecución:', e);
    console.error('💡 Los datos existentes NO fueron afectados.');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

