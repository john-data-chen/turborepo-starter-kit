import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { API_PORT } from './constants/api';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    logger: ['error', 'warn', 'log', 'debug', 'verbose']
  });

  const port = process.env.PORT || API_PORT;

  // Parse cookies before CORS middleware
  app.use(cookieParser());

  // Get allowed origins from environment variables
  const _frontendUrl =
    process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
  const additionalOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : [];

  const allowedOrigins = [
    _frontendUrl,
    'http://localhost:3000',
    ...additionalOrigins
  ].filter(Boolean); // Remove any falsy values

  // Enable CORS with proper configuration
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.some(
          (allowedOrigin) =>
            origin === allowedOrigin ||
            origin.match(
              new RegExp(`^https?://[^/]+${allowedOrigin.replace('*', '')}$`)
            )
        )
      ) {
        return callback(null, true);
      }

      const msg = `CORS not allowed for origin: ${origin}`;
      console.warn(msg);
      return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-XSRF-TOKEN'
    ],
    exposedHeaders: ['Authorization', 'XSRF-TOKEN'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  // Log CORS configuration for debugging
  console.log('CORS enabled with the following configuration:', {
    allowedOrigins,
    credentials: true
  });

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('API documentation for the Task Management System')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header'
      },
      'JWT-auth' // This name should match the one used in @ApiBearerAuth() in controllers
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method'
    }
  });

  // For Vercel deployment, we'll export the NestJS app's HTTP adapter
  if (process.env.VERCEL) {
    await app.init();
    return app.getHttpAdapter().getInstance();
  }

  // For local development
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);

  // Enable hot module replacement for development
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => {
      app.close();
    });
  }

  return app;
}

// Export the serverless function for Vercel
const server = bootstrap();

export default server;
