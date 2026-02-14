/* eslint-disable eslint/max-lines -- Complex component managing kanban board state and interactions */
"use client";

import {
  Active,
  Announcements,
  DataRef,
  DndContext,
  DragOverlay,
  MouseSensor,
  Over,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Fragment, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { taskApi } from "@/lib/api/taskApi";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Project, Task } from "@/types/dbInterface";
import DraggableData from "@/types/drag&drop";

import NewProjectDialog from "../project/NewProjectDialog";
import { BoardContainer, BoardProject } from "../project/Project";
import { TaskCard } from "../task/TaskCard";
import { TaskFilter } from "../task/TaskFilter";

export function Board() {
  const rawProjects = useWorkspaceStore((state) => state.projects);
  const isLoadingProjects = useWorkspaceStore((state) => state.isLoadingProjects);
  const filter = useWorkspaceStore((state) => state.filter);
  const setProjects = useWorkspaceStore((state) => state.setProjects);
  const currentBoardId = useWorkspaceStore((state) => state.currentBoardId);
  const myBoards = useWorkspaceStore((state) => state.myBoards);
  const { user: currentUser, isAuthenticated } = useAuth();
  const currentUserId = currentUser?._id || "";
  const teamBoards = useWorkspaceStore((state) => state.teamBoards);

  // Check if current user is the board owner
  const isBoardOwner = useMemo(() => {
    if (!currentBoardId || !currentUserId) {
      return false;
    }
    if (!isAuthenticated) {
      return false;
    }

    // Find the current board
    const currentBoard = myBoards.find((board) => board._id === currentBoardId);
    if (!currentBoard) {
      return false;
    }

    // Check if current user is the owner of the board
    const ownerId =
      typeof currentBoard.owner === "string" ? currentBoard.owner : currentBoard.owner?._id;

    return ownerId === currentUserId;
  }, [currentBoardId, currentUserId, myBoards, isAuthenticated]);

  const isBoardMember = useMemo(() => {
    if (!currentBoardId || !currentUserId) {
      return false;
    }
    if (!isAuthenticated) {
      return false;
    }

    const currentBoard = [...myBoards, ...teamBoards].find((board) => board._id === currentBoardId);
    if (!currentBoard) {
      return false;
    }

    return currentBoard.members.some((member) => member._id === currentUserId);
  }, [currentBoardId, currentUserId, myBoards, teamBoards, isAuthenticated]);

  // Sort projects by orderInBoard
  const projects = useMemo(() => {
    return [...rawProjects].sort((a, b) => {
      const orderA = a.orderInBoard ?? 0;
      const orderB = b.orderInBoard ?? 0;
      return orderA - orderB;
    });
  }, [rawProjects]);

  const projectsId = useMemo(() => projects.map((project: Project) => project._id), [projects]);

  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const originalProjects = useRef<Project[] | null>(null);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  function hasDraggableData<T extends Active | Over>(
    entry: T | null | undefined
  ): entry is T & {
    data: DataRef<DraggableData>;
  } {
    if (!entry) {
      return false;
    }
    const data = entry.data.current;
    if (data?.type === "Project" || data?.type === "Task") {
      return true;
    }
    return false;
  }

  function getDraggingTaskData(taskId: string, projectId: string) {
    const project = projects.find((project: Project) => project._id.toString() === projectId);
    if (!project) {
      return {
        tasksInProject: [],
        taskPosition: -1,
        project: null
      };
    }
    const tasksInProject = project.tasks.filter(
      (task: Task) => task.project.toString() === projectId
    );
    const taskPosition = tasksInProject.findIndex((task: { _id: string }) => task._id === taskId);
    return {
      tasksInProject,
      taskPosition,
      project
    };
  }

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) {
      return;
    }
    // Store original state for rollback on cancel/error
    originalProjects.current = structuredClone(projects);

    const data = event.active.data.current;
    if (data?.type === "Project") {
      setActiveProject(data?.project);
      return;
    }
    if (data?.type === "Task") {
      setActiveTask(data?.task);
    }
  }

  /**
   * onDragOver — SYNCHRONOUS. Only handles CROSS-PROJECT task moves.
   *
   * Same-project reordering is handled visually by SortableContext CSS transforms
   * and finalized in onDragEnd. This prevents the infinite re-render loop that
   * occurs when same-project index swaps trigger continuous state updates.
   */
  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;

    if (!over) {
      return;
    }
    if (active.id === over.id) {
      return;
    }
    if (!hasDraggableData(active) || !hasDraggableData(over)) {
      return;
    }
    if (active.data.current!.type === "Project") {
      return;
    }

    const activeTask = active.data.current!.task;
    const overData = over.data.current!;

    // Find which project the active task is CURRENTLY in (from state, not stale drag data)
    let activeProjectId: string | null = null;
    for (const p of projects) {
      if (p.tasks.some((t) => t._id === activeTask._id)) {
        activeProjectId = p._id;
        break;
      }
    }

    // Find target project ID
    const overProjectId =
      overData.type === "Project"
        ? overData.project._id
        : overData.type === "Task"
          ? overData.task.project
          : null;

    if (!activeProjectId || !overProjectId) {
      return;
    }

    // CRITICAL: Only handle cross-project moves.
    // Same-project reordering is deferred to onDragEnd to prevent infinite loops.
    if (activeProjectId === overProjectId) {
      return;
    }

    // Cross-project move: splice task between projects
    const updatedProjects = projects.map((project) => ({
      ...project,
      tasks: [...project.tasks]
    }));

    const sourceProject = updatedProjects.find((p) => p._id === activeProjectId);
    const targetProject = updatedProjects.find((p) => p._id === overProjectId);

    if (!sourceProject || !targetProject) {
      return;
    }

    const activeIdx = sourceProject.tasks.findIndex((t) => t._id === activeTask._id);
    if (activeIdx === -1) {
      return;
    }

    const [movedTask] = sourceProject.tasks.splice(activeIdx, 1);
    movedTask.project = targetProject._id;

    if (overData.type === "Task") {
      const overIdx = targetProject.tasks.findIndex((t) => t._id === overData.task._id);
      targetProject.tasks.splice(overIdx >= 0 ? overIdx : targetProject.tasks.length, 0, movedTask);
    } else {
      targetProject.tasks.push(movedTask);
    }

    setProjects(updatedProjects);
  }

  /**
   * onDragEnd — Handles ALL persistence (API calls) and same-project reordering.
   * Fires exactly once when the user drops the item.
   */
  async function onDragEnd(event: DragEndEvent) {
    setActiveProject(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) {
      // No valid drop target — rollback
      if (originalProjects.current) {
        setProjects(originalProjects.current);
      }
      originalProjects.current = null;
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    if (!hasDraggableData(active)) {
      originalProjects.current = null;
      return;
    }

    const activeData = active.data.current;

    // Handle Task moves (cross-project already applied in onDragOver, same-project needs arrayMove)
    if (activeData?.type === "Task") {
      const movedTask = activeData.task;

      // Find where the task currently is in the optimistic state
      let currentProjectId = "";
      let currentIdx = -1;

      for (const project of projects) {
        const idx = project.tasks.findIndex((t) => t._id === movedTask._id);
        if (idx !== -1) {
          currentProjectId = project._id;
          currentIdx = idx;
          break;
        }
      }

      if (!currentProjectId || currentIdx === -1) {
        originalProjects.current = null;
        return;
      }

      // Handle same-project reordering (not done in onDragOver)
      if (hasDraggableData(over) && over.data.current!.type === "Task") {
        const overTask = over.data.current!.task;

        // If in same project, apply the reorder now
        if (currentProjectId === overTask.project) {
          const project = projects.find((p) => p._id === currentProjectId);
          if (project) {
            const overIdx = project.tasks.findIndex((t) => t._id === overTask._id);
            if (overIdx !== -1 && currentIdx !== overIdx) {
              const newTasks = arrayMove([...project.tasks], currentIdx, overIdx);
              const updatedProjects = projects.map((p) =>
                p._id === currentProjectId ? { ...p, tasks: newTasks } : p
              );
              setProjects(updatedProjects);
              currentIdx = overIdx;
            }
          }
        }
      }

      // Check if anything actually changed compared to original
      const originalProject = originalProjects.current?.find((p) =>
        p.tasks.some((t) => t._id === movedTask._id)
      );
      const originalIdx = originalProject?.tasks.findIndex((t) => t._id === movedTask._id) ?? -1;

      if (originalProject?._id === currentProjectId && originalIdx === currentIdx) {
        // No change — clean up
        originalProjects.current = null;
        return;
      }

      try {
        // Single API call to move/reorder task
        await taskApi.moveTask(movedTask._id, currentProjectId, currentIdx);
        toast.success(`Task "${movedTask.title}" moved successfully`);
        originalProjects.current = null;
      } catch (error) {
        console.error("Failed to move task:", error);
        toast.error("Failed to move task. Reverting...");
        if (originalProjects.current) {
          setProjects(originalProjects.current);
        }
        originalProjects.current = null;
      }
      return;
    }

    // Handle Project reordering
    if (activeData?.type === "Project") {
      if (activeId === overId) {
        originalProjects.current = null;
        return;
      }

      const activeProjectIndex = projectsId.indexOf(activeId as string);
      const overProjectIndex = projectsId.indexOf(overId as string);

      if (activeProjectIndex === -1 || overProjectIndex === -1) {
        originalProjects.current = null;
        return;
      }

      // Create backup for rollback
      const previousProjects = originalProjects.current || [...rawProjects];

      // Optimistically update the UI
      const reorderedProjects = arrayMove(projects, activeProjectIndex, overProjectIndex);
      const updatedProjects = reorderedProjects.map((project, index) => ({
        ...project,
        orderInBoard: Number(index)
      }));

      setProjects(updatedProjects);

      try {
        const { projectApi } = await import("@/lib/api/projectApi");

        // Update backend for all projects that changed position
        const updatePromises = updatedProjects.map(async (project, newIndex) => {
          const oldProject = previousProjects.find((p) => p._id === project._id);
          const oldIndex = oldProject?.orderInBoard ?? 0;

          if (oldIndex !== newIndex) {
            return projectApi.updateProject(project._id, { orderInBoard: newIndex });
          }
          return;
        });

        await Promise.all(updatePromises);
        toast.success("Project order updated successfully");
        originalProjects.current = null;
      } catch (error) {
        console.error("Failed to update project order:", error);
        toast.error("Failed to update project order. Reverting...");
        setProjects(previousProjects);
        originalProjects.current = null;
      }
    }
  }

  function onDragCancel() {
    if (originalProjects.current) {
      setProjects(originalProjects.current);
    }
    setActiveProject(null);
    setActiveTask(null);
    originalProjects.current = null;
  }

  const pickedUpTaskProject = useRef<string | null>(null);

  const announcements: Announcements = {
    onDragStart({ active }) {
      if (!hasDraggableData(active)) {
        return;
      }
      if (active.data.current?.type === "Project") {
        const startProjectIdx = projectsId.indexOf(active.id as string);
        const startProject = projects[startProjectIdx];
        return `Picked up Project ${startProject?.title} at position: ${startProjectIdx + 1} of ${projectsId.length}`;
      } else if (active.data.current?.type === "Task") {
        pickedUpTaskProject.current = active.data.current.task.project;
        const { tasksInProject, taskPosition, project } = getDraggingTaskData(
          active.data.current.task._id,
          active.data.current.task.project.toString()
        );
        return `Picked up Task ${active.data.current.task.title} at position: ${taskPosition + 1} of ${
          tasksInProject.length
        } in project ${project?.title}`;
      }
    },
    onDragOver({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) {
        return;
      }
      if (active.data.current?.type === "Project" && over.data.current?.type === "Project") {
        const overProjectIdx = projectsId.indexOf(over.id as string);
        return `Project ${active.data.current.project.title} was moved over ${
          over.data.current.project.title
        } at position ${overProjectIdx + 1} of ${projectsId.length}`;
      } else if (active.data.current?.type === "Task" && over.data.current?.type === "Task") {
        const { tasksInProject, taskPosition, project } = getDraggingTaskData(
          over.data.current.task._id,
          over.data.current.task.project.toString()
        );
        if (over.data.current.task.project !== pickedUpTaskProject.current?.toString()) {
          return `Task ${active.data.current.task.title} was moved over project ${project?.title} in position ${
            taskPosition + 1
          } of ${tasksInProject.length}`;
        }
        return `Task was moved over position ${taskPosition + 1} of ${
          tasksInProject.length
        } in project ${project?.title}`;
      }
    },
    onDragEnd({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) {
        pickedUpTaskProject.current = null;
        return;
      }
      if (active.data.current?.type === "Project" && over.data.current?.type === "Project") {
        const overProjectPosition = projectsId.indexOf(over.id as string);

        return `Project ${active.data.current.project.title} was dropped into position ${overProjectPosition + 1} of ${
          projectsId.length
        }`;
      } else if (active.data.current?.type === "Task" && over.data.current?.type === "Task") {
        const { tasksInProject, taskPosition, project } = getDraggingTaskData(
          over.data.current.task._id,
          over.data.current.task.project.toString()
        );
        if (over.data.current.task.project !== pickedUpTaskProject.current?.toString()) {
          return `Task was dropped into project ${project?.title} in position ${
            taskPosition + 1
          } of ${tasksInProject.length}`;
        }
        return `Task was dropped into position ${taskPosition + 1} of ${
          tasksInProject.length
        } in project ${project?.title}`;
      }
      pickedUpTaskProject.current = null;
    },
    onDragCancel({ active }) {
      if (!hasDraggableData(active)) {
        return;
      }
      return `Dragging ${active.data.current?.type} cancelled.`;
    }
  };

  const filterTasks = (tasks: Task[] = []) => {
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
                    currentUserId={currentUser?._id || ""}
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
              currentUserId={currentUser?._id || ""}
            />
          )}
          {activeTask && <TaskCard task={activeTask} isOverlay />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
