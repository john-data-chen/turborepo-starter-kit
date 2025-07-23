import { TaskCard } from '@/components/kanban/task/TaskCard';
import { Task, TaskStatus } from '@/types/dbInterface';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: any) => {
    if (values && Object.keys(values).length > 0) {
      return `${key} ${JSON.stringify(values)}`;
    }
    return key;
  }
}));

// Mock TaskActions as it's not the focus of this test
vi.mock('@/components/kanban/task/TaskAction', () => ({
  TaskActions: () => <div data-testid="task-actions-mock" />
}));

describe('TaskCard Component', () => {
  const mockTask: Task = {
    _id: '1',
    title: 'Test Task',
    description: 'This is a test task',
    status: TaskStatus.TODO,
    dueDate: new Date('2025-04-28'),
    creator: { id: 'creator-id', name: 'Creator Name' },
    lastModifier: { id: 'modifier-id', name: 'Modifier Name' },
    assignee: { id: 'assignee-id', name: 'Assignee Name' },
    board: 'board-id',
    project: 'project-id',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('renders task title', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders translated task status', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('statusTodo')).toBeInTheDocument();
  });

  it('renders translated creator info', () => {
    render(<TaskCard task={mockTask} />);
    expect(
      screen.getByText('createdBy {"name":"Creator Name"}')
    ).toBeInTheDocument();
  });

  it('renders translated last modifier info', () => {
    render(<TaskCard task={mockTask} />);
    expect(
      screen.getByText('lastModifiedBy {"name":"Modifier Name"}')
    ).toBeInTheDocument();
  });

  it('renders translated assignee info', () => {
    render(<TaskCard task={mockTask} />);
    expect(
      screen.getByText('assignee {"name":"Assignee Name"}')
    ).toBeInTheDocument();
  });

  it('renders translated due date', () => {
    render(<TaskCard task={mockTask} />);
    const formattedDate = '2025/04/28';
    expect(
      screen.getByText(`dueDate: ${formattedDate}`, { exact: false })
    ).toBeInTheDocument();
  });

  it('renders task description', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('This is a test task')).toBeInTheDocument();
  });
});
