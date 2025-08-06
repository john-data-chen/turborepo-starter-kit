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

      // Set cookie with proper domain for Vercel
      const isProduction = process.env.NODE_ENV === 'production';
      const isVercel = process.env.VERCEL === '1';

      // For Vercel production, we need to set the domain to .vercel.app
      // For local development, we don't set the domain
      const domain = isProduction && isVercel ? '.vercel.app' : undefined;

      // Set the JWT cookie
      res.cookie('jwt', result.access_token, {
        httpOnly: true,
        secure: isProduction, // Use secure in production
        sameSite: isProduction ? 'none' : 'lax', // none for cross-site in production
        domain, // Set the domain for cross-subdomain cookies
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
        // Required for cross-site cookies
        ...(isProduction ? { sameSite: 'none', secure: true } : {})
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
