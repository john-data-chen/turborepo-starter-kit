import { describe, it, expect, vi, beforeEach } from "vitest";

import { fetchWithAuth } from "@/lib/api/fetch-with-auth";
import { projectApi } from "@/lib/api/project-api";

vi.mock("@/lib/api/fetch-with-auth", () => ({
  fetchWithAuth: vi.fn()
}));

describe("projectApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get projects", async () => {
    await projectApi.getProjects("b1");
    expect(fetchWithAuth).toHaveBeenCalledWith(expect.stringContaining("boardId=b1"));
  });

  it("should create project", async () => {
    await projectApi.createProject({ title: "P", boardId: "b1" });
    expect(fetchWithAuth).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("should update project", async () => {
    await projectApi.updateProject("p1", { title: "U" });
    expect(fetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining("/projects/p1"),
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("should delete project", async () => {
    await projectApi.deleteProject("p1");
    expect(fetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining("/projects/p1"),
      expect.objectContaining({ method: "DELETE" }),
      true
    );
  });
});
