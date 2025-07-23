import { Board } from '@/components/kanban/board/Board';
import { Project, Task, TaskStatus, UserInfo } from '@/types/dbInterface';
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { act, render, screen } from '@testing-library/react';
// Added act
import React from 'react';
import { vi } from 'vitest';

// --- Hoisted Mocks & Variables ---
const mockSetProjects = vi.fn();
const mockDragTaskOnProject = vi.fn();
let mockProjectsData: Project[] = [];
let mockIsLoadingProjectsData = false;
let mockFilterData: { status?: TaskStatus | null; search?: string } = {};

vi.mock('@/lib/store', () => ({
  useTaskStore: (selector: (state: any) => any) => {
    const state = {
      projects: mockProjectsData,
      isLoadingProjects: mockIsLoadingProjectsData,
      filter: mockFilterData,
      setProjects: mockSetProjects,
      dragTaskOnProject: mockDragTaskOnProject
    };
    return selector(state);
  }
}));

const hoistedToastMocks = vi.hoisted(() => {
  return {
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn()
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: hoistedToastMocks.mockToastSuccess,
    error: hoistedToastMocks.mockToastError
  }
}));

vi.mock('@dnd-kit/sortable', async (importOriginal: () => Promise<any>) => {
  // Optional: Improved type for importOriginal
  const actual = (await importOriginal()) as typeof import('@dnd-kit/sortable'); // FIXED
  return {
    ...actual,
    arrayMove: vi.fn((array, from, to) => {
      const newArray = [...array];
      if (
        from >= 0 &&
        from < newArray.length &&
        to >= 0 &&
        to <= newArray.length
      ) {
        const [element] = newArray.splice(from, 1);
        newArray.splice(to, 0, element);
      }
      return newArray;
    })
  };
});

let capturedDragStart: ((event: DragStartEvent) => void) | undefined;
let capturedDragOver: ((event: DragOverEvent) => void) | undefined;
let capturedDragEnd: ((event: DragEndEvent) => void) | undefined;

vi.mock('@dnd-kit/core', async (importOriginal: () => Promise<any>) => {
  // Optional: Improved type for importOriginal
  const actual = (await importOriginal()) as typeof import('@dnd-kit/core'); // FIXED
  return {
    ...actual,
    DndContext: vi.fn(
      ({
        children,
        onDragStart,
        onDragOver,
        onDragEnd
      }: React.PropsWithChildren<any>) => {
        capturedDragStart = onDragStart;
        capturedDragOver = onDragOver;
        capturedDragEnd = onDragEnd;
        return <div data-testid="dnd-context-wrapper">{children}</div>;
      }
    ),
    DragOverlay: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="drag-overlay">{children}</div>
    ),
    MouseSensor: actual.MouseSensor,
    TouchSensor: actual.TouchSensor,
    useSensor: actual.useSensor,
    useSensors: actual.useSensors
  };
});

vi.mock('@/components/kanban/project/NewProjectDialog', () => ({
  default: () => <div data-testid="new-project-dialog" />
}));

vi.mock('@/components/kanban/project/Project', () => ({
  BoardContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="board-container">{children}</div>
  ),
  BoardProject: ({
    project,
    tasks,
    isOverlay
  }: {
    project: Project;
    tasks: Task[];
    isOverlay?: boolean;
  }) => (
    <div
      data-testid={`board-project-${project._id}`}
      data-is-overlay={isOverlay || false}
    >
      {project.title}
      <div data-testid={`project-tasks-${project._id}`}>
        {tasks.map((task) => (
          <div key={task._id} data-testid={`task-in-project-${task._id}`}>
            {task.title}
          </div>
        ))}
      </div>
    </div>
  )
}));

vi.mock('@/components/kanban/task/TaskCard', () => ({
  TaskCard: ({ task, isOverlay }: { task: Task; isOverlay?: boolean }) => (
    <div
      data-testid={`task-card-${task._id}`}
      data-is-overlay={isOverlay || false}
    >
      {task.title}
    </div>
  )
}));

vi.mock('@/components/kanban/task/TaskFilter', () => ({
  TaskFilter: () => <div data-testid="task-filter" />
}));

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: (props: any) => <div data-testid="skeleton" {...props} />
}));

// --- Test Data ---
const user1: UserInfo = { id: 'u1', name: 'User1' };
const task1P1: Task = {
  _id: 'task1-p1',
  title: 'Task 1 P1',
  status: TaskStatus.TODO,
  project: 'project1',
  board: 'b1',
  creator: user1,
  lastModifier: user1,
  createdAt: new Date(),
  updatedAt: new Date()
};
const task2P1: Task = {
  _id: 'task2-p1',
  title: 'Task 2 P1',
  status: TaskStatus.IN_PROGRESS,
  project: 'project1',
  board: 'b1',
  creator: user1,
  lastModifier: user1,
  createdAt: new Date(),
  updatedAt: new Date()
};
const task1P2: Task = {
  _id: 'task1-p2',
  title: 'Task 1 P2',
  status: TaskStatus.TODO,
  project: 'project2',
  board: 'b1',
  creator: user1,
  lastModifier: user1,
  createdAt: new Date(),
  updatedAt: new Date()
};

