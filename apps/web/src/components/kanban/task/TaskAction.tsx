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
import { useTaskStore } from '@/lib/workspace-store';
import { TaskFormSchema } from '@/types/taskForm';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

export interface TaskActionsProps {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  description?: string;
  dueDate?: Date | null;
  assignee?: string;
  onUpdate?: (
    id: string,
    newTitle: string,
    status: 'TODO' | 'IN_PROGRESS' | 'DONE',
    newDescription?: string,
    newDueDate?: Date | null,
    assignee?: string
  ) => void;
  onDelete?: (id: string) => void;
}

export function TaskActions({
  id,
  title,
  description,
  dueDate,
  assignee,
  status,
  onDelete
}: TaskActionsProps) {
  const updateTask = useTaskStore((state) => state.updateTask);
  const removeTask = useTaskStore((state) => state.removeTask);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editEnable, setEditEnable] = useState(false);
  const t = useTranslations('kanban.task');
  const [assigneeInfo, setAssigneeInfo] = useState<{
    _id: string;
    name: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchAssigneeInfo = async () => {
      if (assignee) {
        try {
          const { getUserById } = await import('@/lib/api/users');
          const user = await getUserById(assignee);
          if (user) {
            setAssigneeInfo({ _id: user._id, name: user.name });
          }
        } catch (error) {
          console.error('Failed to fetch assignee details', error);
        }
      }
    };
    fetchAssigneeInfo();
  }, [assignee]);

  const [permissions, setPermissions] = React.useState<{
    canEdit: boolean;
    canDelete: boolean;
  } | null>(null);
  const [isLoadingPermissions, setIsLoadingPermissions] = React.useState(true);

  const defaultValues = {
    title,
    description,
    status,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    assignee: assigneeInfo ?? undefined
  };

  const handleSubmit = async (values: z.infer<typeof TaskFormSchema>) => {
    const assigneeId = values.assignee?._id;
    updateTask(
      id,
      values.title,
      values.status ?? 'TODO',
      values.description,
      values.dueDate,
      assigneeId
    );
    toast.success(t('updateSuccess', { title: values.title }));
    setEditEnable(false);
  };

  const handleDelete = () => {
    setTimeout(() => (document.body.style.pointerEvents = ''), 100);
    setShowDeleteDialog(false);
    removeTask(id);
    onDelete?.(id);
    toast.success(t('deleteSuccess'));
  };

  const checkPermissions = useCallback(async () => {
    if (!id) {
      setIsLoadingPermissions(false);
      return;
    }
    try {
      const response = await fetch(`/api/tasks/${id}/permissions`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('checkPermissionsFailed'));
      }

      const data = await response.json();
      setPermissions(data);
    } catch (error) {
      console.error('Error checking task permissions:', error);
      setPermissions({ canEdit: false, canDelete: false }); // Fallback on error
      toast.error(
        t('loadPermissionsFailed', { error: (error as Error).message })
      );
    } finally {
      setIsLoadingPermissions(false);
    }
  }, [id, t]);

  return (
    <>
      <Dialog
        open={editEnable && !!permissions?.canEdit}
        onOpenChange={setEditEnable}
      >
        <DialogContent className="sm:max-w-md" data-testid="edit-task-dialog">
          <DialogHeader>
            <DialogTitle>{t('editTaskTitle')}</DialogTitle>
            <DialogDescription>{t('editTaskDescription')}</DialogDescription>
          </DialogHeader>
          <TaskForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={() => setEditEnable(false)}
            submitLabel={t('updateTask')}
          />
        </DialogContent>
      </Dialog>
      <DropdownMenu modal={false} onOpenChange={checkPermissions}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="h-8 w-12"
            data-testid="task-actions-trigger"
          >
            <span className="sr-only">{t('actions')}</span>
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-40"
          hidden={isLoadingPermissions}
        >
          <DropdownMenuItem
            onSelect={() => setEditEnable(true)}
            disabled={!permissions?.canEdit}
            className={
              !permissions?.canEdit
                ? 'text-muted-foreground line-through cursor-not-allowed'
                : ''
            }
          >
            {t('edit')}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setShowDeleteDialog(true)}
            disabled={!permissions?.canDelete}
            className={`
              w-full text-left
              ${
                !permissions?.canDelete
                  ? 'text-muted-foreground line-through cursor-not-allowed'
                  : 'text-red-600 hover:!text-red-600 hover:!bg-destructive/10'
              }
            `}
          >
            {t('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog
        open={showDeleteDialog && !!permissions?.canDelete}
        onOpenChange={setShowDeleteDialog}
      >
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
            >
              {t('delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
