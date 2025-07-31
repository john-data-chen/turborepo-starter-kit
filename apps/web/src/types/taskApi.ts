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
  boardId: string;
  projectId: string;
  assigneeId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  dueDate?: Date | null;
  assigneeId?: string | null;
}

// Query and Mutation Keys
export const TASK_KEYS = {
  all: ['tasks'] as const,
  lists: () => [...TASK_KEYS.all, 'list'] as const,
  list: (filters: { projectId?: string; assigneeId?: string } = {}) =>
    [
      ...TASK_KEYS.lists(),
      ...(filters.projectId ? [{ projectId: filters.projectId }] : []),
      ...(filters.assigneeId ? [{ assigneeId: filters.assigneeId }] : [])
    ] as const,
  details: () => [...TASK_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TASK_KEYS.details(), id] as const
} as const;
