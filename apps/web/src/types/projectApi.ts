// Project-related types and constants that are used across the application

export interface CreateProjectInput {
  title: string;
  description: string | null;
  boardId: string;
  owner: string;
  orderInBoard?: number;
}

export interface UpdateProjectInput {
  title: string;
  description: string | null;
  modifier: string;
  orderInBoard?: number;
}

// Query and Mutation Keys for React Query
export const PROJECT_KEYS = {
  all: ['projects'] as const,
  lists: () => [...PROJECT_KEYS.all, 'list'] as const,
  list: (boardId?: string) =>
    boardId
      ? ([...PROJECT_KEYS.lists(), { boardId }] as const)
      : ([...PROJECT_KEYS.lists()] as const),
  details: () => [...PROJECT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PROJECT_KEYS.details(), id] as const
} as const;
