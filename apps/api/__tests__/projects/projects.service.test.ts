import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Types } from 'mongoose'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BoardService } from '../../src/modules/boards/boards.service'
import { ProjectsService } from '../../src/modules/projects/projects.service'
import { Project } from '../../src/modules/projects/schemas/projects.schema'
import { TasksService } from '../../src/modules/tasks/tasks.service'

describe('ProjectsService', () => {
  let service: ProjectsService
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getModelToken(Project.name),
          useValue: vi
            .fn()
            .mockImplementation((data) => ({
              ...data,
              save: vi.fn().mockResolvedValue({ ...data, _id: '1' }),
              populate: vi.fn().mockReturnThis(),
              lean: vi.fn().mockResolvedValue({ ...data, _id: '1' })
            }))
            .mockReturnValue({
              find: vi
                .fn()
                .mockReturnValue({ populate: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue([]) }),
              findOne: vi.fn().mockReturnValue({
                sort: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                lean: vi.fn().mockResolvedValue(null)
              }),
              findById: vi
                .fn()
                .mockReturnValue({ populate: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue({}) }),
              create: vi.fn(),
              save: vi.fn(),
              exec: vi.fn(),
              deleteMany: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue({ deletedCount: 1 }) }),
              findByIdAndUpdate: vi
                .fn()
                .mockReturnValue({ populate: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue({}) }),
              deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
              updateMany: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue({ modifiedCount: 1 }) }),
              exists: vi.fn().mockResolvedValue(null),
              updateOne: vi.fn().mockResolvedValue({ acknowledged: true })
            })
        },
        {
          provide: TasksService,
          useValue: {
            deleteTasksByProjectId: vi.fn()
          }
        },
        {
          provide: BoardService,
          useValue: {
            findOne: vi.fn()
          }
        }
      ]
    }).compile()

    service = module.get<ProjectsService>(ProjectsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a project', async () => {
      const createProjectDto = {
        title: 'Test Project',
        owner: '60f6e1b3b3f3b3b3b3f3b3b3',
        boardId: '60f6e1b3b3f3b3b3b3f3b3b4'
      }
      const mockProjectInstance = {
        ...createProjectDto,
        _id: '1',
        save: vi.fn().mockResolvedValue({ ...createProjectDto, _id: '1' })
      }

      const projectModel = module.get(getModelToken(Project.name))

      // Mock the constructor
      ;(projectModel as any).mockImplementation(() => mockProjectInstance)

      // Mock static methods needed for create
      projectModel.findOne = vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(null)
      })
      projectModel.findById = vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue({ ...createProjectDto, _id: '1' })
      })

      // oxlint-disable-next-line no-unused-vars
      const result = await service.create(createProjectDto as any)

      expect(mockProjectInstance.save).toHaveBeenCalled()
    })
  })

  describe('deleteByBoardId', () => {
    it('should delete projects by board id', async () => {
      const boardId = '60f6e1b3b3f3b3b3b3f3b3b4'
      const projectModel = module.get(getModelToken(Project.name))
      projectModel.deleteMany = vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue({ deletedCount: 1 }) })

      const result = await service.deleteByBoardId(boardId)

      expect(result.deletedCount).toEqual(1)
    })
  })

  describe('findByBoardId', () => {
    it('should find projects by board id', async () => {
      const boardId = '60f6e1b3b3f3b3b3b3f3b3b4'
      const projectModel = module.get(getModelToken(Project.name))
      projectModel.find = vi
        .fn()
        .mockReturnValue({ populate: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue([]) })

      await service.findByBoardId(boardId)

      expect(projectModel.find).toHaveBeenCalledWith({ board: new Types.ObjectId(boardId) })
    })
  })

  describe('update', () => {
    it('should update a project', async () => {
      const projectId = '60f6e1b3b3f3b3b3b3f3b3b5'
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      const updateProjectDto = { title: 'Test Project Updated' }
      const project = { _id: projectId, owner: userId, board: '60f6e1b3b3f3b3b3f3b3b3b4' }
      const projectModel = module.get(getModelToken(Project.name))
      projectModel.findById = vi.fn().mockResolvedValue(project)
      projectModel.findByIdAndUpdate = vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(project)
      })

      await service.update(projectId, updateProjectDto as any, userId)

      expect(projectModel.findById).toHaveBeenCalledWith(projectId)
      expect(projectModel.findByIdAndUpdate).toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('should remove a project', async () => {
      const projectId = '60f6e1b3b3f3b3b3b3f3b3b5'
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      const project = {
        _id: projectId,
        owner: { toString: () => userId },
        board: '60f6e1b3b3f3b3b3b3f3b3b4',
        orderInBoard: 0
      }
      const projectModel = module.get(getModelToken(Project.name))
      projectModel.findById = vi.fn().mockResolvedValue(project)
      projectModel.deleteOne = vi.fn().mockResolvedValue({ deletedCount: 1 })
      projectModel.updateMany = vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue({ modifiedCount: 1 }) })

      const tasksService = module.get(TasksService)
      vi.spyOn(tasksService, 'deleteTasksByProjectId').mockResolvedValue({ deletedCount: 0 })

      await service.remove(projectId, userId)

      expect(projectModel.findById).toHaveBeenCalledWith(projectId)
      expect(projectModel.deleteOne).toHaveBeenCalledWith({ _id: projectId })
    })
  })

  describe('addMemberIfNotExists', () => {
    it('should add a member to a project if not exists', async () => {
      const projectId = '60f6e1b3b3f3b3b3b3f3b3b5'
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      const projectModel = module.get(getModelToken(Project.name))
      projectModel.exists = vi.fn().mockResolvedValue(null)
      projectModel.updateOne = vi.fn().mockResolvedValue({ acknowledged: true })

      await service.addMemberIfNotExists(projectId, userId)

      expect(projectModel.updateOne).toHaveBeenCalledWith(
        { _id: projectId },
        { $addToSet: { members: new Types.ObjectId(userId) } }
      )
    })
  })
})
