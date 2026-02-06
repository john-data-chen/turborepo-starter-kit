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
} from "./types.ts";
export { TaskStatus } from "./types.ts";

// Storage adapter
export type { StorageAdapter } from "./storage.ts";
export { createStorage } from "./storage.ts";

// Auth store
export type { AuthState } from "./auth-store.ts";
export { createAuthStore } from "./auth-store.ts";

// Workspace types (interface only — implementations live in each app)
export type { WorkspaceState } from "./workspace-types.ts";
