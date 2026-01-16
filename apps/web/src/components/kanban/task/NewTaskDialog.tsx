"use client"

import { Button } from "@repo/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@repo/ui/components/dialog"
import { useTranslations } from "next-intl"
import React from "react"
import { toast } from "sonner"
import { z } from "zod"

import { TaskForm } from "@/components/kanban/task/TaskForm"
import { useCreateTask } from "@/lib/api/tasks/queries"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { TaskFormSchema } from "@/types/taskForm"

export interface NewTaskDialogProps {
  projectId: string
}

export default function NewTaskDialog({ projectId }: NewTaskDialogProps) {
  const addTask = useWorkspaceStore((state) => state.addTask)
  const [addTaskOpen, setAddTaskOpen] = React.useState(false)
  const t = useTranslations("kanban.task")
  const { mutateAsync: createTask } = useCreateTask()

  const handleSubmit = async (values: z.infer<typeof TaskFormSchema>) => {
    // Get the current project to calculate the next orderInProject
    const { projects } = useWorkspaceStore.getState()
    const currentProject = projects.find((p) => p._id === projectId)
    const currentTasks = currentProject?.tasks || []

    // Calculate the next orderInProject
    const lastOrder = currentTasks.reduce(
      (max, task) => Math.max(max, task.orderInProject ?? -1),
      -1
    )
    const nextOrder = lastOrder + 1

    await addTask(
      projectId,
      values.title,
      values.status!,
      createTask,
      values.description ?? "",
      values.dueDate ?? undefined,
      values.assignee?._id ?? undefined,
      nextOrder
    )
    toast.success(t("createSuccess", { title: values.title }))
    setAddTaskOpen(false)
  }

  return (
    <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="lg"
          data-testid="new-task-trigger"
          className="my-4 w-full bg-foreground text-background hover:bg-foreground/90"
        >
          {t("addNewTask")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" data-testid="new-task-dialog">
        <DialogHeader>
          <DialogTitle>{t("addNewTaskTitle")}</DialogTitle>
          <DialogDescription>{t("addNewTaskDescription")}</DialogDescription>
        </DialogHeader>
        <TaskForm
          onSubmit={handleSubmit}
          submitLabel={t("createTask")}
          onCancel={() =>{  setAddTaskOpen(false); }}
        />
      </DialogContent>
    </Dialog>
  )
}
