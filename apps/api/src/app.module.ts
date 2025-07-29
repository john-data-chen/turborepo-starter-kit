import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { Logger, RequestMethod } from "@nestjs/common";
import { TasksModule } from "./tasks/tasks.module";

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // Configure MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("DATABASE_URL"),
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    UserModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  private readonly logger = new Logger("AppModule");

  configure(consumer: MiddlewareConsumer) {
    // Apply middleware for all routes
    consumer
      .apply((req, res, next) => {
        // Log all incoming requests
        const { method, originalUrl, body } = req;
        this.logger.log(
          `[${new Date().toISOString()}] ${method} ${originalUrl}`,
        );

        if (Object.keys(body || {}).length > 0) {
          this.logger.debug("Request body:", JSON.stringify(body, null, 2));
        }

        // Log response when it's finished
        const start = Date.now();
        res.on("finish", () => {
          const duration = Date.now() - start;
          this.logger.log(
            `[${new Date().toISOString()}] ${method} ${originalUrl} ${res.statusCode} - ${duration}ms`,
          );
        });

        next();
      })
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
