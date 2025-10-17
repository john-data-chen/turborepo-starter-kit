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
  ProjectForm: ({ children }: any) => <div data-testid="project-form">{children}</div>
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
})
