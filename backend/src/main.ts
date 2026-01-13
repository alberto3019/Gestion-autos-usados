import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Servir archivos estáticos para uploads locales usando express.static directamente
  // Esto debe hacerse ANTES del prefijo global para evitar conflictos
  const uploadsPath = join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));
  console.log(`📁 Serviendo archivos estáticos desde: ${uploadsPath}`);

  // Configurar prefijo global para la API
  app.setGlobalPrefix('api');

  // Configurar filtro global de excepciones para mejor logging
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`\n🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`📚 API disponible en http://localhost:${port}/api`);
}

bootstrap();

