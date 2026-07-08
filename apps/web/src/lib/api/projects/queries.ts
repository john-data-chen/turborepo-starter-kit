import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSyncToastListener } from "@/hooks/useSyncToast";
import { PROJECT_KEYS, type UpdateProjectInput } from "@/types/projectApi";

import { projectApi } from "../projectApi";
import { suppressNextSyncToast } from "../sync-toast";

export const useProjects = (boardId?: string | { _id: string; title: string }) => {
  let id: string | undefined;
  if (boardId) {
    id = typeof boardId === "string" ? boardId : boardId._id;
  }

  const query = useQuery({
    queryKey: PROJECT_KEYS.list(id || ""),
    queryFn: async () => {
      if (!id) {
        throw new Error("Board ID is required");
      }
      return projectApi.getProjects(id);
    },
    enabled: !!id,
    refetchInterval: 5000
  });

  useSyncToastListener(query.data, !!id, id);

  return query;
};

export const useProject = (id: string | { _id: string } | undefined) => {
  let projectId: string | undefined;
  if (id) {
    projectId = typeof id === "string" ? id : id._id;
  }

  return useQuery({
    queryKey: PROJECT_KEYS.detail(projectId || ""),
    queryFn: async () => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }
      return projectApi.getProjectById(projectId);
    },
    enabled: !!projectId,
    refetchInterval: 5000
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: (newProject) => {
      suppressNextSyncToast();
      const boardId =
        typeof newProject.board === "string" ? newProject.board : newProject.board?._id;

      if (boardId) {
        queryClient.invalidateQueries({
          queryKey: PROJECT_KEYS.list(boardId)
        });
      }
    }
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Omit<UpdateProjectInput, "owner">) => {
      // Create a new object with only the allowed fields
      const updateData: UpdateProjectInput = {
        title: updates.title,
        description: updates.description ?? null
      };

      // Only include description if it's provided
      if (updates.description !== undefined) {
        updateData.description = updates.description;
      }

      return projectApi.updateProject(id, updateData);
    },
    onSuccess: (updatedProject) => {
      suppressNextSyncToast();
      const boardId =
        typeof updatedProject.board === "string" ? updatedProject.board : updatedProject.board?._id;

      if (boardId) {
        queryClient.invalidateQueries({
          queryKey: PROJECT_KEYS.list(boardId)
        });
      }

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
      suppressNextSyncToast();
      if (context?.boardId) {
        queryClient.invalidateQueries({
          queryKey: PROJECT_KEYS.list(context.boardId)
        });
      }
      queryClient.removeQueries({
        queryKey: PROJECT_KEYS.detail(projectId)
      });
    }
  });
};
