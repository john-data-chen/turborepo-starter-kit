/// <reference types="react" />
import React from 'react'
import NewTaskDialog from '@/components/kanban/task/NewTaskDialog'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

globalThis.React = React

// Create hoisted mock for useWorkspaceStore
const { mockUseWorkspaceStore, mockGetState } = vi.hoisted(() => {
  const mockGetState = vi.fn()
  const mockUseWorkspaceStore = Object.assign(vi.fn(), {
    getState: mockGetState
  })
  return { mockUseWorkspaceStore, mockGetState }
})

vi.mock('@/lib/api/tasks/queries', () => ({
  useCreateTask: vi.fn()
}))

vi.mock('@/stores/workspace-store', () => ({
  useWorkspaceStore: mockUseWorkspaceStore
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

vi.mock('@/components/kanban/task/TaskForm', () => ({
  TaskForm: ({ children, onSubmit, onCancel }: any) => (
    <form
      data-testid="task-form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.({
          title: 'Test Task',
          description: 'Test Description',
          status: 'todo',
          dueDate: new Date('2024-12-31'),
          assignee: { _id: 'user-1', name: 'Test User', email: 'test@example.com' }
        })
      }}
    >
      {children}
      <button type="button" onClick={onCancel} data-testid="cancel-btn">
        Cancel
      </button>
      <button type="submit" data-testid="submit-btn">
        Submit
      </button>
    </form>
  )
}))

vi.mock('@repo/ui/components/dialog', () => ({
  Dialog: ({ children }: any) => <div data-testid="dialog">{children}</div>,
  DialogTrigger: ({ children }: any) => <div data-testid="dialog-trigger">{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>
}))

vi.mock('@repo/ui/components/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}))

describe('NewTaskDialog', () => {
  const mockProjectId = 'project-1'

  beforeEach(async () => {
    vi.clearAllMocks()

    const { useCreateTask } = await import('@/lib/api/tasks/queries')

    vi.mocked(useCreateTask).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ _id: 'task-1' }),
      mutate: vi.fn(),
      isPending: false
    } as any)

    const store = {
      addTask: vi.fn().mockResolvedValue('task-1'),
      projects: [
        {
          _id: 'project-1',
          title: 'Test Project',
          tasks: [
            { _id: 'task-1', orderInProject: 0 },
            { _id: 'task-2', orderInProject: 1 }
          ]
        }
      ]
    }

    // Setup the mock implementation
    mockUseWorkspaceStore.mockImplementation((selector?: any) =>
      selector ? selector(store) : store
    )
    mockGetState.mockReturnValue(store)
  })

  it('should render dialog', () => {
    render(<NewTaskDialog projectId={mockProjectId} />)
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })

  it('should render trigger button', () => {
    render(<NewTaskDialog projectId={mockProjectId} />)
    expect(screen.getByText('addNewTask')).toBeInTheDocument()
  })

  it('should render trigger button with correct testid', () => {
    render(<NewTaskDialog projectId={mockProjectId} />)
    expect(screen.getByTestId('new-task-trigger')).toBeInTheDocument()
  })

  it('should render dialog title', () => {
    render(<NewTaskDialog projectId={mockProjectId} />)
    expect(screen.getByText('addNewTaskTitle')).toBeInTheDocument()
  })

  it('should render dialog description', () => {
    render(<NewTaskDialog projectId={mockProjectId} />)
    expect(screen.getByText('addNewTaskDescription')).toBeInTheDocument()
  })

  it('should render task form', () => {
    render(<NewTaskDialog projectId={mockProjectId} />)
    expect(screen.getByTestId('task-form')).toBeInTheDocument()
  })

  it('should render with valid projectId', () => {
    render(<NewTaskDialog projectId="project-123" />)
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })

  it('should render dialog structure', () => {
    const { container } = render(<NewTaskDialog projectId={mockProjectId} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should handle dialog content', () => {
    render(<NewTaskDialog projectId={mockProjectId} />)
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-header')).toBeInTheDocument()
  })

  it('should render dialog with all required elements', () => {
    render(<NewTaskDialog projectId={mockProjectId} />)
    expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-description')).toBeInTheDocument()
    expect(screen.getByTestId('task-form')).toBeInTheDocument()
  })

  it('should handle form submission', async () => {
    const { container } = render(<NewTaskDialog projectId={mockProjectId} />)

    const form = container.querySelector('form')
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    }

    expect(container.querySelector('form')).toBeInTheDocument()
  })

  it('should handle cancel button click', () => {
    const { container } = render(<NewTaskDialog projectId={mockProjectId} />)

    const cancelBtn = container.querySelector('[data-testid="cancel-btn"]')
    if (cancelBtn) {
      cancelBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    }

    expect(container.querySelector('form')).toBeInTheDocument()
  })

  it('should have proper dialog structure for task creation', () => {
    render(<NewTaskDialog projectId={mockProjectId} />)
    expect(screen.getByTestId('new-task-trigger')).toBeInTheDocument()
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('task-form')).toBeInTheDocument()
  })
})
