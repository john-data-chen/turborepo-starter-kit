// Board-related types and constants that are used across the application

export interface CreateBoardInput {
  title: string;
  description?: string;
  owner: string; // MongoDB ObjectId of the board owner
}

export interface UpdateBoardInput {
  title?: string;
  description?: string | null;
}

// Query and Mutation Keys for React Query
export const BOARD_KEYS = {
  all: ["boards"] as const,
  lists: () => [...BOARD_KEYS.all, "list"] as const,
  list: () => [...BOARD_KEYS.lists()] as const,
  details: () => [...BOARD_KEYS.all, "detail"] as const,
  detail: (id: string) => [...BOARD_KEYS.details(), id] as const
} as const;
