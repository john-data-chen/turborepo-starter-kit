import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { User } from '../../src/modules/users/schemas/users.schema'
import { UserService } from '../../src/modules/users/users.service'

describe('UserService', () => {
  let service: UserService
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: vi.fn(),
            find: vi.fn()
          }
        }
      ]
    }).compile()

    service = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const userModel = module.get(getModelToken(User.name))
      userModel.findOne.mockReturnValue({ exec: vi.fn().mockResolvedValue({}) })

      await service.findByEmail('test@test.com')

      expect(userModel.findOne).toHaveBeenCalledWith({ email: 'test@test.com' })
    })
  })

  describe('findAll', () => {
    it('should find all users', async () => {
      const userModel = module.get(getModelToken(User.name))
      userModel.find.mockReturnValue({ exec: vi.fn().mockResolvedValue([]) })

      await service.findAll()

      expect(userModel.find).toHaveBeenCalled()
    })
  })

  describe('searchByName', () => {
    it('should search users by name', async () => {
      const userModel = module.get(getModelToken(User.name))
      userModel.find.mockReturnValue({ exec: vi.fn().mockResolvedValue([]) })

      await service.searchByName('test')

      expect(userModel.find).toHaveBeenCalledWith({ name: { $regex: 'test', $options: 'i' } })
    })
  })
})
