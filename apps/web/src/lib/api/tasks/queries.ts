import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TASK_KEYS } from '@/types/taskApi';
import { taskApi } from '../taskApi';
import type { Task, TaskStatus } from '@/types/dbInterface';

export const useTasks = (projectId?: string, assigneeId?: string) => {
  return useQuery({
    queryKey: TASK_KEYS.list({ projectId, assigneeId }),
    queryFn: () => taskApi.getTasks(projectId, assigneeId),
    enabled: !!projectId || !!assigneeId
  });
};

export const useTask = (taskId?: string) => {
  return useQuery({
    queryKey: TASK_KEYS.detail(taskId || ''),
    queryFn: () => taskApi.getTaskById(taskId || ''),
    enabled: !!taskId
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: (newTask, variables) => {
      // Invalidate the tasks list query to refetch
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.list({ projectId: variables.projectId })
      });

      // Also invalidate the assignee's tasks if applicable
      if (variables.assigneeId) {
        queryClient.invalidateQueries({
          queryKey: TASK_KEYS.list({ assigneeId: variables.assigneeId })
        });
      }
    }
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...updates
    }: { id: string } & Parameters<typeof taskApi.updateTask>[1]) =>
      taskApi.updateTask(id, updates),

    // Optimistic updates
    onMutate: async (updatedTask) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: TASK_KEYS.detail(updatedTask.id)
      });

      // Snapshot the previous value
      const previousTask = queryClient.getQueryData<Task>(
        TASK_KEYS.detail(updatedTask.id)
      );

      // Optimistically update to the new value
      if (previousTask) {
        queryClient.setQueryData<Task>(TASK_KEYS.detail(updatedTask.id), {
          ...previousTask,
          ...updatedTask
        });
      }

      return { previousTask };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, updatedTask, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(
          TASK_KEYS.detail(updatedTask.id),
          context.previousTask
        );
      }
    },

    // Always refetch after error or success:
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.detail(variables.id)
      });

      // Also invalidate any list queries that might include this task
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
    }
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      taskApi.updateTaskStatus(id, status),

    // Optimistic updates
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: TASK_KEYS.detail(id) });

      const previousTask = queryClient.getQueryData<Task>(TASK_KEYS.detail(id));

      if (previousTask) {
        queryClient.setQueryData<Task>(TASK_KEYS.detail(id), {
          ...previousTask,
          status
        });
      }

      return { previousTask };
    },

    onError: (err, { id }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(TASK_KEYS.detail(id), context.previousTask);
      }
    },

    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
    }
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id),

    // Optimistically remove the task from the list
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TASK_KEYS.lists() });

      // Store the previous tasks list for rollback
      const previousTasks = queryClient.getQueryData(TASK_KEYS.lists());

      // Remove the task from all lists
      queryClient.setQueryData(TASK_KEYS.lists(), (old: any) =>
        old?.filter((task: Task) => task.id !== id)
      );

      return { previousTasks };
    },

    // On error, roll back to the previous tasks list
    onError: (err, id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASK_KEYS.lists(), context.previousTasks);
      }
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() });
    }
  });
};
