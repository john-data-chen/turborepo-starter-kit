import { PROJECT_KEYS } from '@/types/projectApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../projectApi';

export const useProjects = (boardId?: string) => {
  return useQuery({
    queryKey: PROJECT_KEYS.list(boardId),
    queryFn: () => projectApi.getProjects(boardId || ''),
    enabled: !!boardId
  });
};

export const useProject = (projectId?: string) => {
  return useQuery({
    queryKey: PROJECT_KEYS.detail(projectId || ''),
    queryFn: () => projectApi.getProjectById(projectId || ''),
    enabled: !!projectId
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: (newProject) => {
      // Invalidate the projects list for the specific board
      queryClient.invalidateQueries({
        queryKey: PROJECT_KEYS.list(newProject.board)
      });
    }
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...updates
    }: { id: string } & Parameters<typeof projectApi.updateProject>[1]) =>
      projectApi.updateProject(id, updates),
    onSuccess: (updatedProject) => {
      // Invalidate both the list and the specific project
      queryClient.invalidateQueries({
        queryKey: PROJECT_KEYS.list(updatedProject.board)
      });
      queryClient.invalidateQueries({
        queryKey: PROJECT_KEYS.detail(updatedProject._id)
      });
    }
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectApi.deleteProject,
    onSuccess: (_, projectId, context: { boardId?: string } | undefined) => {
      // Invalidate the projects list for the board if we have the boardId
      if (context?.boardId) {
        queryClient.invalidateQueries({
          queryKey: PROJECT_KEYS.list(context.boardId)
        });
      }
      // Remove the specific project from the cache
      queryClient.removeQueries({
        queryKey: PROJECT_KEYS.detail(projectId)
      });
    }
  });
};
