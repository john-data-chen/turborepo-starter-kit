import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthService } from '../../src/modules/auth/auth.service'
import { User } from '../../src/modules/users/schemas/users.schema'

describe('AuthService', () => {
  let service: AuthService
  let userService: { findByEmail: vi.Mock }
  let jwtService: { sign: vi.Mock }
  let logger: { log: vi.Mock; error: vi.Mock; warn: vi.Mock; debug: vi.Mock }

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
  })

  describe('login', () => {
    it('should return access_token and user', async () => {
      const user = { _id: '1', email: 'test@test.com' } as User
      const token = 'token'
      jwtService.sign.mockReturnValue(token)

      const result = await service.login(user)

      expect(result.access_token).toEqual(token)
      expect(result.user).toEqual(user)
    })
  })
})
