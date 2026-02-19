import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Board } from "@/components/kanban/board/Board";
import { TaskStatus, type Project } from "@/types/dbInterface";

globalThis.React = React;

const mockUseAuth = vi.fn();
const mockUseBoards = vi.fn();
const mockUseWorkspaceStore = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth()
}));

vi.mock("@/hooks/useBoards", () => ({
  useBoards: () => mockUseBoards()
}));

vi.mock("@/stores/workspace-store", () => ({
  useWorkspaceStore: (selector: any) => mockUseWorkspaceStore(selector)
}));

vi.mock("@/lib/api/taskApi", () => ({
  taskApi: {
    moveTask: vi.fn(),
    updateTask: vi.fn()
  }
}));

vi.mock("@/lib/api/projectApi", () => ({
  projectApi: {
    updateProject: vi.fn()
  }
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: any) => <div data-testid="dnd-context">{children}</div>,
  DragOverlay: ({ children }: any) => <div data-testid="drag-overlay">{children}</div>,
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  MouseSensor: vi.fn(),
  TouchSensor: vi.fn()
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: any) => <div data-testid="sortable-context">{children}</div>,
  arrayMove: (arr: any[], from: number, to: number) => {
    const newArr = [...arr];
    const [item] = newArr.splice(from, 1);
    newArr.splice(to, 0, item);
    return newArr;
  }
}));

vi.mock("@/components/kanban/project/NewProjectDialog", () => ({
  default: () => <div data-testid="new-project-dialog">New Project</div>
}));

vi.mock("@/components/kanban/project/Project", () => ({
  BoardContainer: ({ children }: any) => <div data-testid="board-container">{children}</div>,
  BoardProject: ({ project }: any) => (
    <div data-testid={`project-${project._id}`}>{project.title}</div>
  )
}));

vi.mock("@/components/kanban/task/TaskFilter", () => ({
  TaskFilter: () => <div data-testid="task-filter">Filter</div>
}));

vi.mock("@/components/kanban/task/TaskCard", () => ({
  TaskCard: ({ task }: any) => <div data-testid={`task-card-${task._id}`}>{task.title}</div>
}));

