import {
  Controller,
  Get,
  Logger,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { EmailAuthGuard } from './guards/email-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(EmailAuthGuard)
  async login(@Request() req, @Res({ passthrough: true }) res) {
    const requestId = Math.random().toString(36).substring(2, 8);
    this.logger.log(`[${requestId}] [AuthController] Login endpoint called`);
    this.logger.log(
      `[${requestId}] [AuthController] Request method: ${req.method}`
    );
    this.logger.log(
      `[${requestId}] [AuthController] Request origin: ${req.headers.origin}`
    );
    this.logger.log(
      `[${requestId}] [AuthController] Request host: ${req.headers.host}`
    );
    this.logger.log(
      `[${requestId}] [AuthController] User-Agent: ${req.headers['user-agent']}`
    );
    this.logger.log(
      `[${requestId}] [AuthController] Existing cookies: ${JSON.stringify(req.cookies)}`
    );
    this.logger.debug(
      `[${requestId}] [AuthController] Full request headers: ${JSON.stringify(req.headers, null, 2)}`
    );
    this.logger.debug(
      `[${requestId}] [AuthController] Request body: ${JSON.stringify(req.body, null, 2)}`
    );

    if (!req.user) {
      const errorMsg = 'No user object found in request after authentication';
      this.logger.error(`[${requestId}] [AuthController] ${errorMsg}`);
      throw new UnauthorizedException(errorMsg);
    }

    this.logger.log(
      `[${requestId}] [AuthController] Processing login for user: ${req.user.email}`
    );
    this.logger.log(
      `[${requestId}] [AuthController] User object: ${JSON.stringify(
        {
          _id: req.user._id?.toString(),
          email: req.user.email,
          name: req.user.name
        },
        null,
        2
      )}`
    );

    try {
      // Generate JWT token
      const result = await this.authService.login(req.user);
      this.logger.log(
        `[${requestId}] [AuthController] JWT token generated successfully`
      );

      this.logger.log(
        `[${requestId}] [AuthController] Login successful for user: ${req.user.email}`
      );

      // Set secure cookie settings
      const isProduction = process.env.NODE_ENV === 'production';
      const isVercel = process.env.VERCEL === '1';

      this.logger.log(
        `[${requestId}] [AuthController] Environment check - isProduction: ${isProduction}, isVercel: ${isVercel}`
      );

      // Cookie settings that match frontend
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction || isVercel, // Only secure in production HTTPS
        sameSite: (isProduction || isVercel ? 'none' : 'lax') as 'none' | 'lax', // 'none' for cross-site in production, 'lax' for local
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
        // For cross-subdomain cookies, set domain to .vercel.app
        ...(isProduction || isVercel
          ? {
              domain: process.env.COOKIE_DOMAIN || '.vercel.app'
            }
          : {})
      };

      this.logger.log(
        `[${requestId}] [AuthController] Cookie options prepared:`,
        {
          secure: cookieOptions.secure,
          sameSite: cookieOptions.sameSite,
          domain: cookieOptions.domain,
          httpOnly: cookieOptions.httpOnly,
          maxAge: cookieOptions.maxAge,
          path: cookieOptions.path,
          cookieDomainEnv: process.env.COOKIE_DOMAIN,
          requestOrigin: req.headers.origin,
          requestHost: req.headers.host
        }
      );

      // Set the JWT cookie
      res.cookie('jwt', result.access_token, cookieOptions);
      this.logger.log(
        `[${requestId}] [AuthController] JWT cookie set with value length: ${result.access_token.length}`
      );

      // Also set a non-httpOnly cookie for client-side access if needed
      res.cookie('isAuthenticated', 'true', {
        ...cookieOptions,
        httpOnly: false // Allow client-side access
      });
      this.logger.log(
        `[${requestId}] [AuthController] isAuthenticated cookie set`
      );

      // Log response headers that will be sent
      this.logger.log(
        `[${requestId}] [AuthController] Response headers being sent:`,
        {
          'set-cookie': res.getHeaders()['set-cookie'],
          'access-control-allow-credentials':
            res.getHeaders()['access-control-allow-credentials'],
          'access-control-allow-origin':
            res.getHeaders()['access-control-allow-origin']
        }
      );

      // Return user data without the token (it's in the cookie)
      return { user: result.user };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Login failed for user ${req.user?.email || 'unknown'}: ${errorMessage}`,
        stack
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    const requestId = Math.random().toString(36).substring(2, 8);
    this.logger.log(`[${requestId}] [AuthController] Profile endpoint called`);
    this.logger.log(
      `[${requestId}] [AuthController] Request origin: ${req.headers.origin}`
    );
    this.logger.log(
      `[${requestId}] [AuthController] Request host: ${req.headers.host}`
    );
    this.logger.log(
      `[${requestId}] [AuthController] Cookies received: ${JSON.stringify(req.cookies)}`
    );
    this.logger.log(
      `[${requestId}] [AuthController] Authorization header: ${req.headers.authorization || 'missing'}`
    );
    this.logger.log(
      `[${requestId}] [AuthController] User from JWT: ${JSON.stringify(req.user)}`
    );

    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req, @Res({ passthrough: true }) res) {
    const isProduction = process.env.NODE_ENV === 'production';

    // Clear the JWT cookie with the same options used when setting it
    const isVercel = process.env.VERCEL === '1';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction || isVercel, // Only secure in production HTTPS
      sameSite: (isProduction || isVercel ? 'none' : 'lax') as 'none' | 'lax', // Match login settings
      path: '/',
      maxAge: 0, // Expire immediately
      ...(isProduction || isVercel
        ? {
            domain: process.env.COOKIE_DOMAIN || '.vercel.app'
          }
        : {})
    };

    // Clear both possible cookie names
    res.clearCookie('jwt', cookieOptions);
    res.clearCookie('isAuthenticated', { ...cookieOptions, httpOnly: false });

    // Log the cookie clearing for debugging
    console.log('Clearing cookies with options:', {
      ...cookieOptions,
      requestOrigin: req.headers.origin,
      requestHost: req.headers.host
    });

    return { message: 'Successfully logged out' };
  }
}
