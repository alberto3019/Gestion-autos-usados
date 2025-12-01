import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando usuario superadmin...\n');

  try {
    const email = 'admin@dealershipnetwork.com';
    const password = 'admin123';

    // Buscar si existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`✅ Usuario encontrado: ${email}`);
      console.log(`   Rol actual: ${existingUser.role}`);
      
      // Actualizar contraseña y asegurar que sea super_admin
      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          passwordHash,
          role: 'super_admin',
          isActive: true,
        },
      });
      console.log('✅ Contraseña actualizada y rol verificado\n');
    } else {
      console.log(`❌ Usuario no encontrado. Creando nuevo usuario...`);
      
      // Crear nuevo usuario
      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName: 'Super',
          lastName: 'Admin',
          role: 'super_admin',
          isActive: true,
        },
      });
      console.log('✅ Usuario superadmin creado\n');
    }

    console.log('📋 Credenciales:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n✅ ¡Listo! Ya puedes iniciar sesión.');
  } catch (error) {
    console.error('❌ Error:', error);
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


