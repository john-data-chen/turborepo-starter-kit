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
    this.logger.log(`[AuthController] Login endpoint called`);
    this.logger.debug(`[AuthController] Request method: ${req.method}`);
    this.logger.debug(
      `[AuthController] Request headers: ${JSON.stringify(req.headers, null, 2)}`
    );
    this.logger.debug(
      `[AuthController] Request body: ${JSON.stringify(req.body, null, 2)}`
    );

    if (!req.user) {
      const errorMsg = 'No user object found in request after authentication';
      this.logger.error(`[AuthController] ${errorMsg}`);
      throw new UnauthorizedException(errorMsg);
    }

    this.logger.log(
      `[AuthController] Processing login for user: ${req.user.email}`
    );
    this.logger.debug(
      `[AuthController] User object: ${JSON.stringify(
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
      console.log('[AuthController] Login successful, token generated');

      this.logger.log(
        `[AuthController] Login successful for user: ${req.user.email}`
      );

      // Set secure cookie settings
      const isProduction = process.env.NODE_ENV === 'production';
      const isVercel = process.env.VERCEL === '1';

      // Domain settings for Vercel
      const domain = isProduction && isVercel ? '.vercel.app' : undefined;

      // Cookie settings that match frontend
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction, // true in production for HTTPS
        sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site in production
        domain, // Required for cross-subdomain cookies
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days to match frontend
        path: '/'
      };

      // Set the JWT cookie
      res.cookie('jwt', result.access_token, cookieOptions);

      // Also set a non-httpOnly cookie for client-side access if needed
      res.cookie('isAuthenticated', 'true', {
        ...cookieOptions,
        httpOnly: false // Allow client-side access
      });

      // Log the cookie settings for debugging
      console.log('Setting cookie with settings:', {
        domain,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        isVercel,
        isProduction
      });

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
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res) {
    const isProduction = process.env.NODE_ENV === 'production';
    const isVercel = process.env.VERCEL === '1';

    // Clear the JWT cookie with the same options used when setting it
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      domain: isProduction && isVercel ? '.vercel.app' : undefined,
      path: '/',
      maxAge: 0 // Expire immediately
    };

    res.clearCookie('jwt', cookieOptions);

    // Log the cookie clearing for debugging
    console.log('Clearing cookie with options:', cookieOptions);

    return { message: 'Successfully logged out' };
  }
}
