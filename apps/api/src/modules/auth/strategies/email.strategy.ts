import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common'
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
    let requestId: string
    try {
      this.logger.debug(`[EmailStrategy] Starting validation for request with body: ${JSON.stringify(req.body)}`)

      // Try dynamic import first
      try {
        const { v4: uuidv4 } = await import('uuid')
        requestId = uuidv4()
        this.logger.debug(`[EmailStrategy] Successfully imported uuid v4`)
      } catch (importError: unknown) {
        const error = importError as Error
        this.logger.error(`[EmailStrategy] Failed to import uuid: ${error.message}`, error.stack)
        // Fallback to Date.now() if uuid import fails
        requestId = `req-${Date.now()}`
        this.logger.warn(`[EmailStrategy] Using fallback request ID: ${requestId}`)
      }

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
    } catch (error: unknown) {
      const err = error as Error
      this.logger.error(
        `[${requestId || 'unknown'}] [EmailStrategy] Error during validation: ${err.message}`,
        err.stack
      )
      throw new InternalServerErrorException('An error occurred during authentication')
    }
  }
}
