/// <reference types="react" />
import React from 'react'
import { BoardContainer, BoardProject } from '@/components/kanban/project/Project'
import { TaskStatus, type Project, type Task } from '@/types/dbInterface'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Ensure React is globally available
globalThis.React = React

// Mock dependencies
vi.mock('@/stores/workspace-store', () => ({
  useWorkspaceStore: vi.fn(() => ({
    filter: { status: null, search: '' },
    fetchTasksByProject: vi.fn()
  }))
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => <div>{children}</div>,
  useSortable: () => ({
    setNodeRef: vi.fn(),
    attributes: {},
    listeners: {},
    transform: null,
    transition: undefined,
    isDragging: false
  })
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Translate: {
      toString: () => ''
    }
  }
}))

vi.mock('@/components/kanban/task/NewTaskDialog', () => ({
  default: ({ projectId }: any) => <div data-testid={`new-task-dialog-${projectId}`}>New Task</div>
}))

vi.mock('@/components/kanban/task/TaskCard', () => ({
  TaskCard: ({ task }: any) => <div data-testid={`task-${task._id}`}>{task.title}</div>
}))

vi.mock('@/components/kanban/project/ProjectAction', () => ({
  ProjectActions: ({ title }: any) => <div data-testid="project-actions">{title} Actions</div>
}))

