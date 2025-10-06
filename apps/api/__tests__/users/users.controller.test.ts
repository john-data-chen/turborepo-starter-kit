import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard'
import { UserController } from '../../src/modules/users/users.controller'
import { UserService } from '../../src/modules/users/users.service'

describe('UserController', () => {
  let controller: UserController
  let service: UserService
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: vi.fn(),
            searchByName: vi.fn()
          }
        }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(createMock<JwtAuthGuard>())
      .compile()

    controller = module.get<UserController>(UserController)
    service = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = []
      vi.spyOn(service, 'findAll').mockResolvedValue(result as any)
      expect(await controller.findAll()).toEqual({ users: result })
    })
  })

  describe('search', () => {
    it('should return an array of users', async () => {
      const result = []
      vi.spyOn(service, 'searchByName').mockResolvedValue(result as any)
      expect(await controller.search('test')).toEqual({ users: result })
    })
  })
})
