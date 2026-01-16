import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@repo/ui/components/badge"
import { Card, CardContent, CardHeader } from "@repo/ui/components/card"
import { cn } from "@repo/ui/lib/utils"
import { cva } from "class-variance-authority"
import { format } from "date-fns"
import { Calendar1Icon, FileTextIcon, PointerIcon, UserIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Task, TaskStatus } from "@/types/dbInterface"

import { TaskActions } from "./TaskAction"

interface TaskCardProps {
  task: Task
  isOverlay?: boolean
  onUpdate?: () => void
  isDragEnabled?: boolean
}

export type TaskType = "Task"

export interface TaskDragData {
  type: TaskType
  task: Task
}

function getLastField(task: Task): string {
  const visibleFields = []
  if (task.creator) {
    visibleFields.push("creator")
  }
  if (task.lastModifier) {
    visibleFields.push("lastModifier")
  }
  if (task.assignee) {
    visibleFields.push("assignee")
  }
  if (task.dueDate) {
    visibleFields.push("dueDate")
  }
  if (task.description) {
    visibleFields.push("description")
  }

  return visibleFields[visibleFields.length - 1] || ""
}

export function TaskCard({
  task,
  isOverlay = false,
  onUpdate,
  isDragEnabled = false
}: TaskCardProps) {
  const t = useTranslations("kanban.task")

  // Return null if task is undefined or marked as deleted
  if (!task || task._deleted) {
    return null
  }

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: {
      type: "Task",
      task
    } satisfies TaskDragData,
    disabled: isOverlay || !isDragEnabled, // Disable drag if not enabled or in overlay
    attributes: {
      roleDescription: "Task",
      // @ts-ignore - Adding custom data attributes for debugging
      "data-task-id": task._id,
      // @ts-ignore - Adding custom data attributes for debugging
      "data-draggable": String(isDragEnabled && !isOverlay)
    }
  })

  const cardStyle: React.CSSProperties = {
    transition,
    transform: CSS.Translate.toString(transform)
  }

  const cardVariants = cva("", {
    variants: {
      dragging: {
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary"
      }
    }
  })

  type DragState = "over" | "overlay" | undefined
  const dragState: DragState = isOverlay ? "overlay" : isDragging ? "over" : undefined

  const statusConfig: Record<
    TaskStatus,
    {
      label: string
      className: string
    }
  > = {
    TODO: {
      label: t("statusTodo"),
      className: "bg-slate-500 hover:bg-slate-500"
    },
    IN_PROGRESS: {
      label: t("statusInProgress"),
      className: "bg-blue-500 hover:bg-blue-500"
    },
    DONE: {
      label: t("statusDone"),
      className: "bg-green-500 hover:bg-green-500"
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={cardStyle}
      className={cn(
        "mb-3 transition-shadow hover:shadow-md",
        cardVariants({ dragging: dragState })
      )}
      data-testid="task-card"
      {...(isDragEnabled ? attributes : {})}
    >
      <CardHeader className="flex flex-row border-b-2 px-3 pb-2">
        {isDragEnabled ? (
          <div
            {...attributes}
            {...listeners}
            className="flex h-8 w-16 cursor-grab items-center justify-center rounded-md text-primary/50 transition-colors hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
          >
            <span className="sr-only">drag task: {task.title}</span>
            <PointerIcon className="h-4 w-4" />
          </div>
        ) : (
          <div className="h-8 w-16" />
        )}
        <div className="mx-2 flex flex-1 flex-col items-start gap-2">
          {task.title && (
            <h3 className="text-lg leading-none font-medium tracking-tight">{task.title}</h3>
          )}
          <Badge
            variant="secondary"
            className={cn("text-white", task.status && statusConfig[task.status]?.className)}
          >
            {task.status ? statusConfig[task.status]?.label : t("noStatus")}
          </Badge>
        </div>
        <TaskActions
          id={task._id}
          title={task.title}
          description={task.description || undefined}
          dueDate={task.dueDate || undefined}
          assigneeId={task.assignee?._id}
          status={task.status}
          projectId={task.project}
          boardId={task.board}
          onUpdate={onUpdate}
        />
      </CardHeader>
      <div className="space-y-0">
        {task.creator && (
          <div className={getLastField(task) !== "creator" ? "border-b" : ""}>
            <CardContent className="px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{t("createdBy", { name: task.creator.name })}</span>
              </div>
            </CardContent>
          </div>
        )}
        {task.lastModifier && (
          <div className={getLastField(task) !== "lastModifier" ? "border-b" : ""}>
            <CardContent className="px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{t("lastModifiedBy", { name: task.lastModifier.name })}</span>
              </div>
            </CardContent>
          </div>
        )}
        {task.assignee && (
          <div className={getLastField(task) !== "assignee" ? "border-b" : ""}>
            <CardContent className="px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{t("assignee", { name: task.assignee.name })}</span>
              </div>
            </CardContent>
          </div>
        )}
        {task.dueDate && (
          <div className={getLastField(task) !== "dueDate" ? "border-b" : ""}>
            <CardContent className="px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar1Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  {t("dueDate")}: {task.dueDate ? format(new Date(task.dueDate), "yyyy/MM/dd") : ""}
                </span>
              </div>
            </CardContent>
          </div>
        )}
        {task.description && (
          <div>
            <CardContent className="px-3 py-2">
              <div className="flex items-start gap-2">
                <FileTextIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <p
                  className="text-sm leading-relaxed text-muted-foreground"
                  data-testid="task-card-description"
                >
                  {task.description}
                </p>
              </div>
            </CardContent>
          </div>
        )}
      </div>
    </Card>
  )
}

export default TaskCard