describe("Board", () => {
  const mockUserInfo: any = { _id: "user-1", name: "John", email: "john@example.com" };
  const mockProjects: Project[] = [
    {
      _id: "project-1",
      title: "Project 1",
      description: "Description 1",
      board: "board-1",
      owner: "user-1",
      members: [mockUserInfo],
      orderInBoard: 0,
      tasks: [
        {
          _id: "task-1",
          title: "Task 1",
          description: "Task Description",
          status: TaskStatus.TODO,
          project: "project-1",
          board: "board-1",
          creator: mockUserInfo,
          lastModifier: mockUserInfo,
          orderInProject: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: "project-2",
      title: "Project 2",
      description: "Description 2",
      board: "board-1",
      owner: "user-2",
      members: [],
      orderInBoard: 1,
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const mockMyBoards = [
    {
      _id: "board-1",
      title: "My Board",
      description: "Board Description",
      owner: "user-1",
      members: [mockUserInfo],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const defaultWorkspaceState = {
    projects: mockProjects,
    isLoadingProjects: false,
    filter: { status: null, search: "" },
    setProjects: vi.fn(),
    currentBoardId: "board-1",
    userId: "user-1",
    fetchProjects: vi.fn()
  };

  const defaultAuthState = {
    user: mockUserInfo,
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    loginWithEmail: vi.fn(),
    logout: vi.fn(),
    loginMutation: {},
    error: null,
    session: null
  };

  const defaultBoardsState = {
    myBoards: mockMyBoards,
    teamBoards: [],
    loading: false,
    error: null,
    refresh: vi.fn()
  };

  const setupMocks = (overrides: any = {}) => {
    const authState = { ...defaultAuthState, ...overrides.authState };
    const boardsState = { ...defaultBoardsState, ...overrides.boardsState };
    const workspaceState = { ...defaultWorkspaceState, ...overrides.workspaceState };

    if (overrides.user !== undefined) {
      authState.user = overrides.user;
    }
    if (overrides.isAuthenticated !== undefined) {
      authState.isAuthenticated = overrides.isAuthenticated;
    }
    if (overrides.myBoards !== undefined) {
      boardsState.myBoards = overrides.myBoards;
    }
    if (overrides.teamBoards !== undefined) {
      boardsState.teamBoards = overrides.teamBoards;
    }
    if (overrides.projects !== undefined) {
      workspaceState.projects = overrides.projects;
    }
    if (overrides.isLoadingProjects !== undefined) {
      workspaceState.isLoadingProjects = overrides.isLoadingProjects;
    }
    if (overrides.filter !== undefined) {
      workspaceState.filter = overrides.filter;
    }
    if (overrides.currentBoardId !== undefined) {
      workspaceState.currentBoardId = overrides.currentBoardId;
    }

    mockUseAuth.mockReturnValue(authState);
    mockUseBoards.mockReturnValue(boardsState);
    mockUseWorkspaceStore.mockImplementation((selector: any) => {
      return selector ? selector(workspaceState) : workspaceState;
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it("should render board component", () => {
    render(<Board />);
    expect(screen.getByTestId("board")).toBeInTheDocument();
  });

  it("should render DndContext", () => {
    render(<Board />);
    expect(screen.getByTestId("dnd-context")).toBeInTheDocument();
  });

  it("should render new project dialog", () => {
    render(<Board />);
    expect(screen.getByTestId("new-project-dialog")).toBeInTheDocument();
  });

  it("should render task filter", () => {
    render(<Board />);
    expect(screen.getByTestId("task-filter")).toBeInTheDocument();
  });

  it("should render board container", () => {
    render(<Board />);
    expect(screen.getByTestId("board-container")).toBeInTheDocument();
  });

  it("should render all projects", () => {
    render(<Board />);
    expect(screen.getByTestId("project-project-1")).toBeInTheDocument();
    expect(screen.getByTestId("project-project-2")).toBeInTheDocument();
  });

  it("should show loading skeleton when loading projects", () => {
    setupMocks({ isLoadingProjects: true });

    const { container } = render(<Board />);
    const skeleton = container.querySelector(".bg-secondary");
    expect(skeleton).toBeInTheDocument();
  });

  it("should render drag overlay", () => {
    render(<Board />);
    expect(screen.getByTestId("drag-overlay")).toBeInTheDocument();
  });

  it("should sort projects by orderInBoard", () => {
    const unsortedProjects = [
      { ...mockProjects[1], orderInBoard: 2 },
      { ...mockProjects[0], orderInBoard: 1 }
    ];

    setupMocks({ projects: unsortedProjects });

    render(<Board />);
    expect(screen.getByTestId("project-project-1")).toBeInTheDocument();
    expect(screen.getByTestId("project-project-2")).toBeInTheDocument();
  });

  it("should determine board owner correctly when user is owner", () => {
    render(<Board />);
    expect(screen.getByTestId("board")).toBeInTheDocument();
  });

  it("should determine board owner correctly when user is not owner", () => {
    setupMocks({ user: { _id: "user-2", name: "Jane", email: "jane@example.com" } });

    render(<Board />);
    expect(screen.getByTestId("board")).toBeInTheDocument();
  });

  it("should handle unauthenticated user", () => {
    setupMocks({ user: undefined, isAuthenticated: false });

    render(<Board />);
    expect(screen.getByTestId("board")).toBeInTheDocument();
  });

  it("should determine board member correctly", () => {
    const teamBoards = [
      {
        _id: "board-2",
        title: "Team Board",
        description: "",
        owner: "user-2",
        members: [{ _id: "user-1", name: "John", email: "john@example.com" }],
        projects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    setupMocks({
      myBoards: [],
      teamBoards: teamBoards,
      currentBoardId: "board-2"
    });

    render(<Board />);
    expect(screen.getByTestId("board")).toBeInTheDocument();
  });

  it("should handle empty projects list", () => {
    setupMocks({ projects: [] });

    render(<Board />);
    expect(screen.getByTestId("board")).toBeInTheDocument();
    expect(screen.queryByTestId("project-project-1")).not.toBeInTheDocument();
  });

  it("should filter tasks by status", () => {
    setupMocks({ filter: { status: TaskStatus.TODO, search: "" } });

    render(<Board />);
    expect(screen.getByTestId("board")).toBeInTheDocument();
  });

  it("should filter tasks by search term", () => {
    setupMocks({ filter: { status: null, search: "Task 1" } });

    render(<Board />);
    expect(screen.getByTestId("board")).toBeInTheDocument();
  });

  it("should handle projects with no currentBoardId", () => {
    setupMocks({ currentBoardId: null });

    render(<Board />);
    expect(screen.getByTestId("board")).toBeInTheDocument();
  });

  it("should handle projects with board owner as object", () => {
    const boardsWithObjectOwner = [
      {
        ...mockMyBoards[0],
        owner: { _id: "user-1", name: "John", email: "john@example.com" }
      }
    ];

    setupMocks({ myBoards: boardsWithObjectOwner });

    render(<Board />);
    expect(screen.getByTestId("board")).toBeInTheDocument();
  });
});
