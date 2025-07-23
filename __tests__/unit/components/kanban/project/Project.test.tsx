import { BoardProject } from '@/components/kanban/project/Project';
import { Project, Task, TaskStatus, UserInfo } from '@/types/dbInterface';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Hoist React and the mock function for useSortable
const React = vi.hoisted(() => import('react'));
const mockUseSortableFn = vi.hoisted(() => vi.fn()); // Hoist the mock function itself

// --- Mock Data ---
const mockOwner: UserInfo = { id: 'u1', name: 'Owner User' };
const mockMember1: UserInfo = { id: 'u2', name: 'Member One' };
const mockMember2: UserInfo = { id: 'u3', name: 'Member Two' };

const mockProject: Project = {
  _id: 'p1',
  title: 'Test Project Title',
  description: 'Test Project Description',
  owner: mockOwner,
  members: [mockMember1, mockMember2],
  tasks: [], // Task IDs will be derived from the tasks prop
  board: 'b1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockTasks: Task[] = [
  {
    _id: 't1',
    title: 'Task 1',
    status: TaskStatus.TODO,
    project: 'p1',
    board: 'b1',
    creator: mockOwner,
    lastModifier: mockOwner,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 't2',
    title: 'Task 2',
    status: TaskStatus.IN_PROGRESS,
    project: 'p1',
    board: 'b1',
    creator: mockMember1,
    lastModifier: mockMember1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 't3',
    title: 'Task 3',
    status: TaskStatus.DONE,
    project: 'p1',
    board: 'b1',
    creator: mockMember2,
    lastModifier: mockMember2,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Derive task IDs for the project mock
mockProject.tasks = mockTasks.map(
  (t) => ({ _id: t._id, title: t.title }) as any
); // Simplified for mock

// --- Mocks ---

// Mock useTaskStore
// Explicitly type the return value of the mock function
const mockFilter = vi.fn((): { status: TaskStatus | null } => ({
  status: null
}));
vi.mock('@/lib/store', () => ({
  useTaskStore: () => ({
    filter: mockFilter()
  })
}));

// Mock @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', async (importOriginal) => {
  const original = await importOriginal<typeof import('@dnd-kit/sortable')>();
  // Await React here, once, outside the component definition
  const ReactResolved = await React;
  return {
    ...original,
    useSortable: mockUseSortableFn, // Use the hoisted mock function directly
    // Remove async from the component definition
    SortableContext: ({ children }: { children: React.ReactNode }) =>
      // Use the already resolved React module
      ReactResolved.createElement(ReactResolved.Fragment, null, children)
  };
});

// Mock Child Components
vi.mock('@/components/kanban/project/ProjectAction', () => ({
  ProjectActions: (props: any) => (
    <div data-testid="project-actions" {...props} />
  )
}));
vi.mock('@/components/kanban/task/NewTaskDialog', () => ({
  default: (props: any) => <div data-testid="new-task-dialog" {...props} />
}));
vi.mock('@/components/kanban/task/TaskCard', () => ({
  TaskCard: ({ task }: { task: Task }) => (
    <div data-testid={`task-card-${task._id}`}>{task.title}</div>
  )
}));

// Mock UI Components (Simplified)
vi.mock('@/components/ui/card', async () => ({
  // Use the hoisted React here
  Card: (await React).forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} data-testid="mock-card" {...props}>
      {children}
    </div>
  )),
  CardHeader: ({ children, ...props }: any) => (
    <div data-testid="mock-card-header" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div data-testid="mock-card-content" {...props}>
      {children}
    </div>
  )
}));
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  )
}));
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => (
    <span data-testid="mock-badge" {...props}>
      {children}
    </span>
  )
}));
vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, ...props }: any) => (
    <div data-testid="mock-scroll-area" {...props}>
      {children}
    </div>
  ),
  ScrollBar: (props: any) => <div data-testid="mock-scroll-bar" {...props} />
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}));

// --- Tests ---

