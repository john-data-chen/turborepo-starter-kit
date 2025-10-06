import { Test, TestingModule } from '@nestjs/testing'
import { vi } from 'vitest'
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard'
import { BoardController } from '../../src/modules/boards/boards.controller'
import { BoardService } from '../../src/modules/boards/boards.service'

describe('BoardController', () => {
  let controller: BoardController
  let service: BoardService
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [
        {
          provide: BoardService,
          useValue: {
            create: vi.fn(),
            findAll: vi.fn(),
            findOne: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
            addMember: vi.fn(),
            removeMember: vi.fn()
          }
        }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: vi.fn(() => true) })
      .compile()

    controller = module.get<BoardController>(BoardController)
    service = module.get<BoardService>(BoardService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should create a board', async () => {
      const createBoardDto = { name: 'Test Board', owner: '' }
      const req = { user: { _id: '1' } }
      const result = { ...createBoardDto, _id: '1', owner: '1' }

      vi.spyOn(service, 'create').mockResolvedValue(result as any)

      expect(await controller.create(createBoardDto, req as any)).toEqual(result)
      expect(service.create).toHaveBeenCalledWith({ ...createBoardDto, owner: '1' })
    })
  })

  describe('findAll', () => {
    it('should find all boards for a user', async () => {
      const req = { user: { _id: '1' } }
      const result = { myBoards: [], teamBoards: [] }

      vi.spyOn(service, 'findAll').mockResolvedValue(result)

      expect(await controller.findAll(req as any)).toEqual(result)
      expect(service.findAll).toHaveBeenCalledWith('1')
    })
  })

  describe('findOne', () => {
    it('should find a board by id', async () => {
      const req = { user: { _id: '1' } }
      const result = { _id: '1', name: 'Test Board', owner: '1' }

      vi.spyOn(service, 'findOne').mockResolvedValue(result as any)

      expect(await controller.findOne('1', req as any)).toEqual(result)
      expect(service.findOne).toHaveBeenCalledWith('1', '1')
    })
  })

  describe('update', () => {
    it('should update a board', async () => {
      const updateBoardDto = { name: 'Test Board Updated' }
      const req = { user: { _id: '1' } }
      const result = { _id: '1', name: 'Test Board Updated', owner: '1' }

      vi.spyOn(service, 'update').mockResolvedValue(result as any)

      expect(await controller.update('1', updateBoardDto, req as any)).toEqual(result)
      expect(service.update).toHaveBeenCalledWith('1', updateBoardDto, '1')
    })
  })

  describe('remove', () => {
    it('should remove a board', async () => {
      const req = { user: { _id: '1' } }
      const result = { acknowledged: true, deletedCount: 1 }

      vi.spyOn(service, 'remove').mockResolvedValue(result as any)

      expect(await controller.remove('1', req as any)).toEqual(result)
      expect(service.remove).toHaveBeenCalledWith('1', '1')
    })
  })

  describe('addMember', () => {
    it('should add a member to a board', async () => {
      const req = { user: { _id: '1' } }
      const result = { _id: '1', name: 'Test Board', owner: '1', members: ['2'] }

      vi.spyOn(service, 'addMember').mockResolvedValue(result as any)

      expect(await controller.addMember('1', '2', req as any)).toEqual(result)
      expect(service.addMember).toHaveBeenCalledWith('1', '1', '2')
    })
  })

  describe('removeMember', () => {
    it('should remove a member from a board', async () => {
      const req = { user: { _id: '1' } }
      const result = { _id: '1', name: 'Test Board', owner: '1', members: [] }

      vi.spyOn(service, 'removeMember').mockResolvedValue(result as any)

      expect(await controller.removeMember('1', '2', req as any)).toEqual(result)
      expect(service.removeMember).toHaveBeenCalledWith('1', '1', '2')
    })
  })
})
