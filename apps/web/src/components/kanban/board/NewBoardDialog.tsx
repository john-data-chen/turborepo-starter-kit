'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useBoards } from '@/hooks/useBoards';
import { useRouter } from '@/i18n/navigation';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { boardSchema } from '@/types/boardForm';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { BoardForm } from './BoardForm';

interface NewBoardDialogProps {
  children: React.ReactNode;
}

type BoardFormData = z.infer<typeof boardSchema>;

export default function NewBoardDialog({ children }: NewBoardDialogProps) {
  const [open, setOpen] = useState(false);
  const { addBoard } = useWorkspaceStore();
  const { refresh } = useBoards();
  const router = useRouter();
  const t = useTranslations('kanban.actions');

  const handleSubmit = async (data: BoardFormData) => {
    try {
      const boardId = await addBoard(data.title, data.description);
      toast.success(t('boardCreatedSuccess'));
      setOpen(false);
      await refresh();
      router.push(`/boards/${boardId}`);
    } catch (error) {
      console.error(error);
      toast.error(t('boardCreateFailed'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} data-testid="new-board-dialog">
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle data-testid="new-board-dialog-title">
            {t('newBoardTitle')}
          </DialogTitle>
          <DialogDescription>{t('newBoardDescription')}</DialogDescription>
        </DialogHeader>
        <BoardForm onSubmit={handleSubmit}>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-testid="cancel-button"
              onClick={() => setOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" data-testid="create-button">
              {t('create')}
            </Button>
          </DialogFooter>
        </BoardForm>
      </DialogContent>
    </Dialog>
  );
}
