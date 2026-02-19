import type { Project } from "@repo/store";
import type { StateCreator } from "zustand";

import { projectApi } from "@/lib/api/projectApi";

export interface ProjectSlice {
  projects: Project[];
  isLoadingProjects: boolean;
  setProjects: (projects: Project[]) => void;
  fetchProjects: (boardId: string) => Promise<void>;
  fetchTasksByProject: (projectId: string) => Promise<any[]>;
  addProject: (
    title: string,
    description: string,
    createProject: (project: {
      title: string;
      description: string;
      boardId: string;
      owner: string;
      orderInBoard?: number;
    }) => Promise<Project>
  ) => Promise<string>;
  updateProject: (
    id: string,
    newTitle: string,
    newDescription: string | undefined,
    updateFn: (id: string, data: { title: string; description?: string }) => Promise<Project>
  ) => Promise<void>;
  removeProject: (id: string, deleteFn: (id: string) => Promise<void>) => Promise<void>;
}

export const createProjectSlice: StateCreator<
  ProjectSlice & { userId: string | null; currentBoardId: string | null },
  [],
  [],
  ProjectSlice
> = (set, get) => ({
  projects: [],
  isLoadingProjects: false,

  setProjects: (projects: Project[]) => {
    set({ projects });
  },

  fetchProjects: async (boardId: string) => {
    if (!boardId) {
      return;
    }

    set({ isLoadingProjects: true });

    try {
      const projects = await projectApi.getProjects(boardId);

      if (projects) {
        set({
          projects: projects.map((project) => ({
            ...project,
            tasks: []
          }))
        });
      } else {
        set({ projects: [] });
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      set({ projects: [] });
    } finally {
      set({ isLoadingProjects: false });
    }
  },

  fetchTasksByProject: async (projectId: string) => {
    if (!projectId) {
      return [];
    }

    try {
      const { taskApi } = await import("@/lib/api/taskApi");
      const tasks = await taskApi.getTasks(projectId);

      if (!Array.isArray(tasks)) {
        return [];
      }

      set((state) => {
        const updatedProjects = state.projects.map((project) =>
          project._id === projectId ? { ...project, tasks } : project
        );
        return { projects: updatedProjects };
      });

      return tasks;
    } catch (error) {
      console.error("Error fetching tasks for project:", error);
      return [];
    }
  },

  addProject: async (
    title: string,
    description: string,
    createProject: (project: {
      title: string;
      description: string;
      boardId: string;
      owner: string;
      orderInBoard?: number;
    }) => Promise<Project>
  ) => {
    try {
      const { currentBoardId, userId, projects } = get() as any;
      if (!currentBoardId) {
        throw new Error("No board selected");
      }
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const currentBoardProjects = projects.filter((p: Project) => {
        const projectBoardId = typeof p.board === "string" ? p.board : p.board?._id;
        return projectBoardId === currentBoardId;
      });

      const maxOrder =
        currentBoardProjects.length > 0
          ? Math.max(...currentBoardProjects.map((p: Project) => p.orderInBoard ?? 0), -1)
          : -1;

      const orderInBoard = maxOrder + 1;

      const newProject = await createProject({
        title,
        description,
        boardId: currentBoardId,
        owner: userId,
        orderInBoard
      });

      if (newProject) {
        set((state) => ({
          projects: [...state.projects, newProject]
        }));
        return newProject._id;
      }

      throw new Error("Failed to create project");
    } catch (error) {
      console.error("Error in addProject:", error);
      throw error;
    }
  },

  updateProject: async (
    id: string,
    newTitle: string,
    newDescription: string | undefined,
    updateFn: (id: string, data: { title: string; description?: string }) => Promise<Project>
  ) => {
    try {
      set((state) => ({
        projects: state.projects.map((project) =>
          project._id === id
            ? {
                ...project,
                title: newTitle,
                description: newDescription ?? project.description ?? null,
                updatedAt: new Date().toISOString()
              }
            : project
        )
      }));

      const userId = (get() as any).userId;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const updateData = {
        title: newTitle,
        description: newDescription ?? ""
      };

      await updateFn(id, updateData);
    } catch (error) {
      console.error("Error updating project:", error);
      set((state) => ({
        projects: state.projects.map((project) => (project._id === id ? project : project))
      }));
      throw error;
    }
  },

  removeProject: async (id: string, deleteFn: (id: string) => Promise<void>) => {
    try {
      await deleteFn(id);

      set((state) => ({
        projects: state.projects.filter((project) => project._id !== id)
      }));
    } catch (error) {
      console.error("Error removing project:", error);
      throw error;
    }
  }
});
