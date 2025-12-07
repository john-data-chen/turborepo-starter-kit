import { taskApi } from '@/lib/api/taskApi'
import { TaskStatus, type Task } from '@/types/dbInterface'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
})

describe('taskApi', () => {
  const mockTask: Task = {
    _id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    project: 'project-1',
    board: 'board-1',
    creator: 'user-1',
    lastModifier: 'user-1',
    orderInProject: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('getTasks', () => {
    it('should fetch all tasks', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockTask],
        status: 200,
        headers: new Headers()
      })

      const result = await taskApi.getTasks()

      expect(result).toHaveLength(1)
      expect(result[0]._id).toBe('task-1')
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/tasks'), expect.any(Object))
    })

    it('should fetch tasks with projectId filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockTask],
        status: 200,
        headers: new Headers()
      })

      await taskApi.getTasks('project-1')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks?projectId=project-1'),
        expect.any(Object)
      )
    })

    it('should fetch tasks with assigneeId filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockTask],
        status: 200,
        headers: new Headers()
      })

      await taskApi.getTasks(undefined, 'user-1')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks?assigneeId=user-1'),
        expect.any(Object)
      )
    })

    it('should fetch tasks with both filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockTask],
        status: 200,
        headers: new Headers()
      })

      await taskApi.getTasks('project-1', 'user-1')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks?projectId=project-1&assigneeId=user-1'),
        expect.any(Object)
      )
    })

    it('should include auth token when available', async () => {
      localStorageMock.getItem.mockReturnValueOnce('test-token')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
        status: 200,
        headers: new Headers()
      })

      await taskApi.getTasks()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      )
    })
  })

  describe('getTaskById', () => {
    it('should fetch a single task', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask,
        status: 200,
        headers: new Headers()
      })

      const result = await taskApi.getTaskById('task-1')

      expect(result._id).toBe('task-1')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/task-1'),
        expect.any(Object)
      )
    })

    it('should encode task ID with special characters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask,
        status: 200,
        headers: new Headers()
      })

      await taskApi.getTaskById('task/with/slashes')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/task%2Fwith%2Fslashes'),
        expect.any(Object)
      )
    })

    it('should handle not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Task not found',
        status: 404,
        headers: new Headers()
      })

      await expect(taskApi.getTaskById('non-existent')).rejects.toThrow('Task not found')
    })
  })

  describe('createTask', () => {
    it('should create a new task', async () => {
      const input = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
        project: 'project-1',
        board: 'board-1',
        creator: 'user-1',
        lastModifier: 'user-1',
        orderInProject: 0
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask,
        status: 201,
        headers: new Headers()
      })

      const result = await taskApi.createTask(input)

      expect(result._id).toBe('task-1')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(input)
        })
      )
    })
  })

  describe('updateTask', () => {
    it('should update a task', async () => {
      const input = {
        title: 'Updated Task',
        lastModifier: 'user-1'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockTask, title: 'Updated Task' }),
        status: 200,
        headers: new Headers()
      })

      const result = await taskApi.updateTask('task-1', input)

      expect(result.title).toBe('Updated Task')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/task-1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(input)
        })
      )
    })
  })

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
        status: 204,
        headers: new Headers({ 'content-length': '0' })
      })

      await taskApi.deleteTask('task-1')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/task-1'),
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })

    it('should handle 204 No Content response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers({ 'content-length': '0' }),
        json: async () => ({})
      })

      const result = await taskApi.deleteTask('task-1')

      expect(result).toBeNull()
    })
  })

  describe('getTaskPermissions', () => {
    it('should fetch task permissions', async () => {
      const mockPermissions = {
        canEdit: true,
        canDelete: true,
        canMove: true
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPermissions,
        status: 200,
        headers: new Headers()
      })

      const result = await taskApi.getTaskPermissions('task-1')

      expect(result).toEqual(mockPermissions)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/task-1/permissions'),
        expect.any(Object)
      )
    })
  })

  describe('moveTask', () => {
    it('should move task to another project', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockTask, project: 'project-2' }),
        status: 200,
        headers: new Headers()
      })

      const result = await taskApi.moveTask('task-1', 'project-2', 1)

      expect(result.project).toBe('project-2')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/task-1/move'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            projectId: 'project-2',
            orderInProject: 1
          })
        })
      )
    })
  })

  describe('error handling', () => {
    it('should handle fetch errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Server error',
        status: 500,
        headers: new Headers()
      })

      await expect(taskApi.getTasks()).rejects.toThrow('Server error')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(taskApi.getTasks()).rejects.toThrow('Network error')
    })

    it('should handle text parsing failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => {
          throw new Error('Parse error')
        },
        status: 500,
        headers: new Headers()
      })

      await expect(taskApi.getTasks()).rejects.toThrow('Request failed')
    })

    it('should handle empty response with content-length 0', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-length': '0' }),
        json: async () => ({})
      })

      const result = await taskApi.getTasks()

      expect(result).toBeNull()
    })
  })
})
