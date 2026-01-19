import type { Project } from "@/types/dbInterface";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { projectApi } from "@/lib/api/projectApi";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true
});

describe("projectApi", () => {
  const mockProject: Project = {
    _id: "project-1",
    title: "Test Project",
    description: "Test Description",
    board: "board-1",
    owner: "user-1",
    orderInBoard: 0,
    tasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe("getProjects", () => {
    it("should fetch projects for a board", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockProject]
      });

      const result = await projectApi.getProjects("board-1");

      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe("project-1");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/projects?boardId=board-1"),
        expect.any(Object)
      );
    });

    it("should include auth token when available", async () => {
      localStorageMock.getItem.mockReturnValueOnce("test-token");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      await projectApi.getProjects("board-1");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token"
          })
        })
      );
    });
  });

  describe("getProjectById", () => {
    it("should fetch a single project", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProject
      });

      const result = await projectApi.getProjectById("project-1");

      expect(result._id).toBe("project-1");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/projects/project-1"),
        expect.any(Object)
      );
    });

    it("should handle not found error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "Project not found"
      });

      await expect(projectApi.getProjectById("non-existent")).rejects.toThrow("Project not found");
    });
  });

  describe("createProject", () => {
    it("should create a new project", async () => {
      const input = {
        title: "New Project",
        description: "New Description",
        boardId: "board-1",
        owner: "user-1"
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProject
      });

      const result = await projectApi.createProject(input);

      expect(result._id).toBe("project-1");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/projects"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(input)
        })
      );
    });
  });

  describe("updateProject", () => {
    it("should update a project", async () => {
      const input = {
        title: "Updated Project"
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockProject, title: "Updated Project" })
      });

      const result = await projectApi.updateProject("project-1", input);

      expect(result.title).toBe("Updated Project");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/projects/project-1"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(input)
        })
      );
    });
  });

  describe("deleteProject", () => {
    it("should delete a project", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      await projectApi.deleteProject("project-1");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/projects/project-1"),
        expect.objectContaining({
          method: "DELETE"
        })
      );
    });
  });

  describe("error handling", () => {
    it("should handle fetch errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "Server error"
      });

      await expect(projectApi.getProjects("board-1")).rejects.toThrow("Server error");
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(projectApi.getProjects("board-1")).rejects.toThrow("Network error");
    });

    it("should handle text parsing failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => {
          throw new Error("Parse error");
        }
      });

      await expect(projectApi.getProjects("board-1")).rejects.toThrow("Request failed");
    });
  });
});
