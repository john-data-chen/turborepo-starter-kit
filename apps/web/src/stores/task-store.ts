import type { CreateTaskInput, Task, UpdateTaskInput } from "@repo/store";
import { TaskStatus } from "@repo/store";
import type { StateCreator } from "zustand";

import { taskApi } from "@/lib/api/taskApi";

export interface TaskSlice {
  addTask: (
    projectId: string,
    title: string,
    status: TaskStatus,
    createTask: (task: CreateTaskInput) => Promise<Task>,
    description?: string,
    dueDate?: Date,
    assigneeId?: string,
    orderInProject?: number
  ) => Promise<void>;
  updateTask: (
    taskId: string,
    title: string,
    status: TaskStatus,
    description?: string,
    dueDate?: Date,
    assigneeId?: string,
    newProjectId?: string,
    orderInProject?: number
  ) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  dragTaskOnProject: (
    taskId: string,
    newProjectId: string,
    getTask: (taskId: string) => Promise<Task | undefined>
  ) => Promise<void>;
}

export const createTaskSlice: StateCreator<
  TaskSlice & {
    userId: string | null;
    currentBoardId: string | null;
    projects: any[];
    fetchProjects: (boardId: string) => Promise<void>;
  },
  [],
  [],
  TaskSlice
> = (set, get) => ({
  addTask: async (
    projectId: string,
    title: string,
    status: TaskStatus = TaskStatus.TODO,
    createTask: (task: CreateTaskInput) => Promise<Task>,
    description?: string,
    dueDate?: Date,
    assigneeId?: string,
    orderInProject?: number
  ) => {
    try {
      const { userId, currentBoardId } = get() as any;
      if (!userId || !currentBoardId) {
        throw new Error("User not authenticated or no board selected");
      }

      const projects = (get() as any).projects;
      const currentProject = projects.find((p: any) => p._id === projectId);
      const currentTasks = currentProject?.tasks || [];

      let calculatedOrderInProject = orderInProject;
      if (calculatedOrderInProject === undefined) {
        calculatedOrderInProject = 0;
      }
      calculatedOrderInProject = currentTasks.length;

      const taskInput: CreateTaskInput = {
        title,
        description,
        status,
        project: projectId,
        board: currentBoardId,
        orderInProject: calculatedOrderInProject,
        ...(dueDate && { dueDate }),
        ...(assigneeId && { assignee: assigneeId })
      };

      await createTask(taskInput);

      const { fetchProjects } = get() as any;
      await fetchProjects(currentBoardId);
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    }
  },

  updateTask: async (
    taskId: string,
    title: string,
    status: TaskStatus = TaskStatus.TODO,
    description?: string,
    dueDate?: Date,
    assigneeId?: string,
    newProjectId?: string,
    orderInProject?: number
  ) => {
    try {
      const { userId, currentBoardId } = get() as any;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const updateData: UpdateTaskInput = {
        title,
        status,
        lastModifier: userId,
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(orderInProject !== undefined && { orderInProject }),
        ...(newProjectId && { projectId: newProjectId })
      };

      await taskApi.updateTask(taskId, updateData);

      if (currentBoardId) {
        const { fetchProjects } = get() as any;
        await fetchProjects(currentBoardId);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  removeTask: async (taskId: string) => {
    try {
      const { currentBoardId } = get() as any;

      set((state: any) => ({
        projects: state.projects.map((project: any) => ({
          ...project,
          tasks: project.tasks?.filter((task: Task) => task._id !== taskId) || []
        }))
      }));

      await taskApi.deleteTask(taskId);

      if (currentBoardId) {
        const { fetchProjects } = get() as any;
        await fetchProjects(currentBoardId);
      }
    } catch (error) {
      console.error("Error in removeTask:", error);
      const { currentBoardId } = get() as any;
      if (currentBoardId) {
        const { fetchProjects } = get() as any;
        fetchProjects(currentBoardId);
      }
      throw error;
    }
  },

  dragTaskOnProject: async (
    taskId: string,
    newProjectId: string,
    getTask: (taskId: string) => Promise<Task | undefined>
  ) => {
    try {
      const { currentBoardId } = get() as any;

      const taskToMove = await getTask(taskId);

      if (!taskToMove) {
        throw new Error("Task not found");
      }

      const { updateTask } = get() as any;
      await updateTask(
        taskId,
        taskToMove.title,
        taskToMove.status,
        taskToMove.description || undefined,
        taskToMove.dueDate ? new Date(taskToMove.dueDate) : undefined,
        taskToMove.assignee?._id || undefined,
        newProjectId
      );

      if (currentBoardId) {
        const { fetchProjects } = get() as any;
        await fetchProjects(currentBoardId);
      }
    } catch (error) {
      console.error("Error moving task to project:", error);
      throw error;
    }
  }
});
