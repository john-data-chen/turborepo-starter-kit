import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Types } from 'mongoose'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { ProjectsService } from '../../src/modules/projects/projects.service'
import { Task } from '../../src/modules/tasks/schemas/tasks.schema'
import { TasksService } from '../../src/modules/tasks/tasks.service'

class MockTaskDocument {
  _id: string
  project: string
  orderInProject: number
  save: Mock
  creator: { _id: Types.ObjectId; equals: Mock }
  assignee: Types.ObjectId | null
  populate: Mock

  constructor(taskId: string, userId: string, projectId: string, order: number) {
    this._id = taskId
    this.project = projectId
    this.orderInProject = order
    this.save = vi.fn()
    this.creator = {
      _id: new Types.ObjectId(userId),
      equals: vi.fn().mockImplementation((id: Types.ObjectId) => id.toString() === userId)
    }
    this.assignee = null
    this.populate = vi.fn().mockReturnThis()
  }

  equals(id: Types.ObjectId): boolean {
    return this._id === id.toString()
  }
}

// Define a mock constructor for the TaskModel
class MockTaskModel {
  constructor(data: any) {
    const mockTask = {
      ...data,
      _id: new Types.ObjectId('60f6e1b3b3f3b3b3b3f3b3b7'),
      createdAt: new Date(),
      updatedAt: new Date(),
      save: vi.fn().mockResolvedValue({
        ...data,
        _id: new Types.ObjectId('60f6e1b3b3f3b3b3b3f3b3b7'),
        createdAt: new Date(),
        updatedAt: new Date(),
        populate: vi.fn().mockResolvedValue({
          ...data,
          _id: new Types.ObjectId('60f6e1b3b3f3b3b3b3f3b3b7'),
          creator: { _id: data.creator, name: 'Test User', email: 'test@example.com' },
          assignee: data.assignee
            ? { _id: data.assignee, name: 'Assignee', email: 'assignee@example.com' }
            : null,
          lastModifier: { _id: data.creator, name: 'Test User', email: 'test@example.com' }
        })
      }),
      populate: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue({
        ...data,
        _id: new Types.ObjectId('60f6e1b3b3f3b3b3b3f3b3b7')
      })
    }
    return mockTask
  }

  static find = vi.fn().mockReturnValue({
    sort: vi.fn().mockReturnThis(),
    populate: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue([])
  })
  static findOne = vi.fn()
  static findById = vi.fn().mockImplementation((id) => {
    const mockTask = new MockTaskDocument(
      id.toString(),
      '60f6e1b3b3f3b3b3b3f3b3b3',
      '60f6e1b3b3f3b3b3b3f3b3b4',
      0
    )
    const query = {
      populate: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue(mockTask),
      // oxlint-disable-next-line no-thenable
      then: (resolve: any) => resolve(mockTask)
    }
    return query
  })
  static findByIdAndUpdate = vi.fn().mockReturnValue({
    populate: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue({})
  })
  static create = vi.fn()
  static save = vi.fn()
  static exec = vi.fn()
  static deleteMany = vi
    .fn()
    .mockReturnValue({ exec: vi.fn().mockResolvedValue({ deletedCount: 1 }) })
  static deleteOne = vi
    .fn()
    .mockReturnValue({ exec: vi.fn().mockResolvedValue({ deletedCount: 1 }) })
  static updateMany = vi.fn().mockReturnValue({ exec: vi.fn() })
}

