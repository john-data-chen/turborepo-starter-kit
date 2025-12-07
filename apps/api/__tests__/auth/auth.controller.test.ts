import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { AuthController } from '../../src/modules/auth/auth.controller'

describe('AuthController', () => {
  let controller: AuthController
  let authService: { login: Mock }
  let logger: { log: Mock; error: Mock; warn: Mock; debug: Mock }

  beforeEach(() => {
    authService = {
      login: vi.fn()
    }
    logger = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    }

    // Manually instantiate AuthController with the mock AuthService and Logger
    controller = new AuthController(authService as any)
    ;(controller as any).logger = logger // Manually inject logger
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('login', () => {
    it('should return user and access_token', async () => {
      const user = {
        _id: '1',
        email: 'test@test.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const result = { user, access_token: 'token' }
      const req = {
        user,
        headers: { origin: 'http://localhost:3000' },
        method: 'POST',
        cookies: {}
      }
      const res = {
        cookie: vi.fn(),
        clearCookie: vi.fn(),
        getHeaders: vi.fn().mockReturnValue({})
      }

      authService.login.mockResolvedValue(result as any)

      expect(await controller.login(req, res)).toEqual(result)
      expect(res.cookie).toHaveBeenCalledTimes(2)
    })
  })

  describe('getProfile', () => {
    it('should return user from request', () => {
      const user = { _id: '1', email: 'test@test.com', name: 'Test User' }
      const req = {
        user,
        headers: { origin: 'http://localhost:3000' },
        cookies: {}
      }

      expect(controller.getProfile(req)).toEqual(user)
    })
  })

  describe('logout', () => {
    it('should clear cookies and return a message', async () => {
      const req = {
        user: { _id: '1', email: 'test@test.com' },
        headers: { origin: 'http://localhost:3000' },
        cookies: {}
      }
      const res = {
        clearCookie: vi.fn()
      }

      expect(await controller.logout(req, res)).toEqual({ message: 'Successfully logged out' })
      expect(res.clearCookie).toHaveBeenCalledTimes(2)
    })
  })
})
