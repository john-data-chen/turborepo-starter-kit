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

  // Get frontend URL from environment
  const frontendUrl =
    process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';

  // Parse allowed origins from environment or use defaults
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:3000',
    ...(process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : [])
  ].filter(Boolean);

  // For Vercel, we need to allow all subdomains
  const isVercel = process.env.VERCEL === '1';
  const _vercelDomain = isVercel ? '.vercel.app' : '';

  // Enable CORS with proper configuration for Vercel
  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // For Vercel preview URLs, we need to be more permissive
      if (isVercel && origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Check against allowed origins
      const isAllowed = allowedOrigins.some((allowedOrigin) => {
        // Exact match
        if (origin === allowedOrigin) return true;

        // Wildcard match (e.g., '*.example.com')
        if (allowedOrigin.includes('*')) {
          const regex = new RegExp(
            `^${allowedOrigin.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`
          );
          return regex.test(origin);
        }

        return false;
      });

      if (isAllowed) {
        return callback(null, true);
      }

      const msg = `CORS not allowed for origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`;
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
    exposedHeaders: ['Authorization', 'XSRF-TOKEN', 'set-cookie', 'Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  };

  app.enableCors(corsOptions);

  // Log CORS configuration for debugging
  console.log('CORS Configuration:', {
    allowedOrigins,
    isVercel,
    nodeEnv: process.env.NODE_ENV,
    frontendUrl: process.env.NEXT_PUBLIC_WEB_URL
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
