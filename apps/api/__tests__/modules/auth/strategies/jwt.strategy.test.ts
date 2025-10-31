import { UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { JwtStrategy } from '../../../../src/modules/auth/strategies/jwt.strategy'
import { UserService } from '../../../../src/modules/users/users.service'

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy
  let userService: {
    findByEmail: Mock
  }

  const mockUser = {
    _id: '60f6e1b3b3f3b3b3b3f3b3b3',
    email: 'test@test.com'
  }

  beforeEach(async () => {
    // Mock JWT_SECRET environment variable
    process.env.JWT_SECRET = 'test-secret-key'

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: JwtStrategy,
          useFactory: (userService: UserService) => new JwtStrategy(userService),
          inject: [UserService]
        },
        {
          provide: UserService,
          useValue: {
            findByEmail: vi.fn()
          }
        }
      ]
    }).compile()

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy)
    userService = module.get(UserService)
  })

  describe('validate', () => {
    it('should return the user if found', async () => {
      const payload = { sub: mockUser._id, email: mockUser.email }
      userService.findByEmail.mockResolvedValue(mockUser as any)

      const result = await jwtStrategy.validate(payload)

      expect(userService.findByEmail).toHaveBeenCalledWith(payload.email)
      expect(result).toEqual({ _id: mockUser._id, email: mockUser.email })
    })

    it('should throw UnauthorizedException if user not found', async () => {
      const payload = { sub: mockUser._id, email: mockUser.email }
      userService.findByEmail.mockResolvedValue(null)

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException on error', async () => {
      const payload = { sub: mockUser._id, email: mockUser.email }
      userService.findByEmail.mockRejectedValue(new Error('DB Error'))

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException)
    })

    it('should handle unknown error types', async () => {
      const payload = { sub: mockUser._id, email: mockUser.email }
      userService.findByEmail.mockRejectedValue('Unknown error string')

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException)
    })
  })
})
