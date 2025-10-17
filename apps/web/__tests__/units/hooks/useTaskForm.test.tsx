import { useTaskForm } from '@/hooks/useTaskForm'
import { TaskStatus, User } from '@/types/dbInterface'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the userApi
vi.mock('@/lib/api/userApi', () => ({
  userApi: {
    searchUsers: vi.fn(),
    getUserById: vi.fn()
  }
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn()
  }
}))

describe('useTaskForm', () => {
  const mockUsers: User[] = [
    {
      _id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    {
      _id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', async () => {
    const { userApi } = await import('@/lib/api/userApi')
    vi.mocked(userApi.searchUsers).mockResolvedValue(mockUsers)

    const onSubmit = vi.fn()
    const { result } = renderHook(() =>
      useTaskForm({
        onSubmit
      })
    )

    expect(result.current.form).toBeDefined()
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.searchQuery).toBe('')
    expect(result.current.isSearching).toBe(false)
    expect(result.current.assignOpen).toBe(false)
  })

  it('should load initial users on mount', async () => {
    const { userApi } = await import('@/lib/api/userApi')
    vi.mocked(userApi.searchUsers).mockResolvedValue(mockUsers)

    const onSubmit = vi.fn()
    const { result } = renderHook(() =>
      useTaskForm({
        onSubmit
      })
    )

    await waitFor(() => {
      expect(result.current.users).toHaveLength(2)
    })

    expect(result.current.users).toEqual(mockUsers)
  })

  it('should initialize with provided default values', async () => {
    const { userApi } = await import('@/lib/api/userApi')
    vi.mocked(userApi.searchUsers).mockResolvedValue(mockUsers)

    const onSubmit = vi.fn()
    const defaultValues = {
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date('2024-12-31')
    }

    const { result } = renderHook(() =>
      useTaskForm({
        defaultValues,
        onSubmit
      })
    )

    await waitFor(() => {
      const values = result.current.form.getValues()
      expect(values.title).toBe('Test Task')
      expect(values.description).toBe('Test Description')
      expect(values.status).toBe(TaskStatus.IN_PROGRESS)
    })
  })

  it('should handle assignee as string ID in default values', async () => {
    const { userApi } = await import('@/lib/api/userApi')
    vi.mocked(userApi.searchUsers).mockResolvedValue(mockUsers)
    vi.mocked(userApi.getUserById).mockResolvedValue(mockUsers[0])

    const onSubmit = vi.fn()
    const defaultValues = {
      title: 'Test Task',
      assignee: 'user-1'
    }

    const { result } = renderHook(() =>
      useTaskForm({
        defaultValues,
        onSubmit
      })
    )

    await waitFor(() => {
      const values = result.current.form.getValues()
      expect(values.assignee?._id).toBe('user-1')
    })
  })

  it('should handle assignee as object in default values', async () => {
    const { userApi } = await import('@/lib/api/userApi')
    vi.mocked(userApi.searchUsers).mockResolvedValue(mockUsers)

    const onSubmit = vi.fn()
    const defaultValues = {
      title: 'Test Task',
      assignee: {
        _id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com'
      }
    }

    const { result } = renderHook(() =>
      useTaskForm({
        defaultValues,
        onSubmit
      })
    )

    await waitFor(() => {
      const values = result.current.form.getValues()
      expect(values.assignee?._id).toBe('user-1')
      expect(values.assignee?.name).toBe('John Doe')
    })
  })

  it('should search users when search query changes', async () => {
    const { userApi } = await import('@/lib/api/userApi')
    vi.mocked(userApi.searchUsers).mockResolvedValue(mockUsers)

    const onSubmit = vi.fn()
    const { result } = renderHook(() =>
      useTaskForm({
        onSubmit
      })
    )

    act(() => {
      result.current.setAssignOpen(true)
      result.current.setSearchQuery('john')
    })

    await waitFor(
      () => {
        expect(userApi.searchUsers).toHaveBeenCalledWith('john')
      },
      { timeout: 1000 }
    )
  })

  it('should set isSearching to true while searching', async () => {
    const { userApi } = await import('@/lib/api/userApi')
    let resolveSearch: (value: User[]) => void
    const searchPromise = new Promise<User[]>((resolve) => {
      resolveSearch = resolve
    })
    vi.mocked(userApi.searchUsers).mockReturnValue(searchPromise)

    const onSubmit = vi.fn()
    const { result } = renderHook(() =>
      useTaskForm({
        onSubmit
      })
    )

    act(() => {
      result.current.setAssignOpen(true)
      result.current.setSearchQuery('john')
    })

    await waitFor(() => {
      expect(result.current.isSearching).toBe(true)
    })

    act(() => {
      resolveSearch!(mockUsers)
    })

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false)
    })
  })

  it('should handle user search errors gracefully', async () => {
    const { userApi } = await import('@/lib/api/userApi')
    vi.mocked(userApi.searchUsers).mockRejectedValue(new Error('Search failed'))

    const onSubmit = vi.fn()
    const { result } = renderHook(() =>
      useTaskForm({
        onSubmit
      })
    )

    act(() => {
      result.current.setAssignOpen(true)
      result.current.setSearchQuery('john')
    })

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false)
    })
  })

  it('should call onSubmit when handleSubmit is called', async () => {
    const { userApi } = await import('@/lib/api/userApi')
    vi.mocked(userApi.searchUsers).mockResolvedValue(mockUsers)

    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      useTaskForm({
        onSubmit
      })
    )

    const values = {
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.TODO
    }

    await act(async () => {
      await result.current.handleSubmit(values)
    })

    expect(onSubmit).toHaveBeenCalledWith(values)
    expect(result.current.isSubmitting).toBe(false)
  })

  it('should handle submit with assignee', async () => {
    const { userApi } = await import('@/lib/api/userApi')
    vi.mocked(userApi.searchUsers).mockResolvedValue(mockUsers)

    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      useTaskForm({
        onSubmit
      })
    )

    const values = {
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.TODO,
      assignee: {
        _id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com'
      }
    }

    await act(async () => {
      await result.current.handleSubmit(values)
    })

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.TODO,
      assignee: {
        _id: 'user-1',
        name: 'John Doe'
      }
    })
  })

  it('should handle submit errors', async () => {
    const { userApi } = await import('@/lib/api/userApi')
    const { toast } = await import('sonner')
    vi.mocked(userApi.searchUsers).mockResolvedValue(mockUsers)

    const onSubmit = vi.fn().mockRejectedValue(new Error('Submit failed'))
    const { result } = renderHook(() =>
      useTaskForm({
        onSubmit
      })
    )

    const values = {
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.TODO
    }

    await act(async () => {
      await result.current.handleSubmit(values)
    })

    expect(toast.error).toHaveBeenCalled()
    expect(result.current.isSubmitting).toBe(false)
  })

  it('should set isSubmitting during submission', async () => {
    const { userApi } = await import('@/lib/api/userApi')
    vi.mocked(userApi.searchUsers).mockResolvedValue(mockUsers)

    let resolveSubmit: () => void
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve
    })
    const onSubmit = vi.fn().mockReturnValue(submitPromise)

    const { result } = renderHook(() =>
      useTaskForm({
        onSubmit
      })
    )

    const values = {
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.TODO
    }

    act(() => {
      result.current.handleSubmit(values)
    })

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(true)
    })

    act(() => {
      resolveSubmit!()
    })

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false)
    })
  })

  it('should load assignee data when user is found in existing users list', async () => {
    const { userApi } = await import('@/lib/api/userApi')
    vi.mocked(userApi.searchUsers).mockResolvedValue(mockUsers)

    const onSubmit = vi.fn()
    const { result, rerender } = renderHook(
      ({ defaultValues }) =>
        useTaskForm({
          defaultValues,
          onSubmit
        }),
      {
        initialProps: {
          defaultValues: undefined
        }
      }
    )

    // Wait for initial users to load
    await waitFor(() => {
      expect(result.current.users).toHaveLength(2)
    })

    // Update with assignee that exists in users list
    rerender({
      defaultValues: {
        assignee: 'user-1'
      }
    })

    await waitFor(() => {
      const values = result.current.form.getValues()
      expect(values.assignee?._id).toBe('user-1')
    })
  })

  it('should fetch assignee data when user is not in existing users list', async () => {
    const { userApi } = await import('@/lib/api/userApi')
    vi.mocked(userApi.searchUsers).mockResolvedValue([])
    vi.mocked(userApi.getUserById).mockResolvedValue(mockUsers[0])

    const onSubmit = vi.fn()
    const defaultValues = {
      assignee: 'user-1'
    }

    const { result } = renderHook(() =>
      useTaskForm({
        defaultValues,
        onSubmit
      })
    )

    await waitFor(() => {
      expect(userApi.getUserById).toHaveBeenCalledWith('user-1')
    })

    await waitFor(() => {
      const values = result.current.form.getValues()
      expect(values.assignee?._id).toBe('user-1')
    })
  })

  it('should handle assignee fetch errors gracefully', async () => {
    const { userApi } = await import('@/lib/api/userApi')
    vi.mocked(userApi.searchUsers).mockResolvedValue([])
    vi.mocked(userApi.getUserById).mockRejectedValue(new Error('User not found'))

    const onSubmit = vi.fn()
    const defaultValues = {
      assignee: 'user-999'
    }

    const { result } = renderHook(() =>
      useTaskForm({
        defaultValues,
        onSubmit
      })
    )

    await waitFor(() => {
      expect(userApi.getUserById).toHaveBeenCalledWith('user-999')
    })

    // Should not throw error
    expect(result.current.form).toBeDefined()
  })

  it('should not search users when assignOpen is false', async () => {
    const { userApi } = await import('@/lib/api/userApi')
    vi.mocked(userApi.searchUsers).mockResolvedValue(mockUsers)

    const onSubmit = vi.fn()
    const { result } = renderHook(() =>
      useTaskForm({
        onSubmit
      })
    )

    // Clear the initial search call
    vi.mocked(userApi.searchUsers).mockClear()

    act(() => {
      result.current.setSearchQuery('john')
    })

    // Wait a bit to ensure no search happens
    await new Promise((resolve) => setTimeout(resolve, 600))

    expect(userApi.searchUsers).not.toHaveBeenCalledWith('john')
  })

  it('should clear assignee when no assignee in default values', async () => {
    const { userApi } = await import('@/lib/api/userApi')
    vi.mocked(userApi.searchUsers).mockResolvedValue(mockUsers)

    const onSubmit = vi.fn()
    const { result } = renderHook(() =>
      useTaskForm({
        defaultValues: {
          assignee: undefined
        },
        onSubmit
      })
    )

    await waitFor(() => {
      const values = result.current.form.getValues()
      expect(values.assignee).toBeUndefined()
    })
  })
})