describe('BoardProject', () => {
  const mockProject: Project = {
    _id: 'project-1',
    title: 'Test Project',
    description: 'Test Description',
    board: 'board-1',
    owner: { _id: 'user-1', name: 'John Doe', email: 'john@example.com', createdAt: new Date() },
    members: [
      { _id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date() },
      { _id: 'user-3', name: 'Bob Johnson', email: 'bob@example.com', createdAt: new Date() }
    ],
    orderInBoard: 0,
    tasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const mockTasks: Task[] = [
    {
      _id: 'task-1',
      title: 'Task 1',
      description: 'Description 1',
      status: TaskStatus.TODO,
      project: 'project-1',
      board: 'board-1',
      creator: 'user-1',
      lastModifier: 'user-1',
      orderInProject: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'task-2',
      title: 'Task 2',
      description: 'Description 2',
      status: TaskStatus.IN_PROGRESS,
      project: 'project-1',
      board: 'board-1',
      creator: 'user-1',
      lastModifier: 'user-1',
      orderInProject: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'task-3',
      title: 'Task 3',
      description: 'Description 3',
      status: TaskStatus.DONE,
      project: 'project-1',
      board: 'board-1',
      creator: 'user-1',
      lastModifier: 'user-1',
      orderInProject: 2,
      _deleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render project with title', () => {
    render(
      <BoardProject project={mockProject} tasks={[]} isBoardOwner={true} isBoardMember={true} currentUserId="user-1" />
    )

    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('should render project description', () => {
    render(
      <BoardProject project={mockProject} tasks={[]} isBoardOwner={true} isBoardMember={true} currentUserId="user-1" />
    )

    expect(screen.getByText(/Test Description/)).toBeInTheDocument()
  })

  it('should render project owner', () => {
    render(
      <BoardProject project={mockProject} tasks={[]} isBoardOwner={true} isBoardMember={true} currentUserId="user-1" />
    )

    expect(screen.getByText(/John Doe/)).toBeInTheDocument()
  })

  it('should render project members', () => {
    render(
      <BoardProject project={mockProject} tasks={[]} isBoardOwner={true} isBoardMember={true} currentUserId="user-1" />
    )

    expect(screen.getByText(/Jane Smith, Bob Johnson/)).toBeInTheDocument()
  })

  it('should render all non-deleted tasks', () => {
    render(
      <BoardProject
        project={mockProject}
        tasks={mockTasks}
        isBoardOwner={true}
        isBoardMember={true}
        currentUserId="user-1"
      />
    )

    expect(screen.getByTestId('task-task-1')).toBeInTheDocument()
    expect(screen.getByTestId('task-task-2')).toBeInTheDocument()
    expect(screen.queryByTestId('task-task-3')).not.toBeInTheDocument() // Deleted task should not render
  })

  it('should render new task dialog', () => {
    render(
      <BoardProject project={mockProject} tasks={[]} isBoardOwner={true} isBoardMember={true} currentUserId="user-1" />
    )

    expect(screen.getByTestId('new-task-dialog-project-1')).toBeInTheDocument()
  })

  it('should render project actions', () => {
    render(
      <BoardProject project={mockProject} tasks={[]} isBoardOwner={true} isBoardMember={true} currentUserId="user-1" />
    )

    expect(screen.getByTestId('project-actions')).toBeInTheDocument()
  })

  it('should show "noDescription" when project has no description', () => {
    const projectWithoutDesc = { ...mockProject, description: '' }
    render(
      <BoardProject
        project={projectWithoutDesc}
        tasks={[]}
        isBoardOwner={true}
        isBoardMember={true}
        currentUserId="user-1"
      />
    )

    expect(screen.getByText(/noDescription/)).toBeInTheDocument()
  })

  it('should render with string owner ID', () => {
    const projectWithStringOwner = { ...mockProject, owner: 'user-1' }
    render(
      <BoardProject
        project={projectWithStringOwner}
        tasks={[]}
        isBoardOwner={true}
        isBoardMember={true}
        currentUserId="user-1"
      />
    )

    expect(screen.getByText(/user-1/)).toBeInTheDocument()
  })

  it('should not render members badge when project has no members', () => {
    const projectWithoutMembers = { ...mockProject, members: [] }
    render(
      <BoardProject
        project={projectWithoutMembers}
        tasks={[]}
        isBoardOwner={true}
        isBoardMember={true}
        currentUserId="user-1"
      />
    )

    // Members badge should not be rendered
    const membersBadges = screen.queryByText(/members:/)
    expect(membersBadges).not.toBeInTheDocument()
  })

  it('should filter tasks by status', async () => {
    const { useWorkspaceStore } = await import('@/stores/workspace-store')
    vi.mocked(useWorkspaceStore).mockReturnValue({
      filter: { status: TaskStatus.TODO, search: '' },
      fetchTasksByProject: vi.fn()
    } as any)

    render(
      <BoardProject
        project={mockProject}
        tasks={mockTasks}
        isBoardOwner={true}
        isBoardMember={true}
        currentUserId="user-1"
      />
    )

    expect(screen.getByTestId('task-task-1')).toBeInTheDocument()
    expect(screen.queryByTestId('task-task-2')).not.toBeInTheDocument() // Different status
  })

  it('should fetch tasks on mount', async () => {
    const { useWorkspaceStore } = await import('@/stores/workspace-store')
    const mockFetchTasksByProject = vi.fn().mockResolvedValue(mockTasks)

    vi.mocked(useWorkspaceStore).mockReturnValue({
      filter: { status: null, search: '' },
      fetchTasksByProject: mockFetchTasksByProject
    } as any)

    render(
      <BoardProject project={mockProject} tasks={[]} isBoardOwner={true} isBoardMember={true} currentUserId="user-1" />
    )

    await waitFor(() => {
      expect(mockFetchTasksByProject).toHaveBeenCalledWith('project-1')
    })
  })

  it('should handle fetch tasks error', async () => {
    const { useWorkspaceStore } = await import('@/stores/workspace-store')
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const mockFetchTasksByProject = vi.fn().mockRejectedValue(new Error('Fetch error'))

    vi.mocked(useWorkspaceStore).mockReturnValue({
      filter: { status: null, search: '' },
      fetchTasksByProject: mockFetchTasksByProject
    } as any)

    render(
      <BoardProject project={mockProject} tasks={[]} isBoardOwner={true} isBoardMember={true} currentUserId="user-1" />
    )

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load tasks:', expect.any(Error))
    })

    consoleErrorSpy.mockRestore()
  })

  it('should render with empty tasks array', () => {
    render(
      <BoardProject project={mockProject} tasks={[]} isBoardOwner={true} isBoardMember={true} currentUserId="user-1" />
    )

    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.queryByTestId('task-task-1')).not.toBeInTheDocument()
  })

  it('should handle owner as UserInfo object with missing name', () => {
    const projectWithPartialOwner = {
      ...mockProject,
      owner: { _id: 'user-1', email: 'john@example.com', createdAt: new Date() } as any
    }
    render(
      <BoardProject
        project={projectWithPartialOwner}
        tasks={[]}
        isBoardOwner={true}
        isBoardMember={true}
        currentUserId="user-1"
      />
    )

    expect(screen.getByText(/john@example.com/)).toBeInTheDocument()
  })

  it('should render project container', () => {
    const { container } = render(
      <BoardProject project={mockProject} tasks={[]} isBoardOwner={true} isBoardMember={true} currentUserId="user-1" />
    )

    const projectContainer = container.querySelector('.project-container')
    expect(projectContainer).toBeInTheDocument()
  })
})

describe('BoardContainer', () => {
  it('should render children', () => {
    render(
      <BoardContainer>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </BoardContainer>
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
  })
})
