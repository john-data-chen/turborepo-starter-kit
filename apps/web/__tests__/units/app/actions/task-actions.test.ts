import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { createTask, deleteTask, getTasks, moveTask, updateTask } from "@/app/actions/task-actions";

const getMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => getMock(name)
  }))
}));

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function mockFetch(ok: boolean, body: unknown = {}) {
  const json = vi.fn().mockResolvedValue(body);
  (global.fetch as Mock).mockResolvedValue({ ok, json });
  return { json };
}

describe("task-actions", () => {
  beforeEach(() => {
    global.fetch = vi.fn() as unknown as typeof fetch;
    getMock.mockReturnValue({ value: "test-token" });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("auth headers", () => {
    it("includes Authorization header when jwt cookie present", async () => {
      mockFetch(true, { id: "1" });
      await createTask({ title: "x" });

      const [, init] = (global.fetch as Mock).mock.calls[0];
      expect(init.headers).toMatchObject({
        "Content-Type": "application/json",
        Authorization: "Bearer test-token"
      });
    });

    it("omits Authorization header when jwt cookie missing", async () => {
      getMock.mockReturnValue(undefined);
      mockFetch(true, { id: "1" });
      await createTask({ title: "x" });

      const [, init] = (global.fetch as Mock).mock.calls[0];
      expect(init.headers).not.toHaveProperty("Authorization");
    });
  });

  describe("createTask", () => {
    it("POSTs to /tasks and returns json on success", async () => {
      mockFetch(true, { id: "t1" });
      const res = await createTask({ title: "Task" });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/tasks`,
        expect.objectContaining({ method: "POST", body: JSON.stringify({ title: "Task" }) })
      );
      expect(res).toEqual({ id: "t1" });
    });

    it("throws on failure", async () => {
      mockFetch(false);
      await expect(createTask({ title: "Task" })).rejects.toThrow("Failed to create task");
    });
  });

  describe("updateTask", () => {
    it("PATCHes to /tasks/:id and returns json", async () => {
      mockFetch(true, { id: "t1", title: "new" });
      const res = await updateTask("t1", { title: "new" });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/tasks/t1`,
        expect.objectContaining({ method: "PATCH" })
      );
      expect(res).toEqual({ id: "t1", title: "new" });
    });

    it("throws on failure", async () => {
      mockFetch(false);
      await expect(updateTask("t1", {})).rejects.toThrow("Failed to update task");
    });
  });

  describe("deleteTask", () => {
    it("DELETEs to /tasks/:id", async () => {
      mockFetch(true);
      await deleteTask("t1");

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/tasks/t1`,
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("throws on failure", async () => {
      mockFetch(false);
      await expect(deleteTask("t1")).rejects.toThrow("Failed to delete task");
    });
  });

  describe("moveTask", () => {
    it("PATCHes to /tasks/:id/move with body and returns json", async () => {
      mockFetch(true, { ok: true });
      const res = await moveTask("t1", "p1", 2);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/tasks/t1/move`,
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ projectId: "p1", orderInProject: 2 })
        })
      );
      expect(res).toEqual({ ok: true });
    });

    it("throws on failure", async () => {
      mockFetch(false);
      await expect(moveTask("t1", "p1", 0)).rejects.toThrow("Failed to move task");
    });
  });

  describe("getTasks", () => {
    it("fetches without query when no params", async () => {
      mockFetch(true, []);
      await getTasks();
      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/tasks`, expect.any(Object));
    });

    it("appends projectId and assigneeId query params", async () => {
      mockFetch(true, []);
      await getTasks("p1", "u1");
      const [url] = (global.fetch as Mock).mock.calls[0];
      expect(url).toBe(`${API_URL}/tasks?projectId=p1&assigneeId=u1`);
    });

    it("appends only projectId when assigneeId missing", async () => {
      mockFetch(true, []);
      await getTasks("p1");
      const [url] = (global.fetch as Mock).mock.calls[0];
      expect(url).toBe(`${API_URL}/tasks?projectId=p1`);
    });

    it("throws on failure", async () => {
      mockFetch(false);
      await expect(getTasks()).rejects.toThrow("Failed to fetch tasks");
    });
  });
});
