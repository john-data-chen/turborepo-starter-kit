/// <reference types="react" />
import React from 'react'
import { TaskForm } from '@/components/kanban/task/TaskForm'
import { TaskStatus } from '@/types/dbInterface'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Ensure React is globally available
globalThis.React = React

// Mock dependencies
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

// Mock Form components to avoid react-hook-form complexity
vi.mock('@repo/ui/components/form', () => ({
  Form: ({ children }: any) => <div data-testid="form">{children}</div>,
  FormField: ({ render }: any) => {
    const field = { value: '', onChange: vi.fn(), onBlur: vi.fn(), name: 'test' }
    return render({ field })
  },
  FormItem: ({ children }: any) => <div data-testid="form-item">{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  FormMessage: ({ children }: any) => <span data-testid="form-message">{children}</span>
}))

// Mock Popover components
vi.mock('@repo/ui/components/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>
}))

// Mock Calendar component
vi.mock('@repo/ui/components/calendar', () => ({
  Calendar: () => <div data-testid="calendar">Calendar</div>
}))

// Mock Command components
vi.mock('@repo/ui/components/command', () => ({
  Command: ({ children }: any) => <div>{children}</div>,
  CommandInput: () => <input data-testid="command-input" />,
  CommandList: ({ children }: any) => <div>{children}</div>,
  CommandEmpty: ({ children }: any) => <div>{children}</div>,
  CommandGroup: ({ children }: any) => <div>{children}</div>,
  CommandItem: ({ children, onSelect }: any) => (
    <div onClick={onSelect} data-testid="command-item">
      {children}
    </div>
  )
}))

// Mock RadioGroup components
vi.mock('@repo/ui/components/radio-group', () => ({
  RadioGroup: ({ children, defaultValue }: any) => <div data-testid="radio-group">{children}</div>,
  RadioGroupItem: ({ value }: any) => <input type="radio" value={value} />
}))

vi.mock('@/hooks/useTaskForm', () => ({
  useTaskForm: vi.fn(() => ({
    form: {
      handleSubmit: vi.fn((fn) => (e: any) => {
        e?.preventDefault()
        fn({ title: 'Test Task', status: 'TODO' })
      }),
      control: {} as any,
      formState: { errors: {} }
    },
    isSubmitting: false,
    users: [
      { _id: 'user-1', name: 'John Doe', email: 'john@example.com', createdAt: new Date() },
      { _id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date() }
    ],
    searchQuery: '',
    setSearchQuery: vi.fn(),
    isSearching: false,
    assignOpen: false,
    setAssignOpen: vi.fn(),
    handleSubmit: vi.fn()
  }))
}))

