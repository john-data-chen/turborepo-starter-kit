import { PROJECT_KEYS, type UpdateProjectInput } from '@/types/projectApi'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { projectApi } from '../projectApi'

export const useProjects = (boardId?: string | { _id: string; title: string }) => {
  const id = boardId ? (typeof boardId === 'string' ? boardId : boardId._id) : undefined

  return useQuery({
    queryKey: PROJECT_KEYS.list(id || ''),
    queryFn: () => {
      if (!id) {
        throw new Error('Board ID is required')
      }
      return projectApi.getProjects(id)
    },
    enabled: !!id
  })
}

export const useProject = (id: string | { _id: string } | undefined) => {
  const projectId = id ? (typeof id === 'string' ? id : id._id) : undefined

  return useQuery({
    queryKey: PROJECT_KEYS.detail(projectId || ''),
    queryFn: () => {
      if (!projectId) {
        throw new Error('Project ID is required')
      }
      return projectApi.getProjectById(projectId)
    },
    enabled: !!projectId
  })
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: (newProject) => {
      // Invalidate the projects list for the specific board
      const boardId =
        typeof newProject.board === 'string' ? newProject.board : newProject.board?._id

      if (boardId) {
        queryClient.invalidateQueries({
          queryKey: PROJECT_KEYS.list(boardId)
        })
      }
    }
  })
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Omit<UpdateProjectInput, 'owner'>) => {
      // Create a new object with only the allowed fields
      const updateData: UpdateProjectInput = {
        title: updates.title,
        description: updates.description ?? null
      }

      // Only include description if it's provided
      if (updates.description !== undefined) {
        updateData.description = updates.description
      }

      return projectApi.updateProject(id, updateData)
    },
    onSuccess: (updatedProject) => {
      // Invalidate both the list and the specific project
      const boardId =
        typeof updatedProject.board === 'string' ? updatedProject.board : updatedProject.board?._id

      if (boardId) {
        queryClient.invalidateQueries({
          queryKey: PROJECT_KEYS.list(boardId)
        })
      }

      queryClient.invalidateQueries({
        queryKey: PROJECT_KEYS.detail(updatedProject._id)
      })
    }
  })
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: projectApi.deleteProject,
    onSuccess: (_, projectId, context: { boardId?: string } | undefined) => {
      // Invalidate the projects list for the board if we have the boardId
      if (context?.boardId) {
        queryClient.invalidateQueries({
          queryKey: PROJECT_KEYS.list(context.boardId)
        })
      }
      // Remove the specific project from the cache
      queryClient.removeQueries({
        queryKey: PROJECT_KEYS.detail(projectId)
      })
    }
  })
}
