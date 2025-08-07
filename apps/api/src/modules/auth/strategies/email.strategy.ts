import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-custom';

import { AuthService } from '../auth.service';

// Enable debug logging for this file
const DEBUG = true;

@Injectable()
export class EmailStrategy extends PassportStrategy(Strategy, 'email') {
  private readonly logger = new Logger(EmailStrategy.name);

  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: Request): Promise<any> {
    const { v4: uuidv4 } = require('uuid');
    const requestId = uuidv4();

    // Detailed request logging
    const logData = {
      requestId,
      method: req.method,
      url: req.url,
      headers: {
        'content-type': req.headers['content-type'],
        origin: req.headers.origin,
        'user-agent': req.headers['user-agent']
      },
      body: req.body
    };

    this.logger.log(
      `[${requestId}] [EmailStrategy] Starting validation for request`,
      DEBUG ? JSON.stringify(logData, null, 2) : ''
    );

    const { email } = req.body;

    if (!email) {
      this.logger.warn(
        `[${requestId}] [EmailStrategy] No email provided in request body`,
        DEBUG ? JSON.stringify({ body: req.body }, null, 2) : ''
      );
      throw new UnauthorizedException('Email is required');
    }

    this.logger.log(
      `[${requestId}] [EmailStrategy] Validating user with email: ${email}`
    );

    let user;
    try {
      user = await this.authService.validateUser(email);
      this.logger.log(
        `[${requestId}] [EmailStrategy] AuthService.validateUser completed`,
        DEBUG && user
          ? JSON.stringify(
              {
                userId: user._id?.toString(),
                email: user.email,
                name: user.name
              },
              null,
              2
            )
          : 'No user found'
      );
    } catch (error) {
      this.logger.error(
        `[${requestId}] [EmailStrategy] Error in AuthService.validateUser`,
        error instanceof Error ? error.stack : String(error)
      );
      throw new UnauthorizedException('Authentication failed');
    }

    if (!user) {
      this.logger.warn(
        `[${requestId}] [EmailStrategy] User not found with email: ${email}`,
        DEBUG
          ? `Available fields in request: ${Object.keys(req.body).join(', ')}`
          : ''
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(
      `[${requestId}] [EmailStrategy] User validated successfully: ${user.email}`
    );
    return user;
  }
}
