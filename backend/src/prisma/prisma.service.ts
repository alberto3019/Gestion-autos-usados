import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    let databaseUrl = process.env.DATABASE_URL || '';
    
    // Asegurar que la URL tenga los parámetros correctos para PgBouncer
    if (databaseUrl.includes('pooler') || databaseUrl.includes('pgbouncer')) {
      // Si no tiene pgbouncer=true, agregarlo
      if (!databaseUrl.includes('pgbouncer=true')) {
        databaseUrl += (databaseUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
      }
      // Agregar schema=public si no está
      if (!databaseUrl.includes('schema=')) {
        databaseUrl += '&schema=public';
      }
    }
    
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Conectado a la base de datos PostgreSQL');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

