import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import React, { useState } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  TASK_KEYS,
  useTasks,
  useTask,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useMoveTask
} from "@/hooks/use-tasks";
import { taskApi } from "@/lib/api/task-api";

import { Wrapper } from "./test-utils";

vi.mock("@/lib/api/task-api", () => ({
  taskApi: {
    getTasks: vi.fn(),
    getTaskById: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    moveTask: vi.fn()
  }
}));

vi.mock("@/stores/auth", () => ({
  useAuthStore: Object.assign(
    vi.fn(() => ({ user: { _id: "u1", email: "t@e.com", name: "Test" } })),
    {
      getState: () => ({ user: { _id: "u1", email: "t@e.com", name: "Test" } })
    }
  )
}));

describe("useTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch tasks by projectId", async () => {
    const mockTasks = [{ _id: "t1", title: "Task 1", project: "p1" }];
    vi.mocked(taskApi.getTasks).mockResolvedValue(mockTasks as any);

    const { result } = renderHook(() => useTasks("p1"), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockTasks);
    expect(taskApi.getTasks).toHaveBeenCalledWith("p1", undefined);
  });

  it("should poll every 5 seconds", async () => {
    const mockTasks = [{ _id: "t1", title: "Task 1", project: "p1" }];
    vi.mocked(taskApi.getTasks).mockResolvedValue(mockTasks as any);

    let capturedClient: QueryClient | undefined;
    const CapturingWrapper = ({ children }: { children: React.ReactNode }) => {
      const [client] = useState(() => {
        const c = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        capturedClient = c;
        return c;
      });
      return React.createElement(QueryClientProvider, { client }, children);
    };

    const { result } = renderHook(() => useTasks("p1"), { wrapper: CapturingWrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const query = capturedClient
      ?.getQueryCache()
      .find({ queryKey: TASK_KEYS.list({ project: "p1" }) });
    expect((query!.options as { refetchInterval?: number }).refetchInterval).toBe(5000);
  });

  it("should fetch tasks by assigneeId", async () => {
    vi.mocked(taskApi.getTasks).mockResolvedValue([]);

    const { result } = renderHook(() => useTasks(undefined, "u1"), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(taskApi.getTasks).toHaveBeenCalledWith(undefined, "u1");
  });

  it("should not fetch when no projectId or assigneeId", () => {
    const { result } = renderHook(() => useTasks(), { wrapper: Wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(taskApi.getTasks).not.toHaveBeenCalled();
  });
});

describe("useTask", () => {
  it("should fetch a single task", async () => {
    const mockTask = { _id: "t1", title: "Task 1" };
    vi.mocked(taskApi.getTaskById).mockResolvedValue(mockTask as any);

    const { result } = renderHook(() => useTask("t1"), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockTask);
  });

  it("should poll every 5 seconds", async () => {
    const mockTask = { _id: "t1", title: "Task 1" };
    vi.mocked(taskApi.getTaskById).mockResolvedValue(mockTask as any);

    let capturedClient: QueryClient | undefined;
    const CapturingWrapper = ({ children }: { children: React.ReactNode }) => {
      const [client] = useState(() => {
        const c = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        capturedClient = c;
        return c;
      });
      return React.createElement(QueryClientProvider, { client }, children);
    };

    const { result } = renderHook(() => useTask("t1"), { wrapper: CapturingWrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const query = capturedClient?.getQueryCache().find({ queryKey: TASK_KEYS.detail("t1") });
    expect((query!.options as { refetchInterval?: number }).refetchInterval).toBe(5000);
  });

  it("should not fetch when taskId is undefined", () => {
    const { result } = renderHook(() => useTask(undefined), { wrapper: Wrapper });

    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateTask", () => {
  it("should create task and invalidate queries", async () => {
    const newTask = { _id: "t2", title: "New", project: "p1", assignee: null };
    vi.mocked(taskApi.createTask).mockResolvedValue(newTask as any);

    const { result } = renderHook(() => useCreateTask(), { wrapper: Wrapper });

    // oxlint-disable-next-line typescript/require-await -- act() requires an async callback to await the mutation's microtask flush
    await act(async () => {
      result.current.mutate({ title: "New", projectId: "p1" } as any);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(taskApi.createTask).toHaveBeenCalled();
  });

  it("should handle task with string assignee", async () => {
    const newTask = { _id: "t3", title: "New", project: "p1", assignee: "u1" };
    vi.mocked(taskApi.createTask).mockResolvedValue(newTask as any);

    const { result } = renderHook(() => useCreateTask(), { wrapper: Wrapper });

    // oxlint-disable-next-line typescript/require-await -- act() requires an async callback to await the mutation's microtask flush
    await act(async () => {
      result.current.mutate({ title: "New", projectId: "p1" } as any);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("should handle task with object assignee", async () => {
    const newTask = {
      _id: "t4",
      title: "New",
      project: "p1",
      assignee: { _id: "u1", name: "Test" }
    };
    vi.mocked(taskApi.createTask).mockResolvedValue(newTask as any);

    const { result } = renderHook(() => useCreateTask(), { wrapper: Wrapper });

    // oxlint-disable-next-line typescript/require-await -- act() requires an async callback to await the mutation's microtask flush
    await act(async () => {
      result.current.mutate({ title: "New", projectId: "p1" } as any);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe("useUpdateTask", () => {
  it("should inject lastModifier from auth store", async () => {
    const updated = { _id: "t1", title: "Updated", project: "p1" };
    vi.mocked(taskApi.updateTask).mockResolvedValue(updated as any);

    const { result } = renderHook(() => useUpdateTask(), { wrapper: Wrapper });

    // oxlint-disable-next-line typescript/require-await -- act() requires an async callback to await the mutation's microtask flush
    await act(async () => {
      result.current.mutate({ id: "t1", title: "Updated" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(taskApi.updateTask).toHaveBeenCalledWith("t1", {
      title: "Updated",
      lastModifier: "u1"
    });
  });
});

describe("useDeleteTask", () => {
  it("should delete task", async () => {
    vi.mocked(taskApi.deleteTask).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteTask(), { wrapper: Wrapper });

    // oxlint-disable-next-line typescript/require-await -- act() requires an async callback to await the mutation's microtask flush
    await act(async () => {
      result.current.mutate("t1");
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(taskApi.deleteTask).toHaveBeenCalledWith("t1", expect.anything());
  });
});

describe("useMoveTask", () => {
  it("should move task to another project", async () => {
    const moved = { _id: "t1", project: "p2" };
    vi.mocked(taskApi.moveTask).mockResolvedValue(moved as any);

    const { result } = renderHook(() => useMoveTask(), { wrapper: Wrapper });

    // oxlint-disable-next-line typescript/require-await -- act() requires an async callback to await the mutation's microtask flush
    await act(async () => {
      result.current.mutate({ taskId: "t1", projectId: "p2", orderInProject: 0 });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(taskApi.moveTask).toHaveBeenCalledWith("t1", "p2", 0);
  });
});
