import { describe, it, expect, vi, beforeEach } from "vitest";

import { boardApi } from "@/lib/api/board-api";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

vi.mock("@/lib/api/fetch-with-auth", () => ({
  fetchWithAuth: vi.fn()
}));

describe("boardApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get boards", async () => {
    const mockBoards = { myBoards: [], teamBoards: [] };
    vi.mocked(fetchWithAuth).mockResolvedValue(mockBoards);
    const result = await boardApi.getBoards();
    expect(result).toBe(mockBoards);
  });

  it("should get board by id", async () => {
    vi.mocked(fetchWithAuth).mockResolvedValue({ id: "1" });
    await boardApi.getBoardById("1");
    expect(fetchWithAuth).toHaveBeenCalledWith(expect.stringContaining("/boards/1"));
  });

  it("should create board", async () => {
    await boardApi.createBoard({ title: "T" });
    expect(fetchWithAuth).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: "POST" })
    );
  });

  it("should update board", async () => {
    await boardApi.updateBoard("1", { title: "U" });
    expect(fetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining("/boards/1"),
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("should delete board", async () => {
    await boardApi.deleteBoard("1");
    expect(fetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining("/boards/1"),
      expect.objectContaining({ method: "DELETE" }),
      true
    );
  });

  it("should add board member", async () => {
    await boardApi.addBoardMember("b1", "m1");
    expect(fetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining("/boards/b1/members/m1"),
      expect.objectContaining({ method: "POST" })
    );
  });
});
