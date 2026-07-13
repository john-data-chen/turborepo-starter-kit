import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { createBoard, deleteBoard, updateBoard } from "@/app/actions/board-actions";

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

describe("board-actions", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    getMock.mockReturnValue({ value: "test-token" });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createBoard", () => {
    it("POSTs to /boards with auth header and returns json", async () => {
      mockFetch(true, { id: "b1" });
      const res = await createBoard({ title: "Board", owner: "u1" });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/boards`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ title: "Board", owner: "u1" })
        })
      );
      const [, init] = (global.fetch as Mock).mock.calls[0];
      expect(init.headers).toMatchObject({ Authorization: "Bearer test-token" });
      expect(res).toEqual({ id: "b1" });
    });

    it("omits Authorization when no token", async () => {
      getMock.mockReturnValue(undefined);
      mockFetch(true, { id: "b1" });
      await createBoard({ title: "Board", owner: "u1" });
      const [, init] = (global.fetch as Mock).mock.calls[0];
      expect(init.headers).not.toHaveProperty("Authorization");
    });

    it("throws on failure", async () => {
      mockFetch(false);
      await expect(createBoard({ title: "Board", owner: "u1" })).rejects.toThrow(
        "Failed to create board"
      );
    });
  });

  describe("updateBoard", () => {
    it("PATCHes to /boards/:id and returns json", async () => {
      mockFetch(true, { id: "b1", title: "new" });
      const res = await updateBoard("b1", { title: "new" });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/boards/b1`,
        expect.objectContaining({ method: "PATCH" })
      );
      expect(res).toEqual({ id: "b1", title: "new" });
    });

    it("throws on failure", async () => {
      mockFetch(false);
      await expect(updateBoard("b1", {})).rejects.toThrow("Failed to update board");
    });
  });

  describe("deleteBoard", () => {
    it("DELETEs to /boards/:id", async () => {
      mockFetch(true);
      await deleteBoard("b1");

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_URL}/boards/b1`,
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("throws on failure", async () => {
      mockFetch(false);
      await expect(deleteBoard("b1")).rejects.toThrow("Failed to delete board");
    });
  });
});
