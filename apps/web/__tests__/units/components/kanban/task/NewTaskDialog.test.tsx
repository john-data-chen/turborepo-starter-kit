/// <reference types="react" />
import React from 'react'
import NewTaskDialog from '@/components/kanban/task/NewTaskDialog'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

globalThis.React = React

vi.mock('@/lib/api/tasks/queries', () => ({
  useCreateTask: vi.fn()
}))

vi.mock('@/stores/workspace-store', () => ({
  useWorkspaceStore: vi.fn()
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
  TaskForm: ({ children }: any) => <div data-testid="task-form">{children}</div>
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
    const { useWorkspaceStore } = await import('@/stores/workspace-store')

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

    vi.mocked(useWorkspaceStore).mockImplementation(
      Object.assign(
        vi.fn((selector?: any) => (selector ? selector(store) : store)),
        { getState: () => store }
      ) as any
    )
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
})
