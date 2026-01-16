// Core API client
export { projectApi } from "../projectApi"

// Types and constants
export type { CreateProjectInput, UpdateProjectInput } from "@/types/projectApi"
export { PROJECT_KEYS } from "@/types/projectApi"

// Query and mutation hooks
export {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject
} from "./queries"
