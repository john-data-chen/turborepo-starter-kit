"use client"

import { Badge } from "@repo/ui/components/badge"
import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@repo/ui/components/select"
import { useTranslations } from "next-intl"
import React from "react"

import { useWorkspaceStore } from "@/stores/workspace-store"

export function TaskFilter() {
  const { filter, setFilter, projects } = useWorkspaceStore()
  const t = useTranslations("kanban.task")

  const statusCounts = React.useMemo(() => {
    const counts = {
      TOTAL: 0,
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0
    }

    if (!Array.isArray(projects)) {
      return counts
    }

    projects.forEach((project) => {
      const tasks = Array.isArray(project?.tasks) ? project.tasks : []
      tasks.forEach((task) => {
        if (!task) {
          return
        }
        counts.TOTAL++
        if (task.status && counts.hasOwnProperty(task.status)) {
          counts[task.status as keyof typeof counts]++
        }
      })
    })

    return counts
  }, [projects])

  const handleFilterChange = React.useCallback(
    (value: string) => {
      setFilter({ status: value === "TOTAL" ? null : value })
    },
    [setFilter]
  )

  const handleSearchChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilter({ search: event.target.value })
    },
    [setFilter]
  )

  return (
    <div className="mb-4 flex w-full items-center gap-2 md:w-auto">
      <Input
        type="text"
        placeholder={t("searchPlaceholder")}
        value={filter.search}
        onChange={handleSearchChange}
        className="w-full bg-background md:w-[300px]"
        data-testid="search-input"
      />
      <Select value={filter.status || "TOTAL"} onValueChange={handleFilterChange}>
        <SelectTrigger className="w-[140px]" data-testid="status-select">
          <SelectValue placeholder={t("filterByStatus")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TOTAL" data-testid="total-item">
            {t("total")}
            <Badge variant="outline" className="ml-2">
              {statusCounts.TOTAL}
            </Badge>
          </SelectItem>
          <SelectItem value="TODO" data-testid="todo-item">
            {t("statusTodo")}
            <Badge variant="outline" className="ml-2">
              {statusCounts.TODO}
            </Badge>
          </SelectItem>
          <SelectItem value="IN_PROGRESS" data-testid="in-progress-item">
            {t("statusInProgress")}
            <Badge variant="outline" className="ml-2">
              {statusCounts.IN_PROGRESS}
            </Badge>
          </SelectItem>
          <SelectItem value="DONE" data-testid="done-item">
            {t("statusDone")}
            <Badge variant="outline" className="ml-2">
              {statusCounts.DONE}
            </Badge>
          </SelectItem>
        </SelectContent>
      </Select>

      {(filter.status || filter.search) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFilter({ status: null, search: "" })
          }}
          data-testid="clear-filter-button"
        >
          {t("clearFilter")}
        </Button>
      )}
    </div>
  )
}
