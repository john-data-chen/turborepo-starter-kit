import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { vi } from 'vitest'
import { ProjectsService } from '../../src/modules/projects/projects.service'
import { Task } from '../../src/modules/tasks/schemas/tasks.schema'
import { TasksService } from '../../src/modules/tasks/tasks.service'

describe('TasksService', () => {
  let service: TasksService
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task.name),
          useValue: {
            ...vi.fn().mockImplementation(() => ({
              save: vi.fn().mockResolvedValue({}),
              populate: vi.fn().mockReturnThis()
            })),
            find: vi
              .fn()
              .mockReturnValue({
                sort: vi.fn().mockReturnThis(),
                populate: vi.fn().mockReturnThis(),
                exec: vi.fn().mockResolvedValue([])
              }),
            findOne: vi.fn(),
            findById: vi
              .fn()
              .mockReturnValue({ populate: vi.fn().mockReturnThis(), exec: vi.fn().mockResolvedValue({}) }),
            create: vi.fn(),
            save: vi.fn(),
            exec: vi.fn(),
            deleteMany: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue({ deletedCount: 1 }) }),
            findByIdAndUpdate: vi
              .fn()
              .mockReturnValue({ populate: vi.fn().mockReturnThis(), exec: vi.fn().mockResolvedValue({}) }),
            deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
            updateMany: vi.fn().mockReturnValue({ exec: vi.fn() })
          }
        },
        {
          provide: ProjectsService,
          useValue: {
            addMemberIfNotExists: vi.fn()
          }
        }
      ]
    }).compile()

    service = module.get<TasksService>(TasksService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a task', async () => {
      const createTaskDto = {
        title: 'Test Task',
        project: '60f6e1b3b3f3b3b3b3f3b3b4',
        board: '60f6e1b3b3f3b3b3b3f3b3b5'
      }
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      const task = {
        ...createTaskDto,
        _id: '1',
        creator: userId,
        save: vi.fn().mockResolvedValue(this),
        populate: vi.fn().mockResolvedValue(this)
      }

      const taskModel = module.get(getModelToken(Task.name))
      taskModel.mockReturnValue(task)

      const result = await service.create(createTaskDto as any, userId)

      expect(result.save).toHaveBeenCalled()
    })
  })

  describe('deleteTasksByProjectId', () => {
    it('should delete tasks by project id', async () => {
      const projectId = '60f6e1b3b3f3b3b3b3f3b3b4'
      const taskModel = module.get(getModelToken(Task.name))
      taskModel.deleteMany.mockReturnValue({ exec: vi.fn().mockResolvedValue({ deletedCount: 1 }) })

      const result = await service.deleteTasksByProjectId(projectId)

      expect(result.deletedCount).toEqual(1)
    })
  })

  describe('findAll', () => {
    it('should find all tasks', async () => {
      const taskModel = module.get(getModelToken(Task.name))
      taskModel.find.mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([])
      })

      await service.findAll()

      expect(taskModel.find).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('should find a task by id', async () => {
      const taskId = '60f6e1b3b3f3b3b3b3f3b3b5'
      const task = { _id: taskId, title: 'Test Task', populate: vi.fn().mockResolvedValue(this) }
      const taskModel = module.get(getModelToken(Task.name))
      taskModel.findById.mockReturnValue({ populate: vi.fn().mockReturnThis(), exec: vi.fn().mockResolvedValue(task) })

      await service.findOne(taskId)

      expect(taskModel.findById).toHaveBeenCalledWith(taskId)
    })
  })

  describe('update', () => {
    it('should update a task', async () => {
      const taskId = '60f6e1b3b3f3b3b3b3f3b3b5'
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      const updateTaskDto = { title: 'Test Task Updated' }
      const task = { _id: taskId, creator: { equals: () => true }, populate: vi.fn().mockResolvedValue(this) }
      const taskModel = module.get(getModelToken(Task.name))
      taskModel.findById.mockResolvedValue(task)
      taskModel.findByIdAndUpdate.mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue(task)
      })

      await service.update(taskId, updateTaskDto, userId)

      expect(taskModel.findById).toHaveBeenCalledWith(taskId)
      expect(taskModel.findByIdAndUpdate).toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('should remove a task', async () => {
      const taskId = '60f6e1b3b3f3b3b3b3f3b3b5'
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      const task = { _id: taskId, creator: { equals: () => true }, project: '1', orderInProject: 0 }
      const taskModel = module.get(getModelToken(Task.name))
      taskModel.findById.mockResolvedValue(task)
      taskModel.deleteOne.mockResolvedValue({ deletedCount: 1 })
      taskModel.updateMany.mockReturnValue({ exec: vi.fn() })

      await service.remove(taskId, userId)

      expect(taskModel.findById).toHaveBeenCalledWith(taskId)
      expect(taskModel.deleteOne).toHaveBeenCalled()
    })
  })

  describe('moveTask', () => {
    it('should move a task', async () => {
      const taskId = '60f6e1b3b3f3b3b3b3f3b3b5'
      const newProjectId = '60f6e1b3b3f3b3b3b3f3b3b4'
      const newOrderInProject = 1
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      const task = {
        _id: taskId,
        project: '60f6e1b3b3f3b3b3b3f3b3b6',
        orderInProject: 0,
        save: vi.fn(),
        creator: { equals: () => true },
        populate: vi.fn().mockResolvedValue(this)
      }
      const taskModel = module.get(getModelToken(Task.name))
      taskModel.findById.mockResolvedValue(task)
      taskModel.updateMany.mockReturnValue({ exec: vi.fn() })

      await service.moveTask(taskId, newProjectId, newOrderInProject, userId)

      expect(taskModel.findById).toHaveBeenCalledWith(taskId)
      expect(task.save).toHaveBeenCalled()
    })
  })
})
