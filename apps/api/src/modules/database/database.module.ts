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
  }

  async onModuleDestroy() {
    try {
      await this.connection.close();
      this.logger.log("MongoDB connection closed gracefully");
    } catch (error) {
      this.logger.error("Error closing MongoDB connection", error);
    }
  }
}

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService): Promise<MongooseModuleOptions> => {
        const logger = new Logger("MongoDB");
        const uri = configService.get<string>("DATABASE_URL");

        if (!uri) {
          throw new Error("MongoDB connection string (DATABASE_URL) is not defined");
        }

        const maskedUri = uri.replace(/:\/\/([^:]+):([^@]+)@/, "://***:***@");
        logger.log(`Connecting to: ${maskedUri}`);

        const isProduction = configService.get("NODE_ENV") === "production";

        return {
          uri,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          connectTimeoutMS: 10000,
          maxPoolSize: 100,
          minPoolSize: 1,
          retryWrites: true,
          retryReads: true,
          retryAttempts: 3,
          ssl: isProduction,
          autoIndex: !isProduction,
          connectionFactory: (connection) => {
            connection.on("connected", () => {
              logger.log("MongoDB connected successfully");
            });
            connection.on("error", (error) => {
              logger.error(`MongoDB connection error: ${error.message}`);
            });
            connection.on("disconnected", () => {
              logger.warn("MongoDB disconnected");
            });
            return connection;
          }
        };
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
