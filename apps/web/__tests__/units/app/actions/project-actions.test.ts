import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import {
  createProject,
  deleteProject,
  getProjects,
  updateProject
} from "@/app/actions/project-actions";

const getMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: (name: string) => getMock(name)
  }))
}));

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function mockFetch(ok: boolean, body: unknown = {}) {
  (global.fetch as Mock).mockResolvedValue({ ok, json: vi.fn().mockResolvedValue(body) });
}

describe("project-actions", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    getMock.mockReturnValue({ value: "test-token" });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createProject", () => {
    it("POSTs to /projects and returns json", async () => {
      mockFetch(true, { id: "p1" });
      const res = await createProject({ title: "Proj", boardId: "b1", owner: "u1" });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/projects`,
        expect.objectContaining({ method: "POST" })
      );
      const [, init] = (global.fetch as Mock).mock.calls[0];
      expect(init.headers).toMatchObject({ Authorization: "Bearer test-token" });
      expect(res).toEqual({ id: "p1" });
    });

    it("omits Authorization when no token", async () => {
      getMock.mockReturnValue(undefined);
      mockFetch(true, { id: "p1" });
      await createProject({ title: "Proj", boardId: "b1", owner: "u1" });
      const [, init] = (global.fetch as Mock).mock.calls[0];
      expect(init.headers).not.toHaveProperty("Authorization");
    });

    it("throws on failure", async () => {
      mockFetch(false);
      await expect(createProject({ title: "Proj", boardId: "b1", owner: "u1" })).rejects.toThrow(
        "Failed to create project"
      );
    });
  });

  describe("updateProject", () => {
    it("PATCHes to /projects/:id and returns json", async () => {
      mockFetch(true, { id: "p1", title: "new" });
      const res = await updateProject("p1", { title: "new" });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/projects/p1`,
        expect.objectContaining({ method: "PATCH" })
      );
      expect(res).toEqual({ id: "p1", title: "new" });
    });

    it("throws on failure", async () => {
      mockFetch(false);
      await expect(updateProject("p1", {})).rejects.toThrow("Failed to update project");
    });
  });

  describe("deleteProject", () => {
    it("DELETEs to /projects/:id", async () => {
      mockFetch(true);
      await deleteProject("p1");

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/projects/p1`,
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("throws on failure", async () => {
      mockFetch(false);
      await expect(deleteProject("p1")).rejects.toThrow("Failed to delete project");
    });
  });

  describe("getProjects", () => {
    it("fetches /projects with boardId query and returns json", async () => {
      mockFetch(true, [{ id: "p1" }]);
      const res = await getProjects("b1");

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/projects?boardId=b1`,
        expect.any(Object)
      );
      expect(res).toEqual([{ id: "p1" }]);
    });

    it("throws on failure", async () => {
      mockFetch(false);
      await expect(getProjects("b1")).rejects.toThrow("Failed to fetch projects");
    });
  });
});
