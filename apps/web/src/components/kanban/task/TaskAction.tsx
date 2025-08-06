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
import { useUser } from '@/lib/api/users/queries';
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
  // State for dialogs
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Translations
  const t = useTranslations('kanban.task');

  // Fetch task data to ensure we have the latest
  const { data: task, isLoading: isLoadingTask } = useTask(id);

  // Query and mutation hooks
  const queryClient = useQueryClient();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  // Fetch assignee info if assignee exists
  const { data: assigneeInfo } = useUser(assigneeId || '');

  // Permissions (in a real app, this would come from auth context)
  const canEdit = true;
  const canDelete = true;

  const defaultValues = {
    title,
    description: description || '',
    status: status as TaskStatus, // Now properly typed with the enum
    dueDate: dueDate ? new Date(dueDate) : undefined,
    assignee: assigneeInfo
      ? { _id: assigneeInfo._id, name: assigneeInfo.name || '' }
      : undefined,
    projectId,
    boardId
  };

  // Handle form submission
  const handleSubmit = async (values: z.infer<typeof TaskFormSchema>) => {
    try {
      const { title, description, status, dueDate, assignee } = values;

      await updateTaskMutation.mutateAsync(
        {
          id,
          title,
          description: description || null,
          status,
          dueDate: dueDate || null,
          assigneeId: assignee?._id || null
        },
        {
          onSuccess: () => {
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
            onUpdate?.();
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
      await deleteTaskMutation.mutateAsync(id, {
        onSettled: () => {
          // Invalidate both the specific task and task lists
          queryClient.invalidateQueries({
            queryKey: TASK_KEYS.detail(id),
            refetchType: 'all'
          });
          queryClient.invalidateQueries({
            queryKey: TASK_KEYS.lists(),
            refetchType: 'active'
          });
          onUpdate?.();
        }
      });
      toast.success(t('deleteSuccess'));
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(t('deleteError'));
    } finally {
      setShowDeleteDialog(false);
    }
  };

  // Loading and error states
  if (isLoadingTask) {
    return <div className="px-2 py-1.5">Loading...</div>;
  }

  if (!task) {
    return <div className="px-2 py-1.5 text-red-500">Task not found</div>;
  }

  return (
    <>
      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
            onSelect={() => setIsEditDialogOpen(true)}
            disabled={!canEdit}
            className={
              !canEdit ? 'text-muted-foreground cursor-not-allowed' : ''
            }
          >
            {t('edit')}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => setShowDeleteDialog(true)}
            disabled={!canDelete}
            className={
              !canDelete
                ? 'text-muted-foreground cursor-not-allowed'
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
