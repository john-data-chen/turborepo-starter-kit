import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { projectApi } from "@/lib/api/projectApi";
import {
  useCreateProject,
  useDeleteProject,
  useProject,
  useProjects,
  useUpdateProject
} from "@/lib/api/projects/queries";
import { PROJECT_KEYS } from "@/types/projectApi";

// Mock projectApi
vi.mock("@/lib/api/projectApi", () => ({
  projectApi: {
    getProjects: vi.fn(),
    getProjectById: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn()
  }
}));

describe("Project Query Hooks", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe("useProjects", () => {
    it("should fetch projects with string boardId", async () => {
      const mockProjects = [
        { _id: "1", title: "Project 1", board: "board1" },
        { _id: "2", title: "Project 2", board: "board1" }
      ];
      (projectApi.getProjects as Mock).mockResolvedValue(mockProjects);

      const { result } = renderHook(() => useProjects("board1"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProjects);
      expect(projectApi.getProjects).toHaveBeenCalledWith("board1");
    });

    it("should fetch projects with object boardId", async () => {
      const mockProjects = [{ _id: "1", title: "Project 1", board: "board1" }];
      (projectApi.getProjects as Mock).mockResolvedValue(mockProjects);

      const { result } = renderHook(() => useProjects({ _id: "board1", title: "Board 1" }), {
        wrapper
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProjects);
      expect(projectApi.getProjects).toHaveBeenCalledWith("board1");
    });

    it("should not fetch when boardId is undefined", () => {
      const { result } = renderHook(() => useProjects(undefined), { wrapper });

      expect(result.current.data).toBeUndefined();
      expect(projectApi.getProjects).not.toHaveBeenCalled();
    });

    it("should handle fetch error", async () => {
      const mockError = new Error("Board ID is required");
      (projectApi.getProjects as Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useProjects("board1"), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe("useProject", () => {
    it("should fetch single project with string id", async () => {
      const mockProject = { _id: "1", title: "Project 1", board: "board1" };
      (projectApi.getProjectById as Mock).mockResolvedValue(mockProject);

      const { result } = renderHook(() => useProject("1"), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProject);
      expect(projectApi.getProjectById).toHaveBeenCalledWith("1");
    });

    it("should fetch single project with object id", async () => {
      const mockProject = { _id: "1", title: "Project 1", board: "board1" };
      (projectApi.getProjectById as Mock).mockResolvedValue(mockProject);

      const { result } = renderHook(() => useProject({ _id: "1" }), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProject);
      expect(projectApi.getProjectById).toHaveBeenCalledWith("1");
    });

    it("should not fetch when id is undefined", () => {
      const { result } = renderHook(() => useProject(undefined), { wrapper });

      expect(result.current.data).toBeUndefined();
      expect(projectApi.getProjectById).not.toHaveBeenCalled();
    });
  });

  describe("useCreateProject", () => {
    it("should create project and invalidate board queries", async () => {
      const newProject = { _id: "3", title: "New Project", board: "board1" };
      (projectApi.createProject as Mock).mockResolvedValue(newProject);

      const { result } = renderHook(() => useCreateProject(), { wrapper });

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      await act(async () => {
        await result.current.mutateAsync({ title: "New Project", board: "board1" });
      });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: PROJECT_KEYS.list("board1")
        });
      });

      const callArgs = (projectApi.createProject as Mock).mock.calls[0];
      expect(callArgs[0]).toEqual({ title: "New Project", board: "board1" });
    });

    it("should handle board as object in created project", async () => {
      const newProject = { _id: "3", title: "New Project", board: { _id: "board1" } };
      (projectApi.createProject as Mock).mockResolvedValue(newProject);

      const { result } = renderHook(() => useCreateProject(), { wrapper });

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      await act(async () => {
        await result.current.mutateAsync({ title: "New Project", board: "board1" });
      });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: PROJECT_KEYS.list("board1")
        });
      });
    });
  });

  describe("useUpdateProject", () => {
    it("should update project with title only", async () => {
      const updatedProject = { _id: "1", title: "Updated Project", board: "board1" };
      (projectApi.updateProject as Mock).mockResolvedValue(updatedProject);

      const { result } = renderHook(() => useUpdateProject(), { wrapper });

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      await act(async () => {
        await result.current.mutateAsync({ id: "1", title: "Updated Project" });
      });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: PROJECT_KEYS.list("board1")
        });
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: PROJECT_KEYS.detail("1")
        });
      });

      expect(projectApi.updateProject).toHaveBeenCalledWith("1", {
        title: "Updated Project",
        description: null
      });
    });

    it("should update project with title and description", async () => {
      const updatedProject = {
        _id: "1",
        title: "Updated Project",
        description: "New description",
        board: "board1"
      };
      (projectApi.updateProject as Mock).mockResolvedValue(updatedProject);

      const { result } = renderHook(() => useUpdateProject(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          id: "1",
          title: "Updated Project",
          description: "New description"
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(projectApi.updateProject).toHaveBeenCalledWith("1", {
        title: "Updated Project",
        description: "New description"
      });
    });

    it("should handle board as object in updated project", async () => {
      const updatedProject = { _id: "1", title: "Updated Project", board: { _id: "board1" } };
      (projectApi.updateProject as Mock).mockResolvedValue(updatedProject);

      const { result } = renderHook(() => useUpdateProject(), { wrapper });

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      await act(async () => {
        await result.current.mutateAsync({ id: "1", title: "Updated Project" });
      });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: PROJECT_KEYS.list("board1")
        });
      });
    });
  });

  describe("useDeleteProject", () => {
    it("should delete project and remove from cache", async () => {
      (projectApi.deleteProject as Mock).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useDeleteProject(), { wrapper });

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const removeSpy = vi.spyOn(queryClient, "removeQueries");

      await act(async () => {
        await result.current.mutateAsync("1");
      });

      await waitFor(() => {
        expect(removeSpy).toHaveBeenCalledWith({
          queryKey: PROJECT_KEYS.detail("1")
        });
      });

      // deleteProject is called with (projectId, mutationContext)
      // We only care about the first argument
      expect(projectApi.deleteProject).toHaveBeenCalled();
      expect(projectApi.deleteProject).toHaveBeenCalledTimes(1);
      const callArgs = (projectApi.deleteProject as Mock).mock.calls[0];
      expect(callArgs[0]).toBe("1");
    });

    it("should not invalidate list if no boardId in context", async () => {
      (projectApi.deleteProject as Mock).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useDeleteProject(), { wrapper });

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      await act(async () => {
        await result.current.mutateAsync("1");
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Should not invalidate project list without boardId
      expect(invalidateSpy).not.toHaveBeenCalledWith({
        queryKey: PROJECT_KEYS.list(expect.anything())
      });
    });
  });
});
