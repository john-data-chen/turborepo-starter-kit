import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import React, { useState } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  PROJECT_KEYS,
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject
} from "@/hooks/use-projects";
import { projectApi } from "@/lib/api/project-api";

import { Wrapper } from "./test-utils";

vi.mock("@/lib/api/project-api", () => ({
  projectApi: {
    getProjects: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn()
  }
}));

describe("useProjects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch projects by boardId", async () => {
    const mockProjects = [{ _id: "p1", title: "Project 1", board: "b1" }];
    vi.mocked(projectApi.getProjects).mockResolvedValue(mockProjects as any);

    const { result } = renderHook(() => useProjects("b1"), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProjects);
    expect(projectApi.getProjects).toHaveBeenCalledWith("b1");
  });

  it("should poll every 5 seconds", async () => {
    const mockProjects = [{ _id: "p1", title: "Project 1", board: "b1" }];
    vi.mocked(projectApi.getProjects).mockResolvedValue(mockProjects as any);

    let capturedClient: QueryClient | undefined;
    const CapturingWrapper = ({ children }: { children: React.ReactNode }) => {
      const [client] = useState(() => {
        const c = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        capturedClient = c;
        return c;
      });
      return React.createElement(QueryClientProvider, { client }, children);
    };

    const { result } = renderHook(() => useProjects("b1"), { wrapper: CapturingWrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const query = capturedClient?.getQueryCache().find({ queryKey: PROJECT_KEYS.list("b1") });
    expect(query?.options.refetchInterval).toBe(5000);
  });

  it("should not fetch when boardId is undefined", () => {
    const { result } = renderHook(() => useProjects(undefined), { wrapper: Wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(projectApi.getProjects).not.toHaveBeenCalled();
  });
});

describe("useCreateProject", () => {
  it("should create project and invalidate with string board id", async () => {
    const newProject = { _id: "p2", title: "New", board: "b1" };
    vi.mocked(projectApi.createProject).mockResolvedValue(newProject as any);

    const { result } = renderHook(() => useCreateProject(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ title: "New", boardId: "b1" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(projectApi.createProject).toHaveBeenCalled();
  });

  it("should handle project with object board reference", async () => {
    const newProject = { _id: "p3", title: "New", board: { _id: "b2", title: "Board" } };
    vi.mocked(projectApi.createProject).mockResolvedValue(newProject as any);

    const { result } = renderHook(() => useCreateProject(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ title: "New", boardId: "b2" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe("useUpdateProject", () => {
  it("should update project with string board", async () => {
    const updated = { _id: "p1", title: "Updated", board: "b1" };
    vi.mocked(projectApi.updateProject).mockResolvedValue(updated as any);

    const { result } = renderHook(() => useUpdateProject(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: "p1", title: "Updated" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(projectApi.updateProject).toHaveBeenCalledWith("p1", { title: "Updated" });
  });

  it("should update project with object board", async () => {
    const updated = { _id: "p1", title: "Updated", board: { _id: "b1", title: "B" } };
    vi.mocked(projectApi.updateProject).mockResolvedValue(updated as any);

    const { result } = renderHook(() => useUpdateProject(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: "p1", title: "Updated" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe("useDeleteProject", () => {
  it("should delete project with boardId", async () => {
    vi.mocked(projectApi.deleteProject).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteProject(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: "p1", boardId: "b1" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(projectApi.deleteProject).toHaveBeenCalledWith("p1");
  });

  it("should delete project without boardId", async () => {
    vi.mocked(projectApi.deleteProject).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteProject(), { wrapper: Wrapper });

    await act(async () => {
      result.current.mutate({ id: "p2" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
