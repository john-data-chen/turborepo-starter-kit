import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { User } from '../users/schemas/users.schema'
import { UserService } from '../users/users.service'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string): Promise<User | null> {
    const requestId = Math.random().toString(36).substring(2, 8)
    this.logger.log(`[${requestId}] [AuthService] Validating user with email: ${email}`)

    if (!email) {
      this.logger.warn(`[${requestId}] [AuthService] Email is required for validation`)
      return null
    }

    try {
      this.logger.debug(`[${requestId}] [AuthService] Looking up user with email: ${email}`)

      // Log the userService instance to ensure it's properly injected
      this.logger.debug(`[${requestId}] [AuthService] UserService instance: ${this.userService ? 'exists' : 'missing'}`)

      const startTime = Date.now()
      const user = await this.userService.findByEmail(email)
      const lookupDuration = Date.now() - startTime

      this.logger.debug(
        `[${requestId}] [AuthService] User lookup completed in ${lookupDuration}ms`,
        {
          userFound: !!user,
          userId: user?._id?.toString(),
          userEmail: user?.email
        }
      );

      if (user) {
        this.logger.debug(
          `[${requestId}] [AuthService] User found: ${JSON.stringify(
            {
              _id: user._id?.toString(),
              email: user.email,
              name: user.name
            },
            null,
            2
          )}`
        )
        return user
      }

      this.logger.warn(`[${requestId}] [AuthService] No user found with email: ${email}`)
      return null
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const stack = error instanceof Error ? error.stack : undefined
      this.logger.error(`[${requestId}] [AuthService] Error validating user: ${errorMessage}`, stack)
      // Don't expose internal errors to the client
      throw new Error('Authentication failed. Please try again.')
    }
  }

  async login(user: User) {
    const requestId = Math.random().toString(36).substring(2, 8)
    this.logger.log(`[${requestId}] [AuthService] Generating JWT for user: ${user.email}`)
    this.logger.debug(
      `[${requestId}] [AuthService] User details for JWT: ${JSON.stringify(
        {
          _id: user._id?.toString(),
          email: user.email,
          name: user.name
        },
        null,
        2
      )}`
    )

    try {
      const payload = { email: user.email, sub: user._id }
      const access_token = this.jwtService.sign(payload)

      this.logger.debug(`JWT generated successfully for user: ${user.email}`)
      return {
        access_token,
        user
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const stack = error instanceof Error ? error.stack : undefined
      this.logger.error(`Error generating JWT for user ${user.email}: ${errorMessage}`, stack)
      throw error
    }
  }
}
