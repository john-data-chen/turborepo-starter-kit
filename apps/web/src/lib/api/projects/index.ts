// Re-export everything from the main projects API file
export * from '../projects';

// Re-export all queries and mutations
export * from './queries';

// Export the project API client and types
export {
  projectApi,
  PROJECT_KEYS,
  type CreateProjectInput,
  type UpdateProjectInput
} from '../projects';

// Explicitly export all query hooks for better IDE support
export {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject
} from './queries';
