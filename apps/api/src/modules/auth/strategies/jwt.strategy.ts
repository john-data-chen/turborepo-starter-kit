import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserService } from '../../users/users.service'

interface JwtPayload {
  sub: string
  email: string
  iat?: number
  exp?: number
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.fromCookie, ExtractJwt.fromAuthHeaderAsBearerToken()]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET
    })
  }

  private static fromCookie(req: Request): string | null {
    const requestId = Math.random().toString(36).substring(2, 8)
    console.log(`[${requestId}] [JwtStrategy] Extracting JWT from request`)
    console.log(`[${requestId}] [JwtStrategy] Request URL: ${req.url}`)
    console.log(`[${requestId}] [JwtStrategy] Request method: ${req.method}`)
    console.log(`[${requestId}] [JwtStrategy] Request origin: ${req.headers.origin}`)
    console.log(`[${requestId}] [JwtStrategy] Request host: ${req.headers.host}`)

    // First try to get JWT from cookies
    if (req.cookies && req.cookies.jwt) {
      console.log(`[${requestId}] [JwtStrategy] Found JWT in cookies, length: ${req.cookies.jwt.length}`)
      console.log(`[${requestId}] [JwtStrategy] JWT cookie value preview: ${req.cookies.jwt.substring(0, 50)}...`)
      return req.cookies.jwt
    }

    // Check for JWT in Authorization header as fallback
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      console.log(`[${requestId}] [JwtStrategy] Found JWT in Authorization header`)
      return authHeader.substring(7) // Remove 'Bearer ' prefix
    }

    // Debug: Log all cookies and headers for troubleshooting
    console.log(`[${requestId}] [JwtStrategy] JWT not found in cookies or Authorization header`, {
      cookies: req.cookies,
      cookieHeader: req.headers.cookie,
      allCookieKeys: req.cookies ? Object.keys(req.cookies) : 'no cookies object',
      headers: {
        cookie: req.headers.cookie ? `present (${req.headers.cookie.length} chars)` : 'missing',
        authorization: req.headers.authorization ? 'present' : 'missing',
        host: req.headers.host,
        origin: req.headers.origin,
        referer: req.headers.referer,
        'user-agent': req.headers['user-agent']
      }
    })

    return null
  }

  async validate(payload: JwtPayload) {
    const logger = new Logger('JwtStrategy')
    logger.log(`Validating JWT payload for user: ${payload.email} (${payload.sub})`)

    try {
      // First try to find user by email since we don't have a direct ID lookup
      const user = await this.userService.findByEmail(payload.email)

      if (!user) {
        logger.error(`User not found for ID: ${payload.sub}`)
        throw new UnauthorizedException('User not found')
      }

      logger.log(`User authenticated: ${user.email} (ID: ${user._id})`)
      return {
        _id: user._id,
        email: user.email
        // Add any other user fields you need
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error validating JWT: ${error.message}`, error.stack)
      } else {
        logger.error('Unknown error validating JWT', error)
      }
      throw new UnauthorizedException('Invalid token')
    }
  }
}
