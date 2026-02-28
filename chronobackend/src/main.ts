// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import 'dotenv/config'; // Import and call config from dotenv

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuration pour servir les fichiers statiques
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Configuration CORS
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    `${process.env.FRONTEND_URL}/api`,
    process.env.BACKEND_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
    credentials: true,
  });

  // Pipes de validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  }));

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  
  logger.log(`?? Serveur d�marr� sur http://0.0.0.0:${port}`);
  logger.log(`?? Email configur�: ${process.env.EMAIL_USER}`);
  logger.log(`?? Frontend URL: ${process.env.FRONTEND_URL}`);
  logger.log(`??? Base de donn�es: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
}

bootstrap().catch((error) => {
  console.error('Erreur lors du d�marrage du serveur:', error);
  process.exit(1);
});