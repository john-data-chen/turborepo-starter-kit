'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import { Project, Task } from '@/types/dbInterface';
import DraggableData from '@/types/drag&drop';
import {
  Active,
  Announcements,
  DataRef,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  MouseSensor,
  Over,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { Fragment, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import NewProjectDialog from '../project/NewProjectDialog';
import { BoardContainer, BoardProject } from '../project/Project';
import { TaskCard } from '../task/TaskCard';
import { TaskFilter } from '../task/TaskFilter';

export function Board() {
  const projects = useWorkspaceStore((state) => state.projects);
  const isLoadingProjects = useWorkspaceStore(
    (state) => state.isLoadingProjects
  ); // Get loading state
  const filter = useWorkspaceStore((state) => state.filter);
  const setProjects = useWorkspaceStore((state) => state.setProjects);
  const dragTaskOnProject = useWorkspaceStore(
    (state) => state.dragTaskOnProject
  );
  const projectsId = useMemo(
    () => projects.map((project: Project) => project._id),
    [projects]
  );

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
    if (data?.type === 'Project' || data?.type === 'Task') {
      return true;
    }
    return false;
  }

  function getDraggingTaskData(taskId: string, projectId: string) {
    const project = projects.find(
      (project: Project) => project._id.toString() === projectId
    );
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
    const taskPosition = tasksInProject.findIndex(
      (task: { _id: string }) => task._id === taskId
    );
    return {
      tasksInProject,
      taskPosition,
      project
    };
  }

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === 'Project') {
      setActiveProject(data?.project);
      return;
    }
    if (data?.type === 'Task') {
      setActiveTask(data?.task);
    }
  }

  function onDragOver(event: DragOverEvent) {
    const updatedProjects = [...projects];
    const { active, over } = event;
    // stop if no over data
    if (!over) return;
    // stop if active and over are the same
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
    // stop if no draggable data
    if (!hasDraggableData(active) || !hasDraggableData(over)) return;
    // stop if active is a project
    if (active.data.current!.type === 'Project') return;
    // get active task
    const activeTask = active.data.current!.task;
    const activeProject = updatedProjects.find(
      (project: Project) => project._id === active.data.current!.task.project
    );
    const activeTaskIdx = activeProject!.tasks.findIndex(
      (task: Task) => task._id === activeTask._id
    );
    // drag a task over a project
    if (over.data.current!.type === 'Project') {
      const overProject = updatedProjects.find(
        (project: Project) => project === over.data.current!.project
      );
      if (!overProject) {
        console.error('Target project not found');
        return;
      }
      dragTaskOnProject(activeTask._id, overProject._id)
        .then(() => {
          activeTask.project = overProject._id;
          overProject.tasks.push(activeTask);
          activeProject!.tasks.splice(activeTaskIdx, 1);
          setProjects(updatedProjects);

          if (activeTask.project !== overProject._id.toString()) {
            toast.success(
              `Task: "${activeTask.title}" is moved into Project: "${overProject.title}"`
            );
          }
        })
        .catch((error) => {
          console.error('Failed to move task:', error);
          toast.error(
            `Failed to move task: ${error.message || 'unknown error'}`
          );
        });
    }
    // drag a task over a task
    if (over.data.current!.type === 'Task') {
      const overTask = over.data.current!.task;
      const overProject = updatedProjects.find(
        (project: Project) =>
          project._id.toString() === overTask.project.toString()
      );
      const overTaskIdx = overProject!.tasks.findIndex(
        (task: Task) => task._id === overTask._id
      );
      // move task to a different project
      if (overTask.project !== activeTask.project) {
        dragTaskOnProject(activeTask._id, overTask.project)
          .then(() => {
            activeTask.project = overTask.project;
            overProject!.tasks.splice(overTaskIdx, 0, activeTask);
            activeProject!.tasks.splice(activeTaskIdx, 1);
            setProjects(updatedProjects);
            toast.success(
              `Task: "${activeTask.title}" is moved into Project: "${overProject!.title}"`
            );
          })
          .catch((error) => {
            console.error('Failed to move task:', error);
            toast.error(
              `Failed to move task: ${error.message || 'unknown error'}`
            );
          });
      }
      // move task to the same project
      else {
        const tempTask = activeTask;
        activeProject!.tasks.splice(activeTaskIdx, 1);
        overProject!.tasks.splice(overTaskIdx, 0, tempTask);

        setProjects(updatedProjects);
      }
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveProject(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (!hasDraggableData(active)) return;

    const activeData = active.data.current;

    if (activeId === overId) return;

    const isActiveAProject = activeData?.type === 'Project';
    if (!isActiveAProject) return;
    const activeProjectIndex = projects.findIndex(
      (project: Project) => project._id === activeId
    );

    const overProjectIndex = projects.findIndex(
      (project: Project) => project._id === overId
    );

    setProjects(arrayMove(projects, activeProjectIndex, overProjectIndex));
  }

  const pickedUpTaskProject = useRef<string | null>(null);

  const announcements: Announcements = {
    onDragStart({ active }) {
      if (!hasDraggableData(active)) return;
      if (active.data.current?.type === 'Project') {
        const startProjectIdx = projectsId.findIndex(
          (id: string) => id === active.id
        );
        const startProject = projects[startProjectIdx];
        return `Picked up Project ${startProject?.title} at position: ${
          startProjectIdx + 1
        } of ${projectsId.length}`;
      } else if (active.data.current?.type === 'Task') {
        pickedUpTaskProject.current = active.data.current.task.project;
        const { tasksInProject, taskPosition, project } = getDraggingTaskData(
          active.data.current.task._id,
          active.data.current.task.project.toString()
        );
        return `Picked up Task ${
          active.data.current.task.title
        } at position: ${taskPosition + 1} of ${
          tasksInProject.length
        } in project ${project?.title}`;
      }
    },
    onDragOver({ active, over }) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) return;
      if (
        active.data.current?.type === 'Project' &&
        over.data.current?.type === 'Project'
      ) {
        const overProjectIdx = projectsId.findIndex(
          (id: string) => id === over.id
        );
        return `Project ${active.data.current.project.title} was moved over ${
          over.data.current.project.title
        } at position ${overProjectIdx + 1} of ${projectsId.length}`;
      } else if (
        active.data.current?.type === 'Task' &&
        over.data.current?.type === 'Task'
      ) {
        const { tasksInProject, taskPosition, project } = getDraggingTaskData(
          over.data.current.task._id,
          over.data.current.task.project.toString()
        );
        if (
          over.data.current.task.project !==
          pickedUpTaskProject.current?.toString()
        ) {
          return `Task ${
            active.data.current.task.title
          } was moved over project ${project?.title} in position ${
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
      if (
        active.data.current?.type === 'Project' &&
        over.data.current?.type === 'Project'
      ) {
        const overProjectPosition = projectsId.findIndex(
          (id: string) => id === over.id
        );

        return `Project ${
          active.data.current.project.title
        } was dropped into position ${overProjectPosition + 1} of ${
          projectsId.length
        }`;
      } else if (
        active.data.current?.type === 'Task' &&
        over.data.current?.type === 'Task'
      ) {
        const { tasksInProject, taskPosition, project } = getDraggingTaskData(
          over.data.current.task._id,
          over.data.current.task.project.toString()
        );
        if (
          over.data.current.task.project !==
          pickedUpTaskProject.current?.toString()
        ) {
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
      if (!hasDraggableData(active)) return;
      return `Dragging ${active.data.current?.type} cancelled.`;
    }
  };

  const filterTasks = (tasks: Task[]) => {
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div className="w-full sm:w-[200px]">
            <NewProjectDialog />
          </div>
          <div className="w-full sm:flex sm:justify-end">
            <TaskFilter />
          </div>
        </div>
        <BoardContainer>
          {isLoadingProjects ? (
            <Skeleton className="h-[75vh] max-h-[75vh] w-full md:w-[380px] bg-secondary flex flex-col shrink-0 snap-center" />
          ) : (
            <SortableContext items={projectsId}>
              {projects?.map((project: Project) => (
                <Fragment key={project._id}>
                  <BoardProject
                    project={project}
                    tasks={filterTasks(project.tasks)}
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
            />
          )}
          {activeTask && <TaskCard task={activeTask} isOverlay />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
