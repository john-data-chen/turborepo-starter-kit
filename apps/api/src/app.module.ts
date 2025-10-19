import { Logger, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './modules/auth/auth.module'
import { BoardsModule } from './modules/boards/boards.module'
import { DatabaseModule } from './modules/database/database.module'
import { ProjectsModule } from './modules/projects/projects.module'
import { TasksModule } from './modules/tasks/tasks.module'
import { UsersModule } from './modules/users/users.module'

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),

    DatabaseModule,
    AuthModule,
    BoardsModule,
    ProjectsModule,
    TasksModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule implements NestModule {
  private readonly logger = new Logger('AppModule')

  configure(consumer: MiddlewareConsumer) {
    // HTTP request/response logging removed to reduce log verbosity
    // Error logging is preserved in individual services
  }
}
