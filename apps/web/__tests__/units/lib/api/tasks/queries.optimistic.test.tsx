import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { taskApi } from "@/lib/api/taskApi";
import { useDeleteTask, useUpdateTask } from "@/lib/api/tasks/queries";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { TaskStatus, type Task } from "@/types/dbInterface";
import { TASK_KEYS } from "@/types/taskApi";

vi.mock("@/lib/api/taskApi", () => ({
  taskApi: {
    getTasks: vi.fn(),
    getTaskById: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn()
  }
}));

vi.mock("@/stores/workspace-store", () => ({
  useWorkspaceStore: vi.fn()
}));

const makeTask = (overrides: Partial<Task>): Task => ({
  _id: "1",
  title: "Old Task",
  project: "project1",
  status: TaskStatus.TODO,
  creator: { _id: "user1", name: "User 1", email: "user1@example.com" },
  lastModifier: { _id: "user1", name: "User 1", email: "user1@example.com" },
  board: "board1",
  createdAt: new Date(),
  updatedAt: new Date(),
  orderInProject: 0,
  ...overrides
});

describe("task optimistic updates and rollback", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
    (useWorkspaceStore as unknown as Mock).mockReturnValue("user-123");
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe("useUpdateTask", () => {
    it("keeps existing assignee info when assigneeId is unchanged", async () => {
      const previous = makeTask({
        assignee: { _id: "user9", name: "Nine", email: "nine@example.com" }
      });
      queryClient.setQueryData<Task>(TASK_KEYS.detail("1"), previous);
      queryClient.setQueryData<Task[]>(TASK_KEYS.lists(), [previous]);
      (taskApi.updateTask as Mock).mockResolvedValue(makeTask({}));

      const { result } = renderHook(() => useUpdateTask(), { wrapper });
      await act(async () => {
        await result.current.mutateAsync({ id: "1", assigneeId: "user9" });
      });

      const cached = queryClient.getQueryData<Task>(TASK_KEYS.detail("1"));
      expect(cached?.assignee).toMatchObject({ _id: "user9", name: "Nine" });
    });

    it("uses placeholder assignee when assigneeId changes", async () => {
      const previous = makeTask({
        assignee: { _id: "user9", name: "Nine", email: "nine@example.com" }
      });
      queryClient.setQueryData<Task>(TASK_KEYS.detail("1"), previous);
      (taskApi.updateTask as Mock).mockResolvedValue(makeTask({}));

      const { result } = renderHook(() => useUpdateTask(), { wrapper });
      await act(async () => {
        await result.current.mutateAsync({ id: "1", assigneeId: "user5" });
      });

      const cached = queryClient.getQueryData<Task>(TASK_KEYS.detail("1"));
      expect(cached?.assignee).toMatchObject({ _id: "user5", name: "Loading..." });
    });

    it("optimistically updates title/description/status/dueDate in detail and lists", async () => {
      const previous = makeTask({});
      queryClient.setQueryData<Task>(TASK_KEYS.detail("1"), previous);
      queryClient.setQueryData<Task[]>(TASK_KEYS.lists(), [previous]);
      (taskApi.updateTask as Mock).mockResolvedValue(makeTask({}));

      const { result } = renderHook(() => useUpdateTask(), { wrapper });
      await act(async () => {
        await result.current.mutateAsync({
          id: "1",
          title: "Fresh",
          description: "desc",
          status: TaskStatus.IN_PROGRESS,
          dueDate: new Date("2030-01-01")
        });
      });

      const list = queryClient.getQueryData<Task[]>(TASK_KEYS.lists());
      expect(list?.[0]).toMatchObject({
        title: "Fresh",
        description: "desc",
        status: TaskStatus.IN_PROGRESS
      });
    });

    it("rolls back detail cache on error", async () => {
      const previous = makeTask({ title: "Original" });
      queryClient.setQueryData<Task>(TASK_KEYS.detail("1"), previous);
      (taskApi.updateTask as Mock).mockRejectedValue(new Error("boom"));

      const { result } = renderHook(() => useUpdateTask(), { wrapper });
      await act(async () => {
        await result.current.mutateAsync({ id: "1", title: "Changed" }).catch(() => {});
      });

      const cached = queryClient.getQueryData<Task>(TASK_KEYS.detail("1"));
      expect(cached?.title).toBe("Original");
    });
  });

  describe("useDeleteTask", () => {
    it("restores previous lists and task on error", async () => {
      const taskToDelete = makeTask({ _id: "2", title: "Doomed", orderInProject: 1 });
      const remaining = makeTask({ _id: "1", title: "Keep", orderInProject: 0 });
      queryClient.setQueryData<Task>(TASK_KEYS.detail("2"), taskToDelete);
      queryClient.setQueryData<Task[]>(TASK_KEYS.lists(), [remaining, taskToDelete]);
      (taskApi.deleteTask as Mock).mockRejectedValue(new Error("delete failed"));

      const { result } = renderHook(() => useDeleteTask(), { wrapper });
      await act(async () => {
        await result.current.mutateAsync("2").catch(() => {});
      });

      const list = queryClient.getQueryData<Task[]>(TASK_KEYS.lists());
      expect(list).toEqual([remaining, taskToDelete]);
      expect(queryClient.getQueryData<Task>(TASK_KEYS.detail("2"))).toEqual(taskToDelete);
    });
  });
});
