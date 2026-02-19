"use client";

import { DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Fragment, useMemo } from "react";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { Project } from "@/types/dbInterface";

import NewProjectDialog from "../project/NewProjectDialog";
import { BoardContainer, BoardProject } from "../project/Project";
import { TaskCard } from "../task/TaskCard";
import { TaskFilter } from "../task/TaskFilter";

import { BoardProvider, useBoardContext } from "./BoardContext";
import { useBoardDnd } from "./useBoardDnd";

function BoardContent() {
  const rawProjects = useWorkspaceStore((state) => state.projects);
  const isLoadingProjects = useWorkspaceStore((state) => state.isLoadingProjects);
  const filter = useWorkspaceStore((state) => state.filter);
  const setProjects = useWorkspaceStore((state) => state.setProjects);
  const { currentUserId, isBoardOwner, isBoardMember } = useBoardContext();

  const projects = useMemo(() => {
    return [...rawProjects].sort((a, b) => {
      const orderA = a.orderInBoard ?? 0;
      const orderB = b.orderInBoard ?? 0;
      return orderA - orderB;
    });
  }, [rawProjects]);

  const projectsId = useMemo(() => projects.map((project: Project) => project._id), [projects]);

  const {
    sensors,
    activeProject,
    activeTask,
    announcements,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel
  } = useBoardDnd(projects, projectsId, setProjects, rawProjects);

  const filterTasks = (tasks: any[] = []) => {
    if (!Array.isArray(tasks)) {
      return [];
    }
    return tasks.filter((task) => {
      if (filter.status && task.status !== filter.status) {
        return false;
      }

      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        return (
          task.title.toLowerCase().includes(searchTerm) ||
          (task.description?.toLowerCase().includes(searchTerm) ?? false)
        );
      }

      return true;
    });
  };

  return (
    <div data-testid="board">
      <DndContext
        id="dnd-context"
        sensors={sensors}
        accessibility={{
          announcements
        }}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <div className="w-full sm:w-[200px]">
            <NewProjectDialog />
          </div>
          <div className="w-full sm:flex sm:justify-end">
            <TaskFilter />
          </div>
        </div>
        <BoardContainer>
          {isLoadingProjects ? (
            <Skeleton className="flex h-[75vh] max-h-[75vh] w-full shrink-0 snap-center flex-col bg-secondary md:w-[380px]" />
          ) : (
            <SortableContext items={projectsId}>
              {projects?.map((project: Project) => (
                <Fragment key={project._id}>
                  <BoardProject
                    project={project}
                    tasks={filterTasks(project.tasks)}
                    isBoardOwner={isBoardOwner}
                    isBoardMember={isBoardMember}
                    currentUserId={currentUserId}
                  />
                </Fragment>
              ))}
            </SortableContext>
          )}
        </BoardContainer>
        <DragOverlay>
          {activeProject && (
            <BoardProject
              isOverlay
              project={activeProject}
              tasks={filterTasks(activeProject.tasks)}
              isBoardOwner={isBoardOwner}
              isBoardMember={isBoardMember}
              currentUserId={currentUserId}
            />
          )}
          {activeTask && <TaskCard task={activeTask} isOverlay />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export function Board() {
  return (
    <BoardProvider>
      <BoardContent />
    </BoardProvider>
  );
}
