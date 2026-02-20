import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { projectApi, type UpdateProjectInput } from "@/lib/api/project-api";

export const PROJECT_KEYS = {
  all: ["projects"] as const,
  lists: () => [...PROJECT_KEYS.all, "list"] as const,
  list: (boardId: string) => [...PROJECT_KEYS.lists(), { boardId }] as const,
  details: () => [...PROJECT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PROJECT_KEYS.details(), id] as const
};

export const useProjects = (boardId?: string) => {
  return useQuery({
    queryKey: PROJECT_KEYS.list(boardId || ""),
    queryFn: async () => {
      if (!boardId) {
        throw new Error("Board ID is required");
      }
      return projectApi.getProjects(boardId);
    },
    enabled: !!boardId
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: (newProject) => {
      const boardId =
        typeof newProject.board === "string" ? newProject.board : newProject.board?._id;
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.list(boardId) });
      }
    }
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & UpdateProjectInput) =>
      projectApi.updateProject(id, updates),
    onSuccess: (updatedProject) => {
      const boardId =
        typeof updatedProject.board === "string" ? updatedProject.board : updatedProject.board?._id;
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.list(boardId) });
      }
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(updatedProject._id) });
    }
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, boardId }: { id: string; boardId?: string }) => {
      await projectApi.deleteProject(id);
      return { boardId };
    },
    onSuccess: ({ boardId }, { id }) => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.list(boardId) });
      }
      queryClient.removeQueries({ queryKey: PROJECT_KEYS.detail(id) });
    }
  });
};
