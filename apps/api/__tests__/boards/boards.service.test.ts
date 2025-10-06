import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Model } from 'mongoose'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BoardService } from '../../src/modules/boards/boards.service'
import { Board } from '../../src/modules/boards/schemas/boards.schema'
import { ProjectsService } from '../../src/modules/projects/projects.service'
import { TasksService } from '../../src/modules/tasks/tasks.service'

// Define a mock class for the BoardModel
class MockBoardModel {
  save: any
  populate: any
  exec: any

  constructor(data?: any) {
    // Mock instance methods
    this.save = vi.fn().mockResolvedValue(data)
    this.populate = vi.fn().mockReturnThis()
    this.exec = vi.fn().mockResolvedValue(data)
  }

  // Mock static methods
  static find = vi.fn().mockReturnThis()
  static findOne = vi.fn().mockReturnThis()
  static findById = vi.fn().mockReturnThis()
  static create = vi.fn()
  static findByIdAndUpdate = vi.fn().mockReturnThis()
  static deleteOne = vi.fn().mockReturnThis()
  static findOneAndUpdate = vi.fn().mockReturnThis()
  static aggregate = vi.fn().mockReturnThis()
}

describe('BoardService', () => {
  let service: BoardService
  let boardModel: typeof MockBoardModel & Model<Board>
  let projectsService: ProjectsService
  // oxlint-disable-next-line no-unused-vars
  let tasksService: TasksService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: getModelToken(Board.name),
          useValue: MockBoardModel
        },
        {
          provide: ProjectsService,
          useValue: {
            findByBoardId: vi.fn(),
            deleteByBoardId: vi.fn().mockResolvedValue({ deletedCount: 1 }) // Mock deletedCount
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
    boardModel = module.get<typeof MockBoardModel & Model<Board>>(getModelToken(Board.name))
    projectsService = module.get<ProjectsService>(ProjectsService)
    tasksService = module.get<TasksService>(TasksService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a board', async () => {
      const createBoardDto = { name: 'Test Board', owner: '60f6e1b3b3f3b3b3b3f3b3b3' }
      const mockBoardInstance = new MockBoardModel({ ...createBoardDto, _id: '1', owner: '1' })

      // Mock the static create method to return the mock instance
      MockBoardModel.create = vi.fn().mockResolvedValue(mockBoardInstance)

      const result = await service.create(createBoardDto as any)

      expect(mockBoardInstance.save).toHaveBeenCalled()
      expect(result).toEqual(mockBoardInstance)
    })
  })

  describe('findAll', () => {
    it('should find all boards for a user', async () => {
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      ;(boardModel.aggregate as vi.Mock).mockReturnValue({ exec: vi.fn().mockResolvedValue([]) })

      await service.findAll(userId)

      expect(boardModel.aggregate).toHaveBeenCalledTimes(2)
    })
  })

  describe('findOne', () => {
    it('should find a board by id', async () => {
      const boardId = '60f6e1b3b3f3b3b3b3f3b3b4'
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      ;(boardModel.aggregate as vi.Mock).mockReturnValue({ exec: vi.fn().mockResolvedValue([{}]) })

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

      ;(boardModel.findById as vi.Mock).mockReturnValue({ exec: vi.fn().mockResolvedValue(board) })
      ;(boardModel.findByIdAndUpdate as vi.Mock).mockReturnValue({ exec: vi.fn().mockResolvedValue(board) })

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

      ;(boardModel.findById as vi.Mock).mockReturnValue({ exec: vi.fn().mockResolvedValue(board) })
      ;(boardModel.deleteOne as vi.Mock).mockReturnValue({ exec: vi.fn().mockResolvedValue({ deletedCount: 1 }) })
      ;(projectsService.deleteByBoardId as vi.Mock).mockResolvedValue({ deletedCount: 0 })

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

      ;(boardModel.findOneAndUpdate as vi.Mock).mockReturnValue({ exec: vi.fn().mockResolvedValue({}) })

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

      ;(boardModel.findOneAndUpdate as vi.Mock).mockReturnValue({ exec: vi.fn().mockResolvedValue({}) })

      await service.removeMember(boardId, userId, memberId)

      expect(boardModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: boardId, owner: userId },
        { $pull: { members: memberId } },
        { new: true }
      )
    })
  })
})
