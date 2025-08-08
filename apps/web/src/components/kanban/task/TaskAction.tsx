'use client';

import { TaskForm } from '@/components/kanban/task/TaskForm';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useDeleteTask, useTask, useUpdateTask } from '@/lib/api/tasks/queries';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { TaskStatus } from '@/types/dbInterface';
import { TASK_KEYS } from '@/types/taskApi';
import { TaskFormSchema } from '@/types/taskForm';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

interface TaskActionsProps {
  id: string;
  title: string;
  status: TaskStatus;
  description?: string;
  dueDate?: Date | null;
  assigneeId?: string;
  projectId: string;
  boardId: string;
  onUpdate?: () => void;
}

export function TaskActions({
  id,
  title,
  description,
  dueDate,
  assigneeId,
  status,
  projectId,
  boardId,
  onUpdate
}: TaskActionsProps) {
  // State for dialogs and component state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  // Translations
  const t = useTranslations('kanban.task');

  // Fetch task data to ensure we have the latest
  const { data: task, isLoading: isLoadingTask } = useTask(id, {
    // Disable the query if the task is marked as deleted
    enabled: !isDeleted,
    // Don't retry if the task is not found (404)
    retry: true // Let the hook handle the retry logic
  });

  // Query and mutation hooks
  const queryClient = useQueryClient();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  // Get current user ID from workspace store
  const { userId } = useWorkspaceStore();

  // Determine permissions based on user role
  const isCreator = task?.creator?._id === userId;
  const isAssignee = task?.assignee?._id === userId;

  // Permission logic:
  // - Creator can edit and delete
  // - Assignee can only edit
  // - Others can't do anything
  const canEdit = isCreator || isAssignee;
  const canDelete = isCreator;

  // Prepare default values for the form
  const defaultValues = {
    title,
    description: description || '',
    status: status as TaskStatus,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    // Pass the assignee with required fields - the form will handle loading the full user data
    assignee: assigneeId
      ? {
          _id: assigneeId,
          name: null, // Will be populated by the form
          email: undefined // Optional field
        }
      : undefined,
    projectId,
    boardId
  };

  // Handle form submission
  const handleSubmit = async (values: z.infer<typeof TaskFormSchema>) => {
    try {
      const { title, description, status, dueDate, assignee } = values;

      // The current user ID is now handled by the useUpdateTask hook

      await updateTaskMutation.mutateAsync(
        {
          id,
          title,
          description: description || null,
          status,
          dueDate: dueDate || null,
          assigneeId: assignee?._id || null
          // lastModifier is now handled by the useUpdateTask hook
        },
        {
          onSuccess: async (_data) => {
            // Invalidate both the specific task and task lists
            queryClient.invalidateQueries({
              queryKey: TASK_KEYS.detail(id),
              refetchType: 'all'
            });
            queryClient.invalidateQueries({
              queryKey: TASK_KEYS.lists(),
              refetchType: 'active'
            });

            toast.success(t('updateSuccess', { title }));
            setIsEditDialogOpen(false);

            // Invalidate all related queries
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(id) }),
              queryClient.invalidateQueries({ queryKey: TASK_KEYS.lists() }),
              queryClient.invalidateQueries({
                queryKey: ['board', boardId, 'tasks']
              }),
              queryClient.invalidateQueries({
                queryKey: ['project', projectId, 'tasks']
              })
            ]);

            // Refetch all related queries
            const refetchPromises = [
              queryClient.refetchQueries({ queryKey: TASK_KEYS.detail(id) }),
              queryClient.refetchQueries({ queryKey: TASK_KEYS.lists() }),
              queryClient.refetchQueries({
                queryKey: ['board', boardId, 'tasks']
              }),
              queryClient.refetchQueries({
                queryKey: ['project', projectId, 'tasks']
              })
            ];

            await Promise.all(refetchPromises);

            // Call parent component callback
            if (onUpdate) {
              onUpdate();
            } else {
              console.warn('No onUpdate callback provided');
            }

            // Force re-render
            const queryCache = queryClient.getQueryCache();
            queryCache.findAll().forEach(({ queryKey }) => {
              if (
                Array.isArray(queryKey) &&
                (queryKey[0] === 'board' ||
                  queryKey[0] === 'project' ||
                  queryKey[0] === 'tasks')
              ) {
                queryClient.invalidateQueries({ queryKey });
              }
            });
          },
          onError: (error) => {
            console.error('Error updating task:', error);
            toast.error(t('updateError'));
          }
        }
      );
    } catch (error) {
      console.error('Error in task update handler:', error);
      toast.error(t('updateError'));
    }
  };

  // Handle task deletion
  const handleDelete = async () => {
    try {
      // 1. Save current task data for rollback
      const previousTask = queryClient.getQueryData(TASK_KEYS.detail(id));

      // 2. Create a function to safely update queries
      const updateQueries = (
        queryKey: readonly (string | readonly string[])[],
        taskId: string
      ) => {
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old || !Array.isArray(old)) return old;
          return old.filter((task: any) => task._id !== taskId);
        });
      };

      // 3. Create a function to safely cancel and remove queries
      const cancelAndRemoveQueries = (queryKey: any) => {
        queryClient.cancelQueries({ queryKey });
        queryClient.removeQueries({ queryKey });
      };

      // 4. Optimistically update all related queries
      try {
        // Cancel any ongoing requests for this task
        queryClient.cancelQueries({ queryKey: TASK_KEYS.detail(id) });

        // Update all list queries
        updateQueries(TASK_KEYS.lists(), id);
        updateQueries(['board', boardId, 'tasks'], id);
        updateQueries(['project', projectId, 'tasks'], id);

        // Remove the task detail query
        cancelAndRemoveQueries(TASK_KEYS.detail(id));

        // Also remove any other potential queries that might contain this task
        cancelAndRemoveQueries(['task', id, 'details']);
      } catch (error) {
        console.error('Error during optimistic update:', error);
      }

      // Mark as deleted immediately to prevent any further fetches
      setIsDeleted(true);

      // 5. Execute the delete mutation
      await deleteTaskMutation.mutateAsync(id, {
        onSuccess: async () => {
          try {
            // Invalidate all related queries to ensure data consistency
            await Promise.all([
              queryClient.invalidateQueries({
                queryKey: TASK_KEYS.lists(),
                refetchType: 'active' as const
              }),
              queryClient.invalidateQueries({
                queryKey: ['board', boardId, 'tasks'],
                refetchType: 'active' as const
              }),
              queryClient.invalidateQueries({
                queryKey: ['project', projectId, 'tasks'],
                refetchType: 'active' as const
              })
            ]);

            // Ensure task detail queries are removed
            cancelAndRemoveQueries(TASK_KEYS.detail(id));
            cancelAndRemoveQueries(['task', id, 'details']);

            // Call parent's update callback if provided
            if (onUpdate) {
              try {
                await onUpdate();
              } catch (updateError) {
                console.error('Error in onUpdate callback:', updateError);
              }
            }

            toast.success(t('deleteSuccess'));
          } catch (cleanupError) {
            console.error(
              'Error during cleanup after successful delete:',
              cleanupError
            );
            toast.success(t('deleteSuccess'));
          }
        },
        onError: (error) => {
          console.error('Error in delete mutation:', error);

          // Restore the task data
          if (previousTask) {
            queryClient.setQueryData(TASK_KEYS.detail(id), previousTask);
          }

          // Invalidate all relevant queries to restore correct state
          try {
            queryClient.invalidateQueries({
              predicate: (query) => {
                const queryKey = query.queryKey as readonly (
                  | string
                  | readonly string[]
                )[];
                const firstKey = Array.isArray(queryKey[0])
                  ? queryKey[0][0]
                  : queryKey[0];
                return ['tasks', 'board', 'project'].includes(
                  firstKey as string
                );
              },
              refetchType: 'active' as const
            });
          } catch (invalidateError) {
            console.error('Error during query invalidation:', invalidateError);
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }

          toast.error(t('deleteError'));
        }
      });
    } catch (error) {
      console.error('Error in delete handler:', error);
      toast.error(t('deleteError'));
    } finally {
      setShowDeleteDialog(false);
    }
  };

  // Loading and error states
  if (isLoadingTask && !isDeleted) {
    return <div className="px-2 py-1.5">Loading...</div>;
  }

  if ((!task && !isDeleted) || isDeleted) {
    // If task is deleted or not found, and we're not in a loading state,
    // return null to unmount the component
    return null;
  }

  // If we don't have task data, don't render anything
  if (!task) return null;

  return (
    <>
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleted) {
            setIsEditDialogOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md" data-testid="edit-task-dialog">
          <DialogHeader>
            <DialogTitle>{t('editTaskTitle')}</DialogTitle>
            <DialogDescription>{t('editTaskDescription')}</DialogDescription>
          </DialogHeader>
          <TaskForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={() => setIsEditDialogOpen(false)}
            submitLabel={t('updateTask')}
          />
        </DialogContent>
      </Dialog>

      {/* Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
            data-testid="task-actions-trigger"
          >
            <span className="sr-only">{t('actions')}</span>
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onSelect={() => canEdit && setIsEditDialogOpen(true)}
            disabled={!canEdit}
            className={
              !canEdit
                ? 'text-muted-foreground line-through cursor-not-allowed'
                : ''
            }
          >
            {t('edit')}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => canDelete && setShowDeleteDialog(true)}
            disabled={!canDelete}
            className={
              !canDelete
                ? 'text-muted-foreground line-through cursor-not-allowed'
                : 'text-red-600 hover:!text-red-600 hover:!bg-destructive/10'
            }
          >
            {t('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent data-testid="delete-task-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('confirmDeleteTitle', { title })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteDescription', { title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-button">
              {t('cancel')}
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-testid="confirm-delete-button"
              disabled={deleteTaskMutation.isPending}
            >
              {deleteTaskMutation.isPending ? t('deleting') : t('delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
