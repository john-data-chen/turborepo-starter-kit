import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../user/user.module";
import { LocalStrategy } from "./strategies/local-auth.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    UserModule, // 確保可以注入 UserService
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET, // 從環境變數讀取
      signOptions: { expiresIn: "1d" }, // Token 有效期
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
