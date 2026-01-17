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
import { UpdateTaskInput } from "@/types/taskApi";

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
      // Handle case where project might not be found, though unlikely with current logic
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
    const data = event.active.data.current;
    if (data?.type === "Project") {
      setActiveProject(data?.project);
      return;
    }
    if (data?.type === "Task") {
      setActiveTask(data?.task);
    }
  }

  async function onDragOver(event: DragOverEvent) {
    const updatedProjects = [...projects];
    const { active, over } = event;

    // Early returns for invalid states
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
    const activeProject = updatedProjects.find(
      (project: Project) => project._id === activeTask.project
    );

    if (!activeProject) {
      console.error("Active project not found");
      return;
    }

    const activeTaskIdx = activeProject.tasks.findIndex(
      (task: Task) => task._id === activeTask._id
    );

    // Handle task dragged over a project
    if (over.data.current!.type === "Project") {
      const overProject = updatedProjects.find(
        (project: Project) => project._id === over.data.current!.project._id
      );

      if (!overProject) {
        console.error("Target project not found");
        return;
      }

      // Skip if it's the same project
      if (overProject._id === activeTask.project) {
        return;
      }

      try {
        // Remove task from source project
        activeProject.tasks.splice(activeTaskIdx, 1);

        // Add task to target project at the end (bottom)
        const newOrderInProject = overProject.tasks.length;
        activeTask.project = overProject._id;
        activeTask.orderInProject = newOrderInProject;
        overProject.tasks.push(activeTask);

        // Update local state optimistically
        setProjects(updatedProjects);

        // Update the backend - move task to new project
        await taskApi.moveTask(activeTask._id, overProject._id, newOrderInProject);

        toast.success(`Task: "${activeTask.title}" moved to Project: "${overProject.title}"`);
      } catch (error) {
        console.error("Failed to move task:", error);
        toast.error(
          `Failed to move task: ${error instanceof Error ? error.message : "unknown error"}`
        );
        // Revert local state on error
        setProjects([...projects]);
      }
      return;
    }

    // Handle task dragged over another task
    if (over.data.current!.type === "Task") {
      const overTask = over.data.current!.task;
      const overProject = updatedProjects.find(
        (project: Project) => project._id === overTask.project
      );

      if (!overProject) {
        console.error("Target project not found");
        return;
      }

      const overTaskIdx = overProject.tasks.findIndex((task: Task) => task._id === overTask._id);

      // If moving to a different project
      if (overTask.project !== activeTask.project) {
        try {
          const userId = useWorkspaceStore.getState().userId;
          if (!userId) {
            throw new Error("User not authenticated");
          }

          // Remove task from source project
          activeProject.tasks.splice(activeTaskIdx, 1);

          // Insert task at the position of the over task
          activeTask.project = overTask.project;
          activeTask.orderInProject = overTaskIdx;
          overProject.tasks.splice(overTaskIdx, 0, activeTask);

          // Update orderInProject for all tasks in the target project
          overProject.tasks.forEach((task, index) => {
            task.orderInProject = index;
          });

          // Update local state optimistically
          setProjects(updatedProjects);

          // Update the backend - move task to new project at specific position
          await taskApi.moveTask(activeTask._id, overTask.project, overTaskIdx);

          toast.success(`Task: "${activeTask.title}" moved to Project: "${overProject.title}"`);
        } catch (error) {
          console.error("Failed to move task:", error);
          toast.error(
            `Failed to move task: ${error instanceof Error ? error.message : "unknown error"}`
          );
          setProjects([...projects]);
        }
      }
      // Moving within the same project
      else {
        // Only proceed if the position actually changed
        if (activeTaskIdx === overTaskIdx) {
          return;
        }

        // Create a new array to avoid mutating the original
        const newTasks = [...overProject.tasks];

        // Remove the task from its original position
        const [movedTask] = newTasks.splice(activeTaskIdx, 1);

        // Calculate the new index after removal
        const newIndex = overTaskIdx;

        // Insert at the new position
        newTasks.splice(newIndex, 0, movedTask);

        // Create a backup of current projects for rollback
        const previousProjects = structuredClone(projects);

        // Update orderInProject for all tasks in the new order
        const updatedTasks = newTasks.map((task, index) => ({
          ...task,
          orderInProject: index
        }));

        // Update local state optimistically
        overProject.tasks = updatedTasks;
        setProjects(updatedProjects);

        try {
          // Find tasks that actually changed position
          const tasksToUpdate = updatedTasks.filter((task, newIndex) => {
            const oldTask = previousProjects
              .flatMap((p: Project) => p.tasks)
              .find((t: Task) => t._id === task._id);
            return oldTask?.orderInProject !== newIndex;
          });

          if (tasksToUpdate.length > 0) {
            // Update the backend with the new order for changed tasks
            const userId = useWorkspaceStore.getState().userId;
            if (!userId) {
              throw new Error("User ID not found");
            }

            // Process updates one by one to handle potential errors properly
            for (const task of tasksToUpdate) {
              // Create update data with required fields
              const updateData: UpdateTaskInput = {
                orderInProject: task.orderInProject,
                lastModifier: userId // This is required by the UpdateTaskInput type
              };

              await taskApi.updateTask(task._id, updateData);
            }
          }
        } catch (error) {
          console.error("Failed to update task order:", error);
          toast.error("Failed to update task order. Please try again.");
          // Revert on error
          setProjects(previousProjects);

          // Refresh the data to ensure consistency
          try {
            const { fetchProjects } = useWorkspaceStore.getState();
            if (overProject.board) {
              await fetchProjects(overProject.board.toString());
            }
          } catch (refreshError) {
            console.error("Failed to refresh projects:", refreshError);
          }
        }
      }
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveProject(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) {
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    if (!hasDraggableData(active)) {
      return;
    }

    const activeData = active.data.current;

    if (activeId === overId) {
      return;
    }

    const isActiveAProject = activeData?.type === "Project";
    if (!isActiveAProject) {
      return;
    }

    const activeProjectIndex = projects.findIndex((project: Project) => project._id === activeId);

    const overProjectIndex = projects.findIndex((project: Project) => project._id === overId);

    // Create backup for rollback
    const previousProjects = [...rawProjects];

    // Optimistically update the UI
    const reorderedProjects = arrayMove(projects, activeProjectIndex, overProjectIndex);

    // Update orderInBoard for all affected projects, ensuring it's a number
    const updatedProjects = reorderedProjects.map((project, index) => ({
      ...project,
      orderInBoard: Number(index)
    }));

    // Update the store with new order
    setProjects(updatedProjects);

    try {
      const userId = useWorkspaceStore.getState().userId;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Update backend for all projects that changed position
      const updatePromises = updatedProjects.map(async (project, newIndex) => {
        const oldProject = previousProjects.find((p) => p._id === project._id);
        const oldIndex = oldProject?.orderInBoard ?? 0;

        // Only update if the order actually changed
        if (oldIndex !== newIndex) {
          // Import projectApi dynamically to avoid circular dependency
          const { projectApi } = await import("@/lib/api/projectApi");

          // Ensure orderInBoard is a number
          const order = typeof newIndex === "number" ? newIndex : Number(newIndex);
          if (Number.isNaN(order)) {
            console.error("Invalid orderInBoard value:", newIndex);
            return Promise.reject(new Error("Invalid order value"));
          }

          const updateData = {
            orderInBoard: order
          };

          return projectApi.updateProject(project._id, updateData);
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);

      toast.success("Project order updated successfully");
    } catch (error) {
      console.error("Failed to update project order:", error);
      toast.error("Failed to update project order. Please try again.");

      // Revert to previous state on error
      setProjects(previousProjects);

      // Refresh data to ensure consistency
      try {
        const { fetchProjects, currentBoardId } = useWorkspaceStore.getState();
        if (currentBoardId) {
          await fetchProjects(currentBoardId);
        }
      } catch (refreshError) {
        console.error("Failed to refresh projects:", refreshError);
      }
    }
  }

  const pickedUpTaskProject = useRef<string | null>(null);

  const announcements: Announcements = {
    onDragStart({ active }) {
      if (!hasDraggableData(active)) {
        return;
      }
      if (active.data.current?.type === "Project") {
        const startProjectIdx = projectsId.findIndex((id: string) => id === active.id);
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
        const overProjectIdx = projectsId.findIndex((id: string) => id === over.id);
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
        const overProjectPosition = projectsId.findIndex((id: string) => id === over.id);

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
