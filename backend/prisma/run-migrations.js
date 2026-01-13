const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Ejecutando migraciones...\n');

  try {
    // Leer el archivo de migraciones
    const migrationsPath = path.join(__dirname, 'migrations', 'ALL_MIGRATIONS.sql');
    const sql = fs.readFileSync(migrationsPath, 'utf8');

    // Ejecutar el SQL
    console.log('📝 Ejecutando migraciones SQL...');
    await prisma.$executeRawUnsafe(sql);
    console.log('✅ Migraciones ejecutadas correctamente\n');

    // Crear el superadmin
    console.log('👤 Creando usuario superadmin...');
    const createAdminPath = path.join(__dirname, 'migrations', 'CREATE_SUPERADMIN.sql');
    const adminSql = fs.readFileSync(createAdminPath, 'utf8');
    await prisma.$executeRawUnsafe(adminSql);
    console.log('✅ Usuario superadmin creado\n');

    console.log('🎉 ¡Todo completado exitosamente!');
    console.log('\n📋 Credenciales:');
    console.log('   Email: admin@dealershipnetwork.com');
    console.log('   Password: admin123');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P2010') {
      console.log('\n💡 Algunas tablas o tipos pueden ya existir. Esto es normal si ejecutas el script varias veces.');
    }
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




