import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { vi } from 'vitest'
import { BoardService } from '../../src/modules/boards/boards.service'
import { Board } from '../../src/modules/boards/schemas/boards.schema'
import { ProjectsService } from '../../src/modules/projects/projects.service'
import { TasksService } from '../../src/modules/tasks/tasks.service'

describe('BoardService', () => {
  let service: BoardService
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: getModelToken(Board.name),
          useValue: {
            ...vi.fn().mockImplementation(() => ({
              save: vi.fn().mockResolvedValue({}),
              populate: vi.fn().mockReturnThis(),
              exec: vi.fn().mockResolvedValue({})
            })),
            aggregate: vi.fn().mockResolvedValue([]),
            find: vi.fn(),
            findOne: vi.fn(),
            findById: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue({}) }),
            create: vi.fn(),
            findByIdAndUpdate: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue({}) }),
            deleteOne: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue({ deletedCount: 1 }) }),
            findOneAndUpdate: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue({}) })
          }
        },
        {
          provide: ProjectsService,
          useValue: {
            findByBoardId: vi.fn(),
            deleteByBoardId: vi.fn()
          }
        },
        {
          provide: TasksService,
          useValue: {
            deleteTasksByProjectId: vi.fn()
          }
        }
      ]
    }).compile()

    service = module.get<BoardService>(BoardService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a board', async () => {
      const createBoardDto = { name: 'Test Board', owner: '60f6e1b3b3f3b3b3b3f3b3b3' }
      const mockBoard = { ...createBoardDto, _id: '1', save: vi.fn().mockResolvedValue({}) }

      const boardModel = module.get(getModelToken(Board.name))
      boardModel.mockReturnValue(mockBoard)

      const result = await service.create(createBoardDto as any)

      expect(mockBoard.save).toHaveBeenCalled()
    })
  })

  describe('findAll', () => {
    it('should find all boards for a user', async () => {
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      const boardModel = module.get(getModelToken(Board.name))
      boardModel.aggregate.mockResolvedValue([])

      await service.findAll(userId)

      expect(boardModel.aggregate).toHaveBeenCalledTimes(2)
    })
  })

  describe('findOne', () => {
    it('should find a board by id', async () => {
      const boardId = '60f6e1b3b3f3b3b3b3f3b3b4'
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      const boardModel = module.get(getModelToken(Board.name))
      boardModel.aggregate.mockResolvedValue([{}])

      await service.findOne(boardId, userId)

      expect(boardModel.aggregate).toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('should update a board', async () => {
      const boardId = '60f6e1b3b3f3b3b3b3f3b3b4'
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      const updateBoardDto = { name: 'Test Board Updated' }
      const board = { _id: boardId, owner: userId, members: [], save: vi.fn() }
      const boardModel = module.get(getModelToken(Board.name))
      boardModel.findById.mockReturnValue({ exec: vi.fn().mockResolvedValue(board) })
      boardModel.findByIdAndUpdate.mockReturnValue({ exec: vi.fn().mockResolvedValue(board) })

      await service.update(boardId, updateBoardDto, userId)

      expect(boardModel.findById).toHaveBeenCalledWith(boardId)
      expect(boardModel.findByIdAndUpdate).toHaveBeenCalledWith(boardId, { $set: updateBoardDto }, { new: true })
    })
  })

  describe('remove', () => {
    it('should remove a board', async () => {
      const boardId = '60f6e1b3b3f3b3b3b3f3b3b4'
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      const board = { _id: boardId, owner: { equals: () => true }, members: [] }
      const boardModel = module.get(getModelToken(Board.name))
      boardModel.findById.mockReturnValue({ exec: vi.fn().mockResolvedValue(board) })
      boardModel.deleteOne.mockReturnValue({ exec: vi.fn().mockResolvedValue({ deletedCount: 1 }) })

      const projectsService = module.get(ProjectsService)
      vi.spyOn(projectsService, 'findByBoardId').mockResolvedValue([])

      await service.remove(boardId, userId)

      expect(boardModel.findById).toHaveBeenCalledWith(boardId)
      expect(boardModel.deleteOne).toHaveBeenCalledWith({ _id: boardId })
    })
  })

  describe('addMember', () => {
    it('should add a member to a board', async () => {
      const boardId = '60f6e1b3b3f3b3b3b3f3b3b4'
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      const memberId = '60f6e1b3b3f3b3b3b3f3b3b5'
      const boardModel = module.get(getModelToken(Board.name))
      boardModel.findOneAndUpdate.mockReturnValue({ exec: vi.fn().mockResolvedValue({}) })

      await service.addMember(boardId, userId, memberId)

      expect(boardModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: boardId, owner: userId },
        { $addToSet: { members: memberId } },
        { new: true }
      )
    })
  })

  describe('removeMember', () => {
    it('should remove a member from a board', async () => {
      const boardId = '60f6e1b3b3f3b3b3b3f3b3b4'
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      const memberId = '60f6e1b3b3f3b3b3b3f3b3b5'
      const boardModel = module.get(getModelToken(Board.name))
      boardModel.findOneAndUpdate.mockReturnValue({ exec: vi.fn().mockResolvedValue({}) })

      await service.removeMember(boardId, userId, memberId)

      expect(boardModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: boardId, owner: userId },
        { $pull: { members: memberId } },
        { new: true }
      )
    })
  })
})