describe('BoardProject Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFilter.mockReturnValue({ status: null });
    // Reset the mock function's return value for each test
    mockUseSortableFn.mockReturnValue({
      setNodeRef: vi.fn(),
      // Correct the role attribute to 'button'
      attributes: { role: 'button' },
      listeners: { onMouseDown: vi.fn() },
      transform: null,
      transition: null,
      isDragging: false
    });
  });

  it('should render project details correctly with translated labels', () => {
    render(<BoardProject project={mockProject} tasks={mockTasks} />);

    expect(
      screen.getByText(`description: ${mockProject.description}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`owner: ${mockProject.owner.name}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `members: ${mockProject.members.map((m) => m.name).join(', ')}`
      )
    ).toBeInTheDocument();
  });

  it('should render all tasks when no filter is active', () => {
    render(<BoardProject project={mockProject} tasks={mockTasks} />);

    expect(screen.getByTestId('task-card-t1')).toHaveTextContent('Task 1');
    expect(screen.getByTestId('task-card-t2')).toHaveTextContent('Task 2');
    expect(screen.getByTestId('task-card-t3')).toHaveTextContent('Task 3');
    expect(screen.queryAllByTestId(/task-card-/)).toHaveLength(3);
  });

  it('should render only TODO tasks when filter is set to TODO', () => {
    // This call is now type-safe because the return type allows TaskStatus
    mockFilter.mockReturnValue({ status: TaskStatus.TODO });
    render(<BoardProject project={mockProject} tasks={mockTasks} />);

    expect(screen.getByTestId('task-card-t1')).toHaveTextContent('Task 1');
    expect(screen.queryByTestId('task-card-t2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('task-card-t3')).not.toBeInTheDocument();
    expect(screen.queryAllByTestId(/task-card-/)).toHaveLength(1);
  });

  it('should render only IN_PROGRESS tasks when filter is set to IN_PROGRESS', () => {
    // This call is also type-safe
    mockFilter.mockReturnValue({ status: TaskStatus.IN_PROGRESS });
    render(<BoardProject project={mockProject} tasks={mockTasks} />);

    expect(screen.queryByTestId('task-card-t1')).not.toBeInTheDocument();
    expect(screen.getByTestId('task-card-t2')).toHaveTextContent('Task 2');
    expect(screen.queryByTestId('task-card-t3')).not.toBeInTheDocument();
    expect(screen.queryAllByTestId(/task-card-/)).toHaveLength(1);
  });

  it('should render only DONE tasks when filter is set to DONE', () => {
    // This call is also type-safe
    mockFilter.mockReturnValue({ status: TaskStatus.DONE });
    render(<BoardProject project={mockProject} tasks={mockTasks} />);

    expect(screen.queryByTestId('task-card-t1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('task-card-t2')).not.toBeInTheDocument();
    expect(screen.getByTestId('task-card-t3')).toHaveTextContent('Task 3');
    expect(screen.queryAllByTestId(/task-card-/)).toHaveLength(1);
  });

  it('should apply default styles when not dragging', () => {
    render(<BoardProject project={mockProject} tasks={mockTasks} />);
    // Change the query to find the correct element
    const container = screen.getByTestId('project-container');
    expect(container).not.toHaveClass('ring-2');
    expect(container).not.toHaveClass('opacity-30');
    expect(container).not.toHaveClass('ring-primary');
  });

  it('should apply "over" styles when dragging (but not overlay)', () => {
    // Update the return value of the mock function for this specific test
    mockUseSortableFn.mockReturnValue({
      setNodeRef: vi.fn(),
      attributes: {
        // Also update role here if needed for consistency, though not strictly necessary for this test's assertions
        role: 'button'
      },
      listeners: {
        onMouseDown: vi.fn()
      },
      transform: null,
      transition: null,
      isDragging: true // Simulate dragging
    });
    render(<BoardProject project={mockProject} tasks={mockTasks} />);
    const container = screen.getByTestId('project-container');
    // Check for class parts indicative of the 'over' state on the container
    expect(container).toHaveClass('ring-2');
    expect(container).toHaveClass('opacity-30');
    // expect(container).not.toHaveClass('border-transparent'); // Adjust as needed
    expect(container).not.toHaveClass('ring-primary');
  });

  it('should apply "overlay" styles when isOverlay is true', async () => {
    // Make the test function async
    // Update the return value of the mock function for this specific test
    mockUseSortableFn.mockReturnValue({
      setNodeRef: vi.fn(),
      attributes: {
        // Also update role here if needed for consistency
        role: 'button'
      },
      listeners: {
        onMouseDown: vi.fn()
      },
      transform: null,
      transition: null,
      isDragging: true
    });
    // Await the React promise before using createElement
    const ReactResolved = await React;
    render(
      // Use the resolved React module
      ReactResolved.createElement(BoardProject, {
        project: mockProject,
        tasks: mockTasks,
        isOverlay: true
      })
    );
    // Change the query to find the correct element
    const container = screen.getByTestId('project-container');
    // Check for class parts indicative of the 'overlay' state on the container
    expect(container).toHaveClass('ring-2');
    expect(container).toHaveClass('ring-primary');
    expect(container).not.toHaveClass('border-transparent');
    expect(container).not.toHaveClass('opacity-30');
  });

  it('should render project description placeholder if description is null/undefined', () => {
    const projectWithoutDesc = { ...mockProject, description: undefined };
    render(<BoardProject project={projectWithoutDesc} tasks={mockTasks} />);
    expect(screen.getByText('description: noDescription')).toBeInTheDocument();
  });
});
