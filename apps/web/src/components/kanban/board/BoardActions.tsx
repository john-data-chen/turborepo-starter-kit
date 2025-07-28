'use client';

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
import { useBoards } from '@/hooks/useBoards';
import { useTaskStore } from '@/lib/workspace-store';
import { boardSchema } from '@/types/boardForm';
import { Board } from '@/types/dbInterface';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { BoardForm } from './BoardForm';

interface BoardActionsProps {
  board: Board;
  onDelete?: () => void;
  asChild?: boolean;
  children?: React.ReactNode;
}

export const BoardActions = React.forwardRef<
  HTMLButtonElement,
  BoardActionsProps
>(({ board, onDelete, asChild = false, children }, ref) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [editEnable, setEditEnable] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { updateBoard, removeBoard } = useTaskStore();
  const router = useRouter();
  const { fetchBoards } = useBoards();
  const t = useTranslations('kanban.actions');

  async function onSubmit(values: z.infer<typeof boardSchema>) {
    try {
      setIsSubmitting(true);
      await updateBoard(board._id, values);
      toast.success(t('boardUpdated', { title: values.title }));
      await fetchBoards();
      setEditEnable(false);
      router.refresh();
    } catch (error) {
      toast.error(t('boardUpdateFailed', { error: String(error) }));
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDelete = async () => {
    try {
      await removeBoard(board._id);
      setShowDeleteDialog(false);
      toast.success(t('boardDeleted'));
      onDelete?.();
      await fetchBoards();
      router.refresh();
    } catch (error) {
      toast.error(t('boardDeleteFailed', { error: String(error) }));
    }
  };

  return (
    <>
      <Dialog open={editEnable} onOpenChange={setEditEnable}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('editBoardTitle')}</DialogTitle>
            <DialogDescription>{t('editBoardDescription')}</DialogDescription>
          </DialogHeader>
          <BoardForm
            defaultValues={{
              title: board.title,
              description: board.description
            }}
            onSubmit={onSubmit}
          >
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditEnable(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('saving') : t('saveChanges')}
              </Button>
            </div>
          </BoardForm>
        </DialogContent>
      </Dialog>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          {asChild ? (
            React.Children.only(children)
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              data-testid="board-option-button"
              ref={ref}
            >
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            data-testid="edit-board-button"
            onSelect={() => setEditEnable(true)}
          >
            {t('edit')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            data-testid="delete-board-button"
            onSelect={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            {t('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('confirmDeleteTitle', { title: board.title })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDelete}>
              {t('delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

BoardActions.displayName = 'BoardActions';
