import { TaskStatus } from '@/types/dbInterface';

// Permission types
export interface TaskPermissions {
  canEdit: boolean;
  canDelete: boolean;
}

// Input types
export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: Date;
  board: string; // Changed from boardId to match backend
  project: string; // Changed from projectId to match backend
  creator: string; // Added to match backend
  lastModifier: string; // Added to match backend
  assignee?: string; // Changed from assigneeId to match backend
  orderInProject?: number; // Order of the task within the project
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  dueDate?: Date | null;
  assigneeId?: string | null;
  lastModifier: string;
  orderInProject?: number; // Order of the task within the project
}

// Query and Mutation Keys
export const TASK_KEYS = {
  all: ['tasks'] as const,
  lists: () => [...TASK_KEYS.all, 'list'] as const,
  list: (filters: { project?: string; assignee?: string } = {}) =>
    [
      ...TASK_KEYS.lists(),
      ...(filters.project ? [{ project: filters.project }] : []),
      ...(filters.assignee ? [{ assignee: filters.assignee }] : [])
    ] as const,
  details: () => [...TASK_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TASK_KEYS.details(), id] as const
} as const;