const project1Initial: Project = {
  _id: 'project1',
  title: 'Project One',
  tasks: [task1P1, task2P1],
  owner: user1,
  members: [user1],
  board: 'b1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
const project2Initial: Project = {
  _id: 'project2',
  title: 'Project Two',
  tasks: [task1P2],
  owner: user1,
  members: [user1],
  board: 'b1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe('Board', () => {
  beforeEach(() => {
    mockProjectsData = [
      { ...project1Initial, tasks: [...project1Initial.tasks] },
      { ...project2Initial, tasks: [...project2Initial.tasks] }
    ];
    mockIsLoadingProjectsData = false;
    mockFilterData = {};
    mockSetProjects.mockClear();
    mockDragTaskOnProject.mockClear().mockResolvedValue(undefined);
    hoistedToastMocks.mockToastSuccess.mockClear(); // Updated
    hoistedToastMocks.mockToastError.mockClear(); // Updated
    vi.mocked(arrayMove).mockClear();

    capturedDragStart = undefined;
    capturedDragOver = undefined;
    capturedDragEnd = undefined;
  });

  it('should render Board component and projects correctly when not loading', () => {
    render(<Board />);
    expect(screen.getByTestId('board')).toBeInTheDocument();
    expect(screen.getByTestId('board-project-project1')).toHaveTextContent(
      'Project One'
    );
    expect(screen.getByTestId('board-project-project2')).toHaveTextContent(
      'Project Two'
    );
    expect(screen.getByTestId('task-filter')).toBeInTheDocument();
    expect(screen.getByTestId('new-project-dialog')).toBeInTheDocument();
    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
  });

  it('should render Skeleton when isLoadingProjects is true', () => {
    mockIsLoadingProjectsData = true;
    render(<Board />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    expect(
      screen.queryByTestId('board-project-project1')
    ).not.toBeInTheDocument();
  });

  it('should filter tasks by status (TODO)', () => {
    mockFilterData = { status: TaskStatus.TODO };
    render(<Board />);
    const project1Tasks = screen.getByTestId('project-tasks-project1');
    expect(
      project1Tasks.querySelector('[data-testid="task-in-project-task1-p1"]')
    ).toBeInTheDocument();
    expect(
      project1Tasks.querySelector('[data-testid="task-in-project-task2-p1"]')
    ).not.toBeInTheDocument();

    const project2Tasks = screen.getByTestId('project-tasks-project2');
    expect(
      project2Tasks.querySelector('[data-testid="task-in-project-task1-p2"]')
    ).toBeInTheDocument();
  });

  it('should filter tasks by search term', () => {
    mockFilterData = { search: 'Task 1' };
    render(<Board />);
    const project1Tasks = screen.getByTestId('project-tasks-project1');
    expect(
      project1Tasks.querySelector('[data-testid="task-in-project-task1-p1"]')
    ).toBeInTheDocument();
    expect(
      project1Tasks.querySelector('[data-testid="task-in-project-task2-p1"]')
    ).not.toBeInTheDocument();

    const project2Tasks = screen.getByTestId('project-tasks-project2');
    expect(
      project2Tasks.querySelector('[data-testid="task-in-project-task1-p2"]')
    ).toBeInTheDocument();
  });

  it('should call setProjects after drag over a task in another project', async () => {
    render(<Board />);
    const activeTask = { ...task1P1, project: 'project1' };
    const overTask = { ...task1P2, project: 'project2' };
    const event: DragOverEvent = {
      active: {
        id: activeTask._id,
        data: { current: { type: 'Task', task: activeTask } }
      } as any,
      over: {
        id: overTask._id,
        data: { current: { type: 'Task', task: overTask } }
      } as any,
      activatorEvent: new MouseEvent('click') as Event,
      collisions: null,
      delta: {
        x: 0,
        y: 0
      }
    };
    await act(async () => {
      capturedDragOver?.(event);
    });
    expect(mockDragTaskOnProject).toHaveBeenCalledWith(
      activeTask._id,
      overTask.project
    );
  });

  it('should call setProjects after drag over a task in the same project', async () => {
    render(<Board />);
    const activeTask = { ...task2P1, project: 'project1' };
    const overTask = { ...task1P1, project: 'project1' };
    const event: DragOverEvent = {
      active: {
        id: activeTask._id,
        data: { current: { type: 'Task', task: activeTask } }
      } as any,
      over: {
        id: overTask._id,
        data: { current: { type: 'Task', task: overTask } }
      } as any,
      activatorEvent: new MouseEvent('click') as Event,
      collisions: null,
      delta: {
        x: 0,
        y: 0
      }
    };
    await act(async () => {
      capturedDragOver?.(event);
    });
    expect(mockSetProjects).toHaveBeenCalled();
  });
});
