import { Types } from 'mongoose'
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest'
import { AuthService } from '../../src/modules/auth/auth.service'
import { User } from '../../src/modules/users/schemas/users.schema'

describe('AuthService', () => {
  let service: AuthService
  let userService: { findByEmail: Mock }
  let jwtService: { sign: Mock }
  let logger: { log: Mock; error: Mock; warn: Mock; debug: Mock }

  beforeEach(() => {
    userService = {
      findByEmail: vi.fn()
    }
    jwtService = {
      sign: vi.fn()
    }
    logger = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    }

    // Manually instantiate AuthService with the mocks
    service = new AuthService(userService as any, jwtService as any)
    ;(service as any).logger = logger // Manually inject logger
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('validateUser', () => {
    it('should return user if found', async () => {
      const user = { email: 'test@test.com' } as User
      userService.findByEmail.mockResolvedValue(user)

      expect(await service.validateUser('test@test.com')).toEqual(user)
    })

    it('should return null if user not found', async () => {
      userService.findByEmail.mockResolvedValue(null)

      expect(await service.validateUser('test@test.com')).toBeNull()
    })

    it('should return null if email is empty', async () => {
      expect(await service.validateUser('')).toBeNull()
      expect(logger.warn).toHaveBeenCalled()
    })

    it('should throw error if validation fails', async () => {
      userService.findByEmail.mockRejectedValue(new Error('Database error'))

      await expect(service.validateUser('test@test.com')).rejects.toThrow('Authentication failed. Please try again.')
      expect(logger.error).toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('should return access_token and user', async () => {
      const user = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
        email: 'test@test.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date()
      } as User
      const token = 'token'
      jwtService.sign.mockReturnValue(token)

      const result = await service.login(user)

      expect(result.access_token).toEqual(token)
      expect(result.user).toEqual(user)
    })

    it('should throw error if JWT sign fails', async () => {
      const user = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
        email: 'test@test.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date()
      } as User
      jwtService.sign.mockImplementation(() => {
        throw new Error('JWT error')
      })

      await expect(service.login(user)).rejects.toThrow('JWT error')
      expect(logger.error).toHaveBeenCalled()
    })
  })
})
