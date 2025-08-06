import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserService } from '../../users/users.service';

interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.fromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken()
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET
    });
  }

  private static fromCookie(req: Request): string | null {
    if (req.cookies && req.cookies.jwt) {
      return req.cookies.jwt;
    }
    // Also check Authorization header as fallback
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    return null;
  }

  async validate(payload: JwtPayload) {
    const logger = new Logger('JwtStrategy');
    logger.log(
      `Validating JWT payload for user: ${payload.email} (${payload.sub})`
    );

    try {
      // First try to find user by email since we don't have a direct ID lookup
      const user = await this.userService.findByEmail(payload.email);

      if (!user) {
        logger.error(`User not found for ID: ${payload.sub}`);
        throw new UnauthorizedException('User not found');
      }

      logger.log(`User authenticated: ${user.email} (ID: ${user._id})`);
      return {
        _id: user._id,
        email: user.email
        // Add any other user fields you need
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error validating JWT: ${error.message}`, error.stack);
      } else {
        logger.error('Unknown error validating JWT', error);
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
