import { describe, it, expect, vi, beforeEach } from "vitest";

import { fetchWithAuth } from "@/lib/api/fetch-with-auth";
import { taskApi } from "@/lib/api/task-api";

vi.mock("@/lib/api/fetch-with-auth", () => ({
  fetchWithAuth: vi.fn()
}));

describe("taskApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get tasks with project id", async () => {
    await taskApi.getTasks("p1");
    expect(fetchWithAuth).toHaveBeenCalledWith(expect.stringContaining("projectId=p1"));
  });

  it("should get tasks with assignee id", async () => {
    await taskApi.getTasks(undefined, "u1");
    expect(fetchWithAuth).toHaveBeenCalledWith(expect.stringContaining("assigneeId=u1"));
  });

  it("should get task by id", async () => {
    await taskApi.getTaskById("t1");
    expect(fetchWithAuth).toHaveBeenCalledWith(expect.stringContaining("/tasks/t1"));
  });

  it("should create task", async () => {
    await taskApi.createTask({ title: "T", projectId: "p1" } as any);
    expect(fetchWithAuth).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("should update task", async () => {
    await taskApi.updateTask("t1", { title: "U", lastModifier: "user1" });
    expect(fetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining("/tasks/t1"),
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("should delete task", async () => {
    await taskApi.deleteTask("t1");
    expect(fetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining("/tasks/t1"),
      expect.objectContaining({ method: "DELETE" }),
      true
    );
  });

  it("should get task permissions", async () => {
    await taskApi.getTaskPermissions("t1");
    expect(fetchWithAuth).toHaveBeenCalledWith(expect.stringContaining("/tasks/t1/permissions"));
  });

  it("should move task", async () => {
    await taskApi.moveTask("t1", "p2", 5);
    expect(fetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining("/tasks/t1/move"),
      expect.objectContaining({ method: "PATCH" })
    );
  });
});
