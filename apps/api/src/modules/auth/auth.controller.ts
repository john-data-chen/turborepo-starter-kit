import {
  Controller,
  Get,
  Logger,
  Post,
  Request,
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
  async login(@Request() req) {
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
      const result = await this.authService.login(req.user);
      this.logger.log(
        `[AuthController] Login successful for user: ${req.user.email}`
      );
      return result;
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
}
