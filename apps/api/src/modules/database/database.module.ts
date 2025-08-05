import {
  Global,
  Inject,
  Injectable,
  Logger,
  Module,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  getConnectionToken,
  MongooseModule,
  MongooseModuleOptions
} from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: mongoose.Connection
  ) {}

  async onModuleInit() {
    this.connection.on('connected', () => {
      this.logger.log('Successfully connected to MongoDB');
    });

    this.connection.on('error', (error: Error) => {
      this.logger.error(
        `MongoDB connection error: ${error.message}`,
        error.stack
      );
    });

    this.connection.on('disconnected', () => {
      this.logger.warn('MongoDB disconnected');
    });

    process.on('SIGINT', this.gracefulShutdown.bind(this));
  }

  async onModuleDestroy() {
    await this.gracefulShutdown();
  }

  private async gracefulShutdown() {
    try {
      await this.connection.close();
      this.logger.log('MongoDB connection closed through app termination');
      process.exit(0);
    } catch (error) {
      this.logger.error('Error closing MongoDB connection', error);
      process.exit(1);
    }
  }
}

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (
        configService: ConfigService
      ): Promise<MongooseModuleOptions> => {
        const _logger = new Logger('MongoDB');
        const uri = configService.get<string>('DATABASE_URL');

        if (!uri) {
          throw new Error(
            'MongoDB connection string (DATABASE_URL) is not defined'
          );
        }

        const isProduction = configService.get('NODE_ENV') === 'production';

        return {
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
          autoIndex: !isProduction
        };
      },
      inject: [ConfigService]
    })
  ],
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: (connection: mongoose.Connection) => connection,
      inject: [getConnectionToken()]
    },
    DatabaseService
  ],
  exports: [MongooseModule, 'DATABASE_CONNECTION', DatabaseService]
})
export class DatabaseModule {}
