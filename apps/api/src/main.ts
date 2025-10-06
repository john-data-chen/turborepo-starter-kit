import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import { API_PORT } from './constants/api'

declare const module: any

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    logger: ['error', 'warn', 'log', 'debug', 'verbose']
  })

  const port = process.env.PORT || API_PORT

  // Parse cookies before CORS middleware
  app.use(cookieParser())

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
  ].filter(Boolean) // Filter out any undefined/null values from env vars

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true)
      }

      const isAllowed = allowedOrigins.some((o) => {
        const matches = typeof o === 'string' ? o === origin : o.test(origin)
        return matches
      })

      if (isAllowed) {
        return callback(null, true)
      }

      const errorMsg = `CORS error: Origin ${origin} not allowed.`
      return callback(new Error(errorMsg))
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
  })

  // Enhanced CORS middleware with detailed logging
  const corsMiddleware = (req: any, res: any, next: any) => {
    const origin = req.headers.origin
    const requestMethod = req.method

    // Handle preflight requests
    if (requestMethod === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', origin)
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
      res.header(
        'Access-Control-Allow-Headers',
        ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With', 'X-XSRF-TOKEN', 'Cookie'].join(',')
      )
      res.header('Access-Control-Allow-Credentials', 'true')
      res.header('Access-Control-Max-Age', '86400') // 24 hours

      return res.status(204).end()
    }

    // Handle regular requests
    if (origin) {
      const isAllowed = allowedOrigins.some((o) => (typeof o === 'string' ? o === origin : o.test(origin)))

      if (isAllowed) {
        res.header('Access-Control-Allow-Origin', origin)
        res.header('Access-Control-Allow-Credentials', 'true')
      }
    }

    next()
  }

  // Apply CORS middleware
  app.use(corsMiddleware)

  // Apply CORS middleware before other middleware
  app.use((req, res, next) => {
    next()
  })

  // Apply CORS middleware
  app.use(corsMiddleware)

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  )

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
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method'
    }
  })

  // For Vercel deployment, we'll export the NestJS app's HTTP adapter
  if (process.env.VERCEL) {
    await app.init()
    return app.getHttpAdapter().getInstance()
  }

  // For local development
  await app.listen(port)

  // Enable hot module replacement for development
  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => {
      app.close()
    })
  }

  return app
}

// Export the serverless function for Vercel
const server = bootstrap()

export default server
