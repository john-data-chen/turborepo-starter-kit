// Re-export everything from the main boards API file
export * from '../boards';

// Re-export all queries and mutations
export * from './queries';

// Export the board API client and types
export {
  boardApi,
  BOARD_KEYS,
  type CreateBoardInput,
  type UpdateBoardInput
} from '../boards';

// Explicitly export all query hooks for better IDE support
export {
  useBoards,
  useBoard,
  useCreateBoard,
  useUpdateBoard,
  useDeleteBoard,
  useAddBoardMember,
  useRemoveBoardMember
} from './queries';
