import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
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
    return null;
  }

  async validate(payload: any) {
    if (!payload.sub || !payload.email) {
      throw new Error('Invalid token payload - missing required fields');
    }

    // The returned object will be attached to the request object as req.user
    // Make sure to use _id instead of id to match MongoDB schema
    return {
      _id: payload.sub, // This should match the user._id in MongoDB
      email: payload.email
    };
  }
}
