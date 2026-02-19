import { Announcements, Active, Over, DataRef } from "@dnd-kit/core";
import { useRef } from "react";

import { Project, Task } from "@/types/dbInterface";
import DraggableData from "@/types/drag&drop";

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

function getDraggingTaskData(taskId: string, projectId: string, projects: Project[]) {
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

export function useDndAnnouncements(projects: Project[], projectsId: string[]): Announcements {
  const pickedUpTaskProject = useRef<string | null>(null);

  return {
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
          active.data.current.task.project.toString(),
          projects
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
          over.data.current.task.project.toString(),
          projects
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
          over.data.current.task.project.toString(),
          projects
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
}
