import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { create } from "zustand";

import { boardApi } from "@/lib/api/boardApi";
import { createBoardSlice } from "@/stores/board-store";

vi.mock("@/lib/api/boardApi", () => ({
  boardApi: {
    createBoard: vi.fn(),
    updateBoard: vi.fn()
  }
}));

function makeStore(userId: string | null = "user-1") {
  return create<any>()((set, get, store) => ({
    userId,
    ...createBoardSlice(set as any, get as any, store as any)
  }));
}

describe("board-store slice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("setCurrentBoardId", () => {
    it("sets the current board id", () => {
      const store = makeStore();
      store.getState().setCurrentBoardId("b1");
      expect(store.getState().currentBoardId).toBe("b1");
    });
  });

  describe("addBoard", () => {
    it("creates a board and appends to myBoards", async () => {
      (boardApi.createBoard as Mock).mockResolvedValue({ _id: "b1", title: "B" });
      const store = makeStore();

      const id = await store.getState().addBoard("B", "desc");

      expect(id).toBe("b1");
      expect(boardApi.createBoard).toHaveBeenCalledWith({
        title: "B",
        description: "desc",
        owner: "user-1"
      });
      expect(store.getState().myBoards).toHaveLength(1);
    });

    it("throws when user is not authenticated", async () => {
      const store = makeStore(null);
      await expect(store.getState().addBoard("B")).rejects.toThrow("User not authenticated");
    });

    it("throws when api returns falsy board", async () => {
      (boardApi.createBoard as Mock).mockResolvedValue(null);
      const store = makeStore();
      await expect(store.getState().addBoard("B")).rejects.toThrow("Failed to create board");
    });

    it("propagates api errors", async () => {
      (boardApi.createBoard as Mock).mockRejectedValue(new Error("api down"));
      const store = makeStore();
      await expect(store.getState().addBoard("B")).rejects.toThrow("api down");
    });
  });

  describe("updateBoard", () => {
    it("updates matching board in myBoards and teamBoards", async () => {
      (boardApi.updateBoard as Mock).mockResolvedValue({});
      const store = makeStore();
      store.setState({
        myBoards: [{ _id: "b1", title: "old" }],
        teamBoards: [{ _id: "b1", title: "old" }]
      });

      await store.getState().updateBoard("b1", { title: "new" });

      expect(store.getState().myBoards[0].title).toBe("new");
      expect(store.getState().teamBoards[0].title).toBe("new");
    });

    it("propagates api errors", async () => {
      (boardApi.updateBoard as Mock).mockRejectedValue(new Error("update failed"));
      const store = makeStore();
      await expect(store.getState().updateBoard("b1", {})).rejects.toThrow("update failed");
    });
  });

  describe("removeBoard", () => {
    it("calls deleteFn and resets currentBoardId when it matches", async () => {
      const deleteFn = vi.fn().mockResolvedValue(undefined);
      const store = makeStore();
      store.setState({
        currentBoardId: "b1",
        myBoards: [{ _id: "b1" }],
        teamBoards: [{ _id: "b1" }, { _id: "b2" }]
      });

      await store.getState().removeBoard("b1", deleteFn);

      expect(deleteFn).toHaveBeenCalledWith("b1");
      expect(store.getState().currentBoardId).toBeNull();
      expect(store.getState().teamBoards).toEqual([{ _id: "b2" }]);
    });

    it("propagates errors from deleteFn", async () => {
      const deleteFn = vi.fn().mockRejectedValue(new Error("delete failed"));
      const store = makeStore();
      await expect(store.getState().removeBoard("b1", deleteFn)).rejects.toThrow("delete failed");
    });
  });
});
