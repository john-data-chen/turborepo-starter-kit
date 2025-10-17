/// <reference types="react" />
import React from 'react'
import { TaskActions } from '@/components/kanban/task/TaskAction'
import { TaskStatus } from '@/types/dbInterface'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Ensure React is globally available
globalThis.React = React

// Mock dependencies
vi.mock('@/stores/workspace-store', () => ({
  useWorkspaceStore: vi.fn(() => ({ userId: 'user-1' }))
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('@/lib/api/tasks/queries', () => ({
  useTask: vi.fn(),
  useUpdateTask: vi.fn(),
  useDeleteTask: vi.fn()
}))

vi.mock('@/components/kanban/task/TaskForm', () => ({
  TaskForm: ({ onSubmit, onCancel }: any) => (
    <div data-testid="task-form">
      <button data-testid="form-submit" onClick={() => onSubmit({ title: 'Updated Task' })}>
        Submit
      </button>
      <button data-testid="form-cancel" onClick={onCancel}>
        Cancel
      </button>
    </div>
  )
}))

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    cancelQueries: vi.fn(),
    removeQueries: vi.fn(),
    refetchQueries: vi.fn(),
    getQueryCache: vi.fn(() => ({
      findAll: vi.fn(() => [])
    }))
  }))
}))

describe('TaskActions', () => {
  const mockTask = {
    _id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    creator: { _id: 'user-1', name: 'John', email: 'john@example.com' },
    assignee: { _id: 'user-2', name: 'Jane', email: 'jane@example.com' },
    project: 'project-1',
    board: 'board-1',
    dueDate: new Date('2025-12-31'),
    orderInProject: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const mockProps = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    projectId: 'project-1',
    boardId: 'board-1',
    assigneeId: 'user-2',
    dueDate: new Date('2025-12-31')
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    const { useTask, useUpdateTask, useDeleteTask } = await import('@/lib/api/tasks/queries')
    const { useWorkspaceStore } = await import('@/stores/workspace-store')

    vi.mocked(useWorkspaceStore).mockReturnValue({ userId: 'user-1' } as any)

    vi.mocked(useTask).mockReturnValue({
      data: mockTask,
      isLoading: false
    } as any)

    vi.mocked(useUpdateTask).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(mockTask),
      isPending: false
    } as any)

    vi.mocked(useDeleteTask).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false
    } as any)
  })

  it('should render task actions trigger', () => {
    render(<TaskActions {...mockProps} />)
    expect(screen.getByTestId('task-actions-trigger')).toBeInTheDocument()
  })

  it('should show loading state when task is loading', async () => {
    const { useTask } = await import('@/lib/api/tasks/queries')
    vi.mocked(useTask).mockReturnValue({
      data: undefined,
      isLoading: true
    } as any)

    render(<TaskActions {...mockProps} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render task actions component with creator permissions', () => {
    const { container } = render(<TaskActions {...mockProps} />)
    expect(container).toBeTruthy()
    expect(screen.getByTestId('task-actions-trigger')).toBeInTheDocument()
  })

  it('should render with assignee permissions', async () => {
    const { useWorkspaceStore } = await import('@/stores/workspace-store')
    vi.mocked(useWorkspaceStore).mockReturnValue({ userId: 'user-2' } as any)

    render(<TaskActions {...mockProps} />)
    expect(screen.getByTestId('task-actions-trigger')).toBeInTheDocument()
  })

  it('should render with no permissions', async () => {
    const { useWorkspaceStore } = await import('@/stores/workspace-store')
    vi.mocked(useWorkspaceStore).mockReturnValue({ userId: 'user-3' } as any)

    render(<TaskActions {...mockProps} />)
    expect(screen.getByTestId('task-actions-trigger')).toBeInTheDocument()
  })

  it('should return null when task not found and not loading', async () => {
    const { useTask } = await import('@/lib/api/tasks/queries')
    vi.mocked(useTask).mockReturnValue({
      data: undefined,
      isLoading: false
    } as any)

    const { container } = render(<TaskActions {...mockProps} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should render task with default values', () => {
    render(<TaskActions {...mockProps} />)
    expect(screen.getByTestId('task-actions-trigger')).toBeInTheDocument()
  })

  it('should render with dueDate', () => {
    render(<TaskActions {...mockProps} dueDate={new Date('2025-12-31')} />)
    expect(screen.getByTestId('task-actions-trigger')).toBeInTheDocument()
  })

  it('should render without dueDate', () => {
    render(<TaskActions {...mockProps} dueDate={undefined} />)
    expect(screen.getByTestId('task-actions-trigger')).toBeInTheDocument()
  })

  it('should render without assignee', () => {
    render(<TaskActions {...mockProps} assigneeId={undefined} />)
    expect(screen.getByTestId('task-actions-trigger')).toBeInTheDocument()
  })

  it('should render with description', () => {
    render(<TaskActions {...mockProps} description="Test description" />)
    expect(screen.getByTestId('task-actions-trigger')).toBeInTheDocument()
  })

  it('should render without description', () => {
    render(<TaskActions {...mockProps} description={undefined} />)
    expect(screen.getByTestId('task-actions-trigger')).toBeInTheDocument()
  })

  it('should handle different task statuses', () => {
    render(<TaskActions {...mockProps} status={TaskStatus.IN_PROGRESS} />)
    expect(screen.getByTestId('task-actions-trigger')).toBeInTheDocument()

    const { rerender } = render(<TaskActions {...mockProps} status={TaskStatus.DONE} />)
    expect(screen.getAllByTestId('task-actions-trigger').length).toBeGreaterThan(0)
  })

  it('should handle onUpdate callback when provided', () => {
    const mockOnUpdate = vi.fn()
    render(<TaskActions {...mockProps} onUpdate={mockOnUpdate} />)
    expect(screen.getByTestId('task-actions-trigger')).toBeInTheDocument()
  })
})
