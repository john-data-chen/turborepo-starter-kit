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

  // Define allowed origins
  const allowedOrigins = [
    // Production frontend URL from environment variables
    process.env.NEXT_PUBLIC_WEB_URL,
    // Explicit production frontend URL as fallback
    'https://turborepo-starter-kit-web.vercel.app',
    // Regex for Vercel preview URLs for this project
    /^https:\/\/turborepo-starter-kit-web-*\.vercel\.app$/,
    // Local development
    'http://localhost:3000'
  ].filter(Boolean); // Filter out any undefined/null values from env vars

  app.enableCors({
    origin: (origin, callback) => {
      console.log('CORS - Request origin:', origin);
      console.log('CORS - Allowed origins:', allowedOrigins);

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        console.log('CORS - No origin, allowing request');
        return callback(null, true);
      }

      const isAllowed = allowedOrigins.some((o) => {
        const matches = typeof o === 'string' ? o === origin : o.test(origin);
        if (matches) {
          console.log(`CORS - Origin ${origin} matches allowed origin:`, o);
        }
        return matches;
      });

      if (isAllowed) {
        console.log('CORS - Origin allowed');
        return callback(null, true);
      }

      const errorMsg = `CORS error: Origin ${origin} not allowed.`;
      console.error(errorMsg);
      return callback(new Error(errorMsg));
    },
    credentials: true, // This is crucial for cookies
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'X-XSRF-TOKEN',
      'Cookie' // Explicitly allow Cookie header
    ],
    exposedHeaders: [
      'Authorization',
      'XSRF-TOKEN',
      'Set-Cookie' // Expose Set-Cookie header
    ]
  });

  // Enhanced CORS middleware with detailed logging
  const corsMiddleware = (req: any, res: any, next: any) => {
    const requestId = Math.random().toString(36).substring(2, 8);
    const origin = req.headers.origin;
    const requestMethod = req.method;
    const requestHeaders = req.headers['access-control-request-headers'];

    console.log(`[${requestId}] [CORS] Incoming request:`, {
      origin,
      method: requestMethod,
      path: req.path,
      url: req.url,
      cookies: req.cookies,
      cookieHeader: req.headers.cookie,
      'access-control-request-method': requestMethod,
      'access-control-request-headers': requestHeaders,
      'user-agent': req.headers['user-agent']
    });

    // Handle preflight requests
    if (requestMethod === 'OPTIONS') {
      console.log(
        `[${requestId}] [CORS] Handling preflight request for origin: ${origin}`
      );
      res.header('Access-Control-Allow-Origin', origin);
      res.header(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
      );
      res.header(
        'Access-Control-Allow-Headers',
        [
          'Content-Type',
          'Accept',
          'Authorization',
          'X-Requested-With',
          'X-XSRF-TOKEN',
          'Cookie'
        ].join(',')
      );
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '86400'); // 24 hours

      console.log(`[${requestId}] [CORS] Preflight response headers set:`, {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods':
          'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type,Accept,Authorization,X-Requested-With,X-XSRF-TOKEN,Cookie'
      });

      return res.status(204).end();
    }

    // Handle regular requests
    if (origin) {
      const isAllowed = allowedOrigins.some((o) =>
        typeof o === 'string' ? o === origin : o.test(origin)
      );

      if (isAllowed) {
        console.log(`[${requestId}] [CORS] Allowing origin: ${origin}`);
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        console.log(
          `[${requestId}] [CORS] Regular request headers set for ${origin}`
        );
      } else {
        console.log(`[${requestId}] [CORS] Origin not allowed: ${origin}`);
      }
    } else {
      console.log(`[${requestId}] [CORS] No origin header present`);
    }

    next();
  };

  // Apply CORS middleware
  app.use(corsMiddleware);

  // Log CORS configuration for debugging
  console.log('CORS Configuration:', {
    allowedOrigins: allowedOrigins.map((origin) =>
      origin instanceof RegExp ? origin.toString() : origin
    ),
    nodeEnv: process.env.NODE_ENV,
    frontendUrl: process.env.NEXT_PUBLIC_WEB_URL,
    isVercel: process.env.VERCEL === '1',
    vercelUrl: process.env.VERCEL_URL,
    vercelEnv: process.env.VERCEL_ENV,
    corsEnabled: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'X-XSRF-TOKEN'
    ],
    exposedHeaders: ['Authorization', 'XSRF-TOKEN', 'set-cookie']
  });

  // Apply CORS middleware before other middleware
  app.use((req, res, next) => {
    // Log all incoming requests for debugging
    console.log('Incoming Request:', {
      method: req.method,
      path: req.path,
      headers: req.headers,
      originalUrl: req.originalUrl,
      query: req.query,
      body: req.body
    });
    next();
  });

  // Apply CORS middleware
  app.use(corsMiddleware);

  // Log application startup
  console.log('Application starting with configuration:', {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT || 3001,
    apiUrl: process.env.API_URL,
    mongoUri: process.env.MONGO_URI ? '***' : 'Not set',
    jwtSecret: process.env.JWT_SECRET ? '***' : 'Not set',
    isVercel: process.env.VERCEL === '1',
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL
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
