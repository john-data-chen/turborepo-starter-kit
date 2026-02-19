import {
  Active,
  DataRef,
  Over,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { taskApi } from "@/lib/api/taskApi";
import { Project, Task } from "@/types/dbInterface";
import DraggableData from "@/types/drag&drop";

import { useDndAnnouncements } from "./useDndAnnouncements";

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

export function useBoardDnd(
  projects: Project[],
  projectsId: string[],
  setProjects: (projects: Project[]) => void,
  rawProjects: Project[]
) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const originalProjects = useRef<Project[] | null>(null);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  const announcements = useDndAnnouncements(projects, projectsId);

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) {
      return;
    }
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

    let activeProjectId: string | null = null;
    for (const p of projects) {
      if (p.tasks.some((t) => t._id === activeTask._id)) {
        activeProjectId = p._id;
        break;
      }
    }

    const overProjectId =
      overData.type === "Project"
        ? overData.project._id
        : overData.type === "Task"
          ? overData.task.project
          : null;

    if (!activeProjectId || !overProjectId) {
      return;
    }

    if (activeProjectId === overProjectId) {
      return;
    }

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

  async function onDragEnd(event: DragEndEvent) {
    setActiveProject(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) {
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

    if (activeData?.type === "Task") {
      const movedTask = activeData.task;

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

      if (hasDraggableData(over) && over.data.current!.type === "Task") {
        const overTask = over.data.current!.task;

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

      const originalProject = originalProjects.current?.find((p) =>
        p.tasks.some((t) => t._id === movedTask._id)
      );
      const originalIdx = originalProject?.tasks.findIndex((t) => t._id === movedTask._id) ?? -1;

      if (originalProject?._id === currentProjectId && originalIdx === currentIdx) {
        originalProjects.current = null;
        return;
      }

      try {
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

      const previousProjects = originalProjects.current || [...rawProjects];

      const reorderedProjects = arrayMove(projects, activeProjectIndex, overProjectIndex);
      const updatedProjects = reorderedProjects.map((project, index) => ({
        ...project,
        orderInBoard: Number(index)
      }));

      setProjects(updatedProjects);

      try {
        const { projectApi } = await import("@/lib/api/projectApi");

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

  return {
    sensors,
    activeProject,
    activeTask,
    announcements,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel
  };
}
