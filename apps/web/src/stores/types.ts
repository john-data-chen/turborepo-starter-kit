import type { Board, Project, Task, TaskStatus, CreateTaskInput } from "@repo/store";

export interface UserSliceState {
  userId: string | null;
  userEmail: string | null;
  setUserInfo: (email: string, userId: string) => void;
}

export interface FilterSliceState {
  filter: { status: string | null; search: string };
  setFilter: (filter: Partial<FilterSliceState["filter"]>) => void;
}

export interface ResetSliceState {
  resetInBoards: () => void;
}

export interface BoardSliceState {
  currentBoardId: string | null;
  myBoards: Board[];
  teamBoards: Board[];
  setCurrentBoardId: (boardId: string) => void;
  addBoard: (title: string, description?: string) => Promise<string>;
  updateBoard: (id: string, data: Partial<Board>) => Promise<void>;
  removeBoard: (id: string, deleteFn: (id: string) => Promise<void>) => Promise<void>;
}

export interface ProjectSliceState {
  projects: Project[];
  isLoadingProjects: boolean;
  setProjects: (projects: Project[]) => void;
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
}

export interface TaskSliceState {
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
}

export type WorkspaceState = UserSliceState &
  FilterSliceState &
  ResetSliceState &
  BoardSliceState &
  ProjectSliceState &
  TaskSliceState;
