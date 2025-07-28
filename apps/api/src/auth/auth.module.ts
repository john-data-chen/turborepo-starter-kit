import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../user/user.module";
import { EmailStrategy } from "./strategies/email.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    UserModule, // Ensure UserService is available for injection
    PassportModule.register({ defaultStrategy: "jwt" }), // Set default strategy
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET") || "your-secret-key",
        signOptions: {
          expiresIn: "1d",
          algorithm: "HS256", // Specify the algorithm
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [AuthService, EmailStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService], // Export AuthService if needed by other modules
})
export class AuthModule {}
