import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Logger, RequestMethod } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./modules/database/database.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BoardsModule } from "./modules/boards/boards.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    DatabaseModule,
    AuthModule,
    BoardsModule,
    ProjectsModule,
    TasksModule,
    UsersModule,
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
          `[${new Date().toISOString()}] ${method} ${originalUrl}`
        );

        if (Object.keys(body || {}).length > 0) {
          this.logger.debug("Request body:", JSON.stringify(body, null, 2));
        }

        // Log response when it's finished
        const start = Date.now();
        res.on("finish", () => {
          const duration = Date.now() - start;
          this.logger.log(
            `[${new Date().toISOString()}] ${method} ${originalUrl} ${res.statusCode} - ${duration}ms`
          );
        });

        next();
      })
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
