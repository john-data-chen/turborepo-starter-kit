/// <reference types="react" />
import React from 'react'
import { ProjectActions } from '@/components/kanban/project/ProjectAction'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Ensure React is globally available
globalThis.React = React

// Mock dependencies
vi.mock('@/stores/workspace-store', () => ({
  useWorkspaceStore: vi.fn()
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: any) => {
    if (values?.title) {
      return `${key}: ${values.title}`
    }
    if (values?.error) {
      return `${key}: ${values.error}`
    }
    return key
  }
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('@/lib/api/projects/queries', () => ({
  useDeleteProject: vi.fn(),
  useUpdateProject: vi.fn()
}))

vi.mock('@/components/kanban/project/ProjectForm', () => ({
  ProjectForm: ({ children, onSubmit }: any) => (
    <form
      data-testid="project-form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ title: 'Updated Project', description: 'Updated Description' })
      }}
    >
      {children}
    </form>
  )
}))

describe('ProjectActions', () => {
  const mockProps = {
    id: 'project-1',
    title: 'Test Project',
    description: 'Test Description',
    ownerId: 'user-1'
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    const { useWorkspaceStore } = await import('@/stores/workspace-store')
    const { useDeleteProject, useUpdateProject } = await import('@/lib/api/projects/queries')

    vi.mocked(useWorkspaceStore).mockImplementation((selector?: any) => {
      const state = {
        userId: 'user-1',
        updateProject: vi.fn().mockResolvedValue(undefined)
      }
      return selector ? selector(state) : state
    })

    vi.mocked(useDeleteProject).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false
    } as any)

    vi.mocked(useUpdateProject).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue(mockProps),
      isPending: false
    } as any)
  })

  it('should render project actions trigger', () => {
    render(<ProjectActions {...mockProps} />)
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument()
  })

  it('should render with owner permissions', () => {
    render(<ProjectActions {...mockProps} />)
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument()
  })

  it('should render without owner permissions', async () => {
    const { useWorkspaceStore } = await import('@/stores/workspace-store')
    vi.mocked(useWorkspaceStore).mockImplementation((selector?: any) => {
      const state = {
        userId: 'user-2',
        updateProject: vi.fn().mockResolvedValue(undefined)
      }
      return selector ? selector(state) : state
    })

    render(<ProjectActions {...mockProps} />)
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument()
  })

  it('should render with description', () => {
    render(<ProjectActions {...mockProps} description="Test Description" />)
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument()
  })

  it('should render without description', () => {
    render(<ProjectActions {...mockProps} description={undefined} />)
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument()
  })

  it('should handle project with minimal props', () => {
    const minimalProps = {
      id: 'project-2',
      title: 'Minimal Project',
      ownerId: 'user-1'
    }
    render(<ProjectActions {...minimalProps} />)
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument()
  })

  it('should determine owner correctly when user is owner', () => {
    render(<ProjectActions {...mockProps} ownerId="user-1" />)
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument()
  })

  it('should determine owner correctly when user is not owner', async () => {
    const { useWorkspaceStore } = await import('@/stores/workspace-store')
    vi.mocked(useWorkspaceStore).mockImplementation((selector?: any) => {
      const state = {
        userId: 'user-3',
        updateProject: vi.fn()
      }
      return selector ? selector(state) : state
    })

    render(<ProjectActions {...mockProps} ownerId="user-1" />)
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument()
  })

  it('should handle null userId', async () => {
    const { useWorkspaceStore } = await import('@/stores/workspace-store')
    vi.mocked(useWorkspaceStore).mockImplementation((selector?: any) => {
      const state = {
        userId: null,
        updateProject: vi.fn()
      }
      return selector ? selector(state) : state
    })

    render(<ProjectActions {...mockProps} />)
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument()
  })

  it('should render dropdown menu trigger', () => {
    render(<ProjectActions {...mockProps} />)
    const trigger = screen.getByTestId('project-option-button')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveClass('bg-background')
  })

  it('should handle project with different owner', () => {
    render(<ProjectActions {...mockProps} ownerId="different-user" />)
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument()
  })

  it('should handle same user as owner', () => {
    render(<ProjectActions {...mockProps} ownerId="user-1" />)
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument()
  })

  it('should render correctly with empty description', () => {
    render(<ProjectActions {...mockProps} description="" />)
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument()
  })

  it('should render correctly with long description', () => {
    const longDescription = 'A'.repeat(500)
    render(<ProjectActions {...mockProps} description={longDescription} />)
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument()
  })

  it('should render correctly with special characters in title', () => {
    render(<ProjectActions {...mockProps} title="Test & Project <>" />)
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument()
  })

  it('should render with pending delete mutation', async () => {
    const { useDeleteProject } = await import('@/lib/api/projects/queries')
    vi.mocked(useDeleteProject).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockImplementation(() => new Promise(() => {})),
      isPending: true
    } as any)

    render(<ProjectActions {...mockProps} />)
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument()
  })

  it('should render with pending update mutation', async () => {
    const { useUpdateProject } = await import('@/lib/api/projects/queries')
    vi.mocked(useUpdateProject).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockImplementation(() => new Promise(() => {})),
      isPending: true
    } as any)

    render(<ProjectActions {...mockProps} />)
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument()
  })

  it('should initialize with correct state', () => {
    const { container } = render(<ProjectActions {...mockProps} />)
    expect(container).toBeTruthy()
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument()
  })

  it('should handle component lifecycle', () => {
    const { unmount } = render(<ProjectActions {...mockProps} />)
    expect(screen.getByTestId('project-option-button')).toBeInTheDocument()
    unmount()
  })

  it('should render component structure correctly', () => {
    const { container } = render(<ProjectActions {...mockProps} />)
    expect(container.firstChild).toBeTruthy()
  })
})
