import { CreateTaskInput, Task, TaskStatus } from "@repo/store";
import type { UpdateTaskInput } from "@repo/store";
import type { StateCreator } from "zustand";

import { taskApi } from "@/lib/api/taskApi";

import type { BoardSliceState, ProjectSliceState, TaskSliceState, UserSliceState } from "./types";

export const createTaskSlice: StateCreator<
  TaskSliceState & UserSliceState & BoardSliceState & ProjectSliceState,
  [],
  [],
  TaskSliceState
> = (set, get) => ({
  addTask: async (
    projectId: string,
    title: string,
    status: TaskStatus,
    createTask: (task: CreateTaskInput) => Promise<Task>,
    description?: string,
    dueDate?: Date,
    assigneeId?: string,
    _orderInProject?: number
  ) => {
    try {
      const { userId, currentBoardId, projects, fetchProjects } = get();
      if (!userId || !currentBoardId) {
        throw new Error("User not authenticated or no board selected");
      }

      const currentProject = projects.find((p) => p._id === projectId);
      const currentTasks = currentProject?.tasks || [];
      const calculatedOrderInProject = _orderInProject ?? currentTasks.length;

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

      await fetchProjects(currentBoardId);
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    }
  },

  updateTask: async (
    taskId: string,
    title: string,
    status: TaskStatus,
    description?: string,
    dueDate?: Date,
    assigneeId?: string,
    newProjectId?: string,
    orderInProject?: number
  ) => {
    try {
      const { userId, currentBoardId, fetchProjects } = get();
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
        await fetchProjects(currentBoardId);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  removeTask: async (taskId: string) => {
    try {
      const { currentBoardId, fetchProjects } = get();

      set((state) => ({
        projects: state.projects.map((project) => ({
          ...project,
          tasks: project.tasks?.filter((task) => task._id !== taskId) || []
        }))
      }));

      await taskApi.deleteTask(taskId);

      if (currentBoardId) {
        await fetchProjects(currentBoardId);
      }
    } catch (error) {
      console.error("Error in removeTask:", error);
      throw error;
    }
  },

  dragTaskOnProject: async (
    taskId: string,
    newProjectId: string,
    getTask: (taskId: string) => Promise<Task | undefined>
  ) => {
    try {
      const { currentBoardId, fetchProjects, updateTask } = get();

      const taskToMove = await getTask(taskId);

      if (!taskToMove) {
        throw new Error("Task not found");
      }

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
        await fetchProjects(currentBoardId);
      }
    } catch (error) {
      console.error("Error moving task to project:", error);
      throw error;
    }
  }
});
