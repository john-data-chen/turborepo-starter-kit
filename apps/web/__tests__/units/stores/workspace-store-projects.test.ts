import { beforeEach, describe, expect, it, vi } from "vitest";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { type Project } from "@/types/dbInterface";

// Mock the API modules
vi.mock("@/lib/api/projectApi", () => ({
  projectApi: {
    getProjects: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn()
  }
}));

describe("workspace-store - Project actions", () => {
  beforeEach(() => {
    // Reset the store before each test
    useWorkspaceStore.setState({
      userEmail: null,
      userId: null,
      projects: [],
      isLoadingProjects: false,
      currentBoardId: null,
      myBoards: [],
      teamBoards: [],
      filter: {
        status: null,
        search: ""
      }
    });
    vi.clearAllMocks();
  });

  describe("Project actions", () => {
    it("should fetch and set projects", async () => {
      const { projectApi } = await import("@/lib/api/projectApi");
      const mockProjects: Project[] = [
        {
          _id: "project-1",
          title: "Project 1",
          description: "Description 1",
          board: "board-1",
          owner: "user-1",
          orderInBoard: 0,
          tasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      vi.mocked(projectApi.getProjects).mockResolvedValue(mockProjects);

      const store = useWorkspaceStore.getState();
      await store.fetchProjects("board-1");

      const state = useWorkspaceStore.getState();
      expect(state.projects).toHaveLength(1);
      expect(state.projects[0]._id).toBe("project-1");
      expect(state.isLoadingProjects).toBe(false);
    });

    it("should handle fetch projects error", async () => {
      const { projectApi } = await import("@/lib/api/projectApi");
      vi.mocked(projectApi.getProjects).mockRejectedValue(new Error("Failed to fetch"));

      const store = useWorkspaceStore.getState();
      await store.fetchProjects("board-1");

      const state = useWorkspaceStore.getState();
      expect(state.projects).toEqual([]);
      expect(state.isLoadingProjects).toBe(false);
    });

    it("should not fetch projects if boardId is empty", async () => {
      const { projectApi } = await import("@/lib/api/projectApi");

      const store = useWorkspaceStore.getState();
      await store.fetchProjects("");

      expect(projectApi.getProjects).not.toHaveBeenCalled();
    });

    it("should add a new project", async () => {
      const mockProject: Project = {
        _id: "project-new",
        title: "New Project",
        description: "New Description",
        board: "board-1",
        owner: "user-1",
        orderInBoard: 0,
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const createProjectMock = vi.fn().mockResolvedValue(mockProject);

      useWorkspaceStore.setState({
        userId: "user-1",
        currentBoardId: "board-1",
        projects: []
      });

      const store = useWorkspaceStore.getState();
      const projectId = await store.addProject("New Project", "New Description", createProjectMock);

      expect(projectId).toBe("project-new");
      const state = useWorkspaceStore.getState();
      expect(state.projects).toHaveLength(1);
      expect(state.projects[0].title).toBe("New Project");
    });

    it("should throw error when adding project without board selected", async () => {
      const createProjectMock = vi.fn();

      useWorkspaceStore.setState({
        userId: "user-1",
        currentBoardId: null
      });

      const store = useWorkspaceStore.getState();

      await expect(
        store.addProject("New Project", "Description", createProjectMock)
      ).rejects.toThrow("No board selected");
    });

    it("should throw error when adding project without user authenticated", async () => {
      const createProjectMock = vi.fn();

      useWorkspaceStore.setState({
        userId: null,
        currentBoardId: "board-1"
      });

      const store = useWorkspaceStore.getState();

      await expect(
        store.addProject("New Project", "Description", createProjectMock)
      ).rejects.toThrow("User not authenticated");
    });

    it("should update a project", async () => {
      const mockProject: Project = {
        _id: "project-1",
        title: "Old Title",
        description: "Old Description",
        board: "board-1",
        owner: "user-1",
        orderInBoard: 0,
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      useWorkspaceStore.setState({
        userId: "user-1",
        projects: [mockProject]
      });

      const updateFn = vi.fn().mockResolvedValue({ ...mockProject, title: "New Title" });

      const store = useWorkspaceStore.getState();
      await store.updateProject("project-1", "New Title", "New Description", updateFn);

      const state = useWorkspaceStore.getState();
      expect(state.projects[0].title).toBe("New Title");
      expect(state.projects[0].description).toBe("New Description");
    });

    it("should throw error when updating project without user authenticated", async () => {
      const mockProject: Project = {
        _id: "project-1",
        title: "Old Title",
        description: "Old Description",
        board: "board-1",
        owner: "user-1",
        orderInBoard: 0,
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      useWorkspaceStore.setState({
        userId: null,
        projects: [mockProject]
      });

      const updateFn = vi.fn();
      const store = useWorkspaceStore.getState();

      await expect(
        store.updateProject("project-1", "New Title", "New Description", updateFn)
      ).rejects.toThrow("User not authenticated");
    });

    it("should throw error when project update fails", async () => {
      const mockProject: Project = {
        _id: "project-1",
        title: "Old Title",
        description: "Old Description",
        board: "board-1",
        owner: "user-1",
        orderInBoard: 0,
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      useWorkspaceStore.setState({
        userId: "user-1",
        projects: [mockProject]
      });

      const updateFn = vi.fn().mockRejectedValue(new Error("Update failed"));

      const store = useWorkspaceStore.getState();

      await expect(
        store.updateProject("project-1", "New Title", "New Description", updateFn)
      ).rejects.toThrow("Update failed");
    });

    it("should remove a project", async () => {
      const mockProject: Project = {
        _id: "project-1",
        title: "Project 1",
        description: "Description 1",
        board: "board-1",
        owner: "user-1",
        orderInBoard: 0,
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      useWorkspaceStore.setState({
        projects: [mockProject]
      });

      const deleteFn = vi.fn().mockResolvedValue(undefined);

      const store = useWorkspaceStore.getState();
      await store.removeProject("project-1", deleteFn);

      const state = useWorkspaceStore.getState();
      expect(state.projects).toHaveLength(0);
    });

    it("should set projects directly", () => {
      const mockProjects: Project[] = [
        {
          _id: "project-1",
          title: "Project 1",
          description: "Description 1",
          board: "board-1",
          owner: "user-1",
          orderInBoard: 0,
          tasks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      const store = useWorkspaceStore.getState();
      store.setProjects(mockProjects);

      const state = useWorkspaceStore.getState();
      expect(state.projects).toEqual(mockProjects);
    });
  });
});