describe('TasksService', () => {
  let service: TasksService
  let module: TestingModule

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task.name),
          useValue: MockTaskModel
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

      const result = await service.create(createTaskDto as any, userId)

      // The constructor will create an instance with a save method that gets called
      expect(result).toBeDefined()
    })

    it('should throw an error if user id is not provided', async () => {
      const createTaskDto = {
        title: 'Test Task',
        project: '60f6e1b3b3f3b3b3b3f3b3b4',
        board: '60f6e1b3b3f3b3b3b3f3b3b5'
      }
      await expect(service.create(createTaskDto as any, null)).rejects.toThrow(
        'User ID is required to create a task'
      )
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

    it('should throw an error if project id is invalid', async () => {
      await expect(service.deleteTasksByProjectId('invalid-id')).rejects.toThrow(
        'Invalid project ID'
      )
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

    it('should find all tasks with projectId', async () => {
      const taskModel = module.get(getModelToken(Task.name))
      const projectId = '60f6e1b3b3f3b3b3b3f3b3b4'
      taskModel.find.mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([])
      })

      await service.findAll(projectId)

      expect(taskModel.find).toHaveBeenCalledWith({ project: new Types.ObjectId(projectId) })
    })

    it('should find all tasks with assigneeId', async () => {
      const taskModel = module.get(getModelToken(Task.name))
      const assigneeId = '60f6e1b3b3f3b3b3b3f3b3b3'
      taskModel.find.mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([])
      })

      await service.findAll(undefined, assigneeId)

      expect(taskModel.find).toHaveBeenCalledWith({ assignee: new Types.ObjectId(assigneeId) })
    })
  })

  describe('findOne', () => {
    it('should find a task by id', async () => {
      const taskId = '60f6e1b3b3f3b3b3b3f3b3b5'
      const task = {
        _id: { toString: () => taskId },
        title: 'Test Task',
        status: 'TODO',
        project: '60f6e1b3b3f3b3b3b3f3b3b4',
        board: '60f6e1b3b3f3b3b3b3f3b3b5',
        creator: { _id: '60f6e1b3b3f3b3b3b3f3b3b3', name: 'Test User', email: 'test@example.com' },
        assignee: null,
        lastModifier: {
          _id: '60f6e1b3b3f3b3b3b3f3b3b3',
          name: 'Test User',
          email: 'test@example.com'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const taskModel = module.get(getModelToken(Task.name))
      taskModel.findById.mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue(task)
      })

      await service.findOne(taskId)

      expect(taskModel.findById).toHaveBeenCalledWith(taskId)
    })
  })

  describe('update', () => {
    it('should update a task', async () => {
      const taskId = '60f6e1b3b3f3b3b3b3f3b3b5'
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      const updateTaskDto = { title: 'Test Task Updated', orderInProject: 0 }
      const task = {
        _id: { toString: () => taskId },
        title: 'Test Task',
        status: 'TODO',
        project: '60f6e1b3b3f3b3b3b3f3b3b4',
        board: '60f6e1b3b3f3b3b3b3f3b3b5',
        creator: new Types.ObjectId(userId),
        assignee: null,
        lastModifier: { _id: userId, name: 'Test User', email: 'test@example.com' },
        createdAt: new Date(),
        updatedAt: new Date()
      }
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
      const task = {
        _id: taskId,
        creator: new Types.ObjectId(userId),
        project: '1',
        orderInProject: 0
      }
      const taskModel = module.get(getModelToken(Task.name))
      taskModel.findById.mockResolvedValue(task)
      taskModel.deleteOne.mockReturnValue({ exec: vi.fn().mockResolvedValue({ deletedCount: 1 }) })
      taskModel.updateMany.mockReturnValue({ exec: vi.fn() })

      await service.remove(taskId, userId)

      expect(taskModel.findById).toHaveBeenCalledWith(taskId)
      expect(taskModel.deleteOne).toHaveBeenCalled()
    })

    it('should throw not found exception when removing a non-existing task', async () => {
      const taskId = '60f6e1b3b3f3b3b3b3f3b3b5'
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      const taskModel = module.get(getModelToken(Task.name))
      taskModel.findById.mockResolvedValue(null)

      await expect(service.remove(taskId, userId)).rejects.toThrow(
        'Task with ID 60f6e1b3b3f3b3b3b3f3b3b5 not found'
      )
    })

    it('should throw forbidden exception when removing a task without being the creator', async () => {
      const taskId = '60f6e1b3b3f3b3b3b3f3b3b5'
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      const differentUserId = '60f6e1b3b3f3b3b3b3f3b3b4'
      const task = {
        _id: taskId,
        creator: new Types.ObjectId(differentUserId),
        project: '1',
        orderInProject: 0
      }
      const taskModel = module.get(getModelToken(Task.name))
      taskModel.findById.mockResolvedValue(task)

      await expect(service.remove(taskId, userId)).rejects.toThrow(
        'Only the task creator can perform this action'
      )
    })
  })

  describe('deleteTasksByProjectId', () => {
    it('should throw an error for an invalid project ID', async () => {
      const invalidProjectId = 'invalid-id'
      await expect(service.deleteTasksByProjectId(invalidProjectId)).rejects.toThrow(
        'Invalid project ID'
      )
    })
  })

  describe('findAll', () => {
    it('should find all tasks with projectId', async () => {
      const taskModel = module.get(getModelToken(Task.name))
      const projectId = '60f6e1b3b3f3b3b3b3f3b3b4'
      taskModel.find.mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([])
      })

      await service.findAll(projectId)

      expect(taskModel.find).toHaveBeenCalledWith({ project: new Types.ObjectId(projectId) })
    })

    it('should find all tasks with assigneeId', async () => {
      const taskModel = module.get(getModelToken(Task.name))
      const assigneeId = '60f6e1b3b3f3b3b3b3f3b3b3'
      taskModel.find.mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([])
      })

      await service.findAll(undefined, assigneeId)

      expect(taskModel.find).toHaveBeenCalledWith({ assignee: new Types.ObjectId(assigneeId) })
    })
  })

  describe('create', () => {
    it('should create a task with an assignee', async () => {
      const createTaskDto = {
        title: 'Test Task',
        project: '60f6e1b3b3f3b3b3b3f3b3b4',
        board: '60f6e1b3b3f3b3b3b3f3b3b5',
        assignee: '60f6e1b3b3f3b3b3b3f3b3b6'
      }
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'

      const result = await service.create(createTaskDto as any, userId)

      // The constructor will create an instance with a save method that gets called
      expect(result).toBeDefined()
    })
  })

  describe('update', () => {
    it('should throw not found exception when updating a non-existing task', async () => {
      const taskId = '60f6e1b3b3f3b3b3b3f3b3b5'
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      const updateTaskDto = { title: 'Test Task Updated' }
      const taskModel = module.get(getModelToken(Task.name))
      taskModel.findById.mockResolvedValue(null)

      await expect(service.update(taskId, updateTaskDto, userId)).rejects.toThrow(
        'Task with ID 60f6e1b3b3f3b3b3b3f3b3b5 not found'
      )
    })

    it('should throw forbidden exception when updating a task without permission', async () => {
      const taskId = '60f6e1b3b3f3b3b3b3f3b3b5'
      const userId = '60f6e1b3b3f3b3b3b3f3b3b3'
      const differentUserId = '60f6e1b3b3f3b3b3b3f3b3b4'
      const updateTaskDto = { title: 'Test Task Updated' }
      const task = { _id: taskId, creator: new Types.ObjectId(differentUserId), assignee: null }
      const taskModel = module.get(getModelToken(Task.name))
      taskModel.findById.mockResolvedValue(task)

      await expect(service.update(taskId, updateTaskDto, userId)).rejects.toThrow(
        'You do not have permission to modify this task'
      )
    })
  })

  describe('findOne', () => {
    it('should throw not found exception when task is not found', async () => {
      const taskId = '60f6e1b3b3f3b3b3b3f3b3b5'
      const taskModel = module.get(getModelToken(Task.name))
      taskModel.findById.mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue(null)
      })

      await expect(service.findOne(taskId)).rejects.toThrow(
        'Task with ID 60f6e1b3b3f3b3b3b3f3b3b5 not found'
      )
    })
  })

  describe('toUserResponse', () => {
    it('should return null if user is null', async () => {
      const result = (service as any).toUserResponse(null)
      expect(result).toBeNull()
    })
  })

  describe('toTaskResponse', () => {
    it('should handle population error', async () => {
      const task = {
        _id: { toString: () => '1' },
        populate: vi.fn().mockRejectedValue(new Error('Populate error'))
      }
      await expect((service as any).toTaskResponse(task)).rejects.toThrow('Populate error')
    })

    it('should handle missing lastModifier', async () => {
      const task = {
        _id: { toString: () => '1' },
        creator: { _id: '2' },
        populate: vi.fn().mockReturnThis()
      }
      const result = await (service as any).toTaskResponse(task)
      expect(result.lastModifier).toEqual(result.creator)
    })
  })
})