describe('TaskForm', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined)
  const mockOnCancel = vi.fn()

  const defaultValues = {
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    dueDate: new Date('2025-12-31'),
    assignee: { _id: 'user-1', name: 'John Doe', email: 'john@example.com' },
    projectId: 'project-1',
    boardId: 'board-1'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render task form', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)
    expect(screen.getByTestId('task-title-input')).toBeInTheDocument()
  })

  it('should render form with default values', () => {
    render(<TaskForm defaultValues={defaultValues} onSubmit={mockOnSubmit} />)
    expect(screen.getByTestId('task-title-input')).toBeInTheDocument()
  })

  it('should render title input', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)
    expect(screen.getByTestId('task-title-input')).toBeInTheDocument()
  })

  it('should render description textarea', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)
    expect(screen.getByTestId('task-description-input')).toBeInTheDocument()
  })

  it('should render submit button', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)
    expect(screen.getByTestId('submit-task-button')).toBeInTheDocument()
  })

  it('should render cancel button when onCancel is provided', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    expect(screen.getByTestId('cancel-task-button')).toBeInTheDocument()
  })

  it('should not render cancel button when onCancel is not provided', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)
    expect(screen.queryByTestId('cancel-task-button')).not.toBeInTheDocument()
  })

  it('should render custom submit label', () => {
    render(<TaskForm onSubmit={mockOnSubmit} submitLabel="Create Task" />)
    expect(screen.getByText('Create Task')).toBeInTheDocument()
  })

  it('should render default submit label', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)
    expect(screen.getByText('Submit')).toBeInTheDocument()
  })

  it('should render status radio group', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)
    expect(screen.getByText('statusTodo')).toBeInTheDocument()
    expect(screen.getByText('statusInProgress')).toBeInTheDocument()
    expect(screen.getByText('statusDone')).toBeInTheDocument()
  })

  it('should render assignee trigger', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)
    expect(screen.getByTestId('assignee-trigger')).toBeInTheDocument()
  })

  it('should render due date picker trigger', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)
    expect(screen.getByTestId('task-date-picker-trigger')).toBeInTheDocument()
  })

  it('should show submitting state', async () => {
    const { useTaskForm } = await import('@/hooks/useTaskForm')
    vi.mocked(useTaskForm).mockReturnValue({
      form: {
        handleSubmit: vi.fn((fn) => (e: any) => {
          e?.preventDefault()
          fn({ title: 'Test' })
        }),
        control: {} as any,
        formState: { errors: {} }
      } as any,
      isSubmitting: true,
      users: [],
      searchQuery: '',
      setSearchQuery: vi.fn(),
      isSearching: false,
      assignOpen: false,
      setAssignOpen: vi.fn(),
      handleSubmit: vi.fn()
    })

    render(<TaskForm onSubmit={mockOnSubmit} />)
    expect(screen.getByText('submitting')).toBeInTheDocument()
  })

  it('should show users in assignee list', async () => {
    const { useTaskForm } = await import('@/hooks/useTaskForm')
    vi.mocked(useTaskForm).mockReturnValue({
      form: {
        handleSubmit: vi.fn(),
        control: {} as any,
        formState: { errors: {} }
      } as any,
      isSubmitting: false,
      users: [
        { _id: 'user-1', name: 'John Doe', email: 'john@example.com', createdAt: new Date() },
        { _id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date() }
      ],
      searchQuery: '',
      setSearchQuery: vi.fn(),
      isSearching: false,
      assignOpen: false,
      setAssignOpen: vi.fn(),
      handleSubmit: vi.fn()
    })

    render(<TaskForm onSubmit={mockOnSubmit} />)
    expect(screen.getByTestId('task-title-input')).toBeInTheDocument()
  })

  it('should show searching state', async () => {
    const { useTaskForm } = await import('@/hooks/useTaskForm')
    vi.mocked(useTaskForm).mockReturnValue({
      form: {
        handleSubmit: vi.fn(),
        control: {} as any,
        formState: { errors: {} }
      } as any,
      isSubmitting: false,
      users: [],
      searchQuery: 'test',
      setSearchQuery: vi.fn(),
      isSearching: true,
      assignOpen: false,
      setAssignOpen: vi.fn(),
      handleSubmit: vi.fn()
    })

    render(<TaskForm onSubmit={mockOnSubmit} />)
    expect(screen.getByTestId('task-title-input')).toBeInTheDocument()
  })

  it('should render with minimal props', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)
    expect(screen.getByTestId('task-title-input')).toBeInTheDocument()
    expect(screen.getByTestId('task-description-input')).toBeInTheDocument()
    expect(screen.getByTestId('submit-task-button')).toBeInTheDocument()
  })

  it('should render with all props provided', () => {
    render(
      <TaskForm
        defaultValues={defaultValues}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitLabel="Update Task"
      />
    )
    expect(screen.getByTestId('task-title-input')).toBeInTheDocument()
    expect(screen.getByTestId('cancel-task-button')).toBeInTheDocument()
    expect(screen.getByText('Update Task')).toBeInTheDocument()
  })

  it('should render form labels', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)
    expect(screen.getByText('titleLabel')).toBeInTheDocument()
    expect(screen.getByText('dueDateLabel')).toBeInTheDocument()
    expect(screen.getByText('assignToLabel')).toBeInTheDocument()
    expect(screen.getByText('statusLabel')).toBeInTheDocument()
    expect(screen.getByText('descriptionLabel')).toBeInTheDocument()
  })

  it('should handle default values with undefined assignee', () => {
    const valuesWithoutAssignee = { ...defaultValues, assignee: undefined }
    render(<TaskForm defaultValues={valuesWithoutAssignee} onSubmit={mockOnSubmit} />)
    expect(screen.getByTestId('task-title-input')).toBeInTheDocument()
  })

  it('should handle default values with undefined dueDate', () => {
    const valuesWithoutDueDate = { ...defaultValues, dueDate: undefined }
    render(<TaskForm defaultValues={valuesWithoutDueDate} onSubmit={mockOnSubmit} />)
    expect(screen.getByTestId('task-title-input')).toBeInTheDocument()
  })

  it('should handle default values with undefined description', () => {
    const valuesWithoutDescription = { ...defaultValues, description: undefined }
    render(<TaskForm defaultValues={valuesWithoutDescription} onSubmit={mockOnSubmit} />)
    expect(screen.getByTestId('task-description-input')).toBeInTheDocument()
  })
})
