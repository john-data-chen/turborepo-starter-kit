import type { Board, CreateTaskInput, Project, Task, TaskStatus } from "./types.ts";

/**
 * Shared workspace state interface.
 *
 * The web app provides the full implementation (with API calls).
 * The mobile app can implement a subset or its own version
 * against the same interface contract.
 */
export interface WorkspaceState {
  // User state
  userId: string | null;
  userEmail: string | null;
  setUserInfo: (email: string, userId: string) => void;

  // Projects state
  projects: Project[];
  isLoadingProjects: boolean;
  setProjects: (projects: Project[]) => void;

  // Boards state
  currentBoardId: string | null;
  myBoards: Board[];
  teamBoards: Board[];

  // Filter state
  filter: {
    status: string | null;
    search: string;
  };

  // Project actions
  fetchProjects: (boardId: string) => Promise<void>;
  fetchTasksByProject: (projectId: string) => Promise<Task[]>;
  addProject: (
    title: string,
    description: string,
    createProject: (project: {
      title: string;
      description: string;
      boardId: string;
      owner: string;
      orderInBoard?: number;
    }) => Promise<Project>
  ) => Promise<string>;
  updateProject: (
    id: string,
    newTitle: string,
    newDescription: string | undefined,
    updateFn: (id: string, data: { title: string; description?: string }) => Promise<Project>
  ) => Promise<void>;
  removeProject: (id: string, deleteFn: (id: string) => Promise<void>) => Promise<void>;

  // Task actions
  addTask: (
    projectId: string,
    title: string,
    status: TaskStatus,
    createTask: (task: CreateTaskInput) => Promise<Task>,
    description?: string,
    dueDate?: Date,
    assigneeId?: string,
    orderInProject?: number
  ) => Promise<void>;
  updateTask: (
    taskId: string,
    title: string,
    status: TaskStatus,
    description?: string,
    dueDate?: Date,
    assigneeId?: string,
    newProjectId?: string,
    orderInProject?: number
  ) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  dragTaskOnProject: (
    taskId: string,
    newProjectId: string,
    getTask: (taskId: string) => Promise<Task | undefined>
  ) => Promise<void>;

  // Board actions
  setCurrentBoardId: (boardId: string) => void;
  addBoard: (title: string, description?: string) => Promise<string>;
  updateBoard: (id: string, data: Partial<Board>) => Promise<void>;
  removeBoard: (id: string, deleteFn: (id: string) => Promise<void>) => Promise<void>;

  // UI state
  setFilter: (filter: Partial<WorkspaceState["filter"]>) => void;
  setMyBoards: (boards: Board[]) => void;
  setTeamBoards: (boards: Board[]) => void;
  resetInBoards: () => void;
}
