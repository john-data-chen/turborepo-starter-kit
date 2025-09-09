import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { Strategy } from 'passport-custom'

import { AuthService } from '../auth.service'

@Injectable()
export class EmailStrategy extends PassportStrategy(Strategy, 'email') {
  private readonly logger = new Logger(EmailStrategy.name)

  constructor(private authService: AuthService) {
    super()
  }

  async validate(req: Request): Promise<any> {
    const { v4: uuidv4 } = require('uuid')
    const requestId = uuidv4()
    this.logger.log(`[${requestId}] [EmailStrategy] Starting validation for request`)

    const { email } = req.body

    if (!email) {
      this.logger.warn(`[${requestId}] [EmailStrategy] No email provided`)
      throw new UnauthorizedException('Email is required')
    }

    this.logger.log(`[${requestId}] [EmailStrategy] Validating user with email: ${email}`)
    const user = await this.authService.validateUser(email)

    if (!user) {
      this.logger.warn(`[${requestId}] [EmailStrategy] User not found with email: ${email}`)
      throw new UnauthorizedException('Invalid credentials')
    }

    this.logger.log(`[${requestId}] [EmailStrategy] User validated successfully: ${user.email}`)
    return user
  }
}
