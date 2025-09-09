import { useWorkspaceStore } from '@/stores/workspace-store'
import type { Task, TaskStatus } from '@/types/dbInterface'
import { TASK_KEYS, UpdateTaskInput } from '@/types/taskApi'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '../taskApi'

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
  })
}

interface UseTaskOptions {
  enabled?: boolean
  retry?: boolean | ((failureCount: number, error: any) => boolean)
}

export const useTask = (taskId?: string, options: UseTaskOptions = {}) => {
  const { enabled = true, retry } = options

  return useQuery({
    queryKey: TASK_KEYS.detail(taskId || ''),
    queryFn: () => taskApi.getTaskById(taskId || ''),
    enabled: !!taskId && enabled,
    retry:
      retry ??
      ((failureCount: number, error: any) => {
        if (error?.response?.status === 404) return false
        return failureCount < 3
      })
  })
}

export const useCreateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      title: string
      description?: string
      status?: TaskStatus
      dueDate?: Date
      board: string
      project: string
      creator: string
      assignee?: string | { _id: string }
      orderInProject?: number
    }) => {
      // Ensure assignee is a string (user ID)
      const assigneeId = typeof input.assignee === 'string' ? input.assignee : input.assignee?._id
      return taskApi.createTask({
        title: input.title,
        description: input.description,
        status: input.status,
        dueDate: input.dueDate,
        board: input.board,
        project: input.project,
        creator: input.creator,
        assignee: assigneeId,
        lastModifier: input.creator,
        orderInProject: input.orderInProject
      })
    },
    onSuccess: (variables) => {
      // Invalidate the tasks list query to refetch
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.list({ project: variables.project })
      })

      // Also invalidate the assignee's tasks if applicable
      const assigneeId = variables.assignee
        ? typeof variables.assignee === 'string'
          ? variables.assignee
          : variables.assignee._id
        : undefined

      if (assigneeId) {
        queryClient.invalidateQueries({
          queryKey: TASK_KEYS.list({ assignee: assigneeId })
        })
      }
    }
  })
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient()
  // Get the current user's ID from the workspace store
  const userId = useWorkspaceStore((state: { userId: string | null }) => state.userId)

  if (!userId) {
    throw new Error('User must be authenticated to update a task')
  }

  return useMutation({
    mutationFn: ({
      id,
      ...updates
    }: { id: string } & Omit<UpdateTaskInput, 'assigneeId' | 'lastModifier'> & {
        assigneeId?: string | null
      }) => {
      // Create a clean update object with only the fields we want to send
      const apiUpdates: UpdateTaskInput = {
        lastModifier: userId // Use the current user's ID as the lastModifier
      }

      // Only include fields that are defined in the updates
      if (updates.title !== undefined) apiUpdates.title = updates.title
      if (updates.description !== undefined) apiUpdates.description = updates.description
      if (updates.status !== undefined) apiUpdates.status = updates.status
      if (updates.dueDate !== undefined) apiUpdates.dueDate = updates.dueDate

      // Handle assigneeId separately to ensure it's not sent as undefined
      if ('assigneeId' in updates) {
        apiUpdates.assigneeId = updates.assigneeId ?? null
      }

      return taskApi.updateTask(id, apiUpdates)
    },

    // Optimistic updates
    onMutate: async (updatedTask) => {
      const taskId = updatedTask.id
      const taskQueryKey = TASK_KEYS.detail(taskId)

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskQueryKey })

      // Snapshot the previous values
      const previousTask = queryClient.getQueryData<Task>(taskQueryKey)

      // Optimistically update to the new value
      if (previousTask) {
        // Create a clean update object with only the fields that were actually updated
        const updateFields: Partial<Task> = {}

        // Only include fields that were actually provided in the update
        if ('title' in updatedTask) updateFields.title = updatedTask.title
        if ('description' in updatedTask) updateFields.description = updatedTask.description
        if ('status' in updatedTask) updateFields.status = updatedTask.status
        if ('dueDate' in updatedTask) updateFields.dueDate = updatedTask.dueDate

        // Handle assignee update - we need to include all required UserInfo fields
        if ('assigneeId' in updatedTask) {
          if (updatedTask.assigneeId) {
            // If we have an assigneeId, we need to get the user info from the previous task
            // or from the current assignee if it exists
            const previousTask = queryClient.getQueryData<Task>(taskQueryKey)
            const previousAssignee = previousTask?.assignee

            if (previousAssignee && previousAssignee._id === updatedTask.assigneeId) {
              // If the assignee is the same, keep the existing user info
              updateFields.assignee = { ...previousAssignee }
            } else {
              // Otherwise, we need to fetch the user info
              // For now, we'll just include the ID and placeholder values for required fields
              // The next data fetch will update this with the full user info
              updateFields.assignee = {
                _id: updatedTask.assigneeId,
                name: 'Loading...',
                email: 'loading@example.com'
              }
            }
          } else {
            // If assigneeId is null or undefined, set assignee to undefined
            updateFields.assignee = undefined
          }
        }

        const newTask = {
          ...previousTask,
          ...updateFields,
          updatedAt: new Date().toISOString(),
          _id: taskId // Ensure _id is always set
        }

        // Update the task in the cache
        queryClient.setQueryData(taskQueryKey, newTask)

        // Also update the task in any lists it might be in
        queryClient.setQueriesData({ queryKey: TASK_KEYS.lists() }, (old: Task[] | undefined) => {
          if (!old) return old
          return old.map((task) => (task._id === taskId ? { ...task, ...updateFields } : task))
        })
      }

      return { previousTask }
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, updatedTask, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(TASK_KEYS.detail(updatedTask.id), context.previousTask)
      }
    },

    // Always refetch after error or success to ensure consistency
    onSettled: (data, error, variables) => {
      const taskId = variables.id
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
      ])
    }
  })
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => {
      return taskApi.deleteTask(taskId)
    },
    onMutate: async (taskId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: TASK_KEYS.lists() })
      await queryClient.cancelQueries({ queryKey: TASK_KEYS.detail(taskId) })

      // Get the task that's being deleted to know its project and order
      const taskToDelete = queryClient.getQueryData<Task>(TASK_KEYS.detail(taskId))

      // Snapshot the previous values
      const previousTasks = queryClient.getQueryData(TASK_KEYS.lists())
      const previousTask = queryClient.getQueryData(TASK_KEYS.detail(taskId))

      // Optimistically update the task list
      if (taskToDelete) {
        queryClient.setQueriesData({ queryKey: TASK_KEYS.lists() }, (old: Task[] | undefined) => {
          if (!old) return old

          // Filter out the deleted task and update orders for remaining tasks
          return old
            .filter((task) => task._id !== taskId)
            .map((task) => {
              // If task is in the same project and has higher order, decrease it by 1
              if (
                task.project === taskToDelete.project &&
                task.orderInProject !== undefined &&
                taskToDelete.orderInProject !== undefined &&
                task.orderInProject > taskToDelete.orderInProject
              ) {
                return {
                  ...task,
                  orderInProject: task.orderInProject - 1
                }
              }
              return task
            })
        })
      } else {
        // Fallback: just remove the task if we don't have its details
        queryClient.setQueriesData({ queryKey: TASK_KEYS.lists() }, (old: Task[] | undefined) => {
          if (!old) return old
          return old.filter((task) => task._id !== taskId)
        })
      }

      // Remove the task from the cache
      queryClient.removeQueries({ queryKey: TASK_KEYS.detail(taskId) })

      return { previousTasks, previousTask, taskToDelete }
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASK_KEYS.lists(), context.previousTasks)
      }
      if (context?.previousTask) {
        queryClient.setQueryData(TASK_KEYS.detail(taskId), context.previousTask)
      }
    },

    // Always refetch after error or success to ensure data consistency
    onSettled: (data, error, taskId, context) => {
      // If we have the deleted task info, invalidate queries for that specific project
      if (context?.taskToDelete?.project) {
        queryClient.invalidateQueries({
          queryKey: TASK_KEYS.list({ project: context.taskToDelete.project }),
          refetchType: 'active'
        })
      }

      // Also invalidate general task lists and the specific task
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.lists(),
        refetchType: 'active'
      })
      queryClient.invalidateQueries({
        queryKey: TASK_KEYS.detail(taskId),
        refetchType: 'all'
      })
    }
  })
}
