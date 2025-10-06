import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { vi } from 'vitest'
import { AuthService } from '../../src/modules/auth/auth.service'
import { User } from '../../src/modules/users/schemas/users.schema'
import { UserService } from '../../src/modules/users/users.service'

describe('AuthService', () => {
  let service: AuthService
  let userService: UserService
  let jwtService: JwtService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: vi.fn()
          }
        },
        {
          provide: JwtService,
          useValue: {
            sign: vi.fn()
          }
        }
      ]
    }).compile()

    service = module.get<AuthService>(AuthService)
    userService = module.get<UserService>(UserService)
    jwtService = module.get<JwtService>(JwtService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('validateUser', () => {
    it('should return user if found', async () => {
      const user = { email: 'test@test.com' } as User
      vi.spyOn(userService, 'findByEmail').mockResolvedValue(user)

      expect(await service.validateUser('test@test.com')).toEqual(user)
    })

    it('should return null if user not found', async () => {
      vi.spyOn(userService, 'findByEmail').mockResolvedValue(null)

      expect(await service.validateUser('test@test.com')).toBeNull()
    })
  })

  describe('login', () => {
    it('should return access_token and user', async () => {
      const user = { _id: '1', email: 'test@test.com' } as User
      const token = 'token'
      vi.spyOn(jwtService, 'sign').mockReturnValue(token)

      const result = await service.login(user)

      expect(result.access_token).toEqual(token)
      expect(result.user).toEqual(user)
    })
  })
})
