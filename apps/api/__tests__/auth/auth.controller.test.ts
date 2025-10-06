import { Test, TestingModule } from '@nestjs/testing'
import { vi } from 'vitest'
import { AuthController } from '../../src/modules/auth/auth.controller'
import { AuthService } from '../../src/modules/auth/auth.service'
import { EmailAuthGuard } from '../../src/modules/auth/guards/email-auth.guard'
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard'

describe('AuthController', () => {
  let controller: AuthController
  let authService: AuthService
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: vi.fn()
          }
        }
      ]
    })
      .overrideGuard(EmailAuthGuard)
      .useValue({ canActivate: vi.fn(() => true) })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: vi.fn(() => true) })
      .compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('login', () => {
    it('should return user and access_token', async () => {
      const user = { _id: '1', email: 'test@test.com', name: 'Test User' }
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

      vi.spyOn(authService, 'login').mockResolvedValue(result)

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
