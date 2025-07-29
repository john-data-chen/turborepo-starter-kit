// Auth API
export * from './auth';

// Users API
export type { User as UserType } from './users';
export { searchUsers, getUserById } from './users';

// Tasks API
export * from './tasks';

// Boards API
export * from './boards';

// Projects API
export * from './projects';

// Re-export types with explicit names
export type { User as AuthUser } from './auth/queries';
