import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

import { UserService } from "../../users/users.service";

interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly userService: UserService,
    configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.fromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken()
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET")
    });
  }

  private static fromCookie(req: Request): string | null {
    if (req.cookies?.jwt) {
      return req.cookies.jwt;
    }
    return null;
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.userService.findByEmail(payload.email);

      if (!user) {
        this.logger.error(`User not found for ID: ${payload.sub}`);
        throw new UnauthorizedException("User not found");
      }

      return {
        _id: user._id,
        email: user.email
      };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof Error) {
        this.logger.error(`Error validating JWT: ${error.message}`, error.stack);
      } else {
        this.logger.error("Unknown error validating JWT", error);
      }
      throw new UnauthorizedException("Invalid token");
    }
  }
}
