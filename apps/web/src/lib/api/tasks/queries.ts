import { useWorkspaceStore } from '@/stores/workspace-store';
import type { Task, TaskStatus } from '@/types/dbInterface';
import { TASK_KEYS, UpdateTaskInput } from '@/types/taskApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../taskApi';

export const useTasks = (projectId?: string, assigneeId?: string) => {
  return useQuery<Task[]>({
    queryKey: TASK_KEYS.list({
      project: projectId,
      assignee: assigneeId
    }),
    queryFn: () => taskApi.getTasks(projectId, assigneeId),
    enabled: !!projectId || !!assigneeId,
    // Ensure we always get fresh data when the component mounts
    staleTime: 0,
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
};

interface UseTaskOptions {
  enabled?: boolean;
  retry?: boolean | ((failureCount: number, error: any) => boolean);
}

export const useTask = (taskId?: string, options: UseTaskOptions = {}) => {
  const { enabled = true, retry } = options;

  return useQuery({
    queryKey: TASK_KEYS.detail(taskId || ''),
    queryFn: () => taskApi.getTaskById(taskId || ''),
    enabled: !!taskId && enabled,
    retry:
      retry ??
      ((failureCount: number, error: any) => {
        if (error?.response?.status === 404) return false;
        return failureCount < 3;
      })
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      description?: string;
      status?: TaskStatus;
      dueDate?: Date;
      board: string;
      project: string;
      creator: string;
      assignee?: string;
    }) => {
      // Get the last task's orderInProject to set the new task's order
      const tasks = await taskApi.getTasks(input.project);
      const lastOrder = tasks.length > 0 
        ? Math.max(...tasks.map(t => t.orderInProject || 0))
        : 0;
        
      return taskApi.createTask({
        title: input.title,
        description: input.description,
        status: input.status,
        dueDate: input.dueDate,
        board: input.board,
        project: input.project,
        creator: input.creator,
        assignee: input.assignee,
        lastModifier: input.creator,
        orderInProject: lastOrder + 1
      });
    },
    onSuccess: (newTask, variables) => {
      // Invalidate the tasks list query to refetch
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.list({ project: variables.project })
      });

      // Also invalidate the assignee's tasks if applicable
      if (variables.assignee) {
        queryClient.invalidateQueries({
          queryKey: TASK_KEYS.list({ assignee: variables.assignee })
        });
      }
    }
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  // Get the current user's ID from the workspace store
  const userId = useWorkspaceStore(
    (state: { userId: string | null }) => state.userId
  );

  if (!userId) {
    throw new Error('User must be authenticated to update a task');
  }

  return useMutation({
    mutationFn: ({
      id,
      ...updates
    }: { id: string } & Omit<UpdateTaskInput, 'assigneeId' | 'lastModifier'> & {
        assigneeId?: string | null;
      }) => {
      // Create a clean update object with only the fields we want to send
      const apiUpdates: UpdateTaskInput = {
        lastModifier: userId // Use the current user's ID as the lastModifier
      };

      // Only include fields that are defined in the updates
      if (updates.title !== undefined) apiUpdates.title = updates.title;
      if (updates.description !== undefined)
        apiUpdates.description = updates.description;
      if (updates.status !== undefined) apiUpdates.status = updates.status;
      if (updates.dueDate !== undefined) apiUpdates.dueDate = updates.dueDate;

      // Handle assigneeId separately to ensure it's not sent as undefined
      if ('assigneeId' in updates) {
        apiUpdates.assigneeId = updates.assigneeId ?? null;
      }

      return taskApi.updateTask(id, apiUpdates);
    },

    // Optimistic updates
    onMutate: async (updatedTask) => {
      const taskId = updatedTask.id;
      const taskQueryKey = TASK_KEYS.detail(taskId);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskQueryKey });

      // Snapshot the previous values
      const previousTask = queryClient.getQueryData<Task>(taskQueryKey);

      // Optimistically update to the new value
      if (previousTask) {
        // Create a clean update object with only the fields that were actually updated
        const updateFields: Partial<Task> = {};

        // Only include fields that were actually provided in the update
        if ('title' in updatedTask) updateFields.title = updatedTask.title;
        if ('description' in updatedTask)
          updateFields.description = updatedTask.description;
        if ('status' in updatedTask) updateFields.status = updatedTask.status;
        if ('dueDate' in updatedTask)
          updateFields.dueDate = updatedTask.dueDate;

        // Handle assignee update - we need to include all required UserInfo fields
        if ('assigneeId' in updatedTask) {
          if (updatedTask.assigneeId) {
            // If we have an assigneeId, we need to get the user info from the previous task
            // or from the current assignee if it exists
            const previousTask = queryClient.getQueryData<Task>(taskQueryKey);
            const previousAssignee = previousTask?.assignee;

            if (
              previousAssignee &&
              previousAssignee._id === updatedTask.assigneeId
            ) {
              // If the assignee is the same, keep the existing user info
              updateFields.assignee = { ...previousAssignee };
            } else {
              // Otherwise, we need to fetch the user info
              // For now, we'll just include the ID and placeholder values for required fields
              // The next data fetch will update this with the full user info
              updateFields.assignee = {
                _id: updatedTask.assigneeId,
                name: 'Loading...',
                email: 'loading@example.com'
              };
            }
          } else {
            // If assigneeId is null or undefined, set assignee to undefined
            updateFields.assignee = undefined;
          }
        }

        const newTask = {
          ...previousTask,
          ...updateFields,
          updatedAt: new Date().toISOString(),
          _id: taskId // Ensure _id is always set
        };

        // Update the task in the cache
        queryClient.setQueryData(taskQueryKey, newTask);

        // Also update the task in any lists it might be in
        queryClient.setQueriesData(
          { queryKey: TASK_KEYS.lists() },
          (old: Task[] | undefined) => {
            if (!old) return old;
            return old.map((task) =>
              task._id === taskId ? { ...task, ...updateFields } : task
            );
          }
        );
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

    // Always refetch after error or success to ensure consistency
    onSettled: (data, error, variables) => {
      const taskId = variables.id;
      // Invalidate both the specific task and any lists that might contain it
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: TASK_KEYS.detail(taskId),
          refetchType: 'all'
        }),
        queryClient.invalidateQueries({
          queryKey: TASK_KEYS.lists(),
          refetchType: 'active'
        })
      ]);
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
    mutationFn: (taskId: string) => {
      return taskApi.deleteTask(taskId);
    },
    onMutate: async (taskId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: TASK_KEYS.lists() });
      await queryClient.cancelQueries({ queryKey: TASK_KEYS.detail(taskId) });

      // Snapshot the previous values
      const previousTasks = queryClient.getQueryData(TASK_KEYS.lists());
      const previousTask = queryClient.getQueryData(TASK_KEYS.detail(taskId));

      // Optimistically remove the task from the list
      queryClient.setQueryData(TASK_KEYS.lists(), (old: Task[] = []) =>
        old.filter((task) => task._id !== taskId)
      );

      // Remove the task from the cache
      queryClient.removeQueries({ queryKey: TASK_KEYS.detail(taskId) });

      return { previousTasks, previousTask };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASK_KEYS.lists(), context.previousTasks);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(
          TASK_KEYS.detail(taskId),
          context.previousTask
        );
      }
    },

    // Always refetch after error or success
    onSettled: (data, error, taskId) => {
      // Invalidate both the specific task and task lists
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.lists(),
        refetchType: 'active'
      });
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.detail(taskId),
        refetchType: 'all'
      });
    }
  });
};
