import type { UpdateTaskInput } from "@repo/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { taskApi } from "@/lib/api/task-api";
import { useAuthStore } from "@/stores/auth";

export const TASK_KEYS = {
  all: ["tasks"] as const,
  lists: () => [...TASK_KEYS.all, "list"] as const,
  list: (filters: { project?: string; assignee?: string } = {}) =>
    [
      ...TASK_KEYS.lists(),
      ...(filters.project ? [{ project: filters.project }] : []),
      ...(filters.assignee ? [{ assignee: filters.assignee }] : [])
    ] as const,
  details: () => [...TASK_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TASK_KEYS.details(), id] as const
};

export const useTasks = (projectId?: string, assigneeId?: string) => {
  return useQuery({
    queryKey: TASK_KEYS.list({ project: projectId, assignee: assigneeId }),
    queryFn: async () => taskApi.getTasks(projectId, assigneeId),
    enabled: !!projectId || !!assigneeId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000
  });
};

export const useTask = (taskId?: string) => {
  return useQuery({
    queryKey: TASK_KEYS.detail(taskId || ""),
    queryFn: async () => taskApi.getTaskById(taskId || ""),
    enabled: !!taskId
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.list({ project: newTask.project }) });
      if (newTask.assignee) {
        const assigneeId =
          typeof newTask.assignee === "string" ? newTask.assignee : newTask.assignee._id;
        queryClient.invalidateQueries({ queryKey: TASK_KEYS.list({ assignee: assigneeId }) });
      }
    }
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Omit<UpdateTaskInput, "lastModifier">) => {
      if (!user?._id) {
        throw new Error("User must be authenticated");
      }
      return taskApi.updateTask(id, { ...updates, lastModifier: user._id });
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(updatedTask._id) });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.list({ project: updatedTask.project }) });
    }
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
    }
  });
};

export const useMoveTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      projectId,
      orderInProject
    }: {
      taskId: string;
      projectId: string;
      orderInProject: number;
    }) => taskApi.moveTask(taskId, projectId, orderInProject),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(updatedTask._id) });
    }
  });
};
