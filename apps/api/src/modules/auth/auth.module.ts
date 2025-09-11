import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { UsersModule } from '../users/users.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { EmailStrategy } from './strategies/email.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
  imports: [
    UsersModule, // Ensure UserService is available for injection
    PassportModule.register({ defaultStrategy: 'jwt' }), // Set default strategy
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: '1d',
          algorithm: 'HS256' // Specify the algorithm
        }
      }),
      inject: [ConfigService]
    }),
    ConfigModule.forRoot({
      isGlobal: true
    })
  ],
  providers: [AuthService, EmailStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService] // Export AuthService if needed by other modules
})
export class AuthModule {}
