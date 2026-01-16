import {
  Global,
  Inject,
  Injectable,
  Logger,
  Module,
  OnModuleDestroy,
  OnModuleInit
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { getConnectionToken, MongooseModule, MongooseModuleOptions } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @Inject("DATABASE_CONNECTION")
    private readonly connection: mongoose.Connection
  ) {}

  async onModuleInit() {
    this.connection.on("error", (error: Error) => {
      this.logger.error(`MongoDB connection error: ${error.message}`, error.stack);
    });

    process.on("SIGINT", this.gracefulShutdown.bind(this));
  }

  async onModuleDestroy() {
    await this.gracefulShutdown();
  }

  private async gracefulShutdown() {
    try {
      await this.connection.close();
      process.exit(0);
    } catch (error) {
      this.logger.error("Error closing MongoDB connection", error);
      process.exit(1);
    }
  }
}

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService): Promise<MongooseModuleOptions> => {
        const _logger = new Logger("MongoDB");
        const uri = configService.get<string>("DATABASE_URL");

        // Diagnostic: Log environment and DB connection info
        const nodeEnv = configService.get("NODE_ENV");
        const isCI = configService.get("CI");

        _logger.log(`[Diagnostic] MongoDB Connection Attempt`);
        _logger.log(`[Diagnostic] NODE_ENV: ${nodeEnv}`);
        _logger.log(`[Diagnostic] CI: ${isCI}`);

        if (!uri) {
          _logger.error("[Diagnostic] ✗ DATABASE_URL is not defined!");
          throw new Error("MongoDB connection string (DATABASE_URL) is not defined");
        }

        // Log masked connection string for debugging
        const maskedUri = uri.replace(/:\/\/([^:]+):([^@]+)@/, "://***:***@");
        _logger.log(`[Diagnostic] DATABASE_URL: ${maskedUri}`);

        const isProduction = nodeEnv === "production";

        const options: MongooseModuleOptions = {
          uri,
          serverSelectionTimeoutMS: 10000, // 10 seconds
          socketTimeoutMS: 45000, // 45 seconds
          connectTimeoutMS: 10000, // 10 seconds
          maxPoolSize: 100,
          minPoolSize: 1,
          retryWrites: true,
          retryReads: true,
          retryAttempts: 3,
          ssl: isProduction,
          autoIndex: !isProduction,
          // Add connection event handlers for diagnostic
          connectionFactory: (connection) => {
            connection.on("connected", () => {
              _logger.log("[Diagnostic] ✓ MongoDB connected successfully");
            });
            connection.on("error", (error) => {
              _logger.error(`[Diagnostic] ✗ MongoDB connection error: ${error.message}`);
            });
            connection.on("disconnected", () => {
              _logger.warn("[Diagnostic] MongoDB disconnected");
            });
            return connection;
          }
        };

        _logger.log(
          `[Diagnostic] MongoDB connection options: ${JSON.stringify({
            serverSelectionTimeoutMS: options.serverSelectionTimeoutMS,
            connectTimeoutMS: options.connectTimeoutMS,
            ssl: options.ssl,
            retryAttempts: options.retryAttempts
          })}`
        );

        return options;
      },
      inject: [ConfigService]
    })
  ],
  providers: [
    {
      provide: "DATABASE_CONNECTION",
      useFactory: (connection: mongoose.Connection) => connection,
      inject: [getConnectionToken()]
    },
    DatabaseService
  ],
  exports: [MongooseModule, "DATABASE_CONNECTION", DatabaseService]
})
export class DatabaseModule {}
