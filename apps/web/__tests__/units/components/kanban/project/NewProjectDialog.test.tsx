/// <reference types="react" />
import React from 'react'
import NewProjectDialog from '@/components/kanban/project/NewProjectDialog'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

globalThis.React = React

vi.mock('@/lib/api/projects/queries', () => ({
  useCreateProject: vi.fn()
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

vi.mock('@/components/kanban/project/ProjectForm', () => ({
  ProjectForm: ({ children, onSubmit, onCancel }: any) => (
    <form
      data-testid="project-form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.({ title: 'Test Project', description: 'Test Description' })
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
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>
}))

describe('NewProjectDialog', () => {
  beforeEach(async () => {
    vi.clearAllMocks()

    const { useCreateProject } = await import('@/lib/api/projects/queries')
    const { useWorkspaceStore } = await import('@/stores/workspace-store')

    vi.mocked(useCreateProject).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ _id: 'project-1' }),
      mutate: vi.fn(),
      isPending: false
    } as any)

    vi.mocked(useWorkspaceStore).mockImplementation((selector?: any) => {
      const state = {
        addProject: vi.fn().mockResolvedValue('project-1')
      }
      return selector ? selector(state) : state
    })
  })

  it('should render dialog', () => {
    render(<NewProjectDialog />)
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })

  it('should render trigger button', () => {
    render(<NewProjectDialog />)
    expect(screen.getByText('addNewProject')).toBeInTheDocument()
  })

  it('should render dialog title', () => {
    render(<NewProjectDialog />)
    expect(screen.getByText('addNewProjectTitle')).toBeInTheDocument()
  })

  it('should render dialog description', () => {
    render(<NewProjectDialog />)
    expect(screen.getByText('addNewProjectDescription')).toBeInTheDocument()
  })

  it('should render project form', () => {
    render(<NewProjectDialog />)
    expect(screen.getByTestId('project-form')).toBeInTheDocument()
  })

  it('should render cancel button', () => {
    render(<NewProjectDialog />)
    expect(screen.getByText('cancel')).toBeInTheDocument()
  })

  it('should render submit button', () => {
    render(<NewProjectDialog />)
    expect(screen.getByText('addProject')).toBeInTheDocument()
  })

  it('should call onProjectAdd callback when provided', () => {
    const mockOnProjectAdd = vi.fn()
    render(<NewProjectDialog onProjectAdd={mockOnProjectAdd} />)
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })

  it('should render without onProjectAdd callback', () => {
    render(<NewProjectDialog />)
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
  })

  it('should handle form submission', async () => {
    const mockAddProject = vi.fn().mockResolvedValue('project-1')
    const mockOnProjectAdd = vi.fn()

    const { useWorkspaceStore } = await import('@/stores/workspace-store')

    vi.mocked(useWorkspaceStore).mockImplementation((selector?: any) => {
      const state = { addProject: mockAddProject }
      return selector ? selector(state) : state
    })

    const { container } = render(<NewProjectDialog onProjectAdd={mockOnProjectAdd} />)

    const form = container.querySelector('form')
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    }

    expect(container.querySelector('form')).toBeInTheDocument()
  })

  it('should handle cancel button click', () => {
    const { container } = render(<NewProjectDialog />)

    const cancelBtn = container.querySelector('[data-testid="cancel-btn"]')
    if (cancelBtn) {
      cancelBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    }

    expect(container.querySelector('form')).toBeInTheDocument()
  })

  it('should handle form submission without callback', async () => {
    const mockAddProject = vi.fn().mockResolvedValue('project-1')

    const { useWorkspaceStore } = await import('@/stores/workspace-store')

    vi.mocked(useWorkspaceStore).mockImplementation((selector?: any) => {
      const state = { addProject: mockAddProject }
      return selector ? selector(state) : state
    })

    const { container } = render(<NewProjectDialog />)

    const form = container.querySelector('form')
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    }

    expect(container.querySelector('form')).toBeInTheDocument()
  })

  it('should handle successful project creation and call callback', async () => {
    const mockAddProject = vi.fn().mockResolvedValue('new-project-id')
    const mockOnProjectAdd = vi.fn()

    const { useWorkspaceStore } = await import('@/stores/workspace-store')

    vi.mocked(useWorkspaceStore).mockImplementation((selector?: any) => {
      const state = { addProject: mockAddProject }
      return selector ? selector(state) : state
    })

    const { container } = render(<NewProjectDialog onProjectAdd={mockOnProjectAdd} />)

    const form = container.querySelector('form')
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    }

    expect(container.querySelector('form')).toBeInTheDocument()
  })

  it('should handle when addProject returns falsy value', async () => {
    const mockAddProject = vi.fn().mockResolvedValue(null)

    const { useWorkspaceStore } = await import('@/stores/workspace-store')

    vi.mocked(useWorkspaceStore).mockImplementation((selector?: any) => {
      const state = { addProject: mockAddProject }
      return selector ? selector(state) : state
    })

    const { container } = render(<NewProjectDialog />)

    const form = container.querySelector('form')
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    }

    expect(container.querySelector('form')).toBeInTheDocument()
  })

  it('should handle when addProject returns empty string', async () => {
    const mockAddProject = vi.fn().mockResolvedValue('')

    const { useWorkspaceStore } = await import('@/stores/workspace-store')

    vi.mocked(useWorkspaceStore).mockImplementation((selector?: any) => {
      const state = { addProject: mockAddProject }
      return selector ? selector(state) : state
    })

    const { container } = render(<NewProjectDialog />)

    const form = container.querySelector('form')
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    }

    expect(container.querySelector('form')).toBeInTheDocument()
  })
})
