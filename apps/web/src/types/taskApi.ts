export type { CreateTaskInput, UpdateTaskInput } from "@repo/store";

export interface TaskPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

// Query and Mutation Keys
export const TASK_KEYS = {
  all: ["tasks"] as const,
  lists: () => [...TASK_KEYS.all, "list"] as const,
  list: (filters: { project?: string; assignee?: string } = {}) =>
    [
      ...TASK_KEYS.lists(),
      ...(filters.project ? [{ project: filters.project }] : []),
      ...(filters.assignee ? [{ assignee: filters.assignee }] : [])
    ] as const,
  details: () => [...TASK_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TASK_KEYS.details(), id] as const
} as const;
