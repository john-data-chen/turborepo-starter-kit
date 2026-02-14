// Types
export type {
  Board,
  BoardDocument,
  CreateTaskInput,
  Project,
  Session,
  Task,
  UpdateTaskInput,
  User,
  UserInfo
} from "./types";
export { TaskStatus } from "./types";

// Storage adapter
export type { StorageAdapter } from "./storage";
export { createStorage } from "./storage";

// Auth store
export type { AuthState } from "./auth-store";
export { createAuthStore } from "./auth-store";

// Workspace types (interface only — implementations live in each app)
export type { WorkspaceState } from "./workspace-types";
