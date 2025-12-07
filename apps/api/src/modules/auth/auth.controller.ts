import {
  Controller,
  Get,
  Logger,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { EmailAuthGuard } from './guards/email-auth.guard'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(EmailAuthGuard)
  async login(@Request() req, @Res({ passthrough: true }) res) {
    const requestId = Math.random().toString(36).substring(2, 8)

    if (!req.user) {
      const errorMsg = 'No user object found in request after authentication'
      this.logger.error(`[${requestId}] [AuthController] ${errorMsg}`)
      throw new UnauthorizedException(errorMsg)
    }

    try {
      // Generate JWT token
      const result = await this.authService.login(req.user)

      // Set secure cookie settings
      const isProduction = process.env.NODE_ENV === 'production'
      const isVercel = process.env.VERCEL === '1'

      // Cookie settings that match frontend
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction || isVercel, // Only secure in production HTTPS
        sameSite: 'lax' as const, // Try 'lax' instead of 'none' for cross-site
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      }

      // Set the JWT cookie (keep for local development)
      res.cookie('jwt', result.access_token, cookieOptions)

      // Also set a non-httpOnly cookie for client-side access if needed
      res.cookie('isAuthenticated', 'true', {
        ...cookieOptions,
        httpOnly: false // Allow client-side access
      })

      // Return user data AND token for Authorization header fallback
      return {
        user: result.user,
        access_token: result.access_token // Include token for Authorization header
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const stack = error instanceof Error ? error.stack : undefined
      this.logger.error(
        `Login failed for user ${req.user?.email || 'unknown'}: ${errorMessage}`,
        stack
      )
      throw error
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req, @Res({ passthrough: true }) res) {
    const isProduction = process.env.NODE_ENV === 'production'

    // Clear the JWT cookie with the same options used when setting it
    const isVercel = process.env.VERCEL === '1'
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction || isVercel, // Only secure in production HTTPS
      sameSite: 'lax' as const, // Match login settings
      path: '/',
      maxAge: 0 // Expire immediately
    }

    // Clear both possible cookie names
    res.clearCookie('jwt', cookieOptions)
    res.clearCookie('isAuthenticated', { ...cookieOptions, httpOnly: false })

    return { message: 'Successfully logged out' }
  }
}
