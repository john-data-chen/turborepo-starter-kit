// Core API client
export { taskApi } from "../taskApi";

// Types and constants
export type { CreateTaskInput, UpdateTaskInput } from "@/types/taskApi";
export { TASK_KEYS } from "@/types/taskApi";

// Query and mutation hooks
export { useTasks, useTask, useCreateTask, useUpdateTask, useDeleteTask } from "./queries";
