import React from 'react'
import { taskApi } from '@/lib/api/taskApi'
import {
  useCreateTask,
  useDeleteTask,
  useTask,
  useTasks,
  useUpdateTask
} from '@/lib/api/tasks/queries'
import { useWorkspaceStore } from '@/stores/workspace-store'
import type { Task } from '@/types/dbInterface'
import { TASK_KEYS } from '@/types/taskApi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'

// Mock taskApi
vi.mock('@/lib/api/taskApi', () => ({
  taskApi: {
    getTasks: vi.fn(),
    getTaskById: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn()
  }
}))

// Mock workspace store
vi.mock('@/stores/workspace-store', () => ({
  useWorkspaceStore: vi.fn()
}))

describe('Task Query Hooks', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    })
    vi.clearAllMocks()
    ;(useWorkspaceStore as unknown as Mock).mockReturnValue('user-123')
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  describe('useTasks', () => {
    it('should fetch tasks by projectId', async () => {
      const mockTasks = [
        { _id: '1', title: 'Task 1', project: 'project1' },
        { _id: '2', title: 'Task 2', project: 'project1' }
      ]
      ;(taskApi.getTasks as Mock).mockResolvedValue(mockTasks)

      const { result } = renderHook(() => useTasks('project1'), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockTasks)
      expect(taskApi.getTasks).toHaveBeenCalledWith('project1', undefined)
    })

    it('should fetch tasks by assigneeId', async () => {
      const mockTasks = [{ _id: '1', title: 'Task 1', assignee: 'user1' }]
      ;(taskApi.getTasks as Mock).mockResolvedValue(mockTasks)

      const { result } = renderHook(() => useTasks(undefined, 'user1'), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockTasks)
      expect(taskApi.getTasks).toHaveBeenCalledWith(undefined, 'user1')
    })

    it('should not fetch when both ids are undefined', () => {
      const { result } = renderHook(() => useTasks(), { wrapper })

      expect(result.current.data).toBeUndefined()
      expect(taskApi.getTasks).not.toHaveBeenCalled()
    })
  })

  describe('useTask', () => {
    it('should fetch single task', async () => {
      const mockTask = { _id: '1', title: 'Task 1', project: 'project1' }
      ;(taskApi.getTaskById as Mock).mockResolvedValue(mockTask)

      const { result } = renderHook(() => useTask('1'), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockTask)
      expect(taskApi.getTaskById).toHaveBeenCalledWith('1')
    })

    it('should not fetch when taskId is undefined', () => {
      const { result } = renderHook(() => useTask(undefined), { wrapper })

      expect(result.current.data).toBeUndefined()
      expect(taskApi.getTaskById).not.toHaveBeenCalled()
    })

    it('should respect enabled option', () => {
      const { result } = renderHook(() => useTask('1', { enabled: false }), { wrapper })

      expect(result.current.data).toBeUndefined()
      expect(taskApi.getTaskById).not.toHaveBeenCalled()
    })

    it('should not retry on 404 error', async () => {
      const mockError = { response: { status: 404 } }
      ;(taskApi.getTaskById as Mock).mockRejectedValue(mockError)

      const { result } = renderHook(() => useTask('1'), { wrapper })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(taskApi.getTaskById).toHaveBeenCalledTimes(1)
    })

    it('should retry on non-404 errors', async () => {
      // Create a new query client that allows retries
      const retryQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2, // Retry 2 times = 3 total attempts
            retryDelay: 1 // Fast retries for testing
          }
        }
      })

      const retryWrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={retryQueryClient}>{children}</QueryClientProvider>
      )

      const mockError = { response: { status: 500 } }
      ;(taskApi.getTaskById as Mock).mockRejectedValue(mockError)

      const { result } = renderHook(() => useTask('1'), { wrapper: retryWrapper })

      await waitFor(
        () => expect(result.current.isError).toBe(true),
        { timeout: 10000 } // Increase timeout for retries
      )

      // With retryDelay: 1, it should retry quickly. Check it was called at least 3 times
      expect(taskApi.getTaskById).toHaveBeenCalled()
      expect((taskApi.getTaskById as Mock).mock.calls.length).toBeGreaterThanOrEqual(3)
    }, 10000)
  })

  describe('useCreateTask', () => {
    it('should create task with string assignee', async () => {
      const newTask = {
        _id: '3',
        title: 'New Task',
        project: 'project1',
        assignee: 'user1'
      }
      ;(taskApi.createTask as Mock).mockResolvedValue(newTask)

      const { result } = renderHook(() => useCreateTask(), { wrapper })

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      await act(async () => {
        await result.current.mutateAsync({
          title: 'New Task',
          board: 'board1',
          project: 'project1',
          creator: 'user1',
          assignee: 'user1'
        })
      })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: TASK_KEYS.list({ project: 'project1' })
        })
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: TASK_KEYS.list({ assignee: 'user1' })
        })
      })

      expect(taskApi.createTask).toHaveBeenCalledWith({
        title: 'New Task',
        board: 'board1',
        project: 'project1',
        creator: 'user1',
        assignee: 'user1',
        lastModifier: 'user1',
        description: undefined,
        status: undefined,
        dueDate: undefined,
        orderInProject: undefined
      })
    })

    it('should create task with object assignee', async () => {
      const newTask = {
        _id: '3',
        title: 'New Task',
        project: 'project1',
        assignee: { _id: 'user1' }
      }
      ;(taskApi.createTask as Mock).mockResolvedValue(newTask)

      const { result } = renderHook(() => useCreateTask(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          title: 'New Task',
          board: 'board1',
          project: 'project1',
          creator: 'user1',
          assignee: { _id: 'user1' }
        })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(taskApi.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          assignee: 'user1'
        })
      )
    })
  })

  describe('useUpdateTask', () => {
    it('should throw error if user is not authenticated', () => {
      ;(useWorkspaceStore as unknown as Mock).mockReturnValue(null)

      expect(() => renderHook(() => useUpdateTask(), { wrapper })).toThrow(
        'User must be authenticated to update a task'
      )
    })

    it('should update task title', async () => {
      const updatedTask = { _id: '1', title: 'Updated Task', project: 'project1' }
      ;(taskApi.updateTask as Mock).mockResolvedValue(updatedTask)

      // Set up query data for optimistic update
      queryClient.setQueryData<Task>(TASK_KEYS.detail('1'), {
        _id: '1',
        title: 'Old Task',
        project: 'project1',
        status: 'todo',
        creator: { _id: 'user1', name: 'User 1', email: 'user1@example.com' },
        lastModifier: { _id: 'user1', name: 'User 1', email: 'user1@example.com' },
        board: 'board1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        orderInProject: 0
      })

      const { result } = renderHook(() => useUpdateTask(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ id: '1', title: 'Updated Task' })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(taskApi.updateTask).toHaveBeenCalledWith('1', {
        title: 'Updated Task',
        lastModifier: 'user-123'
      })
    })

    it('should update task with multiple fields', async () => {
      const updatedTask = {
        _id: '1',
        title: 'Updated Task',
        description: 'New description',
        status: 'in_progress' as const,
        project: 'project1'
      }
      ;(taskApi.updateTask as Mock).mockResolvedValue(updatedTask)

      const { result } = renderHook(() => useUpdateTask(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          id: '1',
          title: 'Updated Task',
          description: 'New description',
          status: 'in_progress'
        })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(taskApi.updateTask).toHaveBeenCalledWith('1', {
        title: 'Updated Task',
        description: 'New description',
        status: 'in_progress',
        lastModifier: 'user-123'
      })
    })

    it('should handle assignee update to null', async () => {
      const updatedTask = { _id: '1', title: 'Task', project: 'project1', assignee: undefined }
      ;(taskApi.updateTask as Mock).mockResolvedValue(updatedTask)

      const { result } = renderHook(() => useUpdateTask(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          id: '1',
          assigneeId: null
        })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(taskApi.updateTask).toHaveBeenCalledWith('1', {
        assigneeId: null,
        lastModifier: 'user-123'
      })
    })
  })

  describe('useDeleteTask', () => {
    it('should delete task and update task list', async () => {
      const taskToDelete: Task = {
        _id: '2',
        title: 'Task to Delete',
        project: 'project1',
        status: 'todo',
        creator: { _id: 'user1', name: 'User 1', email: 'user1@example.com' },
        lastModifier: { _id: 'user1', name: 'User 1', email: 'user1@example.com' },
        board: 'board1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        orderInProject: 1
      }

      // Set up query data
      queryClient.setQueryData<Task>(TASK_KEYS.detail('2'), taskToDelete)
      queryClient.setQueryData<Task[]>(TASK_KEYS.lists(), [
        {
          _id: '1',
          title: 'Task 1',
          project: 'project1',
          status: 'todo',
          creator: { _id: 'user1', name: 'User 1', email: 'user1@example.com' },
          lastModifier: { _id: 'user1', name: 'User 1', email: 'user1@example.com' },
          board: 'board1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          orderInProject: 0
        },
        taskToDelete,
        {
          _id: '3',
          title: 'Task 3',
          project: 'project1',
          status: 'todo',
          creator: { _id: 'user1', name: 'User 1', email: 'user1@example.com' },
          lastModifier: { _id: 'user1', name: 'User 1', email: 'user1@example.com' },
          board: 'board1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          orderInProject: 2
        }
      ])
      ;(taskApi.deleteTask as Mock).mockResolvedValue({ success: true })

      const { result } = renderHook(() => useDeleteTask(), { wrapper })

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      await act(async () => {
        await result.current.mutateAsync('2')
      })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: TASK_KEYS.list({ project: 'project1' }),
          refetchType: 'active'
        })
      })

      expect(taskApi.deleteTask).toHaveBeenCalledWith('2')
    })

    it('should handle deletion without task details', async () => {
      queryClient.setQueryData<Task[]>(TASK_KEYS.lists(), [
        {
          _id: '1',
          title: 'Task 1',
          project: 'project1',
          status: 'todo',
          creator: { _id: 'user1', name: 'User 1', email: 'user1@example.com' },
          lastModifier: { _id: 'user1', name: 'User 1', email: 'user1@example.com' },
          board: 'board1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          orderInProject: 0
        }
      ])
      ;(taskApi.deleteTask as Mock).mockResolvedValue({ success: true })

      const { result } = renderHook(() => useDeleteTask(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync('unknown-task')
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(taskApi.deleteTask).toHaveBeenCalledWith('unknown-task')
    })
  })
})
