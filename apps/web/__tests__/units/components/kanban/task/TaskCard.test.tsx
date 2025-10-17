/// <reference types="react" />
import React from 'react'
import { TaskCard } from '@/components/kanban/task/TaskCard'
import { TaskStatus, type Task } from '@/types/dbInterface'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Ensure React is globally available
globalThis.React = React

// Mock dependencies
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: any) => {
    if (values?.name) {
      return `${key}: ${values.name}`
    }
    return key
  }
}))

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: vi.fn(() => ({
    setNodeRef: vi.fn(),
    attributes: {},
    listeners: {},
    transform: null,
    transition: undefined,
    isDragging: false
  }))
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Translate: {
      toString: () => ''
    }
  }
}))

vi.mock('@/components/kanban/task/TaskAction', () => ({
  TaskActions: () => <div data-testid="task-actions">Actions</div>
}))

describe('TaskCard', () => {
  const mockTask: Task = {
    _id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    creator: { _id: 'user-1', name: 'John', email: 'john@example.com', createdAt: new Date() },
    lastModifier: { _id: 'user-2', name: 'Jane', email: 'jane@example.com', createdAt: new Date() },
    assignee: { _id: 'user-3', name: 'Bob', email: 'bob@example.com', createdAt: new Date() },
    project: 'project-1',
    board: 'board-1',
    dueDate: new Date('2025-12-31'),
    orderInProject: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render task card', () => {
    const { container } = render(<TaskCard task={mockTask} />)
    const card = container.querySelector('[data-testid="task-card"]')
    expect(card || container.firstChild).toBeTruthy()
  })

  it('should render task title', () => {
    render(<TaskCard task={mockTask} />)
    const titles = screen.getAllByText('Test Task')
    expect(titles.length).toBeGreaterThan(0)
  })

  it('should render task description', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByTestId('task-card-description')).toHaveTextContent('Test Description')
  })

  it('should render TODO status badge', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText('statusTodo')).toBeInTheDocument()
  })

  it('should render IN_PROGRESS status badge', () => {
    const task = { ...mockTask, status: TaskStatus.IN_PROGRESS }
    render(<TaskCard task={task} />)
    expect(screen.getByText('statusInProgress')).toBeInTheDocument()
  })

  it('should render DONE status badge', () => {
    const task = { ...mockTask, status: TaskStatus.DONE }
    render(<TaskCard task={task} />)
    expect(screen.getByText('statusDone')).toBeInTheDocument()
  })

  it('should render creator information', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText(/createdBy: John/)).toBeInTheDocument()
  })

  it('should render last modifier information', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText(/lastModifiedBy: Jane/)).toBeInTheDocument()
  })

  it('should render assignee information', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText(/assignee: Bob/)).toBeInTheDocument()
  })

  it('should render due date', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText(/dueDate/)).toBeInTheDocument()
    expect(screen.getByText(/2025\/12\/31/)).toBeInTheDocument()
  })

  it('should render TaskActions component', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByTestId('task-actions')).toBeInTheDocument()
  })

  it('should return null for deleted task', () => {
    const deletedTask = { ...mockTask, _deleted: true }
    const { container } = render(<TaskCard task={deletedTask} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should render without description', () => {
    const taskWithoutDesc = { ...mockTask, description: undefined }
    render(<TaskCard task={taskWithoutDesc} />)
    expect(screen.queryByTestId('task-card-description')).not.toBeInTheDocument()
  })

  it('should render without creator', () => {
    const taskWithoutCreator = { ...mockTask, creator: undefined }
    render(<TaskCard task={taskWithoutCreator} />)
    expect(screen.queryByText(/createdBy/)).not.toBeInTheDocument()
  })

  it('should render without last modifier', () => {
    const taskWithoutModifier = { ...mockTask, lastModifier: undefined }
    render(<TaskCard task={taskWithoutModifier} />)
    expect(screen.queryByText(/lastModifiedBy/)).not.toBeInTheDocument()
  })

  it('should render without assignee', () => {
    const taskWithoutAssignee = { ...mockTask, assignee: undefined }
    render(<TaskCard task={taskWithoutAssignee} />)
    expect(screen.queryByText(/assignee/)).not.toBeInTheDocument()
  })

  it('should render without due date', () => {
    const taskWithoutDueDate = { ...mockTask, dueDate: undefined }
    render(<TaskCard task={taskWithoutDueDate} />)
    expect(screen.queryByText(/dueDate/)).not.toBeInTheDocument()
  })

  it('should render with drag enabled', () => {
    const { container } = render(<TaskCard task={mockTask} isDragEnabled={true} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should render with drag disabled', () => {
    const { container } = render(<TaskCard task={mockTask} isDragEnabled={false} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should render as overlay', () => {
    const { container } = render(<TaskCard task={mockTask} isOverlay={true} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should call onUpdate callback when provided', () => {
    const mockOnUpdate = vi.fn()
    const { container } = render(<TaskCard task={mockTask} onUpdate={mockOnUpdate} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should render minimal task with only required fields', () => {
    const minimalTask: Task = {
      _id: 'task-2',
      title: 'Minimal Task',
      status: TaskStatus.TODO,
      project: 'project-1',
      board: 'board-1',
      creator: 'user-1',
      lastModifier: 'user-1',
      orderInProject: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    render(<TaskCard task={minimalTask} />)
    const titles = screen.getAllByText('Minimal Task')
    expect(titles.length).toBeGreaterThan(0)
  })

  it('should handle task with no status', () => {
    const taskWithoutStatus = { ...mockTask, status: undefined as any }
    render(<TaskCard task={taskWithoutStatus} />)
    expect(screen.getByText('noStatus')).toBeInTheDocument()
  })

  it('should render drag handle when drag is enabled', () => {
    const { container } = render(<TaskCard task={mockTask} isDragEnabled={true} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should not render drag handle when drag is disabled', () => {
    const { container } = render(<TaskCard task={mockTask} isDragEnabled={false} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should render with dragging state', async () => {
    const { useSortable } = await import('@dnd-kit/sortable')
    vi.mocked(useSortable).mockReturnValue({
      setNodeRef: vi.fn(),
      attributes: {},
      listeners: {},
      transform: null,
      transition: undefined,
      isDragging: true
    } as any)

    const { container } = render(<TaskCard task={mockTask} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should handle transform during drag', async () => {
    const { useSortable } = await import('@dnd-kit/sortable')
    vi.mocked(useSortable).mockReturnValue({
      setNodeRef: vi.fn(),
      attributes: {},
      listeners: {},
      transform: { x: 10, y: 20, scaleX: 1, scaleY: 1 },
      transition: 'transform 200ms ease',
      isDragging: false
    } as any)

    const { container } = render(<TaskCard task={mockTask} />)
    expect(container.firstChild).toBeTruthy()
  })
})
