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
    if (!email) {
      return null
    }

    try {
      const user = await this.userService.findByEmail(email)
      return user
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const stack = error instanceof Error ? error.stack : undefined
      this.logger.error(`Error validating user: ${errorMessage}`, stack)
      throw new Error('Authentication failed. Please try again.')
    }
  }

  async login(user: User) {
    try {
      const payload = { email: user.email, sub: user._id }
      const access_token = this.jwtService.sign(payload)

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
