'use client';

import { TaskForm } from '@/components/kanban/task/TaskForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useCreateTask } from '@/lib/api/tasks/queries';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { TaskFormSchema } from '@/types/taskForm';
import { useTranslations } from 'next-intl';
import React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

export interface NewTaskDialogProps {
  projectId: string;
}

export default function NewTaskDialog({ projectId }: NewTaskDialogProps) {
  const addTask = useWorkspaceStore((state) => state.addTask);
  const [addTaskOpen, setAddTaskOpen] = React.useState(false);
  const t = useTranslations('kanban.task');
  const { mutateAsync: createTask } = useCreateTask();

  const handleSubmit = async (values: z.infer<typeof TaskFormSchema>) => {
    await addTask(
      projectId!,
      values.title!,
      values.status!,
      createTask,
      values.description ?? '',
      values.dueDate ?? undefined,
      values.assignee?._id ?? undefined
    );
    toast.success(t('createSuccess', { title: values.title }));
    setAddTaskOpen(false);
  };

  return (
    <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="lg"
          data-testid="new-task-trigger"
          className="my-4 w-full bg-foreground text-background hover:bg-foreground/90"
        >
          {t('addNewTask')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" data-testid="new-task-dialog">
        <DialogHeader>
          <DialogTitle>{t('addNewTaskTitle')}</DialogTitle>
          <DialogDescription>{t('addNewTaskDescription')}</DialogDescription>
        </DialogHeader>
        <TaskForm
          onSubmit={handleSubmit}
          submitLabel={t('createTask')}
          onCancel={() => setAddTaskOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
