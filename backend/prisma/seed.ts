import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar todos los datos existentes
  console.log('🧹 Limpiando datos existentes...');
  await prisma.activityLog.deleteMany();
  await prisma.whatsappClickLog.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.vehiclePhoto.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agency.deleteMany();
  console.log('✅ Datos limpiados');

  // Crear Super Admin
  console.log('👤 Creando Super Admin...');
  const superAdminPassword = await bcrypt.hash('12345', 10);
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@admin.com',
      passwordHash: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      isActive: true,
    },
  });
  console.log('✅ Super Admin creado:', superAdmin.email);
  console.log('   Email: admin@admin.com');
  console.log('   Password: 12345');

  console.log('\n🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
