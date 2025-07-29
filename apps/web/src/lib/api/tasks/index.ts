// Re-export everything from the main tasks API file
export * from '../tasks';

// Re-export all queries and mutations
export * from './queries';

// Export the task API client and types
export {
  taskApi,
  TASK_KEYS,
  type CreateTaskInput,
  type UpdateTaskInput
} from '../tasks';

// Explicitly export all query hooks for better IDE support
export {
  useTasks,
  useTask,
  useCreateTask,
  useUpdateTask,
  useUpdateTaskStatus,
  useDeleteTask
} from './queries';
